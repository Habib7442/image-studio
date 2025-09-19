/**
 * Filter Effects System for ImageStudioLab
 * 
 * Comprehensive collection of trending filter effects for selfie enhancement
 * Includes vignette, Instagram filters, vintage effects, and more
 */

export type FilterEffectCategory =
  | 'vignette'
  | 'instagram'
  | 'vintage'
  | 'artistic'
  | 'beauty'
  | 'lighting'
  | 'color-grading'
  | 'creative'
  | 'dramatic'
  | 'subtle'

export interface FilterEffect {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly category: FilterEffectCategory
  readonly intensity: number // 0-100 scale
  readonly parameters: Record<string, FilterParameter>
  readonly popularity: number // 1-10 scale
  readonly engagement: number // 1-10 scale
  readonly socialSharing: boolean
  readonly isTrending: boolean
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly estimatedTime: number // in seconds
  readonly previewImage?: string
  readonly tags: readonly string[]
  readonly customFields?: {
    colorTone?: string
    mood?: string
    era?: string
    skinEnhancement?: boolean
    eyeEnhancement?: boolean
    lipEnhancement?: boolean
    faceSlimming?: boolean
    eyeBrightening?: boolean
  }
}

export interface FilterParameter {
  min?: number
  max?: number
  default?: number
  step?: number
  type?: 'slider' | 'toggle' | 'color' | 'dropdown'
  options?: string[]
  label: string
  description?: string
}

// ============================================================================
// VIGNETTE EFFECTS - Most Popular Category
// ============================================================================

export const vignetteFilterEffects: FilterEffect[] = [
  {
    id: 'classic-vignette',
    name: 'Classic Vignette',
    emoji: '🌙',
    description: 'Darkened edges that draw focus to the center',
    category: 'vignette',
    intensity: 75,
    parameters: {
      strength: { min: 0, max: 100, default: 75, step: 5, type: 'slider', label: 'Strength' },
      size: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Size' },
      feather: { min: 0, max: 100, default: 30, step: 5, type: 'slider', label: 'Feather' }
    },
    popularity: 10,
    engagement: 9,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 15,
    tags: ['vignette', 'dramatic', 'focus', 'classic'],
    customFields: {
      mood: 'dramatic',
      colorTone: 'dark'
    }
  },
  {
    id: 'soft-vignette',
    name: 'Soft Vignette',
    emoji: '☁️',
    description: 'Subtle edge darkening for gentle focus',
    category: 'vignette',
    intensity: 40,
    parameters: {
      strength: { min: 0, max: 60, default: 40, step: 5, type: 'slider', label: 'Strength' },
      size: { min: 20, max: 80, default: 60, step: 5, type: 'slider', label: 'Size' },
      feather: { min: 40, max: 100, default: 70, step: 5, type: 'slider', label: 'Feather' }
    },
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 10,
    tags: ['vignette', 'soft', 'subtle', 'gentle'],
    customFields: {
      mood: 'soft',
      colorTone: 'neutral'
    }
  },
  {
    id: 'white-vignette',
    name: 'White Vignette',
    emoji: '✨',
    description: 'Lightened edges for ethereal glow effect',
    category: 'vignette',
    intensity: 60,
    parameters: {
      strength: { min: 0, max: 80, default: 60, step: 5, type: 'slider', label: 'Strength' },
      size: { min: 30, max: 90, default: 70, step: 5, type: 'slider', label: 'Size' },
      feather: { min: 20, max: 80, default: 50, step: 5, type: 'slider', label: 'Feather' }
    },
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 12,
    tags: ['vignette', 'white', 'glow', 'ethereal'],
    customFields: {
      mood: 'ethereal',
      colorTone: 'light'
    }
  },
  {
    id: 'color-vignette',
    name: 'Color Vignette',
    emoji: '🎨',
    description: 'Colored edge effect for creative styling',
    category: 'vignette',
    intensity: 65,
    parameters: {
      strength: { min: 0, max: 100, default: 65, step: 5, type: 'slider', label: 'Strength' },
      color: { type: 'color', default: '#8B5CF6', label: 'Color' },
      size: { min: 20, max: 80, default: 50, step: 5, type: 'slider', label: 'Size' }
    },
    popularity: 6,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'medium',
    estimatedTime: 20,
    tags: ['vignette', 'color', 'creative', 'styling'],
    customFields: {
      mood: 'creative',
      colorTone: 'custom'
    }
  }
]

