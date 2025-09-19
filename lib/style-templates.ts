export type StyleTemplateCategory =
  | 'professional'
  | 'creative'
  | 'casual'
  | 'artistic'
  | 'vintage'
  | 'trendy'
  | 'polaroid'
  | 'photo-booth'
  | 'collage'
  | 'scrapbook'
  | 'instant-camera'
  | 'event-party'
  | 'meme-text'
  | 'magazine-cover'
  | 'aesthetic-moodboard'
  | 'travel-passport'

export interface StyleTemplate {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly category: StyleTemplateCategory
  readonly prompt: string
  readonly tags: readonly string[]
  readonly popularity: number // 1-10 scale
  readonly engagement: number // 1-10 scale
  readonly socialSharing: boolean
  readonly isTrending: boolean
  readonly difficulty: 'easy' | 'medium' | 'hard'
  readonly estimatedTime: number // in seconds
  readonly previewImage?: string
  readonly customFields?: {
    frameStyle?: string
    textOverlay?: boolean
    multipleImages?: boolean
    vintageLevel?: number
    colorPalette?: string[]
  }
}

const IDENTITY_DIRECTIVE =
  "CRITICAL: Maintain the exact same person's face, facial features, and identity from the uploaded selfie — only change the styling, outfit, lighting, and background while keeping the person's face completely consistent and recognizable."

