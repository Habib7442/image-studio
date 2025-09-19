'use client'

import { useRef, useEffect, useState } from 'react'
import { useImageEditorStore } from '@/store/image-editor-store'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  FlipHorizontal, 
  FlipVertical,
  Crop,
  Move,
  Paintbrush,
  Eraser,
  Undo,
  Redo
} from 'lucide-react'

interface CanvasEditorProps {
  image: string
  onImageChange: (newImage: string) => void
}

export function CanvasEditor({ image, onImageChange }: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [flipHorizontal, setFlipHorizontal] = useState(false)
  const [flipVertical, setFlipVertical] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(10)
  const [brushColor, setBrushColor] = useState('#000000')
  const [canvasTool, setCanvasTool] = useState<'move' | 'brush' | 'eraser' | 'crop'>('move')

  const {
    currentImage,
    activeTool: storeActiveTool,
    setActiveTool: setStoreActiveTool,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState
  } = useImageEditorStore()

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // Set canvas size based on image
      canvas.width = img.width
      canvas.height = img.height
      
      // Apply transformations
      ctx.save()
      
      // Apply rotation
      if (rotation !== 0) {
        ctx.translate(canvas.width / 2, canvas.height / 2)
        ctx.rotate((rotation * Math.PI) / 180)
        ctx.translate(-canvas.width / 2, -canvas.height / 2)
      }
      
      // Apply flip
      if (flipHorizontal || flipVertical) {
        ctx.scale(
          flipHorizontal ? -1 : 1,
          flipVertical ? -1 : 1
        )
        if (flipHorizontal) ctx.translate(-canvas.width, 0)
        if (flipVertical) ctx.translate(0, -canvas.height)
      }
      
      // Draw image
      ctx.drawImage(img, 0, 0)
      ctx.restore()
    }
    img.src = image
  }, [image, rotation, flipHorizontal, flipVertical])

  // Handle canvas drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (canvasTool === 'brush' || canvasTool === 'eraser') {
      setIsDrawing(true)
      draw(e)
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isDrawing && (canvasTool === 'brush' || canvasTool === 'eraser')) {
      draw(e)
    }
  }

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false)
      saveState()
    }
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) * (canvas.width / rect.width)
    const y = (e.clientY - rect.top) * (canvas.height / rect.height)

    ctx.beginPath()
    ctx.arc(x, y, brushSize / 2, 0, 2 * Math.PI)
    
    if (canvasTool === 'brush') {
      ctx.fillStyle = brushColor
      ctx.fill()
    } else if (canvasTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fill()
      ctx.globalCompositeOperation = 'source-over'
    }
  }

  // Apply transformations
  const applyTransformations = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const dataURL = canvas.toDataURL('image/jpeg', 0.9)
    onImageChange(dataURL)
  }

  // Handle rotation
  const handleRotate = (degrees: number) => {
    setRotation(prev => (prev + degrees) % 360)
    setTimeout(applyTransformations, 100)
  }

  // Handle flip
  const handleFlip = (direction: 'horizontal' | 'vertical') => {
    if (direction === 'horizontal') {
      setFlipHorizontal(prev => !prev)
    } else {
      setFlipVertical(prev => !prev)
    }
    setTimeout(applyTransformations, 100)
  }

  // Handle crop
  const handleCrop = () => {
    // This would implement crop functionality
    // For now, just apply current transformations
    applyTransformations()
  }

  // Handle zoom
  const handleZoom = (newZoom: number) => {
    setZoom(newZoom)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.style.transform = `scale(${newZoom})`
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-4 border rounded-lg bg-muted/50">
        {/* Basic Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant={canvasTool === 'move' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCanvasTool('move')}
          >
            <Move className="w-4 h-4" />
          </Button>
          <Button
            variant={canvasTool === 'brush' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCanvasTool('brush')}
          >
            <Paintbrush className="w-4 h-4" />
          </Button>
          <Button
            variant={canvasTool === 'eraser' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCanvasTool('eraser')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            variant={canvasTool === 'crop' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCanvasTool('crop')}
          >
            <Crop className="w-4 h-4" />
          </Button>
        </div>

        {/* Transform Tools */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleRotate(90)}
          >
            <RotateCw className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFlip('horizontal')}
          >
            <FlipHorizontal className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleFlip('vertical')}
          >
            <FlipVertical className="w-4 h-4" />
          </Button>
        </div>

        {/* History */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
          >
            <Undo className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
          >
            <Redo className="w-4 h-4" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(Math.max(0.1, zoom - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm font-medium min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(Math.min(5, zoom + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Brush Settings */}
      {(canvasTool === 'brush' || canvasTool === 'eraser') && (
        <div className="p-4 border rounded-lg bg-muted/50">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Brush Size: {brushSize}px</label>
              <Slider
                value={[brushSize]}
                onValueChange={([value]) => setBrushSize(value)}
                max={50}
                min={1}
                step={1}
                className="mt-2"
              />
            </div>
            {canvasTool === 'brush' && (
              <div>
                <label className="text-sm font-medium">Brush Color</label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={brushColor}
                    onChange={(e) => setBrushColor(e.target.value)}
                    className="w-8 h-8 rounded border"
                  />
                  <span className="text-sm text-muted-foreground">{brushColor}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Canvas */}
      <div className="border rounded-lg overflow-hidden bg-muted/20">
        <div className="overflow-auto max-h-96">
          <canvas
            ref={canvasRef}
            className="cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          />
        </div>
      </div>

      {/* Apply Button */}
      <div className="flex justify-end">
        <Button onClick={applyTransformations}>
          Apply Changes
        </Button>
      </div>
    </div>
  )
}
