import type { GenerationMode } from '@/types'

export const funGenerationModes: GenerationMode[] = [
  {
    id: 'trending',
    title: 'Trending',
    icon: '🔥',
    description: 'Create viral trending content',
    category: 'fun'
  },
  {
    id: 'style-myselfie',
    title: 'Style My Selfie',
    icon: '📸',
    description: 'Transform your selfies with AI',
    category: 'fun'
  },
  {
    id: 'virtual-ad',
    title: 'Virtual Ad On',
    icon: '🎬',
    description: 'Create virtual advertisements',
    category: 'fun'
  },
  {
    id: 'cineshot-ai',
    title: 'Cineshot AI',
    icon: '🎭',
    description: 'Cinematic photo generation',
    category: 'fun'
  },
  {
    id: 'dream-ride-ai',
    title: 'Dream Ride AI',
    icon: '🏍️',
    description: 'AI-powered vehicle photoshoots',
    category: 'fun'
  },
  {
    id: 'ai-gaming-photoshoot',
    title: 'AI Gaming Photoshoot',
    icon: '🎮',
    description: 'Gaming-themed photo sessions',
    category: 'fun'
  },
  {
    id: 'live-avatar-studio',
    title: 'Live Avatar Studio',
    icon: '👤',
    description: 'Real-time avatar creation',
    category: 'fun'
  },
  {
    id: 'editor',
    title: 'Image Editor',
    icon: '🎨',
    description: 'Edit and enhance your images',
    category: 'fun'
  }
];

export const professionalGenerationModes: GenerationMode[] = [
  {
    id: 'product-catalog-photoshoot',
    title: 'Product Catalog Photoshoot',
    icon: '📦',
    description: 'Professional product catalog photography',
    category: 'professional'
  },
  {
    id: 'ai-headshots',
    title: 'AI Headshots Generator',
    icon: '👔',
    description: 'Professional headshot generation',
    category: 'professional'
  },
];
