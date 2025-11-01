import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CompactToggle } from '../components/ui/simple-toggle';

interface HeroImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  opacity: number;
  isActive: boolean;
  order: number;
  created_at: Date;
}

interface HeroSettings {
  autoSlide: boolean;
  slideInterval: number;
  showNavigation: boolean;
  overlayOpacity: number;
  enableGradient: boolean;
  gradientDirection: string;
}

interface HeroCarouselProps {
  children: React.ReactNode;
}

export const HeroCarousel = React.memo(function HeroCarousel({ children }: HeroCarouselProps) {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [settings, setSettings] = useState<HeroSettings>({
    autoSlide: true,
    slideInterval: 5,
    showNavigation: true,
    overlayOpacity: 20,
    enableGradient: true,
    gradientDirection: 'from-blue-50 via-white to-blue-50'
  });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Load settings and images from backend API; fallback to defaults
  useEffect(() => {
    (async () => {
      try {
        const { apiClient } = await import('@/lib/api-client');
        const section = await apiClient.getSectionSettings('homepage_hero');
        const config = (section && (section as any).config) ? (section as any).config : section;

        const rawImages = Array.isArray((config as any)?.images) ? (config as any).images : [];
        const activeImages = rawImages.filter((img: any) => img.isActive);
        const normalized = activeImages.map((img: any, idx: number) => ({
          id: img.id ?? `${idx}-${Math.random().toString(36).slice(2)}`,
          url: img.url ?? '',
          title: img.title ?? '',
          description: img.description ?? '',
          opacity: typeof img.opacity === 'number' ? img.opacity : 25,
          isActive: img.isActive !== false,
          order: typeof img.order === 'number' ? img.order : idx + 1,
          created_at: new Date()
        }));

        if (normalized.length > 0) {
          setImages(normalized.sort((a, b) => a.order - b.order));
        } else {
          // Built-in defaults only
          setImages([
            {
              id: '1',
              url: 'https://images.unsplash.com/photo-1630283017802-785b7aff9aac?auto=format&fit=crop&w=1600&q=80',
              title: 'Modern Office Workspace',
              description: 'Contemporary office environment with natural lighting',
              opacity: 25,
              isActive: true,
              order: 1,
              created_at: new Date()
            },
            {
              id: '2',
              url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?auto=format&fit=crop&w=1600&q=80',
              title: 'Business Conference',
              description: 'Professional meeting and collaboration space',
              opacity: 30,
              isActive: true,
              order: 2,
              created_at: new Date()
            },
            {
              id: '3',
              url: 'https://images.unsplash.com/photo-1758518731457-5ef826b75b3b?auto=format&fit=crop&w=1600&q=80',
              title: 'Team Collaboration',
              description: 'Dynamic team working together on projects',
              opacity: 28,
              isActive: true,
              order: 3,
              created_at: new Date()
            },
            {
              id: '4',
              url: 'https://images.unsplash.com/photo-1611736362199-2f7e76ebeca4?auto=format&fit=crop&w=1600&q=80',
              title: 'Corporate Architecture',
              description: 'Modern corporate building and business environment',
              opacity: 27,
              isActive: true,
              order: 4,
              created_at: new Date()
            }
          ]);
        }

        if ((config as any)?.settings) {
          setSettings((config as any).settings);
        }
      } catch (error) {
        console.error('Error loading hero carousel from backend:', error);
        // Built-in defaults only
        setImages([
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1630283017802-785b7aff9aac?auto=format&fit=crop&w=1600&q=80',
            title: 'Modern Office Workspace',
            description: 'Contemporary office environment with natural lighting',
            opacity: 25,
            isActive: true,
            order: 1,
            created_at: new Date()
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?auto=format&fit=crop&w=1600&q=80',
            title: 'Business Conference',
            description: 'Professional meeting and collaboration space',
            opacity: 30,
            isActive: true,
            order: 2,
            created_at: new Date()
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1758518731457-5ef826b75b3b?auto=format&fit=crop&w=1600&q=80',
            title: 'Team Collaboration',
            description: 'Dynamic team working together on projects',
            opacity: 28,
            isActive: true,
            order: 3,
            created_at: new Date()
          },
          {
            id: '4',
            url: 'https://images.unsplash.com/photo-1611736362199-2f7e76ebeca4?auto=format&fit=crop&w=1600&q=80',
            title: 'Corporate Architecture',
            description: 'Modern corporate building and business environment',
            opacity: 27,
            isActive: true,
            order: 4,
            created_at: new Date()
          }
        ]);
      }
    })();
  }, []);

  // Auto-slide functionality
  useEffect(() => {
    if (settings.autoSlide && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, settings.slideInterval * 1000);
      
      return () => clearInterval(interval);
    }
  }, [settings.autoSlide, settings.slideInterval, images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <section className={`relative bg-gradient-to-br ${settings.gradientDirection} py-20 px-4 overflow-hidden`}>
      {/* Background Image Carousel */}
      {currentImage && (
        <div className="absolute inset-0">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${
                index === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                backgroundImage: `url('${image.url}')`,
                opacity: index === currentImageIndex ? (image.opacity / 100) : 0
              }}
            />
          ))}
          
          {/* Overlay for better text readability */}
          <div 
            className="absolute inset-0 bg-white"
            style={{ opacity: settings.overlayOpacity / 100 }}
          />
        </div>
      )}

      {/* Enhanced Navigation Controls */}
      {settings.showNavigation && images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-gray-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-gray-200"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 text-gray-700" />
          </button>
        </>
      )}

      {/* Toggle Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-black/10 backdrop-blur-sm rounded-full px-4 py-2 hero-toggle-container">
          <div className="flex items-center gap-3">
            {images.map((_, index) => (
              <div 
                key={index}
                className={`transition-all duration-500 ${
                  index === currentImageIndex ? 'hero-toggle-active' : 'hero-toggle-inactive'
                }`}
              >
                <CompactToggle
                  size="xs"
                  checked={index === currentImageIndex}
                  onChange={() => goToImage(index)}
                  className={`transform hover:scale-110 transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'shadow-lg shadow-orange-200/50' 
                      : 'hover:shadow-md hover:shadow-gray-200/50'
                  }`}
                  id={`hero-toggle-${index}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>


    </section>
  );
});
