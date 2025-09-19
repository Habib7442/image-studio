import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { GoogleGenAI } from '@google/genai'
import { Redis } from '@upstash/redis'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has credits
    const supabase = createServiceRoleClient()
    const { data: profile } = await supabase
      .from('users')
      .select('credits_left, total_credits_used')
      .eq('id', userId)
      .single()

    if (!profile || !profile.credits_left || profile.credits_left <= 0) {
      return NextResponse.json({ error: 'No credits remaining' }, { status: 400 })
    }

    // Rate limiting
    let redis: Redis | null = null
    if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
      try {
        redis = new Redis({
          url: process.env.UPSTASH_REDIS_URL,
          token: process.env.UPSTASH_REDIS_REST_TOKEN,
        })
      } catch (error) {
        console.warn('Redis configuration invalid, rate limiting disabled:', error)
      }
    }

    if (redis) {
      const rateLimitKey = `rate_limit:hug_childhood:${userId}`
      const requests = await redis.incr(rateLimitKey)
      
      if (requests === 1) {
        await redis.expire(rateLimitKey, 60) // 1 minute window
      }
      
      if (requests > 10) { // 10 requests per minute
        return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
      }
    }

    const body = await request.json()
    const { currentImage, childhoodImage, template, filters } = body

    if (!currentImage || !childhoodImage) {
      return NextResponse.json({ error: 'Both current and childhood images are required' }, { status: 400 })
    }

    // Initialize Google GenAI
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    })

    // Create the enhanced prompt for hug childhood - using user's specific prompt
    let enhancedPrompt = `Take a photo taken with a Polaroid camera of these two people in 4k and 9:16 ratio frame. The image should have a slight blur around the edges, with the main focus on the two people. The light source should be from the right side, creating a soft, warm glow. Don't change the face. I want same face as I uploaded no alternation 100 percent same of both the people. The background should be a plain, warm-toned wall, illuminated by a warm light source from the right, creating a distinct, soft-edged shadow. The overall mood should be retro and artistic. Both the kid and the girl are hugging each other and smiling. Change the background behind those two people with white curtains and make a cute pose. 

Key requirements:
- Use Polaroid camera aesthetic with 4K resolution and 9:16 ratio
- Slight blur around edges, main focus on the two people
- Light source from the right side creating soft, warm glow
- Keep faces 100% identical to uploaded photos - no alterations
- Background: plain, warm-toned wall with white curtains
- Both people hugging and smiling in a cute pose
- Retro and artistic mood
- All faces must be facing front - no side views or profiles
- High quality, professional photography style`

    // Add template and filter enhancements
    if (template) {
      enhancedPrompt += `\n\nStyle: ${template.name} - ${template.description}`
    }

    if (filters && filters.length > 0) {
      const filterNames = filters.map((f: { name: string }) => f.name).join(', ')
      enhancedPrompt += `\n\nApply these filters: ${filterNames}`
    }

    // Generate 3 variations
    const generatedImages = []
    const maxAttempts = 3
    
    console.log(`Starting generation of ${maxAttempts} variations for Hug Childhood...`)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`Generation attempt ${attempt}/${maxAttempts}`)
        
        // Add variation instruction to prompt for attempts 2 and 3
        let variationPrompt = enhancedPrompt
        if (attempt > 1) {
          const variationInstructions = [
            "Create a completely different composition while keeping both faces front-facing. Change the lighting, background, and setting significantly while keeping the same people. Use different colors, mood, and artistic style. Try a more intimate, close-up approach with warm lighting. IMPORTANT: Both faces must be facing the camera front-on, no side views or profiles.",
            "Generate a unique variation with different framing and setting while keeping both faces front-facing. Vary the visual elements substantially - different background, lighting, and perspective while maintaining the same people. Try a more playful, candid moment with natural lighting. IMPORTANT: Both faces must be facing the camera front-on, no side views or profiles."
          ]
          
          const instruction = variationInstructions[attempt - 2] || variationInstructions[0]
          
          // Add random elements to ensure more variation
          const randomElements = [
            "Use warm, golden lighting with both faces front-facing",
            "Use cool, blue lighting with both faces front-facing", 
            "Use dramatic, high-contrast lighting with both faces front-facing",
            "Use soft, diffused lighting with both faces front-facing",
            "Use a wide-angle perspective with both faces front-facing",
            "Use a close-up, intimate perspective with both faces front-facing",
            "Use a low camera angle with both faces front-facing",
            "Use a high camera angle with both faces front-facing",
            "Add depth of field blur with both faces front-facing",
            "Use sharp, detailed focus throughout with both faces front-facing"
          ]
          
          const randomElement = randomElements[Math.floor(Math.random() * randomElements.length)]
          variationPrompt = `${enhancedPrompt}\n\n${instruction} ${randomElement}.`
        }
        
        console.log(`Sending request to Gemini for attempt ${attempt}`)
        if (attempt > 1) {
          console.log(`Variation prompt for attempt ${attempt}:`, variationPrompt.substring(0, 200) + '...')
        }
        
        const result = await genAI.models.generateContent({
          model: 'gemini-2.5-flash-image-preview',
          contents: [
            { text: variationPrompt },
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: currentImage.split(',')[1]
              }
            },
            {
              inlineData: {
                mimeType: 'image/jpeg', 
                data: childhoodImage.split(',')[1]
              }
            }
          ]
        })

        console.log(`Received response for attempt ${attempt}:`, {
          hasCandidates: !!result.candidates,
          candidatesLength: result.candidates?.length || 0
        })

        if (result.candidates && result.candidates.length > 0) {
          const candidate = result.candidates[0]
          console.log(`Processing candidate for attempt ${attempt}:`, {
            hasContent: !!candidate.content,
            hasParts: !!(candidate.content && candidate.content.parts),
            partsLength: candidate.content?.parts?.length || 0
          })
          
          if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
            const part = candidate.content.parts[0]
            console.log(`Processing part for attempt ${attempt}:`, {
              hasInlineData: !!part.inlineData,
              mimeType: part.inlineData?.mimeType,
              dataLength: part.inlineData?.data?.length || 0
            })
            
            if (part.inlineData && part.inlineData.data) {
              const imageData = `data:image/jpeg;base64,${part.inlineData.data}`
              generatedImages.push(imageData)
              console.log(`Successfully generated image ${attempt}, size: ${imageData.length} characters`)
            } else {
              console.warn(`No image data in response for attempt ${attempt}`)
            }
          } else {
            console.warn(`No content parts found for attempt ${attempt}`)
          }
        } else {
          console.warn(`No candidates found for attempt ${attempt}`)
        }
        
        // Add a delay between generations to ensure distinct variations
        if (attempt < maxAttempts) {
          console.log(`Waiting 1.5 seconds before next variation...`)
          await new Promise(resolve => setTimeout(resolve, 1500))
        }
        
      } catch (error) {
        console.error(`Error generating image ${attempt}:`, error)
        
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

    console.log(`Generation completed. Generated ${generatedImages.length} images out of ${maxAttempts} attempts`)

    if (generatedImages.length === 0) {
      return NextResponse.json({ 
        error: 'Failed to generate images. Please try again with different photos or prompts.' 
      }, { status: 500 })
    }

    // If we have fewer than 3 images, try to generate more
    if (generatedImages.length < 3) {
      console.log(`Only generated ${generatedImages.length} images, attempting to generate more...`)
      
      for (let attempt = generatedImages.length + 1; attempt <= 3; attempt++) {
        try {
          console.log(`Additional generation attempt ${attempt}/3`)
          
          // Use a different variation for additional attempts
          const additionalVariations = [
            "Create a more artistic, dreamy interpretation with soft focus and ethereal lighting. Show the emotional connection between the adult and child in a more abstract, artistic way. IMPORTANT: Both faces must be facing the camera front-on, no side views or profiles.",
            "Generate a candid, spontaneous moment with natural lighting and a more relaxed, everyday setting. Capture the genuine joy and connection between the two people. IMPORTANT: Both faces must be facing the camera front-on, no side views or profiles."
          ]
          
          const variationInstruction = additionalVariations[(attempt - generatedImages.length - 1) % additionalVariations.length]
          const additionalPrompt = `${enhancedPrompt}\n\n${variationInstruction}`
          
          const result = await genAI.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [
              { text: additionalPrompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: currentImage.split(',')[1]
                }
              },
              {
                inlineData: {
                  mimeType: 'image/jpeg', 
                  data: childhoodImage.split(',')[1]
                }
              }
            ]
          })

          if (result.candidates && result.candidates.length > 0) {
            const candidate = result.candidates[0]
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              const part = candidate.content.parts[0]
              if (part.inlineData && part.inlineData.data) {
                const imageData = `data:image/jpeg;base64,${part.inlineData.data}`
                generatedImages.push(imageData)
                console.log(`Successfully generated additional image ${attempt}, size: ${imageData.length} characters`)
              }
            }
          }
          
          // Add delay between additional attempts
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        } catch (error) {
          console.error(`Error in additional generation attempt ${attempt}:`, error)
        }
      }
    }

    // Only deduct credits after successful generation
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        credits_left: (profile.credits_left || 0) - 1,
        total_credits_used: (profile.total_credits_used || 0) + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Failed to update credits:', updateError)
      // Don't fail the request if credit update fails - user still gets their images
      console.warn('Credit update failed but generation was successful')
    }

    const creditsLeft = (profile.credits_left || 0) - 1

    // Log generation (optional - skip if table structure doesn't match)
    console.log(`Generation completed for user ${userId}: ${generatedImages.length} images generated`)

    return NextResponse.json({
      success: true,
      images: generatedImages,
      credits_used: 1,
      credits_remaining: creditsLeft
    })

  } catch (error) {
    console.error('Hug childhood generation error:', error)
    
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