// ============================================================================
// INSTAGRAM FILTERS - Classic Social Media Styles
// ============================================================================

export const instagramFilterEffects: FilterEffect[] = [
  {
    id: 'clarendon',
    name: 'Clarendon',
    emoji: '☀️',
    description: 'High contrast with cool blue tones',
    category: 'instagram',
    intensity: 80,
    parameters: {
      contrast: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Contrast' },
      saturation: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Saturation' },
      brightness: { min: -50, max: 50, default: 10, step: 5, type: 'slider', label: 'Brightness' }
    },
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['instagram', 'clarendon', 'cool', 'contrast'],
    customFields: {
      colorTone: 'cool',
      mood: 'crisp'
    }
  },
  {
    id: 'juno',
    name: 'Juno',
    emoji: '🌅',
    description: 'Warm, golden tones with enhanced vibrance',
    category: 'instagram',
    intensity: 75,
    parameters: {
      warmth: { min: 0, max: 100, default: 75, step: 5, type: 'slider', label: 'Warmth' },
      vibrance: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Vibrance' },
      contrast: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Contrast' }
    },
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['instagram', 'juno', 'warm', 'golden'],
    customFields: {
      colorTone: 'warm',
      mood: 'golden'
    }
  },
  {
    id: 'lark',
    name: 'Lark',
    emoji: '🐦',
    description: 'Desaturated with cool blue undertones',
    category: 'instagram',
    intensity: 70,
    parameters: {
      desaturation: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Desaturation' },
      blueTone: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Blue Tone' },
      contrast: { min: 0, max: 100, default: 40, step: 5, type: 'slider', label: 'Contrast' }
    },
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['instagram', 'lark', 'cool', 'desaturated'],
    customFields: {
      colorTone: 'cool',
      mood: 'minimal'
    }
  },
  {
    id: 'gingham',
    name: 'Gingham',
    emoji: '🌿',
    description: 'Soft, muted tones with vintage feel',
    category: 'instagram',
    intensity: 60,
    parameters: {
      softness: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Softness' },
      vintage: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Vintage' },
      warmth: { min: 0, max: 100, default: 40, step: 5, type: 'slider', label: 'Warmth' }
    },
    popularity: 6,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['instagram', 'gingham', 'vintage', 'soft'],
    customFields: {
      colorTone: 'muted',
      mood: 'vintage'
    }
  },
  {
    id: 'ludwig',
    name: 'Ludwig',
    emoji: '👑',
    description: 'High contrast with dramatic shadows',
    category: 'instagram',
    intensity: 85,
    parameters: {
      contrast: { min: 0, max: 100, default: 85, step: 5, type: 'slider', label: 'Contrast' },
      shadows: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Shadows' },
      highlights: { min: 0, max: 100, default: 30, step: 5, type: 'slider', label: 'Highlights' }
    },
    popularity: 8,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['instagram', 'ludwig', 'dramatic', 'contrast'],
    customFields: {
      colorTone: 'dramatic',
      mood: 'bold'
    }
  },
  {
    id: 'sierra',
    name: 'Sierra',
    emoji: '🏔️',
    description: 'Warm, earthy tones with enhanced saturation',
    category: 'instagram',
    intensity: 70,
    parameters: {
      warmth: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Warmth' },
      saturation: { min: 0, max: 100, default: 65, step: 5, type: 'slider', label: 'Saturation' },
      earthTone: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Earth Tone' }
    },
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 8,
    tags: ['instagram', 'sierra', 'warm', 'earthy'],
    customFields: {
      colorTone: 'warm',
      mood: 'earthy'
    }
  }
]

// ============================================================================
// VINTAGE FILTERS - Retro Film Aesthetics
// ============================================================================

