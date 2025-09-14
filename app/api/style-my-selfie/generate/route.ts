import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'

// Rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour in milliseconds
const RATE_LIMIT_MAX_REQUESTS = 15 // 15 requests per hour per user

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Authentication check with debugging
    const authResult = await auth()
    console.log('Auth result:', authResult)
    
    const { userId } = authResult
    if (!userId) {
      console.log('No userId found in auth result')
      return NextResponse.json(
        { error: 'Unauthorized - No user ID found' },
        { status: 401 }
      )
    }

    // Rate limiting check
    const now = Date.now()
    const userRateLimit = rateLimitStore.get(userId)
    
    if (userRateLimit) {
      if (now < userRateLimit.resetTime) {
        if (userRateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
          const resetTime = new Date(userRateLimit.resetTime).toISOString()
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              resetTime,
              retryAfter: Math.ceil((userRateLimit.resetTime - now) / 1000)
            },
            { status: 429 }
          )
        }
        userRateLimit.count++
      } else {
        rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
      }
    } else {
      rateLimitStore.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    }

    // Parse request body
    const body = await request.json()
    const { prompt, selfieImage, style, additionalDetails } = body

    // Validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      )
    }

    if (!selfieImage || typeof selfieImage !== 'string') {
      return NextResponse.json(
        { error: 'Selfie image is required' },
        { status: 400 }
      )
    }

    // Validate image format
    if (!selfieImage.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Please upload a valid image.' },
        { status: 400 }
      )
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured')
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Get Supabase client
    const supabase = createServiceRoleClient()
    
    // Check user credits
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_left, total_credits_used, is_founding_user, user_tier')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    if (profile.credits_left <= 0) {
      return NextResponse.json(
        { 
          error: 'No credits remaining',
          creditsLeft: profile.credits_left,
          resetTime: profile.last_credit_reset
        },
        { status: 402 }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // Process selfie image
    const base64Data = selfieImage.split(',')[1]
    const mimeType = selfieImage.split(';')[0].split(':')[1]

    // Enhanced prompt for style my selfie
    let enhancedPrompt = prompt

    // If additional details are provided, combine them with the base template prompt
    if (additionalDetails && additionalDetails.trim()) {
      enhancedPrompt = `${prompt}

ADDITIONAL USER REQUIREMENTS:
${additionalDetails}

IMPORTANT: Incorporate these additional details while maintaining the core style template. The user's specific requests should be integrated seamlessly with the base style.`
    }

    // Generate 3 variations
    const images: string[] = []
    const maxAttempts = 3
    
    console.log(`Starting generation of ${maxAttempts} variations for prompt: ${prompt.substring(0, 50)}...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Generation attempt ${attempt}/${maxAttempts}`)
        
        // Add variation instruction to prompt for attempts 2 and 3
        let variationPrompt = enhancedPrompt
        if (attempt > 1) {
          const variationInstructions = [
            "Create a completely different composition and angle. Change the lighting, background, and pose significantly while keeping the same person. Use different colors, mood, and artistic style.",
            "Generate a unique variation with different camera angle, framing, and setting. Vary the visual elements substantially - different background, lighting, and perspective while maintaining the same person."
          ]
          
          const instruction = variationInstructions[attempt - 2] || variationInstructions[0]
          
          // Add random elements to ensure more variation
          const randomElements = [
            "Use warm, golden lighting",
            "Use cool, blue lighting", 
            "Use dramatic, high-contrast lighting",
            "Use soft, diffused lighting",
            "Use a wide-angle perspective",
            "Use a close-up, intimate perspective",
            "Use a low camera angle",
            "Use a high camera angle",
            "Add depth of field blur",
            "Use sharp, detailed focus throughout"
          ]
          
          const randomElement = randomElements[Math.floor(Math.random() * randomElements.length)]
          variationPrompt = `${enhancedPrompt}\n\n${instruction} ${randomElement}.`
        }
        
        const result = await genAI.models.generateContent({
          model: "gemini-2.5-flash-image-preview",
          contents: [
            {
              role: "user",
              parts: [
                { text: variationPrompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: mimeType,
                  },
                },
              ],
            },
          ],
        })

        // Extract generated image
        let generatedImage = null
        if (result.candidates && result.candidates.length > 0) {
          for (const candidate of result.candidates) {
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  generatedImage = `data:image/jpeg;base64,${part.inlineData.data}`
                  break
                }
              }
            }
            if (generatedImage) break
          }
        }

        if (generatedImage) {
          images.push(generatedImage)
          console.log(`Successfully generated image ${attempt}, size: ${generatedImage.length} characters`)
        } else {
          console.log(`No image generated for attempt ${attempt}`)
        }
        
        // Add a delay between generations to ensure distinct variations
        if (attempt < maxAttempts) {
          console.log(`Waiting 1.5 seconds before next variation...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
      } catch (error) {
        console.error(`Generation attempt ${attempt} failed:`, error)
        
        // Add delay before retry to avoid hitting rate limits
        if (attempt < maxAttempts) {
          console.log(`Waiting 5 seconds before retry due to error...`)
          await new Promise(resolve => setTimeout(resolve, 5000))
        }
      }
    }
    
    console.log(`Generation completed. Generated ${images.length} images out of ${maxAttempts} attempts`)

    if (images.length === 0) {
      return NextResponse.json(
        { error: 'No images were generated. Please try a different prompt.' },
        { status: 500 }
      )
    }

    // Deduct credit
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits_left: profile.credits_left - 1,
        total_credits_used: profile.total_credits_used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      // Don't fail the request, just log the error
    }

    // Log generation for analytics
    const generationTime = Date.now() - startTime
    console.log(`Style My Selfie generation completed in ${generationTime}ms for user ${userId}`)

    // Return success response
    return NextResponse.json({
      success: true,
      images: images,
      creditsLeft: profile.credits_left - 1,
      generationTime,
      metadata: {
        style: style || 'professional',
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Style My Selfie generation error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service configuration error' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'AI service temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'style-my-selfie',
    timestamp: new Date().toISOString()
  })
}
