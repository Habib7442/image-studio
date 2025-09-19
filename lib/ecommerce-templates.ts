export interface EcommerceTemplate {
  id: string
  name: string
  emoji: string
  description: string
  category: EcommerceCategory
  prompt: string
  tags: string[]
  isTrending: boolean
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  estimatedTime: string
  useCases: string[]
  targetAudience: string[]
  conversionBoost: string
  costSavings: string
}

export type EcommerceCategory = 
  | 'lifestyle' 
  | 'mockup' 
  | 'lifestyle-model' 
  | 'product-showcase' 
  | 'social-media' 
  | 'advertising' 
  | 'catalog' 
  | 'seasonal'

export const LIFESTYLE_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'jewelry-lifestyle',
    name: 'Jewelry Lifestyle',
    emoji: '💍',
    description: 'Elegant jewelry worn in sophisticated settings',
    category: 'lifestyle',
    prompt: 'Professional lifestyle photography of {product} being worn elegantly in a luxurious setting with soft natural lighting, high-end fashion photography style, clean background, commercial quality',
    tags: ['jewelry', 'luxury', 'elegant', 'fashion'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Product pages', 'Social media', 'Email marketing'],
    targetAudience: 'Luxury jewelry brands',
    conversionBoost: '+40%',
    costSavings: '$2,000-5,000 per shoot'
  },
  {
    id: 'tech-lifestyle',
    name: 'Tech Lifestyle',
    emoji: '📱',
    description: 'Modern tech products in everyday use scenarios',
    category: 'lifestyle',
    prompt: 'Modern lifestyle photography of {product} being used naturally in contemporary home or office setting, clean minimalist aesthetic, professional lighting, commercial quality',
    tags: ['technology', 'modern', 'minimalist', 'professional'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Product demos', 'Website banners', 'App store screenshots'],
    targetAudience: 'Tech companies',
    conversionBoost: '+35%',
    costSavings: '$1,500-3,000 per shoot'
  },
  {
    id: 'fashion-lifestyle',
    name: 'Fashion Lifestyle',
    emoji: '👗',
    description: 'Fashion items in trendy, aspirational settings',
    category: 'lifestyle',
    prompt: 'Trendy lifestyle photography of {product} worn by a stylish model in an aspirational urban or natural setting, fashion-forward styling, professional photography, commercial quality',
    tags: ['fashion', 'trendy', 'aspirational', 'urban'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes',
    useCases: ['Lookbooks', 'Social media', 'Fashion catalogs'],
    targetAudience: 'Fashion brands',
    conversionBoost: '+50%',
    costSavings: '$3,000-8,000 per shoot'
  },
  {
    id: 'home-decor-lifestyle',
    name: 'Home Decor Lifestyle',
    emoji: '🏠',
    description: 'Home decor items in beautiful interior settings',
    category: 'lifestyle',
    prompt: 'Beautiful interior lifestyle photography of {product} placed in a stylish, well-designed home setting, warm inviting atmosphere, natural lighting, commercial quality',
    tags: ['home', 'interior', 'decor', 'cozy'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Interior design', 'Home catalogs', 'Pinterest marketing'],
    targetAudience: 'Home decor brands',
    conversionBoost: '+45%',
    costSavings: '$1,000-4,000 per shoot'
  }
]

export const MOCKUP_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'product-mockup',
    name: 'Product Mockup',
    emoji: '📦',
    description: 'Clean product mockups for e-commerce listings',
    category: 'mockup',
    prompt: 'Professional product mockup of {product} on clean white background with subtle shadow, studio lighting, commercial photography style, high resolution',
    tags: ['mockup', 'clean', 'professional', 'ecommerce'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '1-2 minutes',
    useCases: ['Product listings', 'Catalogs', 'Print materials'],
    targetAudience: 'E-commerce stores',
    conversionBoost: '+25%',
    costSavings: '$500-1,500 per product'
  },
  {
    id: 'packaging-mockup',
    name: 'Packaging Mockup',
    emoji: '📦',
    description: 'Product packaging in realistic 3D mockup style',
    category: 'mockup',
    prompt: 'Realistic 3D packaging mockup of {product} showing the box/container from multiple angles, professional product photography, commercial quality',
    tags: ['packaging', '3d', 'realistic', 'professional'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '2-3 minutes',
    useCases: ['Packaging design', 'Product launches', 'Marketing materials'],
    targetAudience: 'Product brands',
    conversionBoost: '+30%',
    costSavings: '$800-2,000 per design'
  },
  {
    id: 'device-mockup',
    name: 'Device Mockup',
    emoji: '💻',
    description: 'Digital products displayed on device screens',
    category: 'mockup',
    prompt: 'Professional device mockup showing {product} displayed on modern smartphone, tablet, or laptop screen, clean presentation, commercial quality',
    tags: ['device', 'digital', 'screen', 'modern'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['App showcases', 'Digital products', 'Portfolio presentations'],
    targetAudience: 'Digital product creators',
    conversionBoost: '+40%',
    costSavings: '$300-800 per mockup'
  }
]

export const LIFESTYLE_MODEL_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'beauty-model',
    name: 'Beauty Model',
    emoji: '💄',
    description: 'Beauty products on professional models',
    category: 'lifestyle-model',
    prompt: 'Professional beauty photography of {product} being applied by a professional model, studio lighting, clean background, commercial beauty photography style',
    tags: ['beauty', 'model', 'professional', 'studio'],
    isTrending: true,
    difficulty: 'Advanced',
    estimatedTime: '4-5 minutes',
    useCases: ['Beauty campaigns', 'Social media', 'Product launches'],
    targetAudience: 'Beauty brands',
    conversionBoost: '+60%',
    costSavings: '$5,000-15,000 per shoot'
  },
  {
    id: 'fitness-model',
    name: 'Fitness Model',
    emoji: '💪',
    description: 'Fitness products with athletic models',
    category: 'lifestyle-model',
    prompt: 'Dynamic fitness photography of {product} being used by an athletic model during workout, energetic lighting, commercial fitness photography style',
    tags: ['fitness', 'athletic', 'dynamic', 'energetic'],
    isTrending: true,
    difficulty: 'Advanced',
    estimatedTime: '4-5 minutes',
    useCases: ['Fitness marketing', 'Social media', 'Athletic brands'],
    targetAudience: 'Fitness brands',
    conversionBoost: '+55%',
    costSavings: '$4,000-12,000 per shoot'
  },
  {
    id: 'lifestyle-model-casual',
    name: 'Casual Lifestyle Model',
    emoji: '👤',
    description: 'Products with casual, relatable models',
    category: 'lifestyle-model',
    prompt: 'Casual lifestyle photography of {product} being used by a relatable model in everyday setting, natural lighting, authentic feel, commercial quality',
    tags: ['casual', 'relatable', 'everyday', 'authentic'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes',
    useCases: ['Social media', 'Email marketing', 'Product demos'],
    targetAudience: 'General retail brands',
    conversionBoost: '+35%',
    costSavings: '$2,000-6,000 per shoot'
  }
]

export const PRODUCT_SHOWCASE_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'hero-showcase',
    name: 'Hero Product Showcase',
    emoji: '⭐',
    description: 'Dramatic hero shots for product pages',
    category: 'product-showcase',
    prompt: 'Dramatic hero product photography of {product} with dramatic lighting, premium presentation, commercial quality, high-end product photography style',
    tags: ['hero', 'dramatic', 'premium', 'showcase'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes',
    useCases: ['Homepage banners', 'Product pages', 'Advertising'],
    targetAudience: 'Premium brands',
    conversionBoost: '+45%',
    costSavings: '$2,500-7,000 per shoot'
  },
  {
    id: 'detail-showcase',
    name: 'Product Detail Showcase',
    emoji: '🔍',
    description: 'Close-up detail shots highlighting product features',
    category: 'product-showcase',
    prompt: 'Detailed macro photography of {product} highlighting key features and textures, professional product photography, commercial quality',
    tags: ['detail', 'macro', 'features', 'texture'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Product details', 'Zoom views', 'Feature highlights'],
    targetAudience: 'All product brands',
    conversionBoost: '+30%',
    costSavings: '$800-2,500 per product'
  },
  {
    id: 'comparison-showcase',
    name: 'Product Comparison',
    emoji: '⚖️',
    description: 'Side-by-side product comparisons',
    category: 'product-showcase',
    prompt: 'Professional comparison photography of {product} showing different variants or sizes side by side, clean presentation, commercial quality',
    tags: ['comparison', 'variants', 'sizes', 'options'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Product variants', 'Size guides', 'Comparison pages'],
    targetAudience: 'Multi-variant brands',
    conversionBoost: '+25%',
    costSavings: '$1,000-3,000 per comparison'
  }
]

export const SOCIAL_MEDIA_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'instagram-square',
    name: 'Instagram Square',
    emoji: '📱',
    description: 'Perfect square format for Instagram posts',
    category: 'social-media',
    prompt: 'Instagram-optimized square photography of {product} with trendy styling, vibrant colors, social media ready, commercial quality',
    tags: ['instagram', 'square', 'trendy', 'social'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Instagram posts', 'Social media', 'Feed content'],
    targetAudience: 'Social media marketers',
    conversionBoost: '+40%',
    costSavings: '$500-1,500 per post'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    emoji: '📲',
    description: 'Vertical format for Instagram Stories',
    category: 'social-media',
    prompt: 'Instagram Story vertical photography of {product} with engaging composition, mobile-optimized, social media ready',
    tags: ['instagram', 'story', 'vertical', 'mobile'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Instagram Stories', 'TikTok', 'Vertical content'],
    targetAudience: 'Social media creators',
    conversionBoost: '+35%',
    costSavings: '$300-1,000 per story'
  },
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    emoji: '📌',
    description: 'Vertical pins optimized for Pinterest',
    category: 'social-media',
    prompt: 'Pinterest-optimized vertical pin of {product} with lifestyle context, pin-worthy styling, commercial quality',
    tags: ['pinterest', 'pin', 'vertical', 'lifestyle'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Pinterest marketing', 'Visual discovery', 'Inspiration content'],
    targetAudience: 'Pinterest marketers',
    conversionBoost: '+50%',
    costSavings: '$400-1,200 per pin'
  }
]

export const ADVERTISING_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'banner-ad',
    name: 'Banner Advertisement',
    emoji: '📢',
    description: 'Professional banner ads for digital advertising',
    category: 'advertising',
    prompt: 'Professional banner advertisement featuring {product} with compelling composition, commercial advertising style, high conversion design',
    tags: ['banner', 'advertising', 'commercial', 'conversion'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes',
    useCases: ['Google Ads', 'Facebook Ads', 'Display advertising'],
    targetAudience: 'Digital advertisers',
    conversionBoost: '+60%',
    costSavings: '$1,500-4,000 per ad'
  },
  {
    id: 'social-ad',
    name: 'Social Media Ad',
    emoji: '📱',
    description: 'Engaging social media advertisements',
    category: 'advertising',
    prompt: 'Engaging social media advertisement featuring {product} with attention-grabbing design, social media optimized, commercial quality',
    tags: ['social', 'advertising', 'engaging', 'viral'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes',
    useCases: ['Facebook Ads', 'Instagram Ads', 'TikTok Ads'],
    targetAudience: 'Social media advertisers',
    conversionBoost: '+55%',
    costSavings: '$1,200-3,500 per ad'
  },
  {
    id: 'email-marketing',
    name: 'Email Marketing',
    emoji: '📧',
    description: 'Product images for email marketing campaigns',
    category: 'advertising',
    prompt: 'Email marketing photography of {product} with clean, professional presentation, email-optimized, commercial quality',
    tags: ['email', 'marketing', 'professional', 'clean'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Email campaigns', 'Newsletters', 'Promotional emails'],
    targetAudience: 'Email marketers',
    conversionBoost: '+30%',
    costSavings: '$400-1,200 per campaign'
  }
]

export const CATALOG_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'product-catalog',
    name: 'Product Catalog',
    emoji: '📖',
    description: 'Professional catalog-style product photography',
    category: 'catalog',
    prompt: 'Professional catalog photography of {product} with consistent styling, commercial catalog quality, clean presentation',
    tags: ['catalog', 'professional', 'consistent', 'commercial'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Product catalogs', 'Print materials', 'B2B sales'],
    targetAudience: 'B2B companies',
    conversionBoost: '+35%',
    costSavings: '$1,000-3,000 per catalog'
  },
  {
    id: 'lookbook',
    name: 'Fashion Lookbook',
    emoji: '👗',
    description: 'Fashion lookbook style photography',
    category: 'catalog',
    prompt: 'Fashion lookbook photography of {product} with editorial styling, high-fashion aesthetic, commercial quality',
    tags: ['lookbook', 'fashion', 'editorial', 'high-end'],
    isTrending: true,
    difficulty: 'Advanced',
    estimatedTime: '4-5 minutes',
    useCases: ['Fashion lookbooks', 'Editorial content', 'Brand storytelling'],
    targetAudience: 'Fashion brands',
    conversionBoost: '+65%',
    costSavings: '$8,000-20,000 per lookbook'
  }
]

export const SEASONAL_TEMPLATES: EcommerceTemplate[] = [
  {
    id: 'holiday-seasonal',
    name: 'Holiday Seasonal',
    emoji: '🎄',
    description: 'Holiday-themed product photography',
    category: 'seasonal',
    prompt: 'Holiday-themed photography of {product} with festive decorations and seasonal styling, warm holiday atmosphere, commercial quality',
    tags: ['holiday', 'seasonal', 'festive', 'warm'],
    isTrending: true,
    difficulty: 'Medium',
    estimatedTime: '3-4 minutes',
    useCases: ['Holiday campaigns', 'Seasonal marketing', 'Gift guides'],
    targetAudience: 'Seasonal retailers',
    conversionBoost: '+50%',
    costSavings: '$2,000-6,000 per campaign'
  },
  {
    id: 'summer-seasonal',
    name: 'Summer Seasonal',
    emoji: '☀️',
    description: 'Summer-themed product photography',
    category: 'seasonal',
    prompt: 'Summer-themed photography of {product} with bright, sunny styling and warm summer atmosphere, commercial quality',
    tags: ['summer', 'bright', 'sunny', 'warm'],
    isTrending: true,
    difficulty: 'Easy',
    estimatedTime: '2-3 minutes',
    useCases: ['Summer campaigns', 'Seasonal collections', 'Outdoor marketing'],
    targetAudience: 'Seasonal brands',
    conversionBoost: '+40%',
    costSavings: '$1,500-4,000 per campaign'
  }
]

// Combine all templates
export const ECOMMERCE_TEMPLATES: EcommerceTemplate[] = [
  ...LIFESTYLE_TEMPLATES,
  ...MOCKUP_TEMPLATES,
  ...LIFESTYLE_MODEL_TEMPLATES,
  ...PRODUCT_SHOWCASE_TEMPLATES,
  ...SOCIAL_MEDIA_TEMPLATES,
  ...ADVERTISING_TEMPLATES,
  ...CATALOG_TEMPLATES,
  ...SEASONAL_TEMPLATES
]

export const ECOMMERCE_CATEGORIES: EcommerceCategory[] = [
  'lifestyle',
  'mockup',
  'lifestyle-model',
  'product-showcase',
  'social-media',
  'advertising',
  'catalog',
  'seasonal'
]

// Utility functions
export function getEcommerceTemplateById(id: string): EcommerceTemplate | undefined {
  return ECOMMERCE_TEMPLATES.find(template => template.id === id)
}

export function getEcommerceTemplatesByCategory(category: EcommerceCategory): EcommerceTemplate[] {
  return ECOMMERCE_TEMPLATES.filter(template => template.category === category)
}

export function getTrendingEcommerceTemplates(): EcommerceTemplate[] {
  return ECOMMERCE_TEMPLATES.filter(template => template.isTrending)
}

export function searchEcommerceTemplates(query: string): EcommerceTemplate[] {
  const lowercaseQuery = query.toLowerCase()
  return ECOMMERCE_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowercaseQuery) ||
    template.description.toLowerCase().includes(lowercaseQuery) ||
    template.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)) ||
    template.useCases.some(useCase => useCase.toLowerCase().includes(lowercaseQuery))
  )
}

