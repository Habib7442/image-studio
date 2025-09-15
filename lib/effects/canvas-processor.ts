// Canvas-based image processing utilities
// Removed unused import

export interface ProcessingOptions {
  intensity?: number
  direction?: number
  centerX?: number
  centerY?: number
  offset?: number
  strength?: number
  size?: number
  caption?: string
  borderSize?: number
  stripCount?: number
  spacing?: number
}

export class CanvasProcessor {
  private canvas: HTMLCanvasElement | null = null
  private ctx: CanvasRenderingContext2D | null = null

  constructor() {
    // Don't create canvas in constructor to avoid SSR issues
    // Canvas will be created lazily when needed
  }

  private ensureCanvas(): void {
    if (typeof window === 'undefined') {
      throw new Error('Canvas operations can only be performed in the browser')
    }
    
    if (!this.canvas) {
      this.canvas = document.createElement('canvas')
      this.ctx = this.canvas.getContext('2d')!
    }
  }

  // Load image from base64 or ImageData with CORS handling
  async loadImage(imageSource: string | ImageData): Promise<ImageData> {
    this.ensureCanvas()

    console.log('CanvasProcessor.loadImage called with:', { 
      type: typeof imageSource, 
      isImageData: imageSource instanceof ImageData,
      isBase64: typeof imageSource === 'string' && imageSource.startsWith('data:image/'),
      isUrl: typeof imageSource === 'string' && (imageSource.startsWith('http') || imageSource.startsWith('/'))
    })

    if (imageSource instanceof ImageData) {
      return imageSource
    }

    // Validate base64 image format and size before processing
    if (typeof imageSource === 'string' && imageSource.startsWith('data:image/')) {
      // Reject SVG explicitly for security
      if (imageSource.startsWith('data:image/svg+xml')) {
        throw new Error('SVG images are not supported for effects processing')
      }

      const base64Data = imageSource.split(',')[1]
      if (base64Data) {
        const approxBytes = Math.floor((base64Data.length * 3) / 4)
        if (approxBytes > 6 * 1024 * 1024) { // 6MB limit
          throw new Error('Image too large for effects processing. Maximum size is 6MB.')
        }
      }
    }

    return new Promise((resolve, reject) => {
      const img = new Image()
      
      // Enable CORS for external images
      img.crossOrigin = 'anonymous'
      
      img.onload = () => {
        try {
          console.log('Image loaded successfully:', { 
            width: img.width, 
            height: img.height,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          })
          
          // Additional dimension validation
          if (img.width > 4096 || img.height > 4096) {
            reject(new Error('Image dimensions too large. Maximum 4096x4096 pixels.'))
            return
          }

          this.canvas!.width = img.width
          this.canvas!.height = img.height
          this.ctx!.drawImage(img, 0, 0)
          const imageData = this.ctx!.getImageData(0, 0, this.canvas!.width, this.canvas!.height)
          console.log('ImageData created successfully:', { 
            width: imageData.width, 
            height: imageData.height,
            dataLength: imageData.data.length
          })
          resolve(imageData)
        } catch (error) {
          console.error('Error in img.onload:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            name: error instanceof Error ? error.name : undefined,
            error: error
          })
          // If canvas is tainted, try alternative approach
          if (error instanceof DOMException && error.name === 'SecurityError') {
            console.log('Canvas tainted, trying fetch method...')
            this.loadImageViaFetch(imageSource).then(resolve).catch(reject)
          } else {
            reject(error)
          }
        }
      }
      
      img.onerror = (error) => {
        console.error('Image load error:', {
          message: error instanceof Error ? error.message : 'Image load failed',
          error: error
        })
        reject(new Error('Failed to load image'))
      }
      
      console.log('Setting image source:', imageSource)
      img.src = imageSource
    })
  }

  // Alternative method to load images via fetch to avoid CORS issues
  private async loadImageViaFetch(imageSource: string): Promise<ImageData> {
    this.ensureCanvas()

    try {
      console.log('Fetching image via fetch method:', imageSource)
      
      // Fetch the image as a blob
      const response = await fetch(imageSource)
      console.log('Fetch response:', { 
        status: response.status, 
        statusText: response.statusText,
        contentType: response.headers.get('content-type')
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`)
      }
      
      const blob = await response.blob()
      console.log('Blob created:', { size: blob.size, type: blob.type })
      
      // Convert blob to base64
      const base64Url = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          console.log('Base64 conversion successful')
          resolve(reader.result as string)
        }
        reader.onerror = (error) => {
          console.error('Base64 conversion failed:', error)
          reject(error)
        }
        reader.readAsDataURL(blob)
      })

      // Load the base64 image
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          try {
            console.log('Base64 image loaded:', { 
              width: img.width, 
              height: img.height 
            })
            
            if (img.width > 4096 || img.height > 4096) {
              reject(new Error('Image dimensions too large. Maximum 4096x4096 pixels.'))
              return
            }

            this.canvas!.width = img.width
            this.canvas!.height = img.height
            this.ctx!.drawImage(img, 0, 0)
            const imageData = this.ctx!.getImageData(0, 0, this.canvas!.width, this.canvas!.height)
            console.log('ImageData created via fetch method:', { 
              width: imageData.width, 
              height: imageData.height 
            })
            resolve(imageData)
          } catch (error) {
            console.error('Error processing base64 image:', error)
            reject(new Error('Failed to process image data. The image may be corrupted or in an unsupported format.'))
          }
        }
        img.onerror = (error) => {
          console.error('Base64 image load error:', error)
          reject(new Error('Failed to load image'))
        }
        img.src = base64Url
      })
    } catch (error) {
      console.error('Fetch method failed:', error)
      throw new Error(`Failed to load image via fetch: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Convert ImageData to base64
  imageDataToBase64(imageData: ImageData): string {
    this.ensureCanvas()
    this.canvas!.width = imageData.width
    this.canvas!.height = imageData.height
    this.ctx!.putImageData(imageData, 0, 0)
    return this.canvas!.toDataURL('image/jpeg', 0.9)
  }

  // Apply motion blur effect
  applyMotionBlur(imageData: ImageData, options: ProcessingOptions): ImageData {
    const { intensity = 10, direction = 0 } = options
    const data = new Uint8ClampedArray(imageData.data)
    const width = imageData.width
    const height = imageData.height

    // Convert direction to radians
    const angle = (direction * Math.PI) / 180
    const dx = Math.cos(angle) * intensity
    const dy = Math.sin(angle) * intensity

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0

        // Sample along the blur direction
        for (let i = -intensity; i <= intensity; i++) {
          const nx = Math.round(x + (dx * i) / intensity)
          const ny = Math.round(y + (dy * i) / intensity)

          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4
            r += data[idx]
            g += data[idx + 1]
            b += data[idx + 2]
            count++
          }
        }

        const idx = (y * width + x) * 4
        data[idx] = r / count
        data[idx + 1] = g / count
        data[idx + 2] = b / count
      }
    }

    return new ImageData(data, width, height)
  }

      // Apply radial blur effect
      applyRadialBlur(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 15, centerX = 0.5, centerY = 0.5 } = options
        const data = new Uint8ClampedArray(imageData.data)
        const width = imageData.width
        const height = imageData.height
        const centerXpx = centerX * width
        const centerYpx = centerY * height
        const maxDistance = Math.sqrt(width * width + height * height) / 2

        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const dx = x - centerXpx
            const dy = y - centerYpx
            const distance = Math.sqrt(dx * dx + dy * dy)
            const normalizedDistance = distance / maxDistance
            const blurRadius = Math.min(intensity, normalizedDistance * intensity)

            if (blurRadius > 1) {
              let r = 0, g = 0, b = 0, count = 0

              // Sample points in a circular pattern around the current pixel
              for (let i = 0; i < Math.min(blurRadius, 20); i++) {
                const angle = (i / Math.min(blurRadius, 20)) * Math.PI * 2
                const sampleDistance = (i / Math.min(blurRadius, 20)) * blurRadius
                const nx = Math.round(centerXpx + Math.cos(angle) * sampleDistance)
                const ny = Math.round(centerYpx + Math.sin(angle) * sampleDistance)

                if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                  const idx = (ny * width + nx) * 4
                  r += data[idx]
                  g += data[idx + 1]
                  b += data[idx + 2]
                  count++
                }
              }

              if (count > 0) {
                const idx = (y * width + x) * 4
                data[idx] = r / count
                data[idx + 1] = g / count
                data[idx + 2] = b / count
              }
            }
          }
        }

        return new ImageData(data, width, height)
      }

  // Apply gaussian blur effect
  applyGaussianBlur(imageData: ImageData, options: ProcessingOptions): ImageData {
    const { intensity = 5 } = options
    const data = new Uint8ClampedArray(imageData.data)
    const width = imageData.width
    const height = imageData.height

    // Simple box blur approximation
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0

        for (let dy = -intensity; dy <= intensity; dy++) {
          for (let dx = -intensity; dx <= intensity; dx++) {
            const nx = x + dx
            const ny = y + dy

            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4
              r += data[idx]
              g += data[idx + 1]
              b += data[idx + 2]
              count++
            }
          }
        }

        const idx = (y * width + x) * 4
        data[idx] = r / count
        data[idx + 1] = g / count
        data[idx + 2] = b / count
      }
    }

    return new ImageData(data, width, height)
  }

  // Apply chromatic aberration effect
  applyChromaticAberration(imageData: ImageData, options: ProcessingOptions): ImageData {
    const { offset = 5, strength = 1 } = options
    const data = new Uint8ClampedArray(imageData.data)
    const width = imageData.width
    const height = imageData.height

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4

        // Red channel offset
        const rIdx = ((y + offset) * width + (x + offset)) * 4
        if (rIdx >= 0 && rIdx < data.length) {
          data[idx] = data[rIdx] * strength + data[idx] * (1 - strength)
        }

        // Blue channel offset
        const bIdx = ((y - offset) * width + (x - offset)) * 4
        if (bIdx >= 0 && bIdx < data.length) {
          data[idx + 2] = data[bIdx + 2] * strength + data[idx + 2] * (1 - strength)
        }
      }
    }

    return new ImageData(data, width, height)
  }

  // Apply vignette effect
  applyVignette(imageData: ImageData, options: ProcessingOptions): ImageData {
    const { strength = 0.8, size = 0.5 } = options
    const data = new Uint8ClampedArray(imageData.data)
    const width = imageData.width
    const height = imageData.height
    const centerX = width / 2
    const centerY = height / 2
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY) * size

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX
        const dy = y - centerY
        const distance = Math.sqrt(dx * dx + dy * dy)
        const vignette = Math.pow(distance / maxDistance, 2) * strength

        const idx = (y * width + x) * 4
        data[idx] = Math.max(0, data[idx] * (1 - vignette))
        data[idx + 1] = Math.max(0, data[idx + 1] * (1 - vignette))
        data[idx + 2] = Math.max(0, data[idx + 2] * (1 - vignette))
      }
    }

    return new ImageData(data, width, height)
  }

  // Apply sepia effect
  applySepia(imageData: ImageData, options: ProcessingOptions): ImageData {
    const { intensity = 0.8 } = options
    const data = new Uint8ClampedArray(imageData.data)
    const width = imageData.width
    const height = imageData.height

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189))
      const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168))
      const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131))

      data[i] = r * (1 - intensity) + newR * intensity
      data[i + 1] = g * (1 - intensity) + newG * intensity
      data[i + 2] = b * (1 - intensity) + newB * intensity
    }

    return new ImageData(data, width, height)
  }

  // Apply polaroid frame
  applyPolaroidFrame(imageData: ImageData, options: ProcessingOptions): ImageData {
    this.ensureCanvas()
    
    const { caption = 'Polaroid', borderSize = 60 } = options
    const width = imageData.width
    const height = imageData.height

    // Create new canvas with border
    const newCanvas = document.createElement('canvas')
    const newCtx = newCanvas.getContext('2d')!
    newCanvas.width = width + borderSize
    newCanvas.height = height + borderSize + 40

    // White background
    newCtx.fillStyle = '#ffffff'
    newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height)

    // Draw original image
    const tempCanvas = document.createElement('canvas')
    const tempCtx = tempCanvas.getContext('2d')!
    tempCanvas.width = width
    tempCanvas.height = height
    tempCtx.putImageData(imageData, 0, 0)

    newCtx.drawImage(tempCanvas, borderSize / 2, borderSize / 2, width, height)

    // Add caption
    newCtx.fillStyle = '#000000'
    newCtx.font = '20px Arial'
    newCtx.textAlign = 'left'
    newCtx.fillText(caption, borderSize / 2, height + borderSize / 2 + 20)

    // Get the result as ImageData
    return newCtx.getImageData(0, 0, newCanvas.width, newCanvas.height)
  }


      // Apply posterize effect
      applyPosterize(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { levels = 8 } = options
        const data = new Uint8ClampedArray(imageData.data)
        const step = 255 / (levels - 1)

        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.round(data[i] / step) * step
          data[i + 1] = Math.round(data[i + 1] / step) * step
          data[i + 2] = Math.round(data[i + 2] / step) * step
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply invert effect
      applyInvert(imageData: ImageData, options: ProcessingOptions): ImageData {
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          data[i] = 255 - data[i]
          data[i + 1] = 255 - data[i + 1]
          data[i + 2] = 255 - data[i + 2]
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply solarize effect
      applySolarize(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { threshold = 128 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] < threshold ? data[i] : 255 - data[i]
          data[i + 1] = data[i + 1] < threshold ? data[i + 1] : 255 - data[i + 1]
          data[i + 2] = data[i + 2] < threshold ? data[i + 2] : 255 - data[i + 2]
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply cinematic effect
      applyCinematic(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.8 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Cinematic color grading - enhance oranges and teals
          const newR = Math.min(255, r * 1.1 + g * 0.1)
          const newG = Math.min(255, g * 0.9 + r * 0.05)
          const newB = Math.min(255, b * 0.8 + g * 0.2)

          data[i] = r * (1 - intensity) + newR * intensity
          data[i + 1] = g * (1 - intensity) + newG * intensity
          data[i + 2] = b * (1 - intensity) + newB * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply dramatic effect
      applyDramatic(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.7 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // High contrast and saturation
          const contrast = 1.3
          const saturation = 1.4

          r = Math.min(255, Math.max(0, (r - 128) * contrast + 128))
          g = Math.min(255, Math.max(0, (g - 128) * contrast + 128))
          b = Math.min(255, Math.max(0, (b - 128) * contrast + 128))

          // Increase saturation
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          r = Math.min(255, gray + (r - gray) * saturation)
          g = Math.min(255, gray + (g - gray) * saturation)
          b = Math.min(255, gray + (b - gray) * saturation)

          data[i] = data[i] * (1 - intensity) + r * intensity
          data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity
          data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply moody effect
      applyMoody(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.6 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Darken and desaturate
          const darken = 0.7
          const desaturate = 0.6

          r *= darken
          g *= darken
          b *= darken

          // Desaturate
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          r = gray + (r - gray) * desaturate
          g = gray + (g - gray) * desaturate
          b = gray + (b - gray) * desaturate

          data[i] = data[i] * (1 - intensity) + r * intensity
          data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity
          data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply vintage film effect
      applyVintageFilm(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.8 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Vintage film color grading
          const newR = Math.min(255, r * 1.1 + 10)
          const newG = Math.min(255, g * 0.95 + 5)
          const newB = Math.min(255, b * 0.9 + 15)

          // Add slight sepia tone
          const sepiaR = Math.min(255, newR * 0.9 + newG * 0.1)
          const sepiaG = Math.min(255, newG * 0.9 + newR * 0.05)
          const sepiaB = Math.min(255, newB * 0.8 + newG * 0.1)

          data[i] = r * (1 - intensity) + sepiaR * intensity
          data[i + 1] = g * (1 - intensity) + sepiaG * intensity
          data[i + 2] = b * (1 - intensity) + sepiaB * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply film noir effect
      applyNoir(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.9 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Convert to grayscale with high contrast
          const gray = r * 0.299 + g * 0.587 + b * 0.114
          const contrast = 1.5
          const adjustedGray = Math.min(255, Math.max(0, (gray - 128) * contrast + 128))

          data[i] = r * (1 - intensity) + adjustedGray * intensity
          data[i + 1] = g * (1 - intensity) + adjustedGray * intensity
          data[i + 2] = b * (1 - intensity) + adjustedGray * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply golden hour effect
      applyGoldenHour(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.7 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Warm golden tones
          const newR = Math.min(255, r * 1.2 + g * 0.3 + 20)
          const newG = Math.min(255, g * 1.1 + r * 0.2 + 10)
          const newB = Math.min(255, b * 0.8 + r * 0.1)

          data[i] = r * (1 - intensity) + newR * intensity
          data[i + 1] = g * (1 - intensity) + newG * intensity
          data[i + 2] = b * (1 - intensity) + newB * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply blue hour effect
      applyBlueHour(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.6 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Cool blue tones
          const newR = Math.min(255, r * 0.8 + b * 0.2)
          const newG = Math.min(255, g * 0.9 + b * 0.3)
          const newB = Math.min(255, b * 1.2 + g * 0.2 + 20)

          data[i] = r * (1 - intensity) + newR * intensity
          data[i + 1] = g * (1 - intensity) + newG * intensity
          data[i + 2] = b * (1 - intensity) + newB * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply high contrast effect
      applyHighContrast(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.8 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // High contrast adjustment
          const contrast = 1.8
          r = Math.min(255, Math.max(0, (r - 128) * contrast + 128))
          g = Math.min(255, Math.max(0, (g - 128) * contrast + 128))
          b = Math.min(255, Math.max(0, (b - 128) * contrast + 128))

          data[i] = data[i] * (1 - intensity) + r * intensity
          data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity
          data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

      // Apply dreamy effect
      applyDreamy(imageData: ImageData, options: ProcessingOptions): ImageData {
        const { intensity = 0.7 } = options
        const data = new Uint8ClampedArray(imageData.data)

        for (let i = 0; i < data.length; i += 4) {
          let r = data[i]
          let g = data[i + 1]
          let b = data[i + 2]

          // Soft, ethereal effect
          const newR = Math.min(255, r * 1.1 + g * 0.2 + 15)
          const newG = Math.min(255, g * 1.05 + b * 0.1 + 10)
          const newB = Math.min(255, b * 1.1 + r * 0.1 + 20)

          // Soften the colors
          const soften = 0.8
          r = r * (1 - soften) + newR * soften
          g = g * (1 - soften) + newG * soften
          b = b * (1 - soften) + newB * soften

          data[i] = data[i] * (1 - intensity) + r * intensity
          data[i + 1] = data[i + 1] * (1 - intensity) + g * intensity
          data[i + 2] = data[i + 2] * (1 - intensity) + b * intensity
        }

        return new ImageData(data, imageData.width, imageData.height)
      }

  // Main processing method
  async processImage(
    imageSource: string | ImageData,
    effectId: string,
    options: ProcessingOptions
  ): Promise<string> {
    this.ensureCanvas()
    const imageData = await this.loadImage(imageSource)
    let processedData: ImageData

        switch (effectId) {
          case 'motion-blur':
            processedData = this.applyMotionBlur(imageData, options)
            break
          case 'chromatic-aberration':
            processedData = this.applyChromaticAberration(imageData, options)
            break
          case 'vignette':
            processedData = this.applyVignette(imageData, options)
            break
          case 'sepia':
            processedData = this.applySepia(imageData, options)
            break
          case 'polaroid':
            processedData = this.applyPolaroidFrame(imageData, options)
            break
          case 'posterize':
            processedData = this.applyPosterize(imageData, options)
            break
          case 'solarize':
            processedData = this.applySolarize(imageData, options)
            break
          case 'cinematic':
            processedData = this.applyCinematic(imageData, options)
            break
          case 'dramatic':
            processedData = this.applyDramatic(imageData, options)
            break
          case 'moody':
            processedData = this.applyMoody(imageData, options)
            break
          case 'vintage-film':
            processedData = this.applyVintageFilm(imageData, options)
            break
          case 'noir':
            processedData = this.applyNoir(imageData, options)
            break
          case 'golden-hour':
            processedData = this.applyGoldenHour(imageData, options)
            break
          case 'blue-hour':
            processedData = this.applyBlueHour(imageData, options)
            break
          case 'high-contrast':
            processedData = this.applyHighContrast(imageData, options)
            break
          case 'dreamy':
            processedData = this.applyDreamy(imageData, options)
            break
          default:
            processedData = imageData
        }

    return this.imageDataToBase64(processedData)
  }
}

// Export singleton instance - safe for SSR
export const canvasProcessor = new CanvasProcessor()
