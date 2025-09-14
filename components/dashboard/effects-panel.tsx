'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wind, 
  Sparkles, 
  Camera, 
  Clapperboard, 
  Layers, 
  Image, 
  Layout, 
  Palette, 
  Type,
  Wand2,
  Filter,
  Crop,
  RotateCcw,
  FlipHorizontal,
  FlipVertical
} from 'lucide-react'

// Visual Effects from image-editor reference
const visualEffects = [
  {
    id: "motion-blur",
    title: "Motion Blur",
    description: "Add dynamic motion effects",
    icon: <Wind className="h-5 w-5" />,
    gradient: "from-blue-500 to-purple-500",
    category: "blur"
  },
  {
    id: "optical-effects",
    title: "Optical Effects",
    description: "Chromatic aberration, glitch",
    icon: <Sparkles className="h-5 w-5" />,
    gradient: "from-pink-500 to-orange-500",
    category: "optical"
  },
  {
    id: "cinematic-effects",
    title: "Cinematic Effects",
    description: "Professional color grading",
    icon: <Clapperboard className="h-5 w-5" />,
    gradient: "from-amber-500 to-red-500",
    category: "color"
  },
  {
    id: "text-behind-image",
    title: "Text Behind Image",
    description: "Layered text effects",
    icon: <Type className="h-5 w-5" />,
    gradient: "from-indigo-500 to-purple-500",
    category: "text"
  }
]

// Photo Layouts
const photoLayouts = [
  {
    id: "polaroids",
    title: "Polaroids",
    description: "Vintage polaroid frames",
    icon: <Image className="h-5 w-5" />,
    gradient: "from-pink-500 to-rose-500",
    category: "frame"
  },
  {
    id: "film-strip",
    title: "Film Strip",
    description: "Nostalgic film layouts",
    icon: <Camera className="h-5 w-5" />,
    gradient: "from-green-500 to-teal-500",
    category: "frame"
  }
]

// Photo Tools
const photoTools = [
  {
    id: "collages",
    title: "Collages",
    description: "Multi-image compositions",
    icon: <Layers className="h-5 w-5" />,
    gradient: "from-teal-500 to-blue-500",
    category: "composition"
  }
]

// Basic Tools
const basicTools = [
  {
    id: "crop",
    title: "Crop",
    icon: <Crop className="h-4 w-4" />,
    category: "basic"
  },
  {
    id: "rotate",
    title: "Rotate",
    icon: <RotateCcw className="h-4 w-4" />,
    category: "basic"
  },
  {
    id: "flip-horizontal",
    title: "Flip H",
    icon: <FlipHorizontal className="h-4 w-4" />,
    category: "basic"
  },
  {
    id: "flip-vertical",
    title: "Flip V",
    icon: <FlipVertical className="h-4 w-4" />,
    category: "basic"
  }
]

export function EffectsPanel() {
  return (
    <div className="p-4 space-y-6">
      {/* Basic Tools */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Wand2 className="h-4 w-4" />
          Basic Tools
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {basicTools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              className="h-10 flex items-center gap-2"
            >
              {tool.icon}
              {tool.title}
            </Button>
          ))}
        </div>
      </div>

      {/* Visual Effects */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Visual Effects
        </h3>
        <div className="space-y-2">
          {visualEffects.map((effect) => (
            <Button
              key={effect.id}
              variant="outline"
              size="sm"
              className="w-full h-auto p-3 flex items-start gap-3 text-left"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${effect.gradient} text-white flex-shrink-0`}>
                {effect.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm">{effect.title}</div>
                <div className="text-xs text-muted-foreground break-words">{effect.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Photo Layouts */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Layout className="h-4 w-4" />
          Photo Layouts
        </h3>
        <div className="space-y-2">
          {photoLayouts.map((layout) => (
            <Button
              key={layout.id}
              variant="outline"
              size="sm"
              className="w-full h-auto p-3 flex items-start gap-3 text-left"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${layout.gradient} text-white flex-shrink-0`}>
                {layout.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm">{layout.title}</div>
                <div className="text-xs text-muted-foreground break-words">{layout.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* Photo Tools */}
      <div>
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Photo Tools
        </h3>
        <div className="space-y-2">
          {photoTools.map((tool) => (
            <Button
              key={tool.id}
              variant="outline"
              size="sm"
              className="w-full h-auto p-3 flex items-start gap-3 text-left"
            >
              <div className={`p-2 rounded-lg bg-gradient-to-br ${tool.gradient} text-white flex-shrink-0`}>
                {tool.icon}
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="font-medium text-sm">{tool.title}</div>
                <div className="text-xs text-muted-foreground break-words">{tool.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
