import { createServiceRoleClient } from '@/lib/supabase/server'

export interface CleanupResult {
  success: boolean
  deletedCount: number
  errors: string[]
  deletedImages: Array<{
    id: string
    storage_path: string
    created_at: string
  }>
}

/**
 * Cleanup expired images from both Supabase storage and database
 * Images are considered expired if they were created more than 1 hour ago
 */
export async function cleanupExpiredImages(): Promise<CleanupResult> {
  const supabase = createServiceRoleClient()
  const errors: string[] = []
  const deletedImages: Array<{
    id: string
    storage_path: string
    created_at: string
  }> = []

  try {
    // Calculate the cutoff time (1 hour ago)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    console.log(`Starting cleanup for images created before: ${oneHourAgo}`)

    // Find all images older than 1 hour
    const { data: expiredImages, error: fetchError } = await supabase
      .from('generated_images')
      .select('id, storage_path, created_at, user_id')
      .lt('created_at', oneHourAgo)

    if (fetchError) {
      console.error('Error fetching expired images:', fetchError)
      return {
        success: false,
        deletedCount: 0,
        errors: [`Failed to fetch expired images: ${fetchError.message}`],
        deletedImages: []
      }
    }

    if (!expiredImages || expiredImages.length === 0) {
      console.log('No expired images found')
      return {
        success: true,
        deletedCount: 0,
        errors: [],
        deletedImages: []
      }
    }

    console.log(`Found ${expiredImages.length} expired images to delete`)

    // Process each expired image
    for (const image of expiredImages) {
      try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('generated-images')
          .remove([image.storage_path])

        if (storageError) {
          console.error(`Storage deletion error for image ${image.id}:`, storageError)
          errors.push(`Failed to delete ${image.storage_path} from storage: ${storageError.message}`)
          // Continue with database deletion even if storage deletion fails
        }

        // Delete from database
        const { error: dbError } = await supabase
          .from('generated_images')
          .delete()
          .eq('id', image.id)

        if (dbError) {
          console.error(`Database deletion error for image ${image.id}:`, dbError)
          errors.push(`Failed to delete image ${image.id} from database: ${dbError.message}`)
        } else {
          // Only add to deletedImages if database deletion succeeded
          deletedImages.push({
            id: image.id,
            storage_path: image.storage_path,
            created_at: image.created_at
          })
        }

      } catch (error) {
        console.error(`Error processing image ${image.id}:`, error)
        errors.push(`Error processing image ${image.id}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const success = errors.length === 0 || deletedImages.length > 0
    const deletedCount = deletedImages.length

    console.log(`Cleanup completed. Deleted ${deletedCount} images. Errors: ${errors.length}`)

    return {
      success,
      deletedCount,
      errors,
      deletedImages
    }

  } catch (error) {
    console.error('Cleanup function error:', error)
    return {
      success: false,
      deletedCount: 0,
      errors: [`Cleanup function error: ${error instanceof Error ? error.message : 'Unknown error'}`],
      deletedImages: []
    }
  }
}

/**
 * Get statistics about image cleanup
 */
export async function getCleanupStats() {
  const supabase = createServiceRoleClient()
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()

  try {
    // Get total images
    const { count: totalImages, error: totalError } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true })

    // Get expired images count
    const { count: expiredImages, error: expiredError } = await supabase
      .from('generated_images')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', oneHourAgo)

    if (totalError || expiredError) {
      throw new Error(`Database error: ${totalError?.message || expiredError?.message}`)
    }

    return {
      totalImages: totalImages || 0,
      expiredImages: expiredImages || 0,
      cutoffTime: oneHourAgo
    }
  } catch (error) {
    console.error('Error getting cleanup stats:', error)
    return {
      totalImages: 0,
      expiredImages: 0,
      cutoffTime: oneHourAgo,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}
