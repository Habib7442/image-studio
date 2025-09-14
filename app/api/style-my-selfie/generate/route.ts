import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { styleMySelfieRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'
import { uploadMultipleImagesToStorage } from '@/lib/image-storage'
import { deductCreditsWithRetry, refundCreditsWithRetry } from '@/lib/credit-management'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Authentication check with debugging
    const authResult = await auth()
    console.log('Auth userId:', authResult?.userId)
    
    const { userId } = authResult
    if (!userId) {
      console.log('No userId found in auth result')
      return NextResponse.json(
        { error: 'Unauthorized - No user ID found' },
        { status: 401 }
      )
    }

    // Rate limiting check using Redis
    const rateLimitResult = await styleMySelfieRateLimit.checkLimit(userId)
    
    if (!rateLimitResult.success) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          resetTime: new Date(rateLimitResult.resetTime).toISOString(),
          retryAfter: rateLimitResult.retryAfter
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      )
    }

    // Parse request body
    const contentType = request.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      )
    }

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

    // Validate image Data URL (allow jpeg/png/webp only)
    const m = /^data:(image\/(jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/.exec(selfieImage)
    if (!m) {
      return NextResponse.json(
        { error: 'Invalid image format. Please upload JPEG/PNG/WEBP base64.' },
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
      .select('credits_left, total_credits_used, is_founding_user, user_tier, last_credit_reset')
      .eq('id', userId)
      .single()

    let userProfile = profile
    if (profileError || !profile) {
      // Initialize new user with default credits
      console.log(`Creating new user profile for ${userId}`)
      const { data: newProfile, error: createError } = await supabase
        .from('users')
        .insert({
          id: userId,
          credits_left: 10, // Default free credits
          total_credits_used: 0,
          is_founding_user: false,
          user_tier: 'free',
          last_credit_reset: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('credits_left, total_credits_used, is_founding_user, user_tier, last_credit_reset')
        .single()
      
      if (createError || !newProfile) {
        console.error('Failed to create user profile:', createError)
        return NextResponse.json(
          { error: 'Failed to initialize user profile' },
          { status: 500 }
        )
      }
      
      userProfile = newProfile
      console.log(`User profile created successfully for ${userId} with ${userProfile.credits_left} credits`)
    }

    if (!userProfile) {
      return NextResponse.json(
        { error: 'Failed to get user profile' },
        { status: 500 }
      )
    }

    // Early credit check for better UX
    if (userProfile.credits_left <= 0) {
      return NextResponse.json(
        { 
          error: 'No credits remaining',
          creditsLeft: userProfile.credits_left,
          resetTime: userProfile.last_credit_reset
        },
        { status: 402 }
      )
    }

    // ATOMICALLY deduct credit BEFORE expensive AI generation with retry logic
    // This prevents users from getting free generations if something fails
    const creditResult = await deductCreditsWithRetry({
      userId,
      maxRetries: 3,
      retryDelay: 1000
    })

    if (!creditResult.success) {
      if (creditResult.error?.includes('Insufficient credits')) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits',
            creditsLeft: creditResult.creditsLeft,
            resetTime: userProfile.last_credit_reset
          },
          { status: 402 }
        )
      } else {
        return NextResponse.json(
          { 
            error: 'Failed to process credit deduction. Please try again.',
            creditsLeft: creditResult.creditsLeft
          },
          { status: 500 }
        )
      }
    }

    console.log(`Credits deducted for user ${userId}. Remaining: ${creditResult.creditsLeft}`)

    // Initialize Gemini AI
    const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // Process selfie image with validated data
    const mimeType = m[1]
    const base64Data = m[3]
    
    // Validate base64 data length (prevent extremely large payloads)
    if (base64Data.length > 8 * 1024 * 1024) { // 8MB base64 string limit
      return NextResponse.json(
        { error: 'Image data too large. Please use a smaller image.' },
        { status: 413 }
      )
    }
    
    // Enforce max size ~6MB (8MB base64)
    const approxBytes = Math.floor((base64Data.length * 3) / 4)
    if (approxBytes > 6 * 1024 * 1024) {
      return NextResponse.json(
        { 
          error: 'Image too large. Maximum size is 6MB.',
          maxSize: '6MB',
          actualSize: `${Math.round(approxBytes / (1024 * 1024) * 100) / 100}MB`
        },
        { status: 413 }
      )
    }
    
    // Additional validation: check for reasonable image dimensions
    // This is a rough estimate - very large images might cause memory issues
    const estimatedPixels = approxBytes / 3 // Rough estimate assuming RGB
    if (estimatedPixels > 50 * 1024 * 1024) { // 50 megapixels limit
      return NextResponse.json(
        { error: 'Image resolution too high. Please use a smaller image.' },
        { status: 413 }
      )
    }

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
      // AI generation failed, refund the credit with retry logic
      console.log(`AI generation failed for user ${userId}, refunding credit`)
      const refundResult = await refundCreditsWithRetry({
        userId,
        maxRetries: 3,
        retryDelay: 1000
      })
      
      if (!refundResult.success) {
        console.error('Failed to refund credit after multiple attempts:', refundResult.error)
        // Log for manual review - user was charged but didn't get service
        return NextResponse.json(
          { 
            error: 'No images were generated. Credit refund failed - please contact support.',
            creditsLeft: creditResult.creditsLeft
          },
          { status: 500 }
        )
      }
      
      console.log(`Credit refunded for user ${userId}. Remaining: ${refundResult.creditsLeft}`)
      return NextResponse.json(
        { 
          error: 'No images were generated. Please try a different prompt. Credit has been refunded.',
          creditsLeft: refundResult.creditsLeft
        },
        { status: 500 }
      )
    }

    // Upload images to storage and get URLs
    console.log(`Uploading ${images.length} images to storage...`)
    const uploadStartTime = Date.now()
    
    try {
      const uploadedImages = await uploadMultipleImagesToStorage(
        images,
        prompt,
        style || 'professional',
        userId,
        {
          additionalDetails: additionalDetails || null,
          generationTime: Date.now() - startTime,
          variationCount: images.length
        }
      )
      
      const uploadTime = Date.now() - uploadStartTime
      console.log(`Images uploaded to storage in ${uploadTime}ms`)
      
      // Extract URLs for response
      const imageUrls = uploadedImages.map(img => ({
        id: img.id,
        url: img.signed_url || img.public_url,
        storage_path: img.storage_path
      }))

      // Log generation for analytics
      const generationTime = Date.now() - startTime
      console.log(`Style My Selfie generation completed in ${generationTime}ms for user ${userId}`)

      // Get updated rate limit info for headers
      const updatedRateLimit = await styleMySelfieRateLimit.getRemaining(userId)
      const headers = createRateLimitHeaders({
        success: true,
        limit: 15,
        remaining: updatedRateLimit,
        resetTime: Date.now() + (60 * 60 * 1000) // 1 hour from now
      })

      // Return success response with image URLs instead of base64
      return new NextResponse(
        JSON.stringify({
          success: true,
          images: imageUrls, // Now returns URLs instead of base64
          creditsLeft: creditResult.creditsLeft,
          generationTime,
          uploadTime,
          metadata: {
            style: style || 'professional',
            timestamp: new Date().toISOString(),
            totalImages: images.length
          }
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          }
        }
      )
      
    } catch (uploadError) {
      console.error('Failed to upload images to storage:', uploadError)
      
      // If upload fails, refund the credit since user didn't get the service
      const refundResult = await refundCreditsWithRetry({
        userId,
        maxRetries: 3,
        retryDelay: 1000
      })
      
      if (!refundResult.success) {
        console.error('Failed to refund credit after upload failure:', refundResult.error)
        return NextResponse.json(
          { 
            error: 'Failed to process generated images. Credit refund failed - please contact support.',
            creditsLeft: creditResult.creditsLeft
          },
          { status: 500 }
        )
      }
      
      console.log(`Credit refunded for user ${userId} due to upload failure. Remaining: ${refundResult.creditsLeft}`)
      return NextResponse.json(
        { 
          error: 'Failed to process generated images. Credit has been refunded.',
          creditsLeft: refundResult.creditsLeft
        },
        { status: 500 }
      )
    }

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
