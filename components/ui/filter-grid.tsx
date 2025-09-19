'use client'

import { Card, CardContent } from '@/components/ui/card'
import { type FilterEffect } from '@/lib/filter-effects'

interface FilterGridProps {
  filters: FilterEffect[]
  selectedFilters: FilterEffect[]
  onFilterToggle: (filter: FilterEffect) => void
}

export function FilterGrid({ filters, selectedFilters, onFilterToggle }: FilterGridProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-3">Add Filters</h3>
      <div className="grid grid-cols-4 gap-2">
        {filters.map((filter) => (
          <Card
            key={filter.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedFilters.some(f => f.id === filter.id)
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:border-primary'
            }`}
            onClick={() => onFilterToggle(filter)}
          >
            <CardContent className="p-2 text-center">
              <div className="text-lg mb-1">{filter.emoji}</div>
              <div className="text-xs font-medium">{filter.name}</div>
              <div className="text-xs text-muted-foreground">
                {filter.intensity}%
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
