import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { auth } from '@clerk/nextjs/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';

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
const RATE_LIMIT_WINDOW = 60 * 60; // 1 hour in seconds
const RATE_LIMIT_MAX_REQUESTS = 20; // 20 generations per hour for AI editor

// Check rate limit using Redis
async function checkRateLimit(identifier: string): Promise<boolean> {
  // If Redis is not configured, skip rate limiting
  if (!redis) {
    console.log('Redis not configured, skipping rate limiting');
    return true;
  }

  try {
    const key = `rate_limit:ai_editor:${identifier}`;
    const current = await redis.get(key);
    
    if (current === null) {
      // First request - set with expiration
      await redis.setex(key, RATE_LIMIT_WINDOW, 1);
      return true;
    }
    
    const count = parseInt(current as string);
    
    if (count >= RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }
    
    // Increment counter
    await redis.incr(key);
    return true;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Fail open - allow request if Redis is down
    return true;
  }
}

// Get user identifier for rate limiting
function getUserIdentifier(request: NextRequest, userId?: string): string {
  // Use user ID if authenticated, otherwise use IP address
  if (userId) {
    return `user:${userId}`;
  }
  
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return `ip:${ip}`;
}

// Professional prompt enhancement function
function enhanceUserPrompt(userPrompt: string, tool: string): string {
  const baseInstructions = `You are a professional image editor. Edit the provided image according to the user's request while following these critical guidelines:

CRITICAL EDITING PRINCIPLES:
- ONLY change what the user specifically requests - do not modify anything else
- If user asks to change background, ONLY change the background and keep everything else identical
- If user asks to change lighting, ONLY adjust lighting and keep everything else identical  
- If user asks to change colors, ONLY modify colors and keep everything else identical
- If user asks to remove something, ONLY remove that specific item and keep everything else identical
- If user asks to add something, ONLY add that specific item and keep everything else identical
- Preserve the original person's identity, facial features, and natural appearance exactly
- Maintain the exact same composition, pose, and positioning unless specifically requested to change
- Keep all other elements (clothing, objects, settings) exactly as they are unless specifically mentioned

SAFETY & QUALITY GUIDELINES:
- Preserve the subject's integrity and avoid creating duplicate body parts
- Ensure realistic proportions and natural human anatomy
- Maintain professional quality and high resolution
- Avoid any inappropriate or harmful content
- Ensure the result looks natural and professionally edited

TECHNICAL REQUIREMENTS:
- Use professional photography techniques
- Maintain proper lighting and shadows (unless specifically changing them)
- Ensure color accuracy and natural skin tones (unless specifically changing them)
- Keep the image sharp and well-composed
- Maintain the original aspect ratio unless specifically requested to change it

USER REQUEST: "${userPrompt}"

IMPORTANT: Only make the specific changes requested by the user. Do not add, remove, or modify anything else. The result should look like a precise, professional edit that only addresses the user's specific request.`;

  // Add tool-specific enhancements
  const toolEnhancements = {
    'ai-enhance': `Focus ONLY on enhancing the specific aspects mentioned in the user's request. Do not change anything else.`,
    'ai-remove-bg': `Remove or replace ONLY the background while keeping the main subject perfectly intact with clean edges. Do not modify the subject.`,
    'ai-style': `Apply ONLY the specific style transformation requested by the user. Do not change anything else.`,
    'ai-upscale': `Increase resolution while enhancing details. Do not change colors, composition, or other elements unless specifically requested.`,
    'ai-colorize': `Add or enhance ONLY the colors mentioned in the user's request. Do not change other elements.`,
    'ai-restore': `Remove ONLY the specific imperfections mentioned by the user. Do not change anything else.`
  };

  const toolEnhancement = toolEnhancements[tool as keyof typeof toolEnhancements] || '';
  
  return `${baseInstructions}\n\nSPECIFIC INSTRUCTION: ${toolEnhancement}`;
}