export const professionalStyleTemplates: StyleTemplate[] = [
  // Professional Templates
  {
    id: 'professional-headshot',
    name: 'Professional Headshot',
    emoji: '👔',
    description: 'LinkedIn-ready corporate headshot',
    category: 'professional',
    prompt: `Professional corporate headshot with crisp studio lighting, wearing a tailored business suit or blazer, clean background, confident expression, natural skin tone, high-end photography quality, perfect for LinkedIn profile, executive portrait style, sharp focus, professional color grading. ${IDENTITY_DIRECTIVE}`,
    tags: ['corporate', 'business', 'linkedin', 'professional'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'medium',
    estimatedTime: 60
  },
  {
    id: 'executive-portrait',
    name: 'Executive Portrait',
    emoji: '💼',
    description: 'High-end executive photography',
    category: 'professional',
    prompt: `Executive portrait with sophisticated lighting setup, wearing premium business attire, modern office or studio background, confident and authoritative pose, professional color grading, high-end photography, magazine-quality, sharp details, premium aesthetic. ${IDENTITY_DIRECTIVE}`,
    tags: ['executive', 'premium', 'corporate', 'sophisticated'],
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'hard',
    estimatedTime: 90
  }
]

export const creativeStyleTemplates: StyleTemplate[] = [
  // Creative Templates
  {
    id: 'bollywood-style',
    name: 'Bollywood Style',
    emoji: '🎭',
    description: 'Glamorous Bollywood photoshoot',
    category: 'creative',
    prompt: `Glamorous Bollywood-style photoshoot with vibrant colors, dramatic makeup, elegant traditional or fusion outfit, dramatic lighting with warm golden tones, expressive pose, cinematic composition, rich color palette, dramatic shadows, Bollywood aesthetic, glamorous styling, high-fashion photography. ${IDENTITY_DIRECTIVE}`,
    tags: ['bollywood', 'glamorous', 'dramatic', 'colorful'],
    popularity: 8,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'hard',
    estimatedTime: 75
  },
  {
    id: 'fashion-editorial',
    name: 'Fashion Editorial',
    emoji: '📸',
    description: 'High-fashion magazine style',
    category: 'creative',
    prompt: `High-fashion editorial photoshoot with avant-garde styling, artistic composition, dramatic lighting, high-end fashion outfit, artistic pose, magazine-quality photography, creative direction, artistic shadows, fashion photography, editorial aesthetic, creative styling. ${IDENTITY_DIRECTIVE}`,
    tags: ['fashion', 'editorial', 'magazine', 'artistic'],
    popularity: 7,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'hard',
    estimatedTime: 80
  }
]

export const casualStyleTemplates: StyleTemplate[] = [
  // Casual Templates
  {
    id: 'urban-streetwear',
    name: 'Urban Streetwear',
    emoji: '👟',
    description: 'Trendy street fashion look',
    category: 'casual',
    prompt: `Urban streetwear photoshoot with trendy casual outfit, urban background or street setting, natural lighting, confident casual pose, street fashion aesthetic, modern casual styling, urban photography, trendy fashion, casual cool vibe, street style. ${IDENTITY_DIRECTIVE}`,
    tags: ['streetwear', 'urban', 'casual', 'trendy'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 45
  },
  {
    id: 'tropical-travel',
    name: 'Tropical Travel',
    emoji: '🏝️',
    description: 'Vacation-ready tropical vibes',
    category: 'casual',
    prompt: `Tropical travel photoshoot with vacation outfit, tropical or beach background, warm natural lighting, relaxed vacation pose, tropical aesthetic, travel photography, vacation vibes, warm colors, beach or resort setting, relaxed styling. ${IDENTITY_DIRECTIVE}`,
    tags: ['tropical', 'travel', 'vacation', 'beach'],
    popularity: 7,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 40
  }
]

export const artisticStyleTemplates: StyleTemplate[] = [
  // Artistic Templates
  {
    id: 'moody-portrait',
    name: 'Moody Portrait',
    emoji: '🖤',
    description: 'Artistic moody photography',
    category: 'artistic',
    prompt: `Moody artistic portrait with dramatic lighting, sophisticated outfit, dark and moody atmosphere, artistic composition, film noir aesthetic, emotional depth, artistic shadows, cinematic quality, expressive pose, artistic photography, dramatic mood. ${IDENTITY_DIRECTIVE}`,
    tags: ['moody', 'artistic', 'dramatic', 'cinematic'],
    popularity: 7,
    engagement: 8,
    socialSharing: true,
    isTrending: false,
    difficulty: 'medium',
    estimatedTime: 55
  },
  {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    emoji: '⚪',
    description: 'Clean minimalist aesthetic',
    category: 'artistic',
    prompt: `Minimalist modern photoshoot with clean, simple lighting, minimal outfit, white or neutral background, clean composition, modern aesthetic, simple elegance, contemporary style, clean lines, sophisticated simplicity, modern photography, minimalist beauty. ${IDENTITY_DIRECTIVE}`,
    tags: ['minimalist', 'modern', 'clean', 'simple'],
    popularity: 6,
    engagement: 6,
    socialSharing: true,
    isTrending: false,
    difficulty: 'easy',
    estimatedTime: 35
  }
]

export const vintageStyleTemplates: StyleTemplate[] = [
  // Vintage Templates
  {
    id: 'vintage-glamour',
    name: 'Vintage Glamour',
    emoji: '✨',
    description: 'Classic Hollywood glamour',
    category: 'vintage',
    prompt: `Vintage Hollywood glamour photoshoot with classic elegant outfit, vintage lighting setup, sophisticated pose, golden age of Hollywood aesthetic, classic beauty styling, vintage photography, glamorous vintage look, timeless elegance, classic composition. ${IDENTITY_DIRECTIVE}`,
    tags: ['vintage', 'glamour', 'hollywood', 'classic'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 65
  },
  {
    id: 'retro-80s',
    name: 'Retro 80s',
    emoji: '🎸',
    description: 'Bold 80s retro styling',
    category: 'vintage',
    prompt: `Retro 80s photoshoot with bold colorful outfit, neon lighting or bright colors, confident 80s pose, retro aesthetic, vibrant colors, 80s fashion styling, retro photography, bold and fun vibe, nostalgic 80s look. ${IDENTITY_DIRECTIVE}`,
    tags: ['retro', '80s', 'colorful', 'bold'],
    popularity: 7,
    engagement: 7,
    socialSharing: true,
    isTrending: false,
    difficulty: 'medium',
    estimatedTime: 50
  }
]

export const trendyStyleTemplates: StyleTemplate[] = [
  // Trendy Templates
  {
    id: 'aesthetic-dark-academia',
    name: 'Dark Academia',
    emoji: '📚',
    description: 'Moody academic aesthetic',
    category: 'trendy',
    prompt: `Dark academia aesthetic photoshoot with scholarly outfit, moody lighting, vintage academic setting, intellectual pose, sophisticated color palette, artistic composition, academic aesthetic, moody atmosphere, scholarly styling, intellectual photography. ${IDENTITY_DIRECTIVE}`,
    tags: ['aesthetic', 'dark', 'academia', 'moody', 'artistic'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 55
  }
]

// Polaroid Frame Templates - Most Popular Category
export const polaroidStyleTemplates: StyleTemplate[] = [
  {
    id: 'classic-polaroid',
    name: 'Classic Polaroid',
    emoji: '📷',
    description: 'Vintage white border with handwritten caption area',
    category: 'polaroid',
    prompt: `Classic polaroid photo frame with white border, vintage film aesthetic, handwritten caption area at bottom, retro instant camera look, authentic polaroid styling, vintage photography feel, nostalgic appearance, classic instant camera frame. ${IDENTITY_DIRECTIVE}`,
    tags: ['polaroid', 'vintage', 'retro', 'instagram', 'classic'],
    popularity: 10,
    engagement: 9,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 30,
    customFields: {
      frameStyle: 'classic-white',
      textOverlay: true,
      vintageLevel: 8,
      colorPalette: ['white', 'cream', 'vintage']
    }
  },
  {
    id: 'colorful-polaroid',
    name: 'Colorful Polaroid',
    emoji: '🌈',
    description: 'Vibrant colored polaroid frame',
    category: 'polaroid',
    prompt: `Colorful polaroid photo frame with vibrant colored border, modern instant camera aesthetic, bright and fun styling, contemporary polaroid look, colorful frame design, trendy instant camera style, vibrant photography frame. ${IDENTITY_DIRECTIVE}`,
    tags: ['polaroid', 'colorful', 'vibrant', 'trendy', 'instagram'],
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 30,
    customFields: {
      frameStyle: 'colorful',
      textOverlay: true,
      vintageLevel: 3,
      colorPalette: ['bright', 'vibrant', 'colorful']
    }
  }
]

// Photo Booth Strip Templates
export const photoBoothStyleTemplates: StyleTemplate[] = [
  {
    id: 'classic-photo-booth',
    name: 'Classic Photo Booth',
    emoji: '🎞️',
    description: 'Multiple selfies in vertical strip format',
    category: 'photo-booth',
    prompt: `Classic photo booth strip with multiple selfie poses in vertical arrangement, vintage photo booth aesthetic, retro strip format, nostalgic photo booth styling, classic instant photo strip look, traditional photo booth design. ${IDENTITY_DIRECTIVE}`,
    tags: ['photo-booth', 'strip', 'multiple', 'vintage', 'retro'],
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 60,
    customFields: {
      multipleImages: true,
      frameStyle: 'strip-vertical',
      vintageLevel: 7,
      colorPalette: ['black', 'white', 'vintage']
    }
  }
]

// Minimalist Collage Templates
export const collageStyleTemplates: StyleTemplate[] = [
  {
    id: 'grid-collage',
    name: 'Grid Collage',
    emoji: '⬜',
    description: 'Clean grid layout showcasing multiple expressions',
    category: 'collage',
    prompt: `Minimalist grid collage with clean layout, multiple selfie expressions in grid format, clean aesthetic, modern collage design, organized grid arrangement, contemporary collage styling, clean and simple layout. ${IDENTITY_DIRECTIVE}`,
    tags: ['collage', 'grid', 'minimalist', 'clean', 'modern'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'hard',
    estimatedTime: 90,
    customFields: {
      multipleImages: true,
      frameStyle: 'grid',
      vintageLevel: 1,
      colorPalette: ['white', 'clean', 'minimal']
    }
  }
]

// Scrapbook/Doodle Frame Templates
export const scrapbookStyleTemplates: StyleTemplate[] = [
  {
    id: 'doodle-frame',
    name: 'Doodle Frame',
    emoji: '✏️',
    description: 'Playful hand-drawn doodle borders and decorations',
    category: 'scrapbook',
    prompt: `Playful doodle frame with hand-drawn borders, whimsical decorations, artistic doodle styling, creative hand-drawn elements, playful frame design, artistic doodle decorations, whimsical and fun styling. ${IDENTITY_DIRECTIVE}`,
    tags: ['doodle', 'hand-drawn', 'playful', 'whimsical', 'creative'],
    popularity: 8,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 45,
    customFields: {
      frameStyle: 'doodle',
      textOverlay: true,
      vintageLevel: 2,
      colorPalette: ['colorful', 'playful', 'creative']
    }
  }
]

// Instant Camera Effect Templates
export const instantCameraStyleTemplates: StyleTemplate[] = [
  {
    id: 'fuji-instax',
    name: 'Fuji Instax',
    emoji: '📸',
    description: 'Bright, saturated Fuji Instax instant camera look',
    category: 'instant-camera',
    prompt: `Fuji Instax instant camera aesthetic with bright saturated colors, signature curve and paper grain, instant camera styling, vibrant instant photo look, Fuji Instax color palette, instant camera photography, bright and vibrant styling. ${IDENTITY_DIRECTIVE}`,
    tags: ['instax', 'fuji', 'instant', 'bright', 'saturated'],
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 35,
    customFields: {
      frameStyle: 'instax',
      vintageLevel: 4,
      colorPalette: ['bright', 'saturated', 'vibrant']
    }
  }
]

// Event/Party Frame Templates
export const eventPartyStyleTemplates: StyleTemplate[] = [
  {
    id: 'birthday-party',
    name: 'Birthday Party',
    emoji: '🎉',
    description: 'Celebration frame with customizable hashtags and date',
    category: 'event-party',
    prompt: `Birthday party celebration frame with party decorations, celebration styling, festive party aesthetic, birthday celebration design, party frame with decorations, festive and celebratory styling, party celebration look. ${IDENTITY_DIRECTIVE}`,
    tags: ['birthday', 'party', 'celebration', 'festive', 'event'],
    popularity: 8,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 40,
    customFields: {
      frameStyle: 'birthday',
      textOverlay: true,
      vintageLevel: 2,
      colorPalette: ['colorful', 'festive', 'celebration']
    }
  }
]

// Meme/Text Overlay Templates
export const memeTextStyleTemplates: StyleTemplate[] = [
  {
    id: 'viral-meme',
    name: 'Viral Meme',
    emoji: '😂',
    description: 'Bold meme text overlay for viral content',
    category: 'meme-text',
    prompt: `Viral meme style with bold text overlay, meme aesthetic, viral content styling, bold meme text, viral social media look, meme text overlay, viral and trending styling, bold and attention-grabbing design. ${IDENTITY_DIRECTIVE}`,
    tags: ['meme', 'viral', 'text', 'bold', 'trending'],
    popularity: 9,
    engagement: 9,
    socialSharing: true,
    isTrending: true,
    difficulty: 'easy',
    estimatedTime: 25,
    customFields: {
      textOverlay: true,
      frameStyle: 'meme',
      vintageLevel: 1,
      colorPalette: ['bold', 'vibrant', 'attention-grabbing']
    }
  }
]

// Magazine Cover Templates
export const magazineCoverStyleTemplates: StyleTemplate[] = [
  {
    id: 'fashion-magazine',
    name: 'Fashion Magazine',
    emoji: '👗',
    description: 'High-fashion magazine cover aesthetic',
    category: 'magazine-cover',
    prompt: `Fashion magazine cover aesthetic with high-fashion styling, magazine cover design, fashion editorial look, magazine cover layout, high-fashion photography, magazine cover styling, fashion and glamorous look. ${IDENTITY_DIRECTIVE}`,
    tags: ['fashion', 'magazine', 'editorial', 'glamorous', 'high-fashion'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'hard',
    estimatedTime: 75,
    customFields: {
      frameStyle: 'magazine-fashion',
      textOverlay: true,
      vintageLevel: 3,
      colorPalette: ['glamorous', 'sophisticated', 'fashion']
    }
  }
]

// Aesthetic Moodboard Templates
export const aestheticMoodboardStyleTemplates: StyleTemplate[] = [
  {
    id: 'pastel-moodboard',
    name: 'Pastel Moodboard',
    emoji: '🌸',
    description: 'Soft pastel aesthetic with inspirational quotes',
    category: 'aesthetic-moodboard',
    prompt: `Pastel moodboard aesthetic with soft pastel colors, inspirational quote overlay, soft and dreamy styling, pastel color palette, aesthetic moodboard design, soft and gentle look, pastel and dreamy aesthetic. ${IDENTITY_DIRECTIVE}`,
    tags: ['pastel', 'aesthetic', 'moodboard', 'soft', 'dreamy'],
    popularity: 9,
    engagement: 8,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 50,
    customFields: {
      frameStyle: 'moodboard-pastel',
      textOverlay: true,
      vintageLevel: 2,
      colorPalette: ['pastel', 'soft', 'dreamy']
    }
  }
]

// Travel/Passport Stamp Templates
export const travelPassportStyleTemplates: StyleTemplate[] = [
  {
    id: 'passport-stamp',
    name: 'Passport Stamp',
    emoji: '✈️',
    description: 'Travel passport stamp with location tagging',
    category: 'travel-passport',
    prompt: `Travel passport stamp aesthetic with location tagging, travel passport styling, wanderlust aesthetic, travel passport design, travel and adventure look, passport stamp styling, travel and exploration aesthetic. ${IDENTITY_DIRECTIVE}`,
    tags: ['travel', 'passport', 'wanderlust', 'adventure', 'exploration'],
    popularity: 8,
    engagement: 7,
    socialSharing: true,
    isTrending: true,
    difficulty: 'medium',
    estimatedTime: 45,
    customFields: {
      frameStyle: 'passport',
      textOverlay: true,
      vintageLevel: 5,
      colorPalette: ['travel', 'adventure', 'wanderlust']
    }
  }
]

// Combined array for easy access
export const STYLE_TEMPLATES: StyleTemplate[] = [
  ...professionalStyleTemplates,
  ...creativeStyleTemplates,
  ...casualStyleTemplates,
  ...artisticStyleTemplates,
  ...vintageStyleTemplates,
  ...trendyStyleTemplates,
  ...polaroidStyleTemplates,
  ...photoBoothStyleTemplates,
  ...collageStyleTemplates,
  ...scrapbookStyleTemplates,
  ...instantCameraStyleTemplates,
  ...eventPartyStyleTemplates,
  ...memeTextStyleTemplates,
  ...magazineCoverStyleTemplates,
  ...aestheticMoodboardStyleTemplates,
  ...travelPassportStyleTemplates
]

// Category mapping for easy filtering
export const STYLE_TEMPLATE_CATEGORIES: Readonly<Record<StyleTemplateCategory, readonly StyleTemplate[]>> = {
  professional: professionalStyleTemplates,
  creative: creativeStyleTemplates,
  casual: casualStyleTemplates,
  artistic: artisticStyleTemplates,
  vintage: vintageStyleTemplates,
  trendy: trendyStyleTemplates,
  polaroid: polaroidStyleTemplates,
  'photo-booth': photoBoothStyleTemplates,
  collage: collageStyleTemplates,
  scrapbook: scrapbookStyleTemplates,
  'instant-camera': instantCameraStyleTemplates,
  'event-party': eventPartyStyleTemplates,
  'meme-text': memeTextStyleTemplates,
  'magazine-cover': magazineCoverStyleTemplates,
  'aesthetic-moodboard': aestheticMoodboardStyleTemplates,
  'travel-passport': travelPassportStyleTemplates
} as const

export const TEMPLATE_CATEGORIES: ReadonlyArray<{ id: StyleTemplateCategory; name: string; emoji: string }> = [
  { id: 'professional', name: 'Professional', emoji: '👔' },
  { id: 'creative', name: 'Creative', emoji: '🎨' },
  { id: 'casual', name: 'Casual', emoji: '👕' },
  { id: 'artistic', name: 'Artistic', emoji: '🖼️' },
  { id: 'vintage', name: 'Vintage', emoji: '📷' },
  { id: 'trendy', name: 'Trendy', emoji: '🔥' },
  { id: 'polaroid', name: 'Polaroid', emoji: '📷' },
  { id: 'photo-booth', name: 'Photo Booth', emoji: '🎞️' },
  { id: 'collage', name: 'Collage', emoji: '⬜' },
  { id: 'scrapbook', name: 'Scrapbook', emoji: '✏️' },
  { id: 'instant-camera', name: 'Instant Camera', emoji: '📸' },
  { id: 'event-party', name: 'Event & Party', emoji: '🎉' },
  { id: 'meme-text', name: 'Meme & Text', emoji: '😂' },
  { id: 'magazine-cover', name: 'Magazine Cover', emoji: '👗' },
  { id: 'aesthetic-moodboard', name: 'Aesthetic Moodboard', emoji: '🌸' },
  { id: 'travel-passport', name: 'Travel & Passport', emoji: '✈️' }
] as const

// Utility functions for template management
export const getTemplatesByCategory = (category: StyleTemplateCategory): readonly StyleTemplate[] => {
  return STYLE_TEMPLATE_CATEGORIES[category] || []
}

export const getTemplateById = (id: string): StyleTemplate | undefined => {
  return STYLE_TEMPLATES.find(template => template.id === id)
}

export const getTrendingTemplates = (): readonly StyleTemplate[] => {
  return STYLE_TEMPLATES.filter(template => template.isTrending)
}

export const getPopularTemplates = (limit: number = 10): readonly StyleTemplate[] => {
  return STYLE_TEMPLATES
    .sort((a, b) => b.popularity - a.popularity)
    .slice(0, limit)
}

export const getHighEngagementTemplates = (limit: number = 10): readonly StyleTemplate[] => {
  return STYLE_TEMPLATES
    .sort((a, b) => b.engagement - a.engagement)
    .slice(0, limit)
}

export const getTemplatesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): readonly StyleTemplate[] => {
  return STYLE_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export const getSocialSharingTemplates = (): readonly StyleTemplate[] => {
  return STYLE_TEMPLATES.filter(template => template.socialSharing)
}

export const getTemplatesByEstimatedTime = (maxTime: number): readonly StyleTemplate[] => {
  return STYLE_TEMPLATES.filter(template => template.estimatedTime <= maxTime)
}

export const searchTemplates = (query: string): readonly StyleTemplate[] => {
  const lowercaseQuery = query.toLowerCase()
  return STYLE_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  )
}

// Template statistics
export const getTemplateStats = () => {
  const totalTemplates = STYLE_TEMPLATES.length
  const trendingCount = STYLE_TEMPLATES.filter(t => t.isTrending).length
  const socialSharingCount = STYLE_TEMPLATES.filter(t => t.socialSharing).length
  const averagePopularity = STYLE_TEMPLATES.reduce((sum, t) => sum + t.popularity, 0) / totalTemplates
  const averageEngagement = STYLE_TEMPLATES.reduce((sum, t) => sum + t.engagement, 0) / totalTemplates
  
  return {
    totalTemplates,
    trendingCount,
    socialSharingCount,
    averagePopularity: Math.round(averagePopularity * 10) / 10,
    averageEngagement: Math.round(averageEngagement * 10) / 10
  }
}
