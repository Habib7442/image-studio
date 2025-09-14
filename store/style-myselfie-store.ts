import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { StyleTemplate } from '@/lib/style-templates'

interface GeneratedImage {
  id: string
  url: string
  storage_path: string
}

interface GenerationResult {
  images: GeneratedImage[] // Now contains image objects with URLs
  creditsLeft: number
  generationTime: number
  uploadTime?: number
  metadata: {
    style: string
    timestamp: string
    totalImages?: number
  }
}

interface StyleMySelfieState {
  // Image state
  selectedImage: string | null
  setSelectedImage: (image: string | null) => void
  
  // Template state
  selectedTemplate: StyleTemplate | null
  setSelectedTemplate: (template: StyleTemplate | null) => void
  
  // Category filtering
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  
  // Custom prompt
  customPrompt: string
  setCustomPrompt: (prompt: string) => void
  
  // Generation state
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  
  // Progress state
  generationProgress: number
  setGenerationProgress: (progress: number) => void
  
  // Results
  result: GenerationResult | null
  setResult: (result: GenerationResult | null) => void
  
  // Error handling
  error: string | null
  setError: (error: string | null) => void
  
  // File size alert
  showSizeAlert: boolean
  setShowSizeAlert: (show: boolean) => void
  
  // Actions
  reset: () => void
  handleTemplateSelect: (template: StyleTemplate | null) => void
  handleSurpriseMe: (templates: StyleTemplate[]) => void
  getEffectivePrompt: () => string
  canGenerate: () => boolean
}

const initialState = {
  selectedImage: null,
  selectedTemplate: null,
  selectedCategory: 'all',
  customPrompt: '',
  isGenerating: false,
  generationProgress: 0,
  result: null,
  error: null,
  showSizeAlert: false,
}

export const useStyleMySelfieStore = create<StyleMySelfieState>()(
  devtools(
    persist(
      (set, get) => ({
      ...initialState,
      
      // Image actions
      setSelectedImage: (image) => set({ selectedImage: image }, false, 'setSelectedImage'),
      
      // Template actions
      setSelectedTemplate: (template) => set({ selectedTemplate: template }, false, 'setSelectedTemplate'),
      
      // Category actions
      setSelectedCategory: (category) => set({ selectedCategory: category }, false, 'setSelectedCategory'),
      
      // Custom prompt actions
      setCustomPrompt: (prompt) => set({ customPrompt: prompt }, false, 'setCustomPrompt'),
      
      // Generation actions
      setIsGenerating: (generating) => set({ isGenerating: generating }, false, 'setIsGenerating'),
      
      // Progress actions
      setGenerationProgress: (progress) => set({ generationProgress: progress }, false, 'setGenerationProgress'),
      
      // Result actions
      setResult: (result) => set({ result }, false, 'setResult'),
      
      // Error actions
      setError: (error) => set({ error }, false, 'setError'),
      
      // Alert actions
      setShowSizeAlert: (show) => set({ showSizeAlert: show }, false, 'setShowSizeAlert'),
      
      // Complex actions
      reset: () => set(() => ({ ...initialState }), false, 'reset'),
      
      handleTemplateSelect: (template) => {
        set({ 
          selectedTemplate: template,
          customPrompt: '', // Clear custom prompt when selecting template
          error: null 
        }, false, 'handleTemplateSelect')
      },
      
      handleSurpriseMe: (templates) => {
        if (!templates || templates.length === 0) {
          set({ selectedTemplate: null, error: 'No templates available' }, false, 'handleSurpriseMe:empty')
          return
        }
        const idx = Math.floor(Math.random() * templates.length)
        const randomTemplate = templates[idx]
        set({
          selectedTemplate: randomTemplate,
          customPrompt: '',
          error: null
        }, false, 'handleSurpriseMe')
      },
      
      getEffectivePrompt: () => {
        const state = get()
        if (state.selectedTemplate) {
          return state.selectedTemplate.prompt
        }
        return state.customPrompt.trim()
      },
      
      canGenerate: () => {
        const state = get()
        return !!(state.selectedImage && (state.selectedTemplate || state.customPrompt.trim()))
      }
      }),
      {
        name: 'style-myselfie-storage',
        partialize: (state) => ({
          selectedTemplate: state.selectedTemplate,
          selectedCategory: state.selectedCategory,
          customPrompt: state.customPrompt,
        }),
        version: 1,
        migrate: (persistedState, version) => {
          // No migrations yet - version parameter reserved for future use
          console.log(`Migrating from version ${version} to version 1`)
          return persistedState as StyleMySelfieState
        },
      }
    ),
    {
      name: 'style-myselfie-store',
    }
  )
)