export const vintageFilterEffects: FilterEffect[] = [
  {
    id: '1970s-film',
    name: '1970s Film',
    emoji: '📼',
    description: 'Warm, faded colors with film grain',
    category: 'vintage',
    intensity: 75,
    parameters: {
      warmth: { min: 0, max: 100, default: 75, step: 5, type: 'slider', label: 'Warmth' },
      fade: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Fade' },
      grain: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Grain' }
    },
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 25,
    tags: ['vintage', '1970s', 'film', 'warm'],
    customFields: {
      era: '1970s',
      colorTone: 'warm',
      mood: 'nostalgic'
    }
  },
  {
    id: '1980s-neon',
    name: '1980s Neon',
    emoji: '💫',
    description: 'Bold, vibrant colors with neon glow',
    category: 'vintage',
    intensity: 90,
    parameters: {
      vibrance: { min: 0, max: 100, default: 90, step: 5, type: 'slider', label: 'Vibrance' },
      neon: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Neon Glow' },
      contrast: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Contrast' }
    },
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 30,
    tags: ['vintage', '1980s', 'neon', 'vibrant'],
    customFields: {
      era: '1980s',
      colorTone: 'vibrant',
      mood: 'energetic'
    }
  },
  {
    id: '1990s-grunge',
    name: '1990s Grunge',
    emoji: '🎸',
    description: 'Desaturated, moody tones with film grain',
    category: 'vintage',
    intensity: 70,
    parameters: {
      desaturation: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Desaturation' },
      grain: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Grain' },
      mood: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Mood' }
    },
    popularity: 7,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'medium',
    estimatedTime: 25,
    tags: ['vintage', '1990s', 'grunge', 'moody'],
    customFields: {
      era: '1990s',
      colorTone: 'muted',
      mood: 'grunge'
    }
  },
  {
    id: 'polaroid-vintage',
    name: 'Polaroid Vintage',
    emoji: '📷',
    description: 'Classic instant camera look with soft colors',
    category: 'vintage',
    intensity: 65,
    parameters: {
      softness: { min: 0, max: 100, default: 65, step: 5, type: 'slider', label: 'Softness' },
      warmth: { min: 0, max: 100, default: 55, step: 5, type: 'slider', label: 'Warmth' },
      vignette: { min: 0, max: 100, default: 40, step: 5, type: 'slider', label: 'Vignette' }
    },
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 20,
    tags: ['vintage', 'polaroid', 'instant', 'soft'],
    customFields: {
      era: 'instant',
      colorTone: 'soft',
      mood: 'nostalgic'
    }
  }
]

// ============================================================================
// ARTISTIC FILTERS - Creative Color Grading
// ============================================================================

export const artisticFilterEffects: FilterEffect[] = [
  {
    id: 'duotone',
    name: 'Duotone',
    emoji: '🎨',
    description: 'Two-tone color effect for artistic look',
    category: 'artistic',
    intensity: 80,
    parameters: {
      color1: { type: 'color', default: '#FF6B6B', label: 'Primary Color' },
      color2: { type: 'color', default: '#4ECDC4', label: 'Secondary Color' },
      intensity: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Intensity' }
    },
    popularity: 8,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 30,
    tags: ['artistic', 'duotone', 'color', 'creative'],
    customFields: {
      colorTone: 'custom',
      mood: 'artistic'
    }
  },
  {
    id: 'black-white',
    name: 'Black & White',
    emoji: '⚫',
    description: 'Classic monochrome with enhanced contrast',
    category: 'artistic',
    intensity: 70,
    parameters: {
      contrast: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Contrast' },
      brightness: { min: -50, max: 50, default: 0, step: 5, type: 'slider', label: 'Brightness' },
      grain: { min: 0, max: 100, default: 30, step: 5, type: 'slider', label: 'Grain' }
    },
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 15,
    tags: ['artistic', 'black-white', 'monochrome', 'classic'],
    customFields: {
      colorTone: 'monochrome',
      mood: 'timeless'
    }
  },
  {
    id: 'sepia',
    name: 'Sepia',
    emoji: '📸',
    description: 'Warm brown tones for vintage photography feel',
    category: 'artistic',
    intensity: 75,
    parameters: {
      intensity: { min: 0, max: 100, default: 75, step: 5, type: 'slider', label: 'Intensity' },
      warmth: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Warmth' },
      fade: { min: 0, max: 100, default: 40, step: 5, type: 'slider', label: 'Fade' }
    },
    popularity: 6,
    engagement: 5,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 12,
    tags: ['artistic', 'sepia', 'vintage', 'warm'],
    customFields: {
      colorTone: 'warm',
      mood: 'vintage'
    }
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    emoji: '🎬',
    description: 'Movie-like color grading with dramatic tones',
    category: 'artistic',
    intensity: 85,
    parameters: {
      contrast: { min: 0, max: 100, default: 85, step: 5, type: 'slider', label: 'Contrast' },
      saturation: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Saturation' },
      shadows: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Shadows' }
    },
    popularity: 9,
    engagement: 9,
    socialSharing: true,
    isTrending: true,
    difficulty: 'hard',
    estimatedTime: 40,
    tags: ['artistic', 'cinematic', 'dramatic', 'movie'],
    customFields: {
      colorTone: 'dramatic',
      mood: 'cinematic'
    }
  }
]

