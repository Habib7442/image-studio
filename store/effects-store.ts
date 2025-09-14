import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { createJSONStorage } from 'zustand/middleware'
import { EffectConfig, ProcessingOptions } from '@/lib/effects'

export interface AppliedEffect {
  id: string
  effectId: string
  name: string
  options: ProcessingOptions
  timestamp: number
}

export interface ProcessedImage {
  originalImage: string
  processedImage: string
  appliedEffects: AppliedEffect[]
  imageId: string
}

interface EffectsState {
  // Current processing state
  isProcessing: boolean
  processingProgress: number
  currentImageId: string | null

  // Images and effects
  processedImages: ProcessedImage[]
  effectHistory: AppliedEffect[]

  // UI state
  selectedEffect: EffectConfig | null
  selectedImageId: string | null
  showEffectsPanel: boolean

  // Actions
  setIsProcessing: (processing: boolean) => void
  setProcessingProgress: (progress: number) => void
  setCurrentImageId: (imageId: string | null) => void
  setSelectedEffect: (effect: EffectConfig | null) => void
  setSelectedImageId: (imageId: string | null) => void
  setShowEffectsPanel: (show: boolean) => void

  // Image management
  addProcessedImage: (image: ProcessedImage) => void
  updateProcessedImage: (imageId: string, updates: Partial<ProcessedImage>) => void
  removeProcessedImage: (imageId: string) => void
  getProcessedImage: (imageId: string) => ProcessedImage | undefined

  // Effect management
  addEffectToImage: (imageId: string, effect: AppliedEffect) => void
  removeEffectFromImage: (imageId: string, effectId: string) => void
  updateEffectOptions: (imageId: string, effectId: string, options: ProcessingOptions) => void

  // History management
  addToHistory: (effect: AppliedEffect) => void
  clearHistory: () => void
  undoLastEffect: (imageId: string) => void

  // Reset
  reset: () => void
}

const initialState = {
  isProcessing: false,
  processingProgress: 0,
  currentImageId: null,
  processedImages: [],
  effectHistory: [],
  selectedEffect: null,
  selectedImageId: null,
  showEffectsPanel: false,
}

export const useEffectsStore = create<EffectsState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      // Processing state
      setIsProcessing: (processing) => 
        set({ isProcessing: processing }, false, 'setIsProcessing'),
      
      setProcessingProgress: (progress) => 
        set({ processingProgress: Math.max(0, Math.min(100, progress)) }, false, 'setProcessingProgress'),
      
      setCurrentImageId: (imageId) => 
        set({ currentImageId: imageId }, false, 'setCurrentImageId'),

      // UI state
      setSelectedEffect: (effect) => 
        set({ selectedEffect: effect }, false, 'setSelectedEffect'),
      
      setSelectedImageId: (imageId) => 
        set({ selectedImageId: imageId }, false, 'setSelectedImageId'),
      
      setShowEffectsPanel: (show) => 
        set({ showEffectsPanel: show }, false, 'setShowEffectsPanel'),

      // Image management
      addProcessedImage: (image) => 
        set((state) => ({
          processedImages: [...state.processedImages, image]
        }), false, 'addProcessedImage'),

      updateProcessedImage: (imageId, updates) =>
        set((state) => ({
          processedImages: state.processedImages.map(img =>
            img.imageId === imageId ? { ...img, ...updates } : img
          )
        }), false, 'updateProcessedImage'),

      removeProcessedImage: (imageId) =>
        set((state) => ({
          processedImages: state.processedImages.filter(img => img.imageId !== imageId)
        }), false, 'removeProcessedImage'),

      getProcessedImage: (imageId) => {
        const state = get()
        return state.processedImages.find(img => img.imageId === imageId)
      },

      // Effect management
      addEffectToImage: (imageId, effect) =>
        set((state) => ({
          processedImages: state.processedImages.map(img =>
            img.imageId === imageId
              ? { ...img, appliedEffects: [...img.appliedEffects, effect] }
              : img
          ),
          effectHistory: [...state.effectHistory, effect]
        }), false, 'addEffectToImage'),

      removeEffectFromImage: (imageId, effectId) =>
        set((state) => ({
          processedImages: state.processedImages.map(img =>
            img.imageId === imageId
              ? { ...img, appliedEffects: img.appliedEffects.filter(eff => eff.id !== effectId) }
              : img
          )
        }), false, 'removeEffectFromImage'),

      updateEffectOptions: (imageId, effectId, options) =>
        set((state) => ({
          processedImages: state.processedImages.map(img =>
            img.imageId === imageId
              ? {
                  ...img,
                  appliedEffects: img.appliedEffects.map(eff =>
                    eff.id === effectId ? { ...eff, options } : eff
                  )
                }
              : img
          )
        }), false, 'updateEffectOptions'),

      // History management
      addToHistory: (effect) =>
        set((state) => ({
          effectHistory: [...state.effectHistory, effect]
        }), false, 'addToHistory'),

      clearHistory: () =>
        set({ effectHistory: [] }, false, 'clearHistory'),

      undoLastEffect: (imageId) => {
        const state = get()
        const image = state.processedImages.find(img => img.imageId === imageId)
        if (image && image.appliedEffects.length > 0) {
          const lastEffect = image.appliedEffects[image.appliedEffects.length - 1]
          set((state) => ({
            processedImages: state.processedImages.map(img =>
              img.imageId === imageId
                ? { ...img, appliedEffects: img.appliedEffects.slice(0, -1) }
                : img
            )
          }), false, 'undoLastEffect')
        }
      },

      // Reset
      reset: () => set(() => ({ ...initialState }), false, 'reset'),
    }),
    {
      name: 'effects-store',
      storage: createJSONStorage(() => sessionStorage), // Use sessionStorage for persistence
    }
  )
)