export function getEcommerceTemplatesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Advanced'): EcommerceTemplate[] {
  return ECOMMERCE_TEMPLATES.filter(template => template.difficulty === difficulty)
}

export function getEcommerceTemplatesByUseCase(useCase: string): EcommerceTemplate[] {
  return ECOMMERCE_TEMPLATES.filter(template =>
    template.useCases.some(uc => uc.toLowerCase().includes(useCase.toLowerCase()))
  )
}

export function getEcommerceTemplatesByTargetAudience(audience: string): EcommerceTemplate[] {
  return ECOMMERCE_TEMPLATES.filter(template =>
    template.targetAudience.toLowerCase().includes(audience.toLowerCase())
  )
}

export function getEcommerceTemplateStats() {
  const total = ECOMMERCE_TEMPLATES.length
  const trending = ECOMMERCE_TEMPLATES.filter(t => t.isTrending).length
  const categories = ECOMMERCE_CATEGORIES.length
  
  const difficultyStats = {
    Easy: ECOMMERCE_TEMPLATES.filter(t => t.difficulty === 'Easy').length,
    Medium: ECOMMERCE_TEMPLATES.filter(t => t.difficulty === 'Medium').length,
    Advanced: ECOMMERCE_TEMPLATES.filter(t => t.difficulty === 'Advanced').length
  }
  
  return {
    total,
    trending,
    categories,
    difficultyStats
  }
}
