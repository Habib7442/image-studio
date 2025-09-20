import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { Redis } from '@upstash/redis'

interface GenerationContent {
  text?: string
  inlineData?: {
    mimeType: string
    data: string
  }
}

// Redis client for distributed rate limiting (only if Redis is configured)
let redis: Redis | null = null;
if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  } catch (error) {
    console.warn('Redis configuration invalid, rate limiting disabled:', error);
  }
}

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 // 1 hour in seconds
const RATE_LIMIT_MAX_REQUESTS = 15 // 15 generations per hour

// Check rate limit using Redis
async function checkRateLimit(identifier: string): Promise<boolean> {
  // If Redis is not configured, skip rate limiting
  if (!redis) {
    console.log('Redis not configured, skipping rate limiting')
    return true
  }

  try {
    const key = `rate_limit:${identifier}`
    const current = await redis.get(key)
    
    if (current === null) {
      // First request - set with expiration
      await redis.setex(key, RATE_LIMIT_WINDOW, 1)
      return true
    }
    
    const count = parseInt(current as string)
    
    if (count >= RATE_LIMIT_MAX_REQUESTS) {
      return false
    }
    
    // Increment counter
    await redis.incr(key)
    return true
  } catch (error) {
    console.error('Rate limiting error:', error)
    // Fail open - allow request if Redis is down
    return true
  }
}

