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

  // Load image from base64 or ImageData
  async loadImage(imageSource: string | ImageData): Promise<ImageData> {
    this.ensureCanvas()
    
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
      img.onload = () => {
        // Additional dimension validation
        if (img.width > 4096 || img.height > 4096) {
          reject(new Error('Image dimensions too large. Maximum 4096x4096 pixels.'))
          return
        }
        
        this.canvas!.width = img.width
        this.canvas!.height = img.height
        this.ctx!.drawImage(img, 0, 0)
        const imageData = this.ctx!.getImageData(0, 0, this.canvas!.width, this.canvas!.height)
        resolve(imageData)
      }
      img.onerror = reject
      img.src = imageSource
    })
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

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerXpx
        const dy = y - centerYpx
        const distance = Math.sqrt(dx * dx + dy * dy)
        const blurRadius = Math.min(intensity, distance / 10)

        if (blurRadius > 0) {
          let r = 0, g = 0, b = 0, count = 0

          for (let i = 0; i < blurRadius; i++) {
            const angle = (i / blurRadius) * Math.PI * 2
            const nx = Math.round(centerXpx + Math.cos(angle) * i)
            const ny = Math.round(centerYpx + Math.sin(angle) * i)

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

  // Apply film strip effect
  applyFilmStrip(imageData: ImageData, options: ProcessingOptions): ImageData {
    this.ensureCanvas()
    
    const { stripCount = 3, spacing = 20 } = options
    const width = imageData.width
    const height = imageData.height

    // Create new canvas
    const newCanvas = document.createElement('canvas')
    const newCtx = newCanvas.getContext('2d')!
    newCanvas.width = width + (stripCount - 1) * spacing
    newCanvas.height = height

    // Black background
    newCtx.fillStyle = '#000000'
    newCtx.fillRect(0, 0, newCanvas.width, newCanvas.height)

    // Draw strips
    const stripWidth = width / stripCount
    for (let i = 0; i < stripCount; i++) {
      const x = i * (stripWidth + spacing)
      const sx = i * stripWidth
      
      newCtx.drawImage(
        this.canvas!,
        sx, 0, stripWidth, height,
        x, 0, stripWidth, height
      )
    }

    return newCtx.getImageData(0, 0, newCanvas.width, newCanvas.height)
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
      case 'radial-blur':
        processedData = this.applyRadialBlur(imageData, options)
        break
      case 'gaussian-blur':
        processedData = this.applyGaussianBlur(imageData, options)
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
      case 'film-strip':
        processedData = this.applyFilmStrip(imageData, options)
        break
      default:
        processedData = imageData
    }

    return this.imageDataToBase64(processedData)
  }
}

// Export singleton instance - safe for SSR
export const canvasProcessor = new CanvasProcessor()
