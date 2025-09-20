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
    return true // Allow request if rate limiting fails
  }
}

function getUserIdentifier(request: NextRequest, userId?: string): string {
  if (userId) {
    return `user:${userId}`
  }
  
  // Fallback to IP-based rate limiting for non-authenticated users
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
    
    const { prompt, selfieImage, clothingImage } = body
    
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
    if (!selfieImage || !clothingImage) {
      return NextResponse.json(
        { error: 'Both selfie and clothing images are required' },
        { status: 400 }
      )
    }

    // Validate prompt
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

    if (!clothingImage.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid clothing image format. Must be a valid base64 image.' },
        { status: 400 }
      )
    }

    // Get Supabase client for user profile lookup (use service role to bypass RLS)
    const supabase = createServiceRoleClient()
    
    // Check user profile and credits
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_left, total_credits_used')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'User profile not found. Please try signing in again.' },
        { status: 404 }
      )
    }

    // Check if user has enough credits
    if (profile.credits_left < 1) {
      return NextResponse.json(
        { error: 'Insufficient credits. You need at least 1 credit to generate images.' },
        { status: 402 }
      )
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      console.error('Gemini API key not configured')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })
    
    // Create the generation request
    const generationRequest: GenerationContent[] = []
    
    // Add the enhanced prompt
    const defaultPrompt = 'Create a perfect virtual try-on experience by seamlessly merging the uploaded clothing/accessory item with the person from the uploaded selfie image. The clothing or accessory should appear naturally worn by the person from the selfie, with proper fit, realistic draping, and authentic integration. Maintain the person\'s exact facial features, body proportions, and identity from the uploaded selfie while perfectly fitting the clothing/accessory item. Ensure the clothing looks like it belongs on this specific person with realistic fabric behavior, proper sizing, and natural positioning. The result should look like a professional product try-on photo where the person from the selfie is actually wearing the item. CRITICAL: Use the exact same person\'s face, facial features, and identity from the uploaded selfie image - only change the clothing/accessory integration while keeping the person\'s face completely consistent and recognizable.'
    
    const enhancedPrompt = `Create a perfect virtual try-on experience by seamlessly merging the uploaded clothing/accessory item with the person from the uploaded selfie image (1080x1350 pixels, 4:5 aspect ratio): ${prompt || defaultPrompt}. The clothing or accessory should appear naturally worn by the person from the selfie, with proper fit, realistic draping, and authentic integration. Maintain the person's exact facial features, body proportions, and identity from the uploaded selfie while perfectly fitting the clothing/accessory item. Ensure the clothing looks like it belongs on this specific person with realistic fabric behavior, proper sizing, and natural positioning. The result should look like a professional product try-on photo where the person from the selfie is actually wearing the item. CRITICAL: Use the exact same person's face, facial features, and identity from the uploaded selfie image - only change the clothing/accessory integration while keeping the person's face completely consistent and recognizable. Generate a compressed, web-optimized image with minimal file size for fast loading. IMPORTANT: Do not add any text, watermarks, names, or written content to the image unless specifically requested in the prompt.`

    generationRequest.push({
      text: enhancedPrompt
    })

    // Add selfie image
    generationRequest.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: selfieImage.replace(/^data:image\/[a-z]+;base64,/, '')
      }
    })

    // Add clothing image
    generationRequest.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: clothingImage.replace(/^data:image\/[a-z]+;base64,/, '')
      }
    })

    // Generate 3 variations
    const images: string[] = []
    const maxAttempts = 3
    
    console.log(`Starting generation of ${maxAttempts} virtual try-on variations for prompt: ${prompt?.substring(0, 50) || 'default prompt'}...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🎯 Virtual try-on generation attempt ${attempt}/${maxAttempts}`)
        
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: generationRequest,
          generationConfig: {
            temperature: 0.7 + (attempt * 0.1), // Vary temperature for different results
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
        })

        console.log(`✅ Virtual try-on generation attempt ${attempt} completed`)
        
        if (result.candidates && result.candidates.length > 0) {
          const candidate = result.candidates[0]
          if (candidate.content && candidate.content.parts) {
            console.log(`Processing ${candidate.content.parts.length} parts for attempt ${attempt}`)
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const imageData = `data:image/jpeg;base64,${part.inlineData.data}`
                images.push(imageData)
                console.log(`📸 Virtual try-on image ${attempt} generated successfully, size: ${imageData.length} characters`)
                break // Only take the first image from each generation
              }
            }
          } else {
            console.warn(`⚠️ Virtual try-on attempt ${attempt}: No content parts found`)
          }
        } else {
          console.warn(`⚠️ Virtual try-on attempt ${attempt}: No candidates found`)
        }
      } catch (error) {
        console.error(`❌ Virtual try-on generation attempt ${attempt} failed:`, error)
        // Continue to next attempt
      }
    }

    // If we got fewer than 3 images, try to generate more
    if (images.length < 3) {
      console.log(`🔄 Only got ${images.length} images, attempting to generate more...`)
      const additionalAttempts = 3 - images.length
      
      for (let attempt = 1; attempt <= additionalAttempts; attempt++) {
        try {
          console.log(`🎯 Additional virtual try-on generation attempt ${attempt}/${additionalAttempts}`)
          
          const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: generationRequest,
            generationConfig: {
              temperature: 0.8 + (attempt * 0.1),
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          })

          if (result.candidates && result.candidates.length > 0) {
            const candidate = result.candidates[0]
            if (candidate.content && candidate.content.parts) {
              for (const part of candidate.content.parts) {
                if (part.inlineData && part.inlineData.data) {
                  const imageData = `data:image/jpeg;base64,${part.inlineData.data}`
                  images.push(imageData)
                  console.log(`📸 Additional virtual try-on image ${attempt} generated successfully`)
                  break
                }
              }
            }
          }
        } catch (error) {
          console.error(`❌ Additional virtual try-on generation attempt ${attempt} failed:`, error)
        }
      }
    }

    if (images.length === 0) {
      console.error('❌ No virtual try-on images generated after all attempts')
      return NextResponse.json(
        { error: 'Failed to generate virtual try-on images. Please try again with different images or prompt.' },
        { status: 500 }
      )
    }

    console.log(`✅ Successfully generated ${images.length} virtual try-on images`)

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
      console.error('Failed to update user credits:', updateError)
      // Don't fail the request if credit update fails
    }

    return NextResponse.json({
      success: true,
      images: images,
      credits_used: 1,
      credits_remaining: profile.credits_left - 1
    })

  } catch (error) {
    console.error('Virtual try-on generation error:', error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'Daily quota exceeded. Please try again tomorrow.' },
          { status: 429 }
        )
      } else if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Service configuration error. Please try again later.' },
          { status: 500 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    )
  }
}
