export interface AdTemplate {
  id: string
  name: string
  emoji: string
  description: string
  category: 'corporate' | 'lifestyle' | 'luxury' | 'minimal' | 'trendy' | 'creative' | 'social' | 'fashion'
  prompt: string
  tags: string[]
  isTrending?: boolean
  popularity?: number
  engagement?: number
  socialSharing?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  estimatedTime?: number
  previewImage?: string
  customFields?: Record<string, any>
}

export const AD_TEMPLATES: AdTemplate[] = [
  // Corporate Templates
  {
    id: 'corporate-professional',
    name: 'Corporate Professional',
    emoji: '🏢',
    description: 'Clean studio, professional lighting, LinkedIn-style product ad',
    category: 'corporate',
    prompt: 'Professional corporate advertisement featuring this person with this product in a clean studio setting with bright, even lighting, wearing business attire, confident and trustworthy expression, product prominently displayed, corporate color scheme, high-end photography quality, perfect for LinkedIn and professional platforms, executive product endorsement style, sharp focus, professional color grading.',
    tags: ['corporate', 'professional', 'business', 'studio', 'clean'],
    isTrending: true,
    popularity: 95,
    engagement: 88,
    socialSharing: 76,
    difficulty: 'easy',
    estimatedTime: 45,
    customFields: {
      targetAudience: 'B2B professionals',
      bestFor: 'LinkedIn, corporate websites',
      colorScheme: 'Professional blue/gray'
    }
  },
  {
    id: 'executive-luxury',
    name: 'Executive Luxury',
    emoji: '💼',
    description: 'High-end executive product endorsement',
    category: 'corporate',
    prompt: 'Luxury executive product advertisement with sophisticated lighting setup, premium business attire, elegant office or studio background, authoritative and confident pose, product showcased as premium item, high-end brand aesthetic, magazine-quality photography, executive endorsement style, sophisticated color palette, premium product photography.',
    tags: ['executive', 'luxury', 'premium', 'sophisticated', 'authority'],
    popularity: 78,
    engagement: 82,
    socialSharing: 65,
    difficulty: 'medium',
    estimatedTime: 60,
    customFields: {
      targetAudience: 'C-suite executives',
      bestFor: 'Premium brands, luxury products',
      colorScheme: 'Black/gold/silver'
    }
  },

  // Lifestyle Templates
  {
    id: 'cafe-lifestyle',
    name: 'Cafe Lifestyle',
    emoji: '☕',
    description: 'Cozy café, warm tones, holding product casually',
    category: 'lifestyle',
    prompt: 'Lifestyle advertisement in a cozy café setting with warm, natural lighting, person casually holding the product, relaxed and authentic expression, warm color tones, coffee shop atmosphere, lifestyle photography style, authentic and relatable vibe, Instagram-worthy lifestyle shot, cozy and inviting aesthetic, natural product integration.',
    tags: ['lifestyle', 'cafe', 'warm', 'casual', 'authentic'],
    isTrending: true,
    popularity: 92,
    engagement: 94,
    socialSharing: 89,
    difficulty: 'easy',
    estimatedTime: 40,
    customFields: {
      targetAudience: 'Millennials, Gen Z',
      bestFor: 'Instagram, lifestyle brands',
      colorScheme: 'Warm browns/beiges'
    }
  },
  {
    id: 'travel-vibe',
    name: 'Travel Vibe',
    emoji: '🏝️',
    description: 'Beach background, summer feel, influencer-style ad',
    category: 'lifestyle',
    prompt: 'Travel lifestyle advertisement with beach or tropical background, bright summer lighting, person holding product in vacation setting, happy and carefree expression, vibrant summer colors, influencer-style photography, wanderlust aesthetic, travel product endorsement, Instagram travel shot, vacation vibes, adventure lifestyle.',
    tags: ['travel', 'beach', 'summer', 'influencer', 'vibrant'],
    popularity: 87,
    engagement: 91,
    socialSharing: 85,
    difficulty: 'medium',
    estimatedTime: 55,
    customFields: {
      targetAudience: 'Travel enthusiasts',
      bestFor: 'Instagram, travel brands',
      colorScheme: 'Bright blues/oranges'
    }
  },
  {
    id: 'home-cozy',
    name: 'Home Cozy',
    emoji: '🏠',
    description: 'Cozy home setting, warm lighting, comfort product ad',
    category: 'lifestyle',
    prompt: 'Cozy home lifestyle advertisement with warm indoor lighting, person in comfortable home setting with the product, relaxed and content expression, homey atmosphere, warm and inviting colors, lifestyle photography, comfort and relaxation vibes, home product endorsement, cozy aesthetic, domestic lifestyle.',
    tags: ['home', 'cozy', 'comfort', 'warm', 'domestic'],
    popularity: 83,
    engagement: 86,
    socialSharing: 78,
    difficulty: 'easy',
    estimatedTime: 35,
    customFields: {
      targetAudience: 'Home enthusiasts',
      bestFor: 'Instagram, home brands',
      colorScheme: 'Warm neutrals'
    }
  },

  // Luxury Templates
  {
    id: 'luxury-brand',
    name: 'Luxury Brand',
    emoji: '🖤',
    description: 'High-fashion editorial, dramatic lighting, black & gold theme',
    category: 'luxury',
    prompt: 'Luxury high-fashion editorial advertisement with dramatic studio lighting, elegant formal attire, sophisticated black and gold color scheme, glamorous pose, product presented as luxury item, high-end fashion photography, editorial magazine style, premium brand aesthetic, sophisticated shadows and highlights, luxury product endorsement, high-fashion editorial look.',
    tags: ['luxury', 'fashion', 'editorial', 'dramatic', 'glamorous'],
    isTrending: true,
    popularity: 89,
    engagement: 85,
    socialSharing: 72,
    difficulty: 'hard',
    estimatedTime: 75,
    customFields: {
      targetAudience: 'Luxury consumers',
      bestFor: 'Magazine ads, luxury brands',
      colorScheme: 'Black/gold/white'
    }
  },
  {
    id: 'premium-gold',
    name: 'Premium Gold',
    emoji: '✨',
    description: 'Gold and white luxury aesthetic, premium product showcase',
    category: 'luxury',
    prompt: 'Premium luxury advertisement with gold and white color scheme, elegant lighting setup, sophisticated attire, product showcased as premium luxury item, refined and elegant pose, high-end luxury photography, premium brand aesthetic, gold accents and lighting, sophisticated composition, luxury product endorsement, premium editorial style.',
    tags: ['luxury', 'gold', 'premium', 'elegant', 'sophisticated'],
    popularity: 81,
    engagement: 79,
    socialSharing: 68,
    difficulty: 'medium',
    estimatedTime: 65,
    customFields: {
      targetAudience: 'High-end consumers',
      bestFor: 'Luxury brands, premium products',
      colorScheme: 'Gold/white/cream'
    }
  },

  // Minimal Templates
  {
    id: 'minimal-aesthetic',
    name: 'Minimal Aesthetic',
    emoji: '🎨',
    description: 'White background, clean flat lay, Apple-style ad',
    category: 'minimal',
    prompt: 'Minimalist aesthetic advertisement with clean white background, simple and clean lighting, person in minimal attire, product showcased with clean composition, Apple-style product photography, minimalist design aesthetic, clean lines and simple composition, modern and sleek look, minimalist product endorsement, clean and simple aesthetic.',
    tags: ['minimal', 'clean', 'white', 'simple', 'modern'],
    isTrending: true,
    popularity: 94,
    engagement: 90,
    socialSharing: 82,
    difficulty: 'easy',
    estimatedTime: 30,
    customFields: {
      targetAudience: 'Design enthusiasts',
      bestFor: 'Tech brands, minimal products',
      colorScheme: 'White/gray/black'
    }
  },
  {
    id: 'scandinavian-minimal',
    name: 'Scandinavian Minimal',
    emoji: '⚪',
    description: 'Nordic minimalism, light wood, clean design',
    category: 'minimal',
    prompt: 'Scandinavian minimalist advertisement with light wood and neutral tones, clean natural lighting, person in simple neutral attire, product integrated with Nordic design aesthetic, clean and functional composition, Scandinavian design principles, minimal color palette, functional beauty, Nordic lifestyle, clean and organized look.',
    tags: ['scandinavian', 'minimal', 'wood', 'neutral', 'functional'],
    popularity: 76,
    engagement: 84,
    socialSharing: 71,
    difficulty: 'medium',
    estimatedTime: 50,
    customFields: {
      targetAudience: 'Nordic design lovers',
      bestFor: 'Home brands, furniture',
      colorScheme: 'Light wood/white/beige'
    }
  },

  // Trendy Templates
  {
    id: 'urban-street',
    name: 'Urban Street',
    emoji: '🌆',
    description: 'City skyline, neon glow, street photography style',
    category: 'trendy',
    prompt: 'Urban street advertisement with city skyline background, neon lighting effects, person in trendy streetwear, product integrated with urban aesthetic, edgy and cool pose, street photography style, urban color palette, city vibes, trendy street fashion, urban product endorsement, street art aesthetic, metropolitan lifestyle.',
    tags: ['urban', 'street', 'neon', 'trendy', 'city'],
    isTrending: true,
    popularity: 91,
    engagement: 93,
    socialSharing: 87,
    difficulty: 'medium',
    estimatedTime: 55,
    customFields: {
      targetAudience: 'Urban youth',
      bestFor: 'Streetwear, urban brands',
      colorScheme: 'Neon/urban colors'
    }
  },
  {
    id: 'y2k-viral',
    name: 'Y2K Viral',
    emoji: '🌈',
    description: 'Y2K aesthetic, bright colors, viral social media style',
    category: 'trendy',
    prompt: 'Y2K viral advertisement with bright neon colors and futuristic aesthetic, person in trendy Y2K outfit, product with cyberpunk vibes, energetic and fun pose, social media viral style, bright and vibrant colors, Y2K nostalgia, internet culture aesthetic, viral product endorsement, cyber fashion, digital age vibes.',
    tags: ['y2k', 'viral', 'neon', 'cyberpunk', 'social'],
    popularity: 88,
    engagement: 95,
    socialSharing: 92,
    difficulty: 'medium',
    estimatedTime: 50,
    customFields: {
      targetAudience: 'Gen Z, social media users',
      bestFor: 'TikTok, Instagram, viral content',
      colorScheme: 'Bright neon colors'
    }
  },
  {
    id: 'aesthetic-core',
    name: 'Aesthetic Core',
    emoji: '🖤',
    description: 'Dark academia, moody lighting, aesthetic product showcase',
    category: 'trendy',
    prompt: 'Aesthetic core advertisement with dark academia vibes, moody lighting setup, person in sophisticated dark attire, product with intellectual aesthetic, mysterious and artistic pose, aesthetic photography style, dark romantic color palette, academic vibes, aesthetic product endorsement, artistic composition, intellectual lifestyle.',
    tags: ['aesthetic', 'dark', 'academia', 'moody', 'artistic'],
    popularity: 85,
    engagement: 89,
    socialSharing: 81,
    difficulty: 'hard',
    estimatedTime: 70,
    customFields: {
      targetAudience: 'Aesthetic enthusiasts',
      bestFor: 'Instagram, artistic brands',
      colorScheme: 'Dark/moody tones'
    }
  },

  // Creative Templates
  {
    id: 'artistic-editorial',
    name: 'Artistic Editorial',
    emoji: '🎭',
    description: 'Creative artistic direction, unique composition, art gallery style',
    category: 'creative',
    prompt: 'Artistic editorial advertisement with creative lighting and composition, person in artistic attire, product integrated with creative aesthetic, expressive and artistic pose, gallery-worthy photography, creative color palette, artistic expression, creative product endorsement, unique composition, artistic vision, creative lifestyle.',
    tags: ['artistic', 'editorial', 'creative', 'unique', 'expressive'],
    popularity: 79,
    engagement: 87,
    socialSharing: 74,
    difficulty: 'hard',
    estimatedTime: 80,
    customFields: {
      targetAudience: 'Art lovers, creatives',
      bestFor: 'Art galleries, creative brands',
      colorScheme: 'Creative/artistic palette'
    }
  },
  {
    id: 'vintage-film',
    name: 'Vintage Film',
    emoji: '🎬',
    description: 'Retro film aesthetic, warm tones, nostalgic product ad',
    category: 'creative',
    prompt: 'Vintage film advertisement with retro aesthetic and warm color tones, person in vintage-inspired attire, product with nostalgic appeal, classic and timeless pose, film photography style, vintage color grading, nostalgic atmosphere, retro product endorsement, classic composition, timeless elegance, vintage lifestyle.',
    tags: ['vintage', 'film', 'retro', 'nostalgic', 'classic'],
    popularity: 82,
    engagement: 85,
    socialSharing: 77,
    difficulty: 'medium',
    estimatedTime: 60,
    customFields: {
      targetAudience: 'Vintage lovers',
      bestFor: 'Retro brands, vintage products',
      colorScheme: 'Warm vintage tones'
    }
  },

  // Social Media Templates
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    emoji: '📱',
    description: 'Vertical format, mobile-optimized, story-style ad',
    category: 'social',
    prompt: 'Instagram story advertisement in vertical format, mobile-optimized composition, person holding product in engaging pose, bright and vibrant colors, social media aesthetic, story-style photography, mobile-first design, Instagram-optimized lighting, social media product endorsement, story-ready format, mobile-friendly composition.',
    tags: ['instagram', 'story', 'mobile', 'vertical', 'social'],
    isTrending: true,
    popularity: 96,
    engagement: 97,
    socialSharing: 94,
    difficulty: 'easy',
    estimatedTime: 35,
    customFields: {
      targetAudience: 'Social media users',
      bestFor: 'Instagram Stories, social media',
      colorScheme: 'Bright social colors'
    }
  },
  {
    id: 'tiktok-viral',
    name: 'TikTok Viral',
    emoji: '🎵',
    description: 'TikTok-style ad, dynamic pose, viral content aesthetic',
    category: 'social',
    prompt: 'TikTok viral advertisement with dynamic and energetic pose, person showcasing product in engaging way, bright and bold colors, TikTok-style photography, viral content aesthetic, social media optimized, dynamic composition, viral product endorsement, TikTok-ready format, energetic and fun vibe.',
    tags: ['tiktok', 'viral', 'dynamic', 'energetic', 'social'],
    popularity: 93,
    engagement: 98,
    socialSharing: 96,
    difficulty: 'easy',
    estimatedTime: 40,
    customFields: {
      targetAudience: 'TikTok users, Gen Z',
      bestFor: 'TikTok, viral content',
      colorScheme: 'Bright/vibrant colors'
    }
  },

  // Fashion Templates
  {
    id: 'fashion-runway',
    name: 'Fashion Runway',
    emoji: '👗',
    description: 'High-fashion runway style, dramatic pose, fashion editorial',
    category: 'fashion',
    prompt: 'High-fashion runway advertisement with dramatic pose and lighting, person in fashionable attire, product integrated with fashion aesthetic, runway-style photography, fashion editorial look, sophisticated composition, fashion-forward styling, high-end fashion photography, runway product endorsement, fashion magazine style, couture aesthetic.',
    tags: ['fashion', 'runway', 'editorial', 'dramatic', 'couture'],
    popularity: 86,
    engagement: 88,
    socialSharing: 79,
    difficulty: 'hard',
    estimatedTime: 85,
    customFields: {
      targetAudience: 'Fashion enthusiasts',
      bestFor: 'Fashion brands, magazines',
      colorScheme: 'Fashion-forward palette'
    }
  },
  {
    id: 'streetwear-cool',
    name: 'Streetwear Cool',
    emoji: '👟',
    description: 'Streetwear aesthetic, cool pose, urban fashion style',
    category: 'fashion',
    prompt: 'Streetwear cool advertisement with urban fashion aesthetic, person in trendy streetwear, product integrated with street style, cool and confident pose, street photography style, urban fashion vibes, streetwear product endorsement, cool and edgy composition, street fashion photography, urban lifestyle, trendy street aesthetic.',
    tags: ['streetwear', 'cool', 'urban', 'trendy', 'street'],
    popularity: 90,
    engagement: 92,
    socialSharing: 86,
    difficulty: 'medium',
    estimatedTime: 55,
    customFields: {
      targetAudience: 'Streetwear enthusiasts',
      bestFor: 'Streetwear brands, urban fashion',
      colorScheme: 'Urban/street colors'
    }
  }
]

