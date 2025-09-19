import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types for the image editor
export interface EditorImage {
  id: string
  src: string
  name: string
  width: number
  height: number
  uploadedAt: string
}

export interface EditorLayer {
  id: string
  name: string
  type: 'image' | 'ai_edit' | 'filter' | 'text' | 'shape'
  visible: boolean
  opacity: number
  blendMode: string
  data: any
  createdAt: string
}

export interface AIEdit {
  id: string
  prompt: string
  strength: number
  model: string
  result: string
  createdAt: string
}

export interface EditorTool {
  id: string
  name: string
  icon: string
  category: 'basic' | 'ai' | 'advanced' | 'effects'
  active: boolean
}

export interface EditorSettings {
  quality: 'fast' | 'standard' | 'pro'
  format: 'jpeg' | 'png' | 'webp'
  resolution: number
  aiStrength: number
  autoEnhance: boolean
}

interface ImageEditorState {
  // Current image
  currentImage: EditorImage | null
  setCurrentImage: (image: EditorImage | null) => void
  
  // Layers
  layers: EditorLayer[]
  activeLayerId: string | null
  addLayer: (layer: Omit<EditorLayer, 'id' | 'createdAt'>) => void
  removeLayer: (layerId: string) => void
  updateLayer: (layerId: string, updates: Partial<EditorLayer>) => void
  setActiveLayer: (layerId: string | null) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  
  // AI Edits
  aiEdits: AIEdit[]
  addAIEdit: (edit: Omit<AIEdit, 'id' | 'createdAt'>) => void
  removeAIEdit: (editId: string) => void
  
  // Tools
  activeTool: string | null
  setActiveTool: (toolId: string | null) => void
  tools: EditorTool[]
  
  // Settings
  settings: EditorSettings
  updateSettings: (updates: Partial<EditorSettings>) => void
  
  // Generation state
  isGenerating: boolean
  setIsGenerating: (generating: boolean) => void
  generationProgress: number
  setGenerationProgress: (progress: number) => void
  
  // History
  history: string[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  saveState: () => void
  
  // UI State
  showLayers: boolean
  setShowLayers: (show: boolean) => void
  showTools: boolean
  setShowTools: (show: boolean) => void
  showSettings: boolean
  setShowSettings: (show: boolean) => void
  
  // Error handling
  error: string | null
  setError: (error: string | null) => void
  
  // Actions
  reset: () => void
  exportImage: (format: string, quality: number) => Promise<string>
  loadImage: (file: File) => Promise<void>
}

const initialState = {
  currentImage: null,
  layers: [],
  activeLayerId: null,
  aiEdits: [],
  activeTool: null,
  tools: [
    // Basic tools
    { id: 'select', name: 'Select', icon: 'cursor', category: 'basic', active: false },
    { id: 'crop', name: 'Crop', icon: 'crop', category: 'basic', active: false },
    { id: 'rotate', name: 'Rotate', icon: 'rotate-cw', category: 'basic', active: false },
    { id: 'flip', name: 'Flip', icon: 'flip-horizontal', category: 'basic', active: false },
    { id: 'resize', name: 'Resize', icon: 'maximize', category: 'basic', active: false },
    
    // AI tools
    { id: 'ai-enhance', name: 'AI Enhance', icon: 'sparkles', category: 'ai', active: false },
    { id: 'ai-remove-bg', name: 'Remove Background', icon: 'scissors', category: 'ai', active: false },
    { id: 'ai-style', name: 'AI Style Transfer', icon: 'palette', category: 'ai', active: false },
    { id: 'ai-upscale', name: 'AI Upscale', icon: 'zoom-in', category: 'ai', active: false },
    { id: 'ai-colorize', name: 'AI Colorize', icon: 'droplets', category: 'ai', active: false },
    { id: 'ai-restore', name: 'AI Restore', icon: 'refresh-cw', category: 'ai', active: false },
    
    // Advanced tools
    { id: 'brush', name: 'Brush', icon: 'paintbrush', category: 'advanced', active: false },
    { id: 'clone', name: 'Clone', icon: 'copy', category: 'advanced', active: false },
    { id: 'heal', name: 'Heal', icon: 'heart', category: 'advanced', active: false },
    { id: 'gradient', name: 'Gradient', icon: 'gradient', category: 'advanced', active: false },
    { id: 'text', name: 'Text', icon: 'type', category: 'advanced', active: false },
    
    // Effects
    { id: 'blur', name: 'Blur', icon: 'blur', category: 'effects', active: false },
    { id: 'sharpen', name: 'Sharpen', icon: 'zap', category: 'effects', active: false },
    { id: 'noise', name: 'Noise Reduction', icon: 'volume-x', category: 'effects', active: false },
    { id: 'vignette', name: 'Vignette', icon: 'circle', category: 'effects', active: false },
  ],
  settings: {
    quality: 'standard',
    format: 'jpeg',
    resolution: 100,
    aiStrength: 0.7,
    autoEnhance: true,
  },
  isGenerating: false,
  generationProgress: 0,
  history: [],
  historyIndex: -1,
  canUndo: false,
  canRedo: false,
  showLayers: true,
  showTools: true,
  showSettings: false,
  error: null,
}

export const useImageEditorStore = create<ImageEditorState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Image actions
        setCurrentImage: (image) => {
          set({ currentImage: image }, false, 'setCurrentImage')
          if (image) {
            get().saveState()
          }
        },
        
