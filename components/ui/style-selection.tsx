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
}

export function StyleSelection({ onStyleChange, className }: StyleSelectionProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<StyleTemplate | null>(null)
  const [selectedFilters, setSelectedFilters] = useState<FilterEffect[]>([])
  const [customPrompt, setCustomPrompt] = useState('')
  const [activeTab, setActiveTab] = useState<'templates' | 'filters' | 'custom'>('templates')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Get trending templates and filters
  const trendingTemplates = getTrendingTemplates().slice(0, 6)
  const trendingFilters = getTrendingFilters().slice(0, 8)

  const handleTemplateSelect = useCallback((template: StyleTemplate) => {
    setSelectedTemplate(template)
    generateFinalPrompt(template, selectedFilters, customPrompt)
  }, [selectedFilters, customPrompt])

  const handleFilterToggle = useCallback((filter: FilterEffect) => {
    const newFilters = selectedFilters.some(f => f.id === filter.id)
      ? selectedFilters.filter(f => f.id !== filter.id)
      : [...selectedFilters, filter]
    
    setSelectedFilters(newFilters)
    generateFinalPrompt(selectedTemplate, newFilters, customPrompt)
  }, [selectedTemplate, customPrompt])

  const handleCustomPromptChange = useCallback((value: string) => {
    setCustomPrompt(value)
    generateFinalPrompt(selectedTemplate, selectedFilters, value)
  }, [selectedTemplate, selectedFilters])

  const generateFinalPrompt = (template: StyleTemplate | null, filters: FilterEffect[], custom: string) => {
    let finalPrompt = ''

    // Start with template prompt if selected
    if (template) {
      finalPrompt = template.prompt
    }

    // Add custom text if provided
    if (custom.trim()) {
      if (finalPrompt) {
        finalPrompt += ` ${custom.trim()}`
      } else {
        finalPrompt = custom.trim()
      }
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
  const hasAnySelection = selectedTemplate || selectedFilters.length > 0 || customPrompt.trim().length > 0

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Style Selection Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Choose Your Style</h3>
        <div className="grid grid-cols-3 gap-3">
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
              <div className="text-xs text-muted-foreground mt-1">Write your own</div>
            </CardContent>
          </Card>
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
      {activeTab === 'custom' && (
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium mb-2">
              Describe Your Vision <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Textarea
              value={customPrompt}
              onChange={(e) => handleCustomPromptChange(e.target.value)}
              placeholder="e.g., Professional headshot in a modern office, wearing a blue suit, natural lighting..."
              className="w-full h-24 p-3 border border-input rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
              maxLength={1000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {customPrompt.length}/1000 characters
              </span>
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-primary hover:text-primary/80"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
            </div>
          </div>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="bg-muted rounded-lg p-4 space-y-4">
              <h4 className="text-sm font-medium">Advanced Options</h4>
              
              {/* Template Selection */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Base Template (Optional)
                </Label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={(e) => {
                    const template = trendingTemplates.find(t => t.id === e.target.value)
                    setSelectedTemplate(template || null)
                    generateFinalPrompt(template || null, selectedFilters, customPrompt)
                  }}
                  className="w-full p-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No template (Custom only)</option>
                  {trendingTemplates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.emoji} {template.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filter Selection */}
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Additional Filters (Optional)
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {trendingFilters.slice(0, 6).map((filter) => (
                    <label key={filter.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={selectedFilters.some(f => f.id === filter.id)}
                        onChange={() => handleFilterToggle(filter)}
                        className="rounded border-input"
                      />
                      <span>{filter.emoji} {filter.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected Items Preview */}
      {hasAnySelection && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-medium mb-2">Selected Style</h4>
          <div className="space-y-2">
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
            {customPrompt.trim() && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Custom Text:</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                  &ldquo;{customPrompt.trim().substring(0, 50)}{customPrompt.trim().length > 50 ? '...' : ''}&rdquo;
                </span>
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
                Select a template, add filters, or write custom text to enable generation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
