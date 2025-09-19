import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { Redis } from '@upstash/redis'

// Google GenAI will be initialized inside the function

// Redis client for distributed rate limiting (only if Redis is configured)
let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  } catch (error) {
    console.warn('Redis initialization failed:', error)
  }
}

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 5

async function checkRateLimit(userId: string): Promise<boolean> {
  if (!redis) return true // Allow if Redis is not available
  
  const key = `rate_limit:ecommerce:${userId}`
  const current = await redis.incr(key)
  
  if (current === 1) {
    await redis.expire(key, RATE_LIMIT_WINDOW / 1000)
  }
  
  return current <= RATE_LIMIT_MAX_REQUESTS
}


export async function POST(request: NextRequest) {
  try {
    const { productImage, lifestyleImage, template, customPrompt, finalPrompt } = await request.json()

    // Validate required fields
    if (!productImage) {
      return NextResponse.json({ error: 'Product image is required' }, { status: 400 })
    }

    if (!finalPrompt && !template && !customPrompt) {
      return NextResponse.json({ error: 'Template or custom prompt is required' }, { status: 400 })
    }

    // Check authentication with Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check rate limit
    const isWithinRateLimit = await checkRateLimit(userId)
    if (!isWithinRateLimit) {
      return NextResponse.json({ 
        error: 'Rate limit exceeded. Please try again later.' 
      }, { status: 429 })
    }

    // Check user credits using service role client
    const supabase = createServiceRoleClient()
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_left, total_credits_used, is_founding_user')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 })
    }

    if (profile.credits_left < 1) {
      return NextResponse.json({ 
        error: 'Insufficient credits. You need at least 1 credit to generate e-commerce images.' 
      }, { status: 400 })
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

    // Prepare the generation request
    const generationRequest = {
      model: 'gemini-2.5-flash-image-preview',
      contents: [] as any[]
    }

    // Build the enhanced prompt for E-commerce Enhancement
    const enhancedPrompt = `Create a professional e-commerce product image (1080x1350 pixels, 4:5 aspect ratio): ${finalPrompt.trim()}.

E-COMMERCE PRODUCT ENHANCEMENT REQUIREMENTS:
- Transform the product according to the prompt while maintaining its core features and identity
- Create a professional, high-quality product image perfect for e-commerce and social media
- Use commercial photography lighting and composition
- Ensure the product looks appealing and marketable
- Maintain the product's recognizable features and characteristics
- Create a visually stunning result that showcases the product effectively

Make it look professional, high-quality, and perfect for e-commerce and Instagram. Use vertical composition that showcases the product beautifully on mobile. CRITICAL: Generate a compressed, web-optimized image with minimal file size for fast loading. IMPORTANT: Do not add any text, watermarks, names, or written content to the image unless specifically requested in the prompt.`

    // Add text content
    generationRequest.contents.push({
      text: enhancedPrompt
    })

    // Add product image
    generationRequest.contents.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: productImage.replace(/^data:image\/[a-z]+;base64,/, '')
      }
    })

    // Generate 2 variations
    const generatedImages = []
    const maxAttempts = 2
    
    console.log(`Starting generation of ${maxAttempts} variations for E-commerce Enhancement: ${finalPrompt.substring(0, 50)}...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Generation attempt ${attempt}/${maxAttempts}`)
        
        // Add variation instruction to prompt for attempt 2
        let variationPrompt = enhancedPrompt
        if (attempt > 1) {
          const variationInstructions = [
            "Create a completely different composition and angle. Change the lighting, background, and setting significantly while keeping the same product. Use different colors, mood, and artistic style."
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
          console.log(`Attempt ${attempt} - Candidate structure:`, {
            hasContent: !!candidate.content,
            hasParts: !!(candidate.content && candidate.content.parts),
            partsLength: candidate.content?.parts?.length || 0
          })
          
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const part = candidate.content.parts[0]
            console.log(`Attempt ${attempt} - Part structure:`, {
              hasInlineData: !!part.inlineData,
              mimeType: part.inlineData?.mimeType,
              dataLength: part.inlineData?.data?.length || 0
            })
            
            if (part.inlineData) {
              const imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
              const imageId = `ecommerce_${Date.now()}_${attempt}_${Math.random().toString(36).substr(2, 9)}`
              generatedImages.push({
                id: imageId,
                url: imageData,
                prompt: variationPrompt,
                template: template || { name: 'Custom', description: 'Custom enhancement' }
              })
              console.log(`Added image ${attempt} with ID: ${imageId}`)
              console.log(`Successfully generated image ${attempt}`)
            } else {
              console.warn(`No image data in response for attempt ${attempt}`)
              console.log(`Part structure:`, JSON.stringify(part, null, 2))
            }
          } else {
            console.warn(`No content in response for attempt ${attempt}`)
            console.log(`Candidate structure:`, JSON.stringify(candidate, null, 2))
          }
        } else {
          console.warn(`No candidates in response for attempt ${attempt}`)
        }
      } catch (error) {
        console.error(`Error generating image ${attempt}:`, error)
        // Continue with other images even if one fails
      }
    }

    console.log(`Final generated images array length: ${generatedImages.length}`)
    console.log(`Final generated images:`, generatedImages.map(img => ({ id: img.id, hasUrl: !!img.url })))

    if (generatedImages.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate any images. Please try again.' 
      }, { status: 500 })
    }

    // Only deduct credits after successful generation
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits_left: profile.credits_left - 1,
        total_credits_used: profile.total_credits_used + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) {
      console.error('Failed to update credits:', updateError);
      // Don't fail the request if credit update fails - user still gets their images
      console.warn('Credit update failed but generation was successful');
    }

    const creditsLeft = profile.credits_left - 1;

    // Log the generation
    try {
      await supabase
        .from('generated_images')
        .insert({
          user_id: userId,
          prompt: finalPrompt,
          template_used: template?.name || 'Custom',
          image_count: generatedImages.length,
          generation_type: 'ecommerce_enhancement'
        })
    } catch (logError) {
      console.error('Error logging generation:', logError)
      // Don't fail the request for logging errors
    }

    return NextResponse.json({
      success: true,
      images: generatedImages,
      credits_used: 1,
      credits_remaining: creditsLeft
    })

  } catch (error) {
    console.error('E-commerce enhancement generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
