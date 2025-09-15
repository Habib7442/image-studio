import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { generalApiRateLimit, createRateLimitHeaders } from '@/lib/rate-limit'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting check
    const rateLimitResult = await generalApiRateLimit.checkLimit(userId)
    
    if (!rateLimitResult.success) {
      const headers = createRateLimitHeaders(rateLimitResult)
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
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

    const supabase = createServiceRoleClient()
    
    // Get user's generated images
    const { data: images, error } = await supabase
      .from('generated_images')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching images:', error)
      return NextResponse.json(
        { error: 'Failed to fetch images' },
        { status: 500 }
      )
    }

    // Generate URLs for each image
    const imagesWithUrls = await Promise.all(
      (images || []).map(async (image) => {
        try {
          // Use the storage path directly (it should now be the correct path)
          const storagePath = image.storage_path
          
          // Generate public URL using the storage path
          const { data: publicUrlData } = supabase.storage
            .from('generated-images')
            .getPublicUrl(storagePath)
          
          // Generate signed URL (valid for 1 hour) using the storage path
          const { data: signedUrlData } = await supabase.storage
            .from('generated-images')
            .createSignedUrl(storagePath, 3600)
          
          return {
            ...image,
            public_url: publicUrlData.publicUrl,
            signed_url: signedUrlData?.signedUrl || publicUrlData.publicUrl
          }
        } catch (urlError) {
          console.error('Error generating URLs for image:', image.id, urlError)
          return {
            ...image,
            public_url: null,
            signed_url: null
          }
        }
      })
    )

    return NextResponse.json({ images: imagesWithUrls })
  } catch (error) {
    console.error('Error in images API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
