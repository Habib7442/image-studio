'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Search, Sparkles, Shuffle, TrendingUp } from 'lucide-react'
import { 
  AD_TEMPLATES, 
  AD_TEMPLATE_CATEGORIES, 
  getRandomAdTemplate, 
  searchAdTemplates, 
  getTrendingAdTemplates, 
  type AdTemplate 
} from '@/lib/ad-templates'

interface AdTemplateSelectorProps {
  selectedTemplate: AdTemplate | null
  onTemplateSelect: (template: AdTemplate | null) => void
  onSurpriseMe: () => void
}

export function AdTemplateSelector({ 
  selectedTemplate, 
  onTemplateSelect, 
  onSurpriseMe 
}: AdTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isExpanded, setIsExpanded] = useState(false)
  const [showTrending, setShowTrending] = useState(false)

  const trendingTemplates = getTrendingAdTemplates()
  const filteredTemplates = searchQuery 
    ? searchAdTemplates(searchQuery)
    : showTrending
      ? trendingTemplates
      : selectedCategory === 'all' 
        ? AD_TEMPLATES 
        : AD_TEMPLATES.filter(template => template.category === selectedCategory)

  const handleTemplateClick = (template: AdTemplate) => {
    if (selectedTemplate?.id === template.id) {
      onTemplateSelect(null) // Deselect if already selected
    } else {
      onTemplateSelect(template)
    }
  }

  const handleSurpriseMe = () => {
    const randomTemplate = getRandomAdTemplate()
    onTemplateSelect(randomTemplate)
    onSurpriseMe()
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search ad templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter and Trending Toggle */}
        <div className="flex flex-wrap gap-2 items-center">
          <Button
            variant={selectedCategory === 'all' && !showTrending ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedCategory('all')
              setShowTrending(false)
            }}
          >
            All
          </Button>
          
          <Button
            variant={showTrending ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setShowTrending(!showTrending)
              setSelectedCategory('all')
            }}
            className="flex items-center space-x-1"
          >
            <TrendingUp className="w-3 h-3" />
            <span>Trending</span>
          </Button>

          {AD_TEMPLATE_CATEGORIES.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id && !showTrending ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectedCategory(category.id)
                setShowTrending(false)
              }}
            >
              {category.emoji} {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Selected Template Display */}
      {selectedTemplate && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{selectedTemplate.emoji}</span>
                <div>
                  <h4 className="font-semibold">{selectedTemplate.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {selectedTemplate.isTrending && (
                      <Badge variant="secondary" className="text-xs">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {selectedTemplate.difficulty} • ~{selectedTemplate.estimatedTime}s
                    </Badge>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTemplateSelect(null)}
              >
                ✕
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Surprise Me Button */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={handleSurpriseMe}
          className="flex items-center space-x-2"
        >
          <Shuffle className="w-4 h-4" />
          <span>🎲 Surprise Me!</span>
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">
            {showTrending ? '🔥 Trending Ad Styles' : 'Ad Style Templates'}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'Show All'}
          </Button>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-3 ${!isExpanded ? 'max-h-96 overflow-hidden' : ''}`}>
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedTemplate?.id === template.id 
                  ? 'ring-2 ring-primary border-primary' 
                  : 'hover:border-primary/50'
              }`}
              onClick={() => handleTemplateClick(template)}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{template.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-sm">{template.name}</h4>
                      {template.isTrending && (
                        <Badge variant="secondary" className="text-xs">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{template.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {template.difficulty} • ~{template.estimatedTime}s
                      </Badge>
                      {template.popularity && template.popularity >= 90 && (
                        <Badge variant="secondary" className="text-xs">
                          🔥 Popular
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {template.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <div className="flex-shrink-0">
                      <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No ad templates found matching your search.</p>
          </div>
        )}
      </div>

      {/* Trending Pack Info */}
      {showTrending && (
        <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-pink-50 border border-orange-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-1">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-800">Trending Ads Pack</span>
          </div>
          <p className="text-xs text-orange-700">
            These are the hottest ad styles trending on Instagram right now. Updated monthly based on viral content!
          </p>
        </div>
      )}
    </div>
  )
}
