import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
  fileType?: string
  initialQuality?: number
}

export const defaultCompressionOptions: CompressionOptions = {
  maxSizeMB: 1, // Maximum 1MB output
  maxWidthOrHeight: 1024, // Max 1024px dimension
  useWebWorker: true, // Use Web Worker for performance
  fileType: 'image/jpeg', // Consistent output format
  initialQuality: 0.8, // 80% quality
}

/**
 * Compress an image file using browser-image-compression library
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Promise<string> - Base64 data URL of compressed image
 */
export const compressImage = async (
  file: File, 
  options: CompressionOptions = defaultCompressionOptions
): Promise<string> => {
  try {
    const compressedFile = await imageCompression(file, options)
    
    // Convert compressed file to base64 data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error('Failed to read compressed file'))
      reader.readAsDataURL(compressedFile)
    })
  } catch (error) {
    console.error('Image compression failed:', error)
    throw new Error('Failed to compress image')
  }
}

/**
 * Compress image with fallback to original if compression fails
 * @param file - The image file to compress
 * @param options - Compression options (optional)
 * @returns Promise<string> - Base64 data URL of compressed or original image
 */
export const compressImageWithFallback = async (
  file: File,
  options: CompressionOptions = defaultCompressionOptions
): Promise<{ dataUrl: string; wasCompressed: boolean; error?: string }> => {
  try {
    const compressedDataUrl = await compressImage(file, options)
    return { dataUrl: compressedDataUrl, wasCompressed: true }
  } catch (error) {
    console.warn('Compression failed, using original image:', error)
    
    // Fallback to original image
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({ 
          dataUrl: reader.result as string, 
          wasCompressed: false,
          error: 'Compression failed, using original. File may be too large for generation.'
        })
      }
      reader.onerror = () => reject(new Error('Failed to read original file'))
      reader.readAsDataURL(file)
    })
  }
}
