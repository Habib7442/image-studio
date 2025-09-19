import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { inngest } from '@/inngest/client';
import { imageStoreService } from '@/lib/image-store';

// Generate unique request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication with Clerk
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json();
    const { prompt, selfieImage } = body;

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

    if (!selfieImage || typeof selfieImage !== 'string') {
      return NextResponse.json(
        { error: 'Selfie image is required' },
        { status: 400 }
      );
    }

    if (!selfieImage.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'Invalid image format. Must be a valid base64 image.' },
        { status: 400 }
      );
    }

    // Generate unique request ID for tracking
    const requestId = generateRequestId();

    // Store the image temporarily
    imageStoreService.set(requestId, selfieImage);

    // Send event to Inngest to start the workflow (without the large image data)
    await inngest.send({
      name: "selfie/generate",
      data: {
        userId,
        requestId,
        prompt: prompt.trim(),
        // Don't include the image data in the event
      }
    });

    // Return immediate response with request ID for tracking
    return NextResponse.json({
      success: true,
      message: 'Image generation started',
      requestId,
      status: 'processing'
    });

  } catch (error) {
    console.error('Style My Selfie API error:', error);
    
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