// Get user identifier for rate limiting
function getUserIdentifier(request: NextRequest, userId?: string): string {
  // Use user ID if authenticated, otherwise use IP address
  if (userId) {
    return `user:${userId}`
  }
  
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return `ip:${ip}`
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check rate limit
    const identifier = getUserIdentifier(request, userId)
    const isRateLimited = await checkRateLimit(identifier)
    if (!isRateLimited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. You can generate up to 15 images per hour. Please try again later.' 
        },
        { status: 429 }
      )
    }

    // Parse request body with size validation
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return NextResponse.json(
        { error: 'Request payload too large. Please compress your images and try again.' },
        { status: 413 }
      )
    }
    
    const { prompt, selfieImage, productImage, template, filters, adTemplate } = body
    
    // Check payload size
    const payloadSize = JSON.stringify(body).length
    const maxPayloadSize = 4 * 1024 * 1024 // 4MB limit
    if (payloadSize > maxPayloadSize) {
      console.error(`Payload too large: ${payloadSize} bytes (max: ${maxPayloadSize})`)
      return NextResponse.json(
        { error: 'Request payload too large. Please use smaller images (under 2MB each) and try again.' },
        { status: 413 }
      )
    }

    // Validate required fields
    if (!selfieImage || !productImage) {
      return NextResponse.json(
        { error: 'Both selfie and product images are required' },
        { status: 400 }
      )
    }

    // Validate prompt (optional if template is selected)
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      if (!adTemplate) {
        return NextResponse.json(
          { error: 'Prompt is required when no ad template is selected' },
          { status: 400 }
        )
      }
    }

    if (prompt && prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt must be less than 1000 characters' },
        { status: 400 }
      )
    }

    // Basic validation
    if (!selfieImage.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid selfie image format. Must be a valid base64 image.' },
        { status: 400 }
      )
    }

    if (!productImage.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid product image format. Must be a valid base64 image.' },
        { status: 400 }
      )
    }

    // Get Supabase client for user profile lookup (use service role to bypass RLS)
    const supabase = createServiceRoleClient()
    
    // Check user credits using Clerk userId
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_left, total_credits_used, is_founding_user')
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
        { error: 'No credits remaining. Credits reset daily.' },
        { status: 402 }
      )
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Build the enhanced prompt
    let enhancedPrompt = ''
    
    if (adTemplate) {
      // Use ad template prompt as base
      enhancedPrompt = adTemplate.prompt
    } else {
      // Use custom prompt
      enhancedPrompt = prompt || ''
    }

    // Add style template and filters if provided
    if (template) {
      enhancedPrompt = `${template.prompt} ${enhancedPrompt}`
    }

    if (filters && filters.length > 0) {
      const filterDescriptions = filters.map((filter: any) => 
        `${filter.name}: ${filter.description}`
      ).join(', ')
      enhancedPrompt = `${enhancedPrompt} Apply these effects: ${filterDescriptions}.`
    }

    // Add Instagram optimization and product ad specific instructions
    enhancedPrompt = `Create a professional product advertisement featuring this person with this product (1080x1350 pixels, 4:5 aspect ratio): ${enhancedPrompt}. 

CRITICAL REQUIREMENTS:
- The person from the selfie image must be the main subject
- The product from the product image must be prominently featured and integrated naturally
- Create a cohesive advertisement that looks like a professional brand campaign
- Use high-quality product photography techniques
- Ensure the person and product work together harmoniously
- Make it perfect for Instagram feed with vertical composition
- Use professional lighting and composition
- Create an engaging, marketable advertisement
- Ensure the person's face, facial features, and identity from the selfie remain exactly the same
- The product should appear naturally integrated with the person
- Use appropriate color grading and professional photography techniques

Make it visually stunning, well-composed, and perfect for Instagram feed. Use vertical composition that works great on mobile. CRITICAL: Generate a compressed, web-optimized image with minimal file size for fast loading. IMPORTANT: Do not add any text, watermarks, names, or written content to the image unless specifically requested in the prompt.`

    // Prepare the generation request
    const generationRequest = {
      model: 'gemini-2.5-flash-image-preview',
      contents: [
        { text: enhancedPrompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: selfieImage.replace(/^data:image\/[a-z]+;base64,/, '')
          }
        },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: productImage.replace(/^data:image\/[a-z]+;base64,/, '')
          }
        }
      ] as GenerationContent[]
    }

    // Generate 3 variations
    const images: string[] = []
    const maxAttempts = 3
    
    console.log(`Starting generation of ${maxAttempts} variations for Add Me + Product: ${prompt?.substring(0, 50) || 'using template'}...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Generation attempt ${attempt}/${maxAttempts}`)
        
        // Add variation instruction to prompt for attempts 2 and 3
        let variationPrompt = enhancedPrompt
        if (attempt > 1) {
          const variationInstructions = [
            "Create a completely different product shot with different composition, lighting, and background. Change the angle, mood, and artistic style while keeping the same person and product. Try a more casual, lifestyle approach with natural lighting.",
            "Generate a unique variation with different setting, camera angle, and visual elements. Vary the background, lighting, and perspective substantially while maintaining focus on the product's integration with the person. Try a more dramatic, editorial style."
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
        
        // Update the generation request with variation prompt
        const variationRequest = {
          ...generationRequest,
          contents: [
            { text: variationPrompt },
            ...generationRequest.contents.slice(1) // Keep the image data
          ]
        }
        
        console.log(`Sending request to Gemini for attempt ${attempt}`)
        if (attempt > 1) {
          console.log(`Variation prompt for attempt ${attempt}:`, variationPrompt.substring(0, 200) + '...')
        }
        const result = await genAI.models.generateContent(variationRequest)
        
        console.log(`Received response for attempt ${attempt}:`, {
          hasCandidates: !!result.candidates,
          candidatesLength: result.candidates?.length || 0
        })
        
        if (result.candidates && result.candidates.length > 0) {
          const candidate = result.candidates[0]
          
          if (candidate.content && candidate.content.parts) {
            console.log(`Processing ${candidate.content.parts.length} parts for attempt ${attempt}`)
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageData = `data:image/jpeg;base64,${part.inlineData.data}`
                images.push(imageData)
                console.log(`Successfully generated image ${attempt}, size: ${imageData.length} characters`)
                break // Only take the first image from each generation
              }
            }
          } else {
            console.log(`No content parts found for attempt ${attempt}`)
          }
        } else {
          console.log(`No candidates found for attempt ${attempt}`)
        }
        
        // Add a delay between generations to ensure distinct variations
        if (attempt < maxAttempts) {
          console.log(`Waiting 1.5 seconds before next variation...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
      } catch (error) {
        console.error(`Generation attempt ${attempt} failed:`, error)
        
        // Handle quota exceeded errors specifically
        if (error instanceof Error && error.message.includes('quota')) {
          console.error('Quota exceeded, stopping generation attempts')
          break // Stop trying if quota is exceeded
        }
        
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
        { error: 'No images were generated. Please try a different prompt or template.' },
        { status: 500 }
      )
    }

    // Only deduct credits after successful generation
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
      // Don't fail the request if credit update fails - user still gets their images
      console.warn('Credit update failed but generation was successful')
    }

    const creditsLeft = profile.credits_left - 1

    // Return success response
    return NextResponse.json({
      success: true,
      images,
      creditsLeft,
      prompt: enhancedPrompt,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Add Me + Product generation error:', error)
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 500 }
        )
      }
      
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { 
            error: 'AI service quota exceeded. You have reached the daily limit for free tier. Please try again tomorrow or upgrade your plan.',
            errorType: 'QUOTA_EXCEEDED',
            retryAfter: '24 hours'
          },
          { status: 429 }
        )
      }
      
      if (error.message.includes('429')) {
        return NextResponse.json(
          { 
            error: 'Too many requests. Please wait a few minutes before trying again.',
            errorType: 'RATE_LIMITED',
            retryAfter: '5 minutes'
          },
          { status: 429 }
        )
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}