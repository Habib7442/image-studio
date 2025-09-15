import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { imageId } = await request.json()
    
    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // First, get the image record to get the storage path
    const { data: imageRecord, error: fetchError } = await supabase
      .from('generated_images')
      .select('storage_path, user_id')
      .eq('id', imageId)
      .eq('user_id', userId)
      .single()

    if (fetchError || !imageRecord) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('generated-images')
      .remove([imageRecord.storage_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('generated_images')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId)

    if (dbError) {
      return NextResponse.json({ error: 'Failed to delete image from database' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Image deleted successfully' })

  } catch (error) {
    console.error('Delete image error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