export const AD_TEMPLATE_CATEGORIES = [
  { id: 'corporate', name: 'Corporate', emoji: '🏢' },
  { id: 'lifestyle', name: 'Lifestyle', emoji: '☕' },
  { id: 'luxury', name: 'Luxury', emoji: '🖤' },
  { id: 'minimal', name: 'Minimal', emoji: '🎨' },
  { id: 'trendy', name: 'Trendy', emoji: '🌆' },
  { id: 'creative', name: 'Creative', emoji: '🎭' },
  { id: 'social', name: 'Social Media', emoji: '📱' },
  { id: 'fashion', name: 'Fashion', emoji: '👗' }
] as const

export function getAdTemplateById(id: string): AdTemplate | undefined {
  return AD_TEMPLATES.find(template => template.id === id)
}

export function getAdTemplatesByCategory(category: string): AdTemplate[] {
  return AD_TEMPLATES.filter(template => template.category === category)
}

export function getRandomAdTemplate(): AdTemplate {
  const randomIndex = Math.floor(Math.random() * AD_TEMPLATES.length)
  return AD_TEMPLATES[randomIndex]
}

export function getTrendingAdTemplates(): AdTemplate[] {
  return AD_TEMPLATES.filter(template => template.isTrending)
}

export function getPopularAdTemplates(): AdTemplate[] {
  return AD_TEMPLATES
    .filter(template => template.popularity && template.popularity >= 85)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
}

