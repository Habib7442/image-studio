import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// In-memory store for progress tracking (in production, use Redis or database)
const progressStore = new Map<string, {
  requestId: string;
  userId: string;
  progress: number;
  step: string;
  message: string;
  status: 'processing' | 'completed' | 'failed';
  result?: {
    images: string[];
    creditsLeft: number;
  };
  error?: string;
  createdAt: number;
}>();

// Clean up old progress entries (older than 1 hour)
setInterval(() => {
  const oneHourAgo = Date.now() - (60 * 60 * 1000);
  for (const [key, value] of progressStore.entries()) {
    if (value.createdAt < oneHourAgo) {
      progressStore.delete(key);
    }
  }
}, 5 * 60 * 1000); // Run every 5 minutes

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Request ID is required' },
        { status: 400 }
      );
    }

    const progress = progressStore.get(requestId);

    if (!progress) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    // Verify the request belongs to the authenticated user
    if (progress.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If completed, try to get images from the image store
    let result = progress.result;
    if (progress.status === 'completed' && !result?.images) {
      try {
        const { imageStoreService } = await import('@/lib/image-store');
        const storedResult = imageStoreService.get(`${progress.requestId}_result`);
        if (storedResult) {
          const parsedResult = JSON.parse(storedResult);
          result = {
            ...result,
            images: parsedResult.images,
            creditsLeft: parsedResult.creditsLeft
          };
          // Clean up the stored result
          imageStoreService.delete(`${progress.requestId}_result`);
        }
      } catch (error) {
        console.error('Error retrieving stored result:', error);
      }
    }

    return NextResponse.json({
      requestId: progress.requestId,
      progress: progress.progress,
      step: progress.step,
      message: progress.message,
      status: progress.status,
      result: result,
      error: progress.error
    });

  } catch (error) {
    console.error('Progress tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Webhook endpoint for Inngest to update progress
export async function POST(request: NextRequest) {
  try {
    // Basic security check - ensure request is from localhost (Inngest dev server)
    // In production, you'd validate Inngest's webhook signature
    const origin = request.headers.get('origin') || request.headers.get('referer');
    const isLocalhost = origin?.includes('localhost') || origin?.includes('127.0.0.1');
    
    if (!isLocalhost && process.env.NODE_ENV === 'development') {
      return NextResponse.json({ error: 'Unauthorized origin' }, { status: 403 });
    }

    const body = await request.json();
    const { requestId, userId, progress, step, message, status, result, error } = body;

    if (!requestId || !userId) {
      return NextResponse.json(
        { error: 'Request ID and User ID are required' },
        { status: 400 }
      );
    }

    const existingProgress = progressStore.get(requestId) || {
      requestId,
      userId,
      progress: 0,
      step: 'initializing',
      message: 'Starting generation...',
      status: 'processing' as const,
      createdAt: Date.now()
    };

    progressStore.set(requestId, {
      ...existingProgress,
      progress: progress ?? existingProgress.progress,
      step: step ?? existingProgress.step,
      message: message ?? existingProgress.message,
      status: status ?? existingProgress.status,
      result: result ?? existingProgress.result,
      error: error ?? existingProgress.error
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Progress update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
