import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CompactToggle } from './ui/simple-toggle';
import { apiClient } from '@/lib/api-client';

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

export const HeroCarousel: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
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

  useEffect(() => {
    let cancelled = false;

    const DEFAULT_FALLBACK_IMAGES: HeroImage[] = [
      {
        id: 'hero-1',
        url: 'https://images.unsplash.com/photo-1630283017802-785b7aff9aac?auto=format&fit=crop&w=1600&q=80',
        title: 'Modern Office Workspace',
        description: 'Contemporary office environment with natural lighting',
        opacity: 30,
        isActive: true,
        order: 1,
        created_at: new Date()
      },
      {
        id: 'hero-2',
        url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?auto=format&fit=crop&w=1600&q=80',
        title: 'Business Conference',
        description: 'Professional meeting and collaboration space',
        opacity: 30,
        isActive: true,
        order: 2,
        created_at: new Date()
      },
      {
        id: 'hero-3',
        url: 'https://images.unsplash.com/photo-1758518731457-5ef826b75b3b?auto=format&fit=crop&w=1600&q=80',
        title: 'Team Collaboration',
        description: 'Dynamic team working together on projects',
        opacity: 28,
        isActive: true,
        order: 3,
        created_at: new Date()
      },
      {
        id: 'hero-4',
        url: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1600&q=80',
        title: 'Creative Workspace',
        description: 'Design and innovation in a collaborative studio',
        opacity: 28,
        isActive: true,
        order: 4,
        created_at: new Date()
      }
    ];

    const loadHero = async () => {
      try {
        const section = await apiClient.getSectionSettings('homepage_hero');
        const config = (section && (section as any).config) ? (section as any).config : section;

        // Images from backend
        const rawImages = Array.isArray((config as any)?.images) ? (config as any).images : [];
        const activeImages = rawImages.filter((img: any) => img.isActive);
        const normalizedImages = activeImages.map((img: any, idx: number) => ({
          id: img.id ?? `${idx}-${Math.random().toString(36).slice(2)}`,
          url: img.url ?? '',
          title: img.title ?? '',
          description: img.description ?? '',
          opacity: typeof img.opacity === 'number' ? img.opacity : 25,
          isActive: img.isActive !== false,
          order: typeof img.order === 'number' ? img.order : idx + 1,
          created_at: new Date()
        }));

        if (!cancelled) {
          if (normalizedImages.length > 0) {
            setImages(normalizedImages.sort((a, b) => a.order - b.order));
          } else {
            // Fallback to built-in defaults only (no localStorage)
            setImages(DEFAULT_FALLBACK_IMAGES);
          }

          // Settings
          if ((config as any)?.settings) {
            setSettings((config as any).settings);
          } // else keep initial defaults
        }
      } catch (error) {
        console.error('Error loading hero config from backend:', error);
        // Fallback to built-in defaults only (no localStorage)
        setImages(DEFAULT_FALLBACK_IMAGES);
        // Keep initial settings defaults
      }
    };

    loadHero();
    return () => { cancelled = true; };
  }, []);

  // Re-enable auto-slide behavior
  useEffect(() => {
    if (settings.autoSlide && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, settings.slideInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoSlide, settings.slideInterval, images.length]);

  const currentImage = images[currentImageIndex] || images[0];

  const prevImage = () => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length);
  const nextImage = () => setCurrentImageIndex((i) => (i + 1) % images.length);
  const goToImage = (index: number) => setCurrentImageIndex(index);

  return (
    <section className={`relative bg-gradient-to-br ${settings.gradientDirection} py-20 px-4 overflow-hidden`}>
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
          <div 
            className="absolute inset-0 bg-white"
            style={{ opacity: settings.overlayOpacity / 100 }}
          />
        </div>
      )}

      {settings.showNavigation && images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-gray-200"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/90 hover:bg-white shadow-lg rounded-full p-3 transition-all duration-300 hover:scale-110 hover:shadow-xl border border-gray-200"
            aria-label="Next image"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Restore visible dot toggles */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white/70 backdrop-blur-md rounded-full px-4 py-2 shadow border border-gray-200">
          <div className="flex items-center gap-3">
            {images.map((_, index) => (
              <CompactToggle
                key={index}
                size="xs"
                checked={index === currentImageIndex}
                onChange={() => goToImage(index)}
                className={`transition-all duration-300 ${index === currentImageIndex ? 'scale-105 shadow-md' : 'opacity-70 hover:opacity-100'}`}
                id={`hero-toggle-${index}`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="relative z-10">
        {children}
      </div>
    </section>
  );
};
