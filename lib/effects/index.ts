// Effects system for image processing
export interface EffectConfig {
  id: string
  name: string
  description: string
  icon: string
  category: 'blur' | 'color' | 'style' | 'frame'
  parameters: Record<string, ParameterConfig>
}

export interface ParameterConfig {
  min?: number
  max?: number
  default?: number | string
  step?: number
  type?: 'text'
  maxLength?: number
}

export interface EffectResult {
  imageData: ImageData
  processedImage: string // base64
}

// Available effects
export const EFFECTS: EffectConfig[] = [
  {
    id: 'motion-blur',
    name: 'Motion Blur',
    description: 'Add dynamic motion effects to your image',
    icon: '🌪️',
    category: 'blur',
    parameters: {
      intensity: { min: 1, max: 20, default: 10, step: 1 },
      direction: { min: 0, max: 360, default: 0, step: 15 }
    }
  },
  {
    id: 'radial-blur',
    name: 'Radial Blur',
    description: 'Create a radial blur effect from center point',
    icon: '🌀',
    category: 'blur',
    parameters: {
      intensity: { min: 1, max: 30, default: 15, step: 1 },
      centerX: { min: 0, max: 1, default: 0.5, step: 0.1 },
      centerY: { min: 0, max: 1, default: 0.5, step: 0.1 }
    }
  },
  {
    id: 'gaussian-blur',
    name: 'Gaussian Blur',
    description: 'Apply smooth blur effect to your image',
    icon: '💫',
    category: 'blur',
    parameters: {
      intensity: { min: 1, max: 15, default: 5, step: 1 }
    }
  },
  {
    id: 'chromatic-aberration',
    name: 'Chromatic Aberration',
    description: 'Create colorful fringe effects',
    icon: '🌈',
    category: 'color',
    parameters: {
      offset: { min: 1, max: 20, default: 5, step: 1 },
      strength: { min: 0.1, max: 2, default: 1, step: 0.1 }
    }
  },
  {
    id: 'vignette',
    name: 'Vignette',
    description: 'Add dark edges to focus attention',
    icon: '🌙',
    category: 'style',
    parameters: {
      strength: { min: 0.1, max: 2, default: 0.8, step: 0.1 },
      size: { min: 0.1, max: 1, default: 0.5, step: 0.1 }
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    description: 'Apply vintage sepia tone',
    icon: '📸',
    category: 'color',
    parameters: {
      intensity: { min: 0, max: 1, default: 0.8, step: 0.1 }
    }
  },
  {
    id: 'polaroid',
    name: 'Polaroid Frame',
    description: 'Add vintage polaroid-style frame',
    icon: '📷',
    category: 'frame',
    parameters: {
      caption: { type: 'text', default: 'Polaroid', maxLength: 50 },
      borderSize: { min: 20, max: 100, default: 60, step: 10 }
    }
  },
  {
    id: 'film-strip',
    name: 'Film Strip',
    description: 'Create nostalgic film strip effect',
    icon: '🎞️',
    category: 'frame',
    parameters: {
      stripCount: { min: 1, max: 5, default: 3, step: 1 },
      spacing: { min: 10, max: 50, default: 20, step: 5 }
    }
  }
]

// Effect categories for UI grouping
export const EFFECT_CATEGORIES = [
  { id: 'blur', name: 'Blur Effects', icon: '🌪️' },
  { id: 'color', name: 'Color Effects', icon: '🎨' },
  { id: 'style', name: 'Style Effects', icon: '✨' },
  { id: 'frame', name: 'Frames', icon: '🖼️' }
] as const

// Get effects by category
export const getEffectsByCategory = (category: string) => {
  return EFFECTS.filter(effect => effect.category === category)
}

// Get effect by ID
export const getEffectById = (id: string) => {
  return EFFECTS.find(effect => effect.id === id)
}
