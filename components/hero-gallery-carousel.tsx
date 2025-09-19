'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Star, Heart } from 'lucide-react'

// Landing assets data
const landingAssets = [
  { src: '/landing-assets/1.jpg', alt: 'AI Generated Portrait 1', category: 'Portrait' },
  { src: '/landing-assets/2.jpg', alt: 'AI Generated Portrait 2', category: 'Portrait' },
  { src: '/landing-assets/3.jpg', alt: 'AI Generated Portrait 3', category: 'Portrait' },
  { src: '/landing-assets/4.jpg', alt: 'AI Generated Portrait 4', category: 'Portrait' },
  { src: '/landing-assets/5.jpg', alt: 'AI Generated Portrait 5', category: 'Portrait' },
  { src: '/landing-assets/6.jpg', alt: 'AI Generated Portrait 6', category: 'Portrait' },
  { src: '/landing-assets/7.jpg', alt: 'AI Generated Portrait 7', category: 'Portrait' },
  { src: '/landing-assets/8.jpg', alt: 'AI Generated Portrait 8', category: 'Portrait' },
  { src: '/landing-assets/9.jpg', alt: 'AI Generated Portrait 9', category: 'Portrait' },
  { src: '/landing-assets/10.jpg', alt: 'AI Generated Portrait 10', category: 'Portrait' },
]

export function HeroGalleryCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % landingAssets.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Gallery Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="outline" className="text-sm">
            <Sparkles className="w-3 h-3 mr-1" />
            AI Gallery
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Star className="w-3 h-3 mr-1" />
            Trending Now
          </Badge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          See What&apos;s Possible
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base">
          Real examples of AI-generated images created with ImageStudioLab
        </p>
      </div>

      {/* Carousel */}
      <div className="relative">
        <Carousel
          className="w-full"
          opts={{
            align: "start",
            loop: true,
          }}
          setApi={(api) => {
            if (api) {
              api.on('select', () => {
                setCurrentIndex(api.selectedScrollSnap())
              })
            }
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {landingAssets.map((asset, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="group relative overflow-hidden rounded-2xl bg-muted/50 p-2">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                    <Image
                      src={asset.src}
                      alt={asset.alt}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      priority={index < 4} // Prioritize first 4 images
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    
                    {/* Category badge */}
                    <div className="absolute top-3 left-3">
                      <Badge variant="secondary" className="text-xs bg-black/50 text-white border-0">
                        {asset.category}
                      </Badge>
                    </div>
                    
                    {/* Like button */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="p-2 rounded-full bg-black/50 text-white hover:bg-red-500/80 transition-colors">
                        <Heart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          
          {/* Navigation arrows */}
          <CarouselPrevious className="hidden sm:flex -left-12 bg-background/80 hover:bg-background border-2" />
          <CarouselNext className="hidden sm:flex -right-12 bg-background/80 hover:bg-background border-2" />
        </Carousel>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-6 space-x-2">
        {landingAssets.slice(0, 5).map((_, index) => (
          <button
            key={index}
            className={`w-2 h-2 rounded-full transition-colors duration-300 ${
              currentIndex % landingAssets.length === index
                ? 'bg-primary'
                : 'bg-muted-foreground/30'
            }`}
            onClick={() => {
              // This would need to be connected to the carousel API
              // For now, it's just visual
            }}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <Sparkles className="w-4 h-4" />
          <span>10+ Styles</span>
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4" />
          <span>Professional Quality</span>
        </div>
        <div className="flex items-center gap-1">
          <Heart className="w-4 h-4" />
          <span>Instant Results</span>
        </div>
      </div>
    </div>
  )
}
