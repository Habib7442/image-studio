'use client'

import { Card, CardContent } from '@/components/ui/card'
import { type StyleTemplate } from '@/lib/style-templates'

interface TemplateGridProps {
  templates: StyleTemplate[]
  selectedTemplate: StyleTemplate | null
  onTemplateSelect: (template: StyleTemplate) => void
}

export function TemplateGrid({ 
  templates, 
  selectedTemplate, 
  onTemplateSelect
}: TemplateGridProps) {
  return (
    <div className="space-y-4">
      {/* Trending Templates */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          🔥 Trending Now
          <span className="text-xs text-muted-foreground">(Quick Style)</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedTemplate?.id === template.id
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:border-primary'
              }`}
              onClick={() => onTemplateSelect(template)}
            >
              <CardContent className="p-3 text-center">
                <div className="text-2xl mb-1">{template.emoji}</div>
                <div className="text-xs font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.difficulty} • ~{template.estimatedTime}s
                </div>
                {template.isTrending && (
                  <div className="text-xs text-orange-500 mt-1">🔥</div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
