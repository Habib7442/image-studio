'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X } from 'lucide-react'
import { 
  getTrendingTemplates, 
  type StyleTemplate 
} from '@/lib/style-templates'
import { 
  getTrendingFilters,
  type FilterEffect 
} from '@/lib/filter-effects'
import { TemplateGrid } from './template-grid'
import { FilterGrid } from './filter-grid'

interface StyleSelectionProps {
  onStyleChange: (prompt: string, template?: StyleTemplate, filters?: FilterEffect[]) => void
  className?: string
  showCustom?: boolean
}

export function StyleSelection({ onStyleChange, className, showCustom = false }: StyleSelectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StyleTemplate | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<FilterEffect[]>([])
  const [activeTab, setActiveTab] = useState<'templates' | 'filters' | 'custom'>('templates')
  const [customPrompt, setCustomPrompt] = useState('')

  // Get trending templates and filters
  const trendingTemplates = getTrendingTemplates().slice(0, 6)
  const trendingFilters = getTrendingFilters().slice(0, 8)

  const handleTemplateSelect = useCallback((template: StyleTemplate) => {
    setSelectedTemplate(template)
    setCustomPrompt('')
    generateFinalPrompt(template, selectedFilters, '')
  }, [selectedFilters])

  const handleFilterToggle = useCallback((filter: FilterEffect) => {
    const newFilters = selectedFilters.some(f => f.id === filter.id)
      ? selectedFilters.filter(f => f.id !== filter.id)
      : [...selectedFilters, filter]
    
    setSelectedFilters(newFilters)
    generateFinalPrompt(selectedTemplate, newFilters, customPrompt)
  }, [selectedTemplate, customPrompt])

  const handleCustomPromptChange = useCallback((value: string) => {
    setCustomPrompt(value)
    setSelectedTemplate(null)
    generateFinalPrompt(null, selectedFilters, value)
  }, [selectedFilters])

  const generateFinalPrompt = (template: StyleTemplate | null, filters: FilterEffect[], custom: string) => {
    let finalPrompt = ''

    // Start with custom prompt if provided
    if (custom.trim()) {
      finalPrompt = custom.trim()
    } else if (template) {
      // Use template prompt if no custom prompt
      finalPrompt = template.prompt
    }

    // Add filter effects to prompt
    if (filters.length > 0) {
      const filterDescriptions = filters.map(filter => 
        `${filter.name}: ${filter.description}`
      ).join(', ')
      
      if (finalPrompt) {
        finalPrompt += ` Apply these effects: ${filterDescriptions}.`
      } else {
        finalPrompt = `Apply these effects: ${filterDescriptions}.`
      }
    }

    onStyleChange(finalPrompt, template, filters)
  }


  // Check if any option is selected
  const hasAnySelection = selectedTemplate || selectedFilters.length > 0 || customPrompt.trim()

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Style Selection Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Choose Your Style</h3>
        <div className={`grid gap-3 ${showCustom ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeTab === 'templates' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">🎨</div>
              <div className="text-sm font-medium">Templates</div>
              <div className="text-xs text-muted-foreground mt-1">Pre-made styles</div>
            </CardContent>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              activeTab === 'filters' 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => setActiveTab('filters')}
          >
            <CardContent className="p-4 text-center">
              <div className="text-2xl mb-2">✨</div>
              <div className="text-sm font-medium">Filters</div>
              <div className="text-xs text-muted-foreground mt-1">Visual effects</div>
            </CardContent>
          </Card>

          {showCustom && (
            <Card 
              className={`cursor-pointer transition-all hover:shadow-md ${
                activeTab === 'custom' 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab('custom')}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">✏️</div>
                <div className="text-sm font-medium">Custom</div>
                <div className="text-xs text-muted-foreground mt-1">Describe your vision</div>
              </CardContent>
            </Card>
          )}
          
        </div>
      </div>

      {/* Templates Tab */}
      {activeTab === 'templates' && (
        <TemplateGrid
          templates={trendingTemplates}
          selectedTemplate={selectedTemplate}
          onTemplateSelect={handleTemplateSelect}
        />
      )}

      {/* Filters Tab */}
      {activeTab === 'filters' && (
        <FilterGrid
          filters={trendingFilters}
          selectedFilters={selectedFilters}
          onFilterToggle={handleFilterToggle}
        />
      )}

      {/* Custom Tab */}
      {showCustom && activeTab === 'custom' && (
        <div className="space-y-4">
          <div className="text-center text-sm text-muted-foreground mb-4">
            Describe your vision in your own words
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="custom-prompt" className="text-sm font-medium">
                Describe Your Style
              </Label>
              <Textarea
                id="custom-prompt"
                placeholder="e.g., Transform me into a cyberpunk character with neon lights and futuristic clothing, dramatic lighting, high contrast..."
                value={customPrompt}
                onChange={(e) => handleCustomPromptChange(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Be specific about the style, setting, lighting, and mood you want for your selfie.
            </div>
          </div>
        </div>
      )}

      {/* Selected Items Preview */}
      {hasAnySelection && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Selected Style</h4>
          <div className="space-y-2">
            {customPrompt && (
              <div className="flex items-start gap-2">
                <span className="text-lg">✏️</span>
                <div className="flex-1">
                  <span className="text-sm font-medium">Custom:</span>
                  <div className="text-sm text-muted-foreground mt-1">{customPrompt}</div>
                </div>
                <button
                  onClick={() => handleCustomPromptChange('')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{selectedTemplate.emoji}</span>
                <span className="text-sm">{selectedTemplate.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedTemplate.difficulty})
                </span>
              </div>
            )}
            {selectedFilters.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Filters:</span>
                {selectedFilters.map((filter) => (
                  <span
                    key={filter.id}
                    className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs"
                  >
                    {filter.emoji} {filter.name}
                    <button
                      onClick={() => handleFilterToggle(filter)}
                      className="text-primary/60 hover:text-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Status */}
      {!hasAnySelection && (
        <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-orange-500 text-lg">💡</span>
            <div>
              <h4 className="text-orange-700 dark:text-orange-300 font-medium text-sm">Choose Your Style</h4>
              <p className="text-orange-600 dark:text-orange-400 text-xs mt-1">
                Select a template or add filters to enable generation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
