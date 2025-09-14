'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Square, 
  Circle, 
  Triangle, 
  Hexagon, 
  Star, 
  Heart,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Minus,
  Zap,
  Sun,
  Moon,
  Cloud,
  Image as ImageIcon,
  Video,
  Music,
  FileText
} from 'lucide-react'

const shapes = [
  { name: 'Rectangle', icon: <Square className="h-5 w-5" />, id: 'rectangle' },
  { name: 'Circle', icon: <Circle className="h-5 w-5" />, id: 'circle' },
  { name: 'Triangle', icon: <Triangle className="h-5 w-5" />, id: 'triangle' },
  { name: 'Hexagon', icon: <Hexagon className="h-5 w-5" />, id: 'hexagon' },
  { name: 'Star', icon: <Star className="h-5 w-5" />, id: 'star' },
  { name: 'Heart', icon: <Heart className="h-5 w-5" />, id: 'heart' }
]

const arrows = [
  { name: 'Right Arrow', icon: <ArrowRight className="h-5 w-5" />, id: 'arrow-right' },
  { name: 'Left Arrow', icon: <ArrowLeft className="h-5 w-5" />, id: 'arrow-left' },
  { name: 'Up Arrow', icon: <ArrowUp className="h-5 w-5" />, id: 'arrow-up' },
  { name: 'Down Arrow', icon: <ArrowDown className="h-5 w-5" />, id: 'arrow-down' }
]

const lines = [
  { name: 'Straight Line', icon: <Minus className="h-5 w-5" />, id: 'line' },
  { name: 'Curved Line', icon: <Minus className="h-5 w-5" />, id: 'curve' }
]

const icons = [
  { name: 'Lightning', icon: <Zap className="h-5 w-5" />, id: 'lightning' },
  { name: 'Sun', icon: <Sun className="h-5 w-5" />, id: 'sun' },
  { name: 'Moon', icon: <Moon className="h-5 w-5" />, id: 'moon' },
  { name: 'Cloud', icon: <Cloud className="h-5 w-5" />, id: 'cloud' }
]

const media = [
  { name: 'Image', icon: <ImageIcon className="h-5 w-5" />, id: 'image' },
  { name: 'Video', icon: <Video className="h-5 w-5" />, id: 'video' },
  { name: 'Audio', icon: <Music className="h-5 w-5" />, id: 'audio' },
  { name: 'Document', icon: <FileText className="h-5 w-5" />, id: 'document' }
]

export function ElementsPanel() {
  return (
    <div className="p-4 space-y-6">
      {/* Shapes */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Shapes</h3>
        <div className="grid grid-cols-3 gap-2">
          {shapes.map((shape) => (
            <Button
              key={shape.id}
              variant="outline"
              size="sm"
              className="h-12 flex flex-col items-center gap-1"
            >
              {shape.icon}
              <span className="text-xs">{shape.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Arrows</h3>
        <div className="grid grid-cols-2 gap-2">
          {arrows.map((arrow) => (
            <Button
              key={arrow.id}
              variant="outline"
              size="sm"
              className="h-10 flex items-center gap-2"
            >
              {arrow.icon}
              <span className="text-xs">{arrow.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Lines */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Lines</h3>
        <div className="grid grid-cols-2 gap-2">
          {lines.map((line) => (
            <Button
              key={line.id}
              variant="outline"
              size="sm"
              className="h-10 flex items-center gap-2"
            >
              {line.icon}
              <span className="text-xs">{line.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Icons */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Icons</h3>
        <div className="grid grid-cols-2 gap-2">
          {icons.map((icon) => (
            <Button
              key={icon.id}
              variant="outline"
              size="sm"
              className="h-10 flex items-center gap-2"
            >
              {icon.icon}
              <span className="text-xs">{icon.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Media */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Media</h3>
        <div className="grid grid-cols-2 gap-2">
          {media.map((item) => (
            <Button
              key={item.id}
              variant="outline"
              size="sm"
              className="h-10 flex items-center gap-2"
            >
              {item.icon}
              <span className="text-xs">{item.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Add</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full">
            <Square className="h-4 w-4 mr-2" />
            Add Rectangle
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Circle className="h-4 w-4 mr-2" />
            Add Circle
          </Button>
          <Button variant="outline" size="sm" className="w-full">
            <Minus className="h-4 w-4 mr-2" />
            Add Line
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
