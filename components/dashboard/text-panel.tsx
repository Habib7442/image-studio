'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Palette,
  Move,
  RotateCcw,
  Copy,
  Trash2
} from 'lucide-react'

const fontSizes = [12, 14, 16, 18, 24, 32, 48, 64, 72, 96]
const fontFamilies = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Playfair Display',
  'Merriweather'
]

const textStyles = [
  { name: 'Heading 1', size: 32, weight: 'bold' },
  { name: 'Heading 2', size: 24, weight: 'bold' },
  { name: 'Heading 3', size: 20, weight: 'semibold' },
  { name: 'Body', size: 16, weight: 'normal' },
  { name: 'Caption', size: 14, weight: 'normal' },
  { name: 'Small', size: 12, weight: 'normal' }
]

const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
  '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080',
  '#FFC0CB', '#A52A2A', '#808080', '#000080', '#008000'
]

export function TextPanel() {
  return (
    <div className="p-4 space-y-6">
      {/* Text Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Add Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Type your text here..."
            className="w-full"
          />
          
          <div className="flex gap-2">
            <Button size="sm" className="flex-1">
              Add to Canvas
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Styles */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Quick Styles</h3>
        <div className="space-y-2">
          {textStyles.map((style, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full justify-start h-auto p-3"
            >
              <div className="text-left">
                <div 
                  className="font-medium"
                  style={{ 
                    fontSize: style.size, 
                    fontWeight: style.weight 
                  }}
                >
                  {style.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {style.size}px • {style.weight}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Font Family */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Font Family</h3>
        <div className="grid grid-cols-2 gap-2">
          {fontFamilies.map((font) => (
            <Button
              key={font}
              variant="outline"
              size="sm"
              className="text-xs"
              style={{ fontFamily: font }}
            >
              {font}
            </Button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Font Size</h3>
        <div className="grid grid-cols-5 gap-2">
          {fontSizes.map((size) => (
            <Button
              key={size}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Text Formatting */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Formatting</h3>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Palette className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Alignment</h3>
        <div className="grid grid-cols-4 gap-2">
          <Button variant="outline" size="sm">
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Colors</h3>
        <div className="grid grid-cols-5 gap-2">
          {colors.map((color) => (
            <Button
              key={color}
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              style={{ backgroundColor: color }}
            >
              <span className="sr-only">{color}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Text Actions */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Actions</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm">
            <Move className="h-4 w-4 mr-2" />
            Move
          </Button>
          <Button variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Rotate
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
          <Button variant="outline" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}
