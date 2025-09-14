export type StyleTemplateCategory =
  | 'professional'
  | 'creative'
  | 'casual'
  | 'artistic'
  | 'vintage'
  | 'trendy'

export interface StyleTemplate {
  readonly id: string
  readonly name: string
  readonly emoji: string
  readonly description: string
  readonly category: StyleTemplateCategory
  readonly prompt: string
  readonly tags: readonly string[]
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
    tags: ['corporate', 'business', 'linkedin', 'professional']
  },
  {
    id: 'executive-portrait',
    name: 'Executive Portrait',
    emoji: '💼',
    description: 'High-end executive photography',
    category: 'professional',
    prompt: `Executive portrait with sophisticated lighting setup, wearing premium business attire, modern office or studio background, confident and authoritative pose, professional color grading, high-end photography, magazine-quality, sharp details, premium aesthetic. ${IDENTITY_DIRECTIVE}`,
    tags: ['executive', 'premium', 'corporate', 'sophisticated']
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
    tags: ['bollywood', 'glamorous', 'dramatic', 'colorful']
  },
  {
    id: 'fashion-editorial',
    name: 'Fashion Editorial',
    emoji: '📸',
    description: 'High-fashion magazine style',
    category: 'creative',
    prompt: `High-fashion editorial photoshoot with avant-garde styling, artistic composition, dramatic lighting, high-end fashion outfit, artistic pose, magazine-quality photography, creative direction, artistic shadows, fashion photography, editorial aesthetic, creative styling. ${IDENTITY_DIRECTIVE}`,
    tags: ['fashion', 'editorial', 'magazine', 'artistic']
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
    tags: ['streetwear', 'urban', 'casual', 'trendy']
  },
  {
    id: 'tropical-travel',
    name: 'Tropical Travel',
    emoji: '🏝️',
    description: 'Vacation-ready tropical vibes',
    category: 'casual',
    prompt: `Tropical travel photoshoot with vacation outfit, tropical or beach background, warm natural lighting, relaxed vacation pose, tropical aesthetic, travel photography, vacation vibes, warm colors, beach or resort setting, relaxed styling. ${IDENTITY_DIRECTIVE}`,
    tags: ['tropical', 'travel', 'vacation', 'beach']
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
    tags: ['moody', 'artistic', 'dramatic', 'cinematic']
  },
  {
    id: 'minimalist-modern',
    name: 'Minimalist Modern',
    emoji: '⚪',
    description: 'Clean minimalist aesthetic',
    category: 'artistic',
    prompt: `Minimalist modern photoshoot with clean, simple lighting, minimal outfit, white or neutral background, clean composition, modern aesthetic, simple elegance, contemporary style, clean lines, sophisticated simplicity, modern photography, minimalist beauty. ${IDENTITY_DIRECTIVE}`,
    tags: ['minimalist', 'modern', 'clean', 'simple']
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
    tags: ['vintage', 'glamour', 'hollywood', 'classic']
  },
  {
    id: 'retro-80s',
    name: 'Retro 80s',
    emoji: '🎸',
    description: 'Bold 80s retro styling',
    category: 'vintage',
    prompt: `Retro 80s photoshoot with bold colorful outfit, neon lighting or bright colors, confident 80s pose, retro aesthetic, vibrant colors, 80s fashion styling, retro photography, bold and fun vibe, nostalgic 80s look. ${IDENTITY_DIRECTIVE}`,
    tags: ['retro', '80s', 'colorful', 'bold']
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
    tags: ['aesthetic', 'dark', 'academia', 'moody', 'artistic']
  }
]

// Combined array for easy access
export const STYLE_TEMPLATES: StyleTemplate[] = [
  ...professionalStyleTemplates,
  ...creativeStyleTemplates,
  ...casualStyleTemplates,
  ...artisticStyleTemplates,
  ...vintageStyleTemplates,
  ...trendyStyleTemplates
]

// Category mapping for easy filtering
export const STYLE_TEMPLATE_CATEGORIES: Readonly<Record<StyleTemplateCategory, readonly StyleTemplate[]>> = {
  professional: professionalStyleTemplates,
  creative: creativeStyleTemplates,
  casual: casualStyleTemplates,
  artistic: artisticStyleTemplates,
  vintage: vintageStyleTemplates,
  trendy: trendyStyleTemplates
} as const

export const TEMPLATE_CATEGORIES: ReadonlyArray<{ id: StyleTemplateCategory; name: string; emoji: string }> = [
  { id: 'professional', name: 'Professional', emoji: '👔' },
  { id: 'creative', name: 'Creative', emoji: '🎨' },
  { id: 'casual', name: 'Casual', emoji: '👕' },
  { id: 'artistic', name: 'Artistic', emoji: '🖼️' },
  { id: 'vintage', name: 'Vintage', emoji: '📷' },
  { id: 'trendy', name: 'Trendy', emoji: '🔥' }
] as const