// AI Tool configurations
const AI_TOOLS = {
  'ai-enhance': {
    name: 'AI Enhance',
    prompt: 'Enhance this image to make it look more professional and high-quality. Improve lighting, colors, sharpness, and overall visual appeal while maintaining the original composition and subject.',
    model: 'gemini-2.5-flash-image-preview'
  },
  'ai-remove-bg': {
    name: 'Remove Background',
    prompt: 'Remove the background from this image, keeping only the main subject. Make the background transparent or replace it with a clean white background.',
    model: 'gemini-2.5-flash-image-preview'
  },
  'ai-style': {
    name: 'AI Style Transfer',
    prompt: 'Apply artistic style transformation to this image. Create a visually stunning result with enhanced colors, lighting, and artistic effects while maintaining the original subject and composition.',
    model: 'gemini-2.5-flash-image-preview'
  },
  'ai-upscale': {
    name: 'AI Upscale',
    prompt: 'Upscale this image to higher resolution while maintaining quality and sharpness. Enhance details and make it suitable for high-resolution display.',
    model: 'gemini-2.5-flash-image-preview'
  },
  'ai-colorize': {
    name: 'AI Colorize',
    prompt: 'Add vibrant and realistic colors to this image. Enhance the color palette, saturation, and vibrancy while maintaining natural-looking results.',
    model: 'gemini-2.5-flash-image-preview'
  },
  'ai-restore': {
    name: 'AI Restore',
    prompt: 'Restore and enhance this image by removing noise, artifacts, and imperfections. Improve clarity, sharpness, and overall quality while preserving the original content.',
    model: 'gemini-2.5-flash-image-preview'
  }
};

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check rate limit
    const identifier = getUserIdentifier(request, userId);
    const isRateLimited = await checkRateLimit(identifier);
    if (!isRateLimited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. You can generate up to 20 images per hour. Please try again later.' 
        },
        { status: 429 }
      )
    }

    // Parse request body
    const body = await request.json();
    const { prompt, image, tool, settings } = body;

    // Input validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (prompt.length > 1000) {
      return NextResponse.json(
        { error: 'Prompt must be less than 1000 characters' },
        { status: 400 }
      );
    }

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be a valid base64 image.' },
        { status: 400 }
      );
    }

    if (!tool || !AI_TOOLS[tool as keyof typeof AI_TOOLS]) {
      return NextResponse.json(
        { error: 'Invalid AI tool selected' },
        { status: 400 }
      );
    }

    // Get Supabase client for user profile lookup
    const supabase = createServiceRoleClient();
    
    // Check user credits using Clerk userId
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('credits_left, total_credits_used, is_founding_user')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (profile.credits_left <= 0) {
      return NextResponse.json(
        { error: 'No credits remaining. Credits reset daily.' },
        { status: 402 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    // Get tool configuration
    const toolConfig = AI_TOOLS[tool as keyof typeof AI_TOOLS];
    
    // Build enhanced prompt with professional prompt engineering
    let enhancedPrompt = enhanceUserPrompt(prompt.trim(), tool);
    
    // Add quality and strength settings
    const qualitySettings = {
      fast: 'Generate quickly with good quality',
      standard: 'Generate with high quality and attention to detail',
      pro: 'Generate with maximum quality, professional-grade results, and perfect attention to detail'
    };
    
    const strengthSettings = {
      low: 'Apply subtle changes that enhance the image naturally',
      medium: 'Apply moderate changes that are noticeable but realistic',
      high: 'Apply strong changes that create dramatic improvements'
    };
    
    const aiStrength = settings?.aiStrength || 0.7;
    const strength = aiStrength < 0.3 ? 'low' : aiStrength < 0.7 ? 'medium' : 'high';
    
    enhancedPrompt += `\n\nQuality: ${qualitySettings[settings?.quality || 'standard']}\nStrength: ${strengthSettings[strength]}`;
    
    // Add format and resolution requirements
    enhancedPrompt += `\n\nCRITICAL: Generate a compressed, web-optimized image with minimal file size for fast loading. IMPORTANT: Do not add any text, watermarks, names, or written content to the image unless specifically requested in the prompt.`;

    // Prepare the generation request
    const generationRequest = {
      model: toolConfig.model,
      contents: [
        { text: enhancedPrompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: image.replace(/^data:image\/[a-z]+;base64,/, '')
          }
        }
      ]
    };

    console.log(`Starting AI Editor generation with tool: ${tool}, prompt: ${prompt.substring(0, 50)}...`);
    
    const result = await genAI.models.generateContent(generationRequest);
    
    console.log(`Received response:`, {
      hasCandidates: !!result.candidates,
      candidatesLength: result.candidates?.length || 0
    });
    
    let generatedImage: string | null = null;
    
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      
      if (candidate.content && candidate.content.parts) {
        console.log(`Processing ${candidate.content.parts.length} parts`);
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            generatedImage = `data:image/jpeg;base64,${part.inlineData.data}`;
            console.log(`Successfully generated image, size: ${generatedImage.length} characters`);
            break; // Only take the first image
          }
        }
      } else {
        console.log(`No content parts found`);
      }
    } else {
      console.log(`No candidates found`);
    }

    if (!generatedImage) {
      return NextResponse.json(
        { error: 'No image was generated. Please try a different prompt or tool.' },
        { status: 500 }
      );
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
      // Don't fail the request if credit update fails - user still gets their image
      console.warn('Credit update failed but generation was successful');
    }

    const creditsLeft = profile.credits_left - 1;

    // Return success response
    return NextResponse.json({
      success: true,
      result: generatedImage,
      tool: tool,
      toolName: toolConfig.name,
      creditsLeft,
      prompt: enhancedPrompt,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Editor generation error:', error);
    
    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'AI service authentication failed' },
          { status: 500 }
        );
      }
      
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('RESOURCE_EXHAUSTED')) {
        return NextResponse.json(
          { 
            error: 'AI service quota exceeded. You have reached the daily limit for free tier. Please try again tomorrow or upgrade your plan.',
            errorType: 'QUOTA_EXCEEDED',
            retryAfter: '24 hours'
          },
          { status: 429 }
        );
      }
      
      if (error.message.includes('429')) {
        return NextResponse.json(
          { 
            error: 'Too many requests. Please wait a few minutes before trying again.',
            errorType: 'RATE_LIMITED',
            retryAfter: '5 minutes'
          },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
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
  });
}