export function getHighEngagementAdTemplates(): AdTemplate[] {
  return AD_TEMPLATES
    .filter(template => template.engagement && template.engagement >= 85)
    .sort((a, b) => (b.engagement || 0) - (a.engagement || 0))
}

export function getAdTemplatesByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): AdTemplate[] {
  return AD_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export function getSocialSharingAdTemplates(): AdTemplate[] {
  return AD_TEMPLATES
    .filter(template => template.socialSharing && template.socialSharing >= 80)
    .sort((a, b) => (b.socialSharing || 0) - (a.socialSharing || 0))
}

export function getAdTemplatesByEstimatedTime(maxTime: number): AdTemplate[] {
  return AD_TEMPLATES.filter(template => 
    template.estimatedTime && template.estimatedTime <= maxTime
  )
}

export function searchAdTemplates(query: string): AdTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return AD_TEMPLATES.filter(template => 
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.category.toLowerCase().includes(lowercaseQuery)
  )
}

export function getAdTemplateStats() {
  const total = AD_TEMPLATES.length
  const trending = AD_TEMPLATES.filter(t => t.isTrending).length
  const categories = AD_TEMPLATE_CATEGORIES.length
  const avgPopularity = AD_TEMPLATES.reduce((sum, t) => sum + (t.popularity || 0), 0) / total
  const avgEngagement = AD_TEMPLATES.reduce((sum, t) => sum + (t.engagement || 0), 0) / total
  
  return {
    total,
    trending,
    categories,
    avgPopularity: Math.round(avgPopularity),
    avgEngagement: Math.round(avgEngagement)
  }
}
