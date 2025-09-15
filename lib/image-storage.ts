import 'server-only'
import { createServiceRoleClient } from '@/lib/supabase/server'

export interface ImageUploadResult {
  id: string
  storage_path: string
  public_url: string
  signed_url?: string
}

export interface GeneratedImage {
  id: string
  storage_path: string
  prompt: string
  style: string
  user_id: string
  metadata?: {
    [key: string]: any
  }
  created_at: string
  expires_at: string
}

// Upload image to Supabase storage and save metadata to database
export const uploadImageToStorage = async (
  imageData: string,
  prompt: string,
  style: string,
  userId: string,
  metadata?: any
): Promise<ImageUploadResult> => {
  const supabase = createServiceRoleClient()
  
  // Convert base64 to blob for faster uploads
  const base64Data = imageData.split(',')[1]
  const binaryString = atob(base64Data)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  const blob = new Blob([bytes], { type: 'image/jpeg' })
  
  // Log performance metrics
  const sizeReduction = Math.round((1 - blob.size / imageData.length) * 100)
  console.log(`📊 Upload optimization: ${blob.size} bytes (blob) vs ${imageData.length} bytes (base64) - ${sizeReduction}% size reduction`)

  // Generate unique filename
  const timestamp = Date.now()
  const randomId = Math.random().toString(36).substring(2, 15)
  const filename = `${userId}/${timestamp}-${randomId}.jpg`
  const storagePath = `style-my-selfie/${filename}`

  // Upload to storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('generated-images')
    .upload(filename, blob, {
      contentType: 'image/jpeg',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('generated-images')
    .getPublicUrl(filename)

  // Generate signed URL (valid for 1 hour)
  const { data: signedUrlData } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(filename, 3600) // 1 hour

  // Save metadata to database
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  
  const { data: dbData, error: dbError } = await supabase
    .from('generated_images')
    .insert({
      user_id: userId,
      storage_path: filename, // Use filename instead of storagePath
      public_url: urlData.publicUrl,
      signed_url: signedUrlData?.signedUrl,
      prompt,
      style,
      metadata: metadata || {},
      expires_at: expiresAt.toISOString()
    })
    .select()
    .single()

  if (dbError) {
    // If database insert fails, clean up the uploaded file
    await supabase.storage
      .from('generated-images')
      .remove([filename])
    throw new Error(`Database insert failed: ${dbError.message}`)
  }

  return {
    id: dbData.id,
    storage_path: storagePath,
    public_url: urlData.publicUrl,
    signed_url: signedUrlData?.signedUrl
  }
}

// Upload multiple images to storage
export const uploadMultipleImagesToStorage = async (
  images: string[],
  prompt: string,
  style: string,
  userId: string,
  metadata?: any
): Promise<ImageUploadResult[]> => {
  const uploadPromises = images.map(async (imageData, index) => {
    const imageMetadata = {
      ...metadata,
      variation: index + 1,
      total_variations: images.length
    }
    
    return uploadImageToStorage(
      imageData,
      prompt,
      style,
      userId,
      imageMetadata
    )
  })

  return Promise.all(uploadPromises)
}

// Get signed URL for an image (for secure access)
export const getSignedUrl = async (
  storagePath: string,
  expiresIn: number = 3600
): Promise<string> => {
  const supabase = createServiceRoleClient()
  
  const filename = storagePath.split('/').pop()
  if (!filename) {
    throw new Error('Invalid storage path')
  }

  const { data, error } = await supabase.storage
    .from('generated-images')
    .createSignedUrl(filename, expiresIn)

  if (error) {
    throw new Error(`Failed to create signed URL: ${error.message}`)
  }

  return data.signedUrl
}

// Delete an image from storage and database
export const deleteImage = async (imageId: string, userId: string): Promise<void> => {
  const supabase = createServiceRoleClient()

  // Get image details first
  const { data: image, error: fetchError } = await supabase
    .from('generated_images')
    .select('storage_path')
    .eq('id', imageId)
    .eq('user_id', userId)
    .single()

  if (fetchError || !image) {
    throw new Error('Image not found')
  }

  // Extract filename from storage path
  const filename = image.storage_path.split('/').pop()

  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('generated-images')
    .remove([filename!])

  if (storageError) {
    console.error('Storage deletion error:', storageError)
  }

  // Mark as deleted in database
  const { error: dbError } = await supabase
    .from('generated_images')
    .update({ is_deleted: true })
    .eq('id', imageId)
    .eq('user_id', userId)

  if (dbError) {
    throw new Error(`Database deletion failed: ${dbError.message}`)
  }
}

// Clean up expired images
export const cleanupExpiredImages = async (): Promise<number> => {
  const supabase = createServiceRoleClient()

  // Get expired images
  const { data: expiredImages, error: fetchError } = await supabase
    .from('generated_images')
    .select('id, storage_path')
    .eq('is_deleted', false)
    .lt('expires_at', new Date().toISOString())

  if (fetchError) {
    throw new Error(`Failed to fetch expired images: ${fetchError.message}`)
  }

  if (!expiredImages || expiredImages.length === 0) {
    return 0
  }

  let cleanedCount = 0

  for (const image of expiredImages) {
    try {
      const filename = image.storage_path.split('/').pop()
      
      // Delete from storage
      await supabase.storage
        .from('generated-images')
        .remove([filename!])

      // Mark as deleted in database
      await supabase
        .from('generated_images')
        .update({ is_deleted: true })
        .eq('id', image.id)

      cleanedCount++
    } catch (error) {
      console.error(`Error cleaning up image ${image.id}:`, error)
    }
  }

  return cleanedCount
}