// ============================================================================
// BEAUTY FILTERS - Enhancement and Makeup
// ============================================================================

export const beautyFilterEffects: FilterEffect[] = [
  {
    id: 'natural-smooth',
    name: 'Natural Smooth',
    emoji: '✨',
    description: 'Subtle skin smoothing without losing texture',
    category: 'beauty',
    intensity: 50,
    parameters: {
      smoothing: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Smoothing' },
      texture: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Texture' },
      clarity: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Clarity' }
    },
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 20,
    tags: ['beauty', 'smooth', 'natural', 'skin'],
    customFields: {
      skinEnhancement: true,
      mood: 'natural'
    }
  },
  {
    id: 'contour-enhance',
    name: 'Contour Enhance',
    emoji: '💄',
    description: 'Subtle face contouring and definition',
    category: 'beauty',
    intensity: 60,
    parameters: {
      contour: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Contour' },
      definition: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Definition' },
      natural: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Natural Look' }
    },
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 25,
    tags: ['beauty', 'contour', 'definition', 'face'],
    customFields: {
      faceSlimming: true,
      mood: 'defined'
    }
  },
  {
    id: 'eye-brighten',
    name: 'Eye Brighten',
    emoji: '👁️',
    description: 'Brighten and enhance eye area',
    category: 'beauty',
    intensity: 55,
    parameters: {
      brightness: { min: 0, max: 100, default: 55, step: 5, type: 'slider', label: 'Brightness' },
      clarity: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Clarity' },
      color: { min: 0, max: 100, default: 40, step: 5, type: 'slider', label: 'Color Pop' }
    },
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 15,
    tags: ['beauty', 'eyes', 'brighten', 'enhance'],
    customFields: {
      eyeEnhancement: true,
      eyeBrightening: true,
      mood: 'awake'
    }
  },
  {
    id: 'lip-enhance',
    name: 'Lip Enhance',
    emoji: '💋',
    description: 'Subtle lip enhancement and color boost',
    category: 'beauty',
    intensity: 45,
    parameters: {
      color: { min: 0, max: 100, default: 45, step: 5, type: 'slider', label: 'Color Boost' },
      definition: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Definition' },
      natural: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Natural Look' }
    },
    popularity: 6,
    engagement: 5,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 12,
    tags: ['beauty', 'lips', 'color', 'enhance'],
    customFields: {
      lipEnhancement: true,
      mood: 'enhanced'
    }
  }
]

// ============================================================================
// LIGHTING FILTERS - Golden Hour and Ethereal Effects
// ============================================================================

export const lightingFilterEffects: FilterEffect[] = [
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    emoji: '🌅',
    description: 'Warm, glowing sunlight effect',
    category: 'lighting',
    intensity: 80,
    parameters: {
      warmth: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Warmth' },
      glow: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Glow' },
      brightness: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Brightness' }
    },
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 30,
    tags: ['lighting', 'golden', 'warm', 'sunlight'],
    customFields: {
      colorTone: 'warm',
      mood: 'dreamy'
    }
  },
  {
    id: 'ethereal-glow',
    name: 'Ethereal Glow',
    emoji: '✨',
    description: 'Soft, dreamy glow effect',
    category: 'lighting',
    intensity: 70,
    parameters: {
      glow: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Glow' },
      softness: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Softness' },
      brightness: { min: 0, max: 100, default: 50, step: 5, type: 'slider', label: 'Brightness' }
    },
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 25,
    tags: ['lighting', 'ethereal', 'glow', 'dreamy'],
    customFields: {
      colorTone: 'soft',
      mood: 'ethereal'
    }
  },
  {
    id: 'light-leaks',
    name: 'Light Leaks',
    emoji: '💫',
    description: 'Dynamic colored streaks and halos',
    category: 'lighting',
    intensity: 75,
    parameters: {
      intensity: { min: 0, max: 100, default: 75, step: 5, type: 'slider', label: 'Intensity' },
      color: { type: 'color', default: '#FFD700', label: 'Leak Color' },
      angle: { min: 0, max: 360, default: 45, step: 15, type: 'slider', label: 'Angle' }
    },
    popularity: 7,
    engagement: 8,
    socialSharing: true,
    isTrending: false,
    difficulty: 'hard',
    estimatedTime: 35,
    tags: ['lighting', 'leaks', 'dynamic', 'creative'],
    customFields: {
      colorTone: 'dynamic',
      mood: 'creative'
    }
  }
]