        // Layer actions
        addLayer: (layer) => {
          const newLayer: EditorLayer = {
            ...layer,
            id: `layer-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          set((state) => ({
            layers: [...state.layers, newLayer],
            activeLayerId: newLayer.id,
          }), false, 'addLayer')
          get().saveState()
        },
        
        removeLayer: (layerId) => {
          set((state) => ({
            layers: state.layers.filter(layer => layer.id !== layerId),
            activeLayerId: state.activeLayerId === layerId ? null : state.activeLayerId,
          }), false, 'removeLayer')
          get().saveState()
        },
        
        updateLayer: (layerId, updates) => {
          set((state) => ({
            layers: state.layers.map(layer =>
              layer.id === layerId ? { ...layer, ...updates } : layer
            ),
          }), false, 'updateLayer')
          get().saveState()
        },
        
        setActiveLayer: (layerId) => {
          set({ activeLayerId: layerId }, false, 'setActiveLayer')
        },
        
        reorderLayers: (fromIndex, toIndex) => {
          set((state) => {
            const newLayers = [...state.layers]
            const [movedLayer] = newLayers.splice(fromIndex, 1)
            newLayers.splice(toIndex, 0, movedLayer)
            return { layers: newLayers }
          }, false, 'reorderLayers')
          get().saveState()
        },
        
        // AI Edit actions
        addAIEdit: (edit) => {
          const newEdit: AIEdit = {
            ...edit,
            id: `ai-edit-${Date.now()}`,
            createdAt: new Date().toISOString(),
          }
          set((state) => ({
            aiEdits: [...state.aiEdits, newEdit],
          }), false, 'addAIEdit')
          get().saveState()
        },
        
        removeAIEdit: (editId) => {
          set((state) => ({
            aiEdits: state.aiEdits.filter(edit => edit.id !== editId),
          }), false, 'removeAIEdit')
          get().saveState()
        },
        
        // Tool actions
        setActiveTool: (toolId) => {
          set((state) => ({
            activeTool: toolId,
            tools: state.tools.map(tool => ({
              ...tool,
              active: tool.id === toolId
            })),
          }), false, 'setActiveTool')
        },
        
        // Settings actions
        updateSettings: (updates) => {
          set((state) => ({
            settings: { ...state.settings, ...updates },
          }), false, 'updateSettings')
        },
        
        // Generation actions
        setIsGenerating: (generating) => {
          set({ isGenerating: generating }, false, 'setIsGenerating')
        },
        
        setGenerationProgress: (progress) => {
          set({ generationProgress: progress }, false, 'setGenerationProgress')
        },
        
        // History actions
        saveState: () => {
          const state = get()
          const stateSnapshot = JSON.stringify({
            currentImage: state.currentImage,
            layers: state.layers,
            aiEdits: state.aiEdits,
          })
          
          set((prevState) => {
            const newHistory = prevState.history.slice(0, prevState.historyIndex + 1)
            newHistory.push(stateSnapshot)
            
            // Limit history to 50 states
            if (newHistory.length > 50) {
              newHistory.shift()
            }
            
            return {
              history: newHistory,
              historyIndex: newHistory.length - 1,
              canUndo: newHistory.length > 1,
              canRedo: false,
            }
          }, false, 'saveState')
        },
        
        undo: () => {
          const state = get()
          if (state.canUndo && state.historyIndex > 0) {
            const newIndex = state.historyIndex - 1
            const stateSnapshot = JSON.parse(state.history[newIndex])
            
            set({
              currentImage: stateSnapshot.currentImage,
              layers: stateSnapshot.layers,
              aiEdits: stateSnapshot.aiEdits,
              historyIndex: newIndex,
              canUndo: newIndex > 0,
              canRedo: true,
            }, false, 'undo')
          }
        },
        
        redo: () => {
          const state = get()
          if (state.canRedo && state.historyIndex < state.history.length - 1) {
            const newIndex = state.historyIndex + 1
            const stateSnapshot = JSON.parse(state.history[newIndex])
            
            set({
              currentImage: stateSnapshot.currentImage,
              layers: stateSnapshot.layers,
              aiEdits: stateSnapshot.aiEdits,
              historyIndex: newIndex,
              canUndo: true,
              canRedo: newIndex < state.history.length - 1,
            }, false, 'redo')
          }
        },
        
        // UI actions
        setShowLayers: (show) => set({ showLayers: show }, false, 'setShowLayers'),
        setShowTools: (show) => set({ showTools: show }, false, 'setShowTools'),
        setShowSettings: (show) => set({ showSettings: show }, false, 'setShowSettings'),
        
        // Error actions
        setError: (error) => set({ error }, false, 'setError'),
        
        // Utility actions
        reset: () => {
          set(initialState, false, 'reset')
        },
        
        exportImage: async (format: string, quality: number) => {
          // This will be implemented with canvas API
          return ''
        },
        
        loadImage: async (file: File) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => {
              const img = new Image()
              img.onload = () => {
                const editorImage: EditorImage = {
                  id: `img-${Date.now()}`,
                  src: e.target?.result as string,
                  name: file.name,
                  width: img.width,
                  height: img.height,
                  uploadedAt: new Date().toISOString(),
                }
                get().setCurrentImage(editorImage)
                resolve()
              }
              img.onerror = reject
              img.src = e.target?.result as string
            }
            reader.onerror = reject
            reader.readAsDataURL(file)
          })
        },
      }),
      {
        name: 'image-editor-storage',
        partialize: (state) => ({
          settings: state.settings,
          tools: state.tools,
          showLayers: state.showLayers,
          showTools: state.showTools,
          showSettings: state.showSettings,
        }),
        version: 1,
      }
    ),
    {
      name: 'image-editor-store',
    }
  )
)