// ============================================================================
// CREATIVE FILTERS - Pop Art and Cartoonify
// ============================================================================

export const creativeFilterEffects: FilterEffect[] = [
  {
    id: 'pop-art',
    name: 'Pop Art',
    emoji: '🎨',
    description: 'Bold outlines and vibrant color pops',
    category: 'creative',
    intensity: 90,
    parameters: {
      outline: { min: 0, max: 100, default: 90, step: 5, type: 'slider', label: 'Outline' },
      vibrance: { min: 0, max: 100, default: 85, step: 5, type: 'slider', label: 'Vibrance' },
      contrast: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Contrast' }
    },
    popularity: 8,
    engagement: 9,
    socialSharing: true,
    isTrending: true,
    difficulty: 'hard',
    estimatedTime: 45,
    tags: ['creative', 'pop-art', 'bold', 'vibrant'],
    customFields: {
      colorTone: 'vibrant',
      mood: 'bold'
    }
  },
  {
    id: 'cartoonify',
    name: 'Cartoonify',
    emoji: '🎭',
    description: 'Convert selfie to cartoon/comic book style',
    category: 'creative',
    intensity: 85,
    parameters: {
      cartoon: { min: 0, max: 100, default: 85, step: 5, type: 'slider', label: 'Cartoon Effect' },
      smoothness: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Smoothness' },
      color: { min: 0, max: 100, default: 80, step: 5, type: 'slider', label: 'Color Intensity' }
    },
    popularity: 7,
    engagement: 8,
    socialSharing: true,
    isTrending: false,
    difficulty: 'hard',
    estimatedTime: 50,
    tags: ['creative', 'cartoon', 'comic', 'fun'],
    customFields: {
      colorTone: 'vibrant',
      mood: 'fun'
    }
  },
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    emoji: '🖼️',
    description: 'Artistic oil painting effect',
    category: 'creative',
    intensity: 75,
    parameters: {
      brush: { min: 0, max: 100, default: 75, step: 5, type: 'slider', label: 'Brush Size' },
      detail: { min: 0, max: 100, default: 60, step: 5, type: 'slider', label: 'Detail' },
      color: { min: 0, max: 100, default: 70, step: 5, type: 'slider', label: 'Color Intensity' }
    },
    popularity: 6,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'hard',
    estimatedTime: 60,
    tags: ['creative', 'oil-painting', 'artistic', 'classic'],
    customFields: {
      colorTone: 'artistic',
      mood: 'classic'
    }
  }
]

// ============================================================================
// COMBINED ARRAYS AND UTILITIES
// ============================================================================

// Combined array for easy access
export const FILTER_EFFECTS: FilterEffect[] = [
  ...vignetteFilterEffects,
  ...instagramFilterEffects,
  ...vintageFilterEffects,
  ...artisticFilterEffects,
  ...beautyFilterEffects,
  ...lightingFilterEffects,
  ...creativeFilterEffects
]

// Category mapping for easy filtering
export const FILTER_EFFECT_CATEGORIES: Readonly<Record<FilterEffectCategory, readonly FilterEffect[]>> = {
  vignette: vignetteFilterEffects,
  instagram: instagramFilterEffects,
  vintage: vintageFilterEffects,
  artistic: artisticFilterEffects,
  beauty: beautyFilterEffects,
  lighting: lightingFilterEffects,
  'color-grading': artisticFilterEffects, // Alias for artistic
  creative: creativeFilterEffects,
  dramatic: [...vignetteFilterEffects, ...artisticFilterEffects].filter(f => f.customFields?.mood === 'dramatic'),
  subtle: [...beautyFilterEffects, ...vignetteFilterEffects].filter(f => f.intensity < 60)
} as const

export const FILTER_CATEGORIES: ReadonlyArray<{ id: FilterEffectCategory; name: string; emoji: string }> = [
  { id: 'vignette', name: 'Vignette', emoji: '🌙' },
  { id: 'instagram', name: 'Instagram', emoji: '📱' },
  { id: 'vintage', name: 'Vintage', emoji: '📼' },
  { id: 'artistic', name: 'Artistic', emoji: '🎨' },
  { id: 'beauty', name: 'Beauty', emoji: '✨' },
  { id: 'lighting', name: 'Lighting', emoji: '💡' },
  { id: 'creative', name: 'Creative', emoji: '🎭' },
  { id: 'dramatic', name: 'Dramatic', emoji: '⚡' },
  { id: 'subtle', name: 'Subtle', emoji: '🌸' }
] as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getFiltersByCategory = (category: FilterEffectCategory): readonly FilterEffect[] => {
  return FILTER_EFFECT_CATEGORIES[category] || []
}

export const getFilterById = (id: string): FilterEffect | undefined => {
  return FILTER_EFFECTS.find(filter => filter.id === id)
}

export const getTrendingFilters = (): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => filter.isTrending)
}

export const getPopularFilters = (limit: number = 10): readonly FilterEffect[] => {
  return FILTER_EFFECTS
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

export const getHighEngagementFilters = (limit: number = 10): readonly FilterEffect[] => {
  return FILTER_EFFECTS
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit)
}

export const getFiltersByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => filter.difficulty === difficulty)
}

export const getSocialSharingFilters = (): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => filter.socialSharing)
}

export const getFiltersByEstimatedTime = (maxTime: number): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => filter.estimatedTime <= maxTime)
}

export const getFiltersByIntensity = (minIntensity: number, maxIntensity: number = 100): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => 
    filter.intensity >= minIntensity && filter.intensity <= maxIntensity
  )
}

export const searchFilters = (query: string): readonly FilterEffect[] => {
  const lowercaseQuery = query.toLowerCase()
  return FILTER_EFFECTS.filter(filter => 
    filter.name.toLowerCase().includes(lowercaseQuery) ||
    filter.description.toLowerCase().includes(lowercaseQuery) ||
    filter.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// Filter statistics
export const getFilterStats = () => {
  const totalFilters = FILTER_EFFECTS.length
  const trendingCount = FILTER_EFFECTS.filter(f => f.isTrending).length
  const socialSharingCount = FILTER_EFFECTS.filter(f => f.socialSharing).length
  const averagePopularity = FILTER_EFFECTS.reduce((sum, f) => sum + f.popularity, 0) / totalFilters
  const averageEngagement = FILTER_EFFECTS.reduce((sum, f) => sum + f.engagement, 0) / totalFilters
  const averageIntensity = FILTER_EFFECTS.reduce((sum, f) => sum + f.intensity, 0) / totalFilters
  
  return {
    totalFilters,
    trendingCount,
    socialSharingCount,
    averagePopularity: Math.round(averagePopularity * 10) / 10,
    averageEngagement: Math.round(averageEngagement * 10) / 10,
    averageIntensity: Math.round(averageIntensity * 10) / 10
  }
}

// Get filters by mood/color tone
export const getFiltersByMood = (mood: string): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => 
    filter.customFields?.mood === mood
  )
}

export const getFiltersByColorTone = (colorTone: string): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => 
    filter.customFields?.colorTone === colorTone
  )
}

// Get beauty enhancement filters
export const getBeautyEnhancementFilters = (): readonly FilterEffect[] => {
  return FILTER_EFFECTS.filter(filter => 
    filter.customFields?.skinEnhancement || 
    filter.customFields?.eyeEnhancement || 
    filter.customFields?.lipEnhancement ||
    filter.customFields?.faceSlimming ||
    filter.customFields?.eyeBrightening
  )
}
