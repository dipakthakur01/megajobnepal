import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Slider } from '../ui/slider';
import { CompactToggle } from '../ui/simple-toggle';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Upload, 
  Image as ImageIcon, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Save,
  RefreshCw,
  Palette
} from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '../../lib/api-client';
// Note: Using the global unsplash_tool function instead of local import

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
  slideInterval: number; // in seconds
  showNavigation: boolean;
  overlayOpacity: number;
  enableGradient: boolean;
  gradientDirection: string;
}

export function HeroImageManagement() {
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
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newImageData, setNewImageData] = useState({
    url: '',
    title: '',
    description: '',
    opacity: 20
  });
  const [editingImage, setEditingImage] = useState<HeroImage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const section = await apiClient.getSectionSettings('homepage_hero');
      const config = (section && (section as any).config) ? (section as any).config : section;
      
      // Load images from API
      if ((config as any)?.images && Array.isArray((config as any).images)) {
        setImages((config as any).images);
      } else {
        // Initialize with multiple default images for auto-carousel demonstration
        const defaultImages: HeroImage[] = [
          {
            id: '1',
            url: 'https://images.unsplash.com/photo-1630283017802-785b7aff9aac?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjB3b3Jrc3BhY2V8ZW58MXx8fHwxNzU5MDEzOTM3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            title: 'Modern Office Workspace',
            description: 'Contemporary office environment with natural lighting',
            opacity: 25,
            isActive: true,
            order: 1,
            created_at: new Date()
          },
          {
            id: '2',
            url: 'https://images.unsplash.com/photo-1557804500-7a58fbcd4d1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBjb25mZXJlbmNlfGVufDF8fHx8MTc1OTAzOTEwOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            title: 'Business Conference',
            description: 'Professional meeting and collaboration space',
            opacity: 30,
            isActive: true,
            order: 2,
            created_at: new Date()
          },
          {
            id: '3',
            url: 'https://images.unsplash.com/photo-1758518731457-5ef826b75b3b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwY29sbGFib3JhdGlvbnxlbnwxfHx8fDE3NTg5OTEwOTJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            title: 'Team Collaboration',
            description: 'Dynamic team working together on projects',
            opacity: 28,
            isActive: true,
            order: 3,
            created_at: new Date()
          },
          {
            id: '4',
            url: 'https://images.unsplash.com/photo-1611736362199-2f7e76ebeca4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGUlMjBidWlsZGluZyUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTg5NjgyMjJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
            title: 'Corporate Architecture',
            description: 'Modern corporate building and business environment',
            opacity: 27,
            isActive: true,
            order: 4,
            created_at: new Date()
          }
        ];
        setImages(defaultImages);
      }
      
      // Load settings from API (merge with defaults safely)
      if ((config as any)?.settings) {
        setSettings(prev => ({ ...prev, ...(config as any).settings }));
      }
    } catch (error) {
      console.error('Error loading hero data from API:', error);
      // Keep default empty state - no localStorage fallback
    }
  };

  const saveImages = async (imagesToSave: HeroImage[]) => {
    try {
      await apiClient.saveSectionSettings('homepage_hero', {
        images: imagesToSave,
        settings
      }, true);
      toast.success('Images saved successfully');
    } catch (error) {
      console.error('Error saving images:', error);
      toast.error('Failed to save images');
    }
  };

  const saveSettings = async (settingsToSave: HeroSettings) => {
    try {
      await apiClient.saveSectionSettings('homepage_hero', {
        images,
        settings: settingsToSave
      }, true);
      setSettings(settingsToSave);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const searchUnsplashImages = async () => {
    if (!searchQuery.trim()) {
      toast.error('Please enter a search query');
      return;
    }

    setIsSearching(true);
    try {
      // Use a dynamic import to access the unsplash_tool if available
      let imageUrl: string | null = null;
      
      try {
        // Try to use the local unsplash utility first
        const { unsplash_tool: localUnsplash } = await import('../../lib/unsplash');
        imageUrl = await localUnsplash({ query: searchQuery });
      } catch (importError) {
        // Fallback to a hardcoded good quality image based on common search terms
        const fallbackImages: Record<string, string> = {
          'office': 'https://images.unsplash.com/photo-1497366216548-37526070297c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2V8fDE3NTgwMDE2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          'business': 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzc3x8MTc1ODAwMTY2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
          'technology': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWNobm9sb2d5fHwxNzU4MDAxNjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          'team': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtfHwxNzU4MDAxNjYyfDA&ixlib=rb-4.1.0&q=80&w=1080',
          'workplace': 'https://images.unsplash.com/photo-1695891583421-3cbbf1c2e3bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc3BhY2V8fDE3NTgwMDE2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
          'corporate': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Jwb3JhdGV8fDE3NTgwMDE2NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
        };
        
        const normalizedQuery = searchQuery.toLowerCase().trim();
        imageUrl = fallbackImages[normalizedQuery] || fallbackImages['office'];
      }
      
      if (imageUrl) {
        setNewImageData(prev => ({
          ...prev,
          url: imageUrl,
          title: `Unsplash: ${searchQuery}`,
          description: `Image from Unsplash search: ${searchQuery}`
        }));
        toast.success('Image found! You can now add it to the carousel.');
      } else {
        toast.error('No image found for this search query');
      }
    } catch (error) {
      console.error('Unsplash search error:', error);
      toast.error('Failed to search images. Please try a different search term.');
    } finally {
      setIsSearching(false);
    }
  };

  const addImage = async () => {
    if (!newImageData.url || !newImageData.title) {
      toast.error('Please provide both image URL and title');
      return;
    }

    const newImage: HeroImage = {
      id: Date.now().toString(),
      url: newImageData.url,
      title: newImageData.title,
      description: newImageData.description,
      opacity: newImageData.opacity,
      isActive: true,
      order: images.length + 1,
      created_at: new Date()
    };

    const updatedImages = [...images, newImage];
    setImages(updatedImages);
    await saveImages(updatedImages);
    
    setNewImageData({ url: '', title: '', description: '', opacity: 20 });
    setShowAddDialog(false);
    toast.success('Image added successfully');
  };

  const updateImage = async (imageId: string, updates: Partial<HeroImage>) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    );
    setImages(updatedImages);
    await saveImages(updatedImages);
    toast.success('Image updated successfully');
  };

  const deleteImage = async (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    setImages(updatedImages);
    await saveImages(updatedImages);
    toast.success('Image deleted successfully');
  };

  const reorderImages = (dragIndex: number, hoverIndex: number) => {
    const dragImage = images[dragIndex];
    const updatedImages = [...images];
    updatedImages.splice(dragIndex, 1);
    updatedImages.splice(hoverIndex, 0, dragImage);
    
    // Update order numbers
    const reorderedImages = updatedImages.map((img, index) => ({
      ...img,
      order: index + 1
    }));
    
    setImages(reorderedImages);
    saveImages(reorderedImages);
  };

  const nextImage = () => {
    if (images.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    if (images.length <= 1) {
      setCurrentImageIndex(0);
      return;
    }
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Auto-slide functionality
  useEffect(() => {
    if (settings.autoSlide && images.length > 1 && previewMode) {
      const interval = setInterval(nextImage, settings.slideInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [settings.autoSlide, settings.slideInterval, images.length, previewMode]);

  const currentImage = images[currentImageIndex] || images[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Hero Image Management</h2>
          <p className="text-gray-600">Manage homepage hero section background images and settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {previewMode ? 'Exit Preview' : 'Preview Mode'}
          </Button>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" aria-describedby="hero-image-form-description">
              <DialogHeader>
                <DialogTitle>Add Hero Image</DialogTitle>
                <DialogDescription id="hero-image-form-description">
                  Add a new background image for the hero section
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {/* Unsplash Search */}
                <div className="space-y-2">
                  <Label>Search Unsplash Images</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., office, business, technology"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && searchUnsplashImages()}
                    />
                    <Button 
                      onClick={searchUnsplashImages} 
                      disabled={isSearching}
                      size="sm"
                    >
                      {isSearching ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Search'}
                    </Button>
                  </div>
                </div>
                
                {/* Manual URL Input */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://..."
                    value={newImageData.url}
                    onChange={(e) => setNewImageData(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageTitle">Title</Label>
                  <Input
                    id="imageTitle"
                    placeholder="Image title"
                    value={newImageData.title}
                    onChange={(e) => setNewImageData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="imageDescription">Description (Optional)</Label>
                  <Input
                    id="imageDescription"
                    placeholder="Image description"
                    value={newImageData.description}
                    onChange={(e) => setNewImageData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Background Intensity: {newImageData.opacity}%</Label>
                    <span className="text-xs text-gray-500">
                      {newImageData.opacity < 20 ? 'Subtle' : 
                       newImageData.opacity < 40 ? 'Moderate' : 
                       newImageData.opacity < 70 ? 'Strong' : 'Very Strong'}
                    </span>
                  </div>
                  <Slider
                    value={[newImageData.opacity]}
                    onValueChange={(value) => setNewImageData(prev => ({ ...prev, opacity: value[0] }))}
                    max={100}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500">
                    Controls how prominently this background appears to users
                  </p>
                </div>

                {newImageData.url && (
                  <div className="space-y-2">
                    <Label>Preview</Label>
                    <div className="relative h-32 rounded border overflow-hidden">
                      <img
                        src={newImageData.url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        style={{ opacity: newImageData.opacity / 100 }}
                      />
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={addImage} className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Image
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Preview Section */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-64 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50">
              {currentImage && (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('${currentImage.url}')`,
                      opacity: currentImage.opacity / 100
                    }}
                  />
                  <div className="relative z-10 h-full flex items-center justify-center">
                    <div className="text-center text-gray-900">
                      <h1 className="text-2xl font-bold mb-2">
                        Find Your Dream Job In Nepal With <span className="text-blue-600">MegaJob</span>
                      </h1>
                      <p className="text-gray-600">
                        Search and Apply for the Best Jobs in Nepal Today
                      </p>
                    </div>
                  </div>
                  
                  {/* Enhanced Navigation Controls */}
                  {settings.showNavigation && images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110 border border-gray-200"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-700" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-300 hover:scale-110 border border-gray-200"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-700" />
                      </button>
                    </>
                  )}
                  
                  {/* Enhanced Image Indicators */}
                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-1">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            index === currentImageIndex 
                              ? 'bg-blue-600 scale-125' 
                              : 'bg-white/70 hover:bg-white/90 hover:scale-110'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            {currentImage && (
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Current:</strong> {currentImage.title}</p>
                <p><strong>Opacity:</strong> {currentImage.opacity}%</p>
                {settings.autoSlide && <p><strong>Auto-slide:</strong> Every {settings.slideInterval}s</p>}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Background Images ({images.length})
              </CardTitle>
              <CardDescription>
                Manage the carousel of background images for the hero section
              </CardDescription>
            </CardHeader>
            <CardContent>
              {images.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No images added yet</p>
                  <Button onClick={() => setShowAddDialog(true)} className="mt-4">
                    Add First Image
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {images.map((image, index) => (
                    <div
                      key={image.id}
                      className={`border rounded-lg p-4 ${
                        currentImageIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={image.url}
                            alt={image.title}
                            className="w-full h-full object-cover"
                            style={{ opacity: image.opacity / 100 }}
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{image.title}</h3>
                          {image.description && (
                            <p className="text-sm text-gray-500 truncate">{image.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${
                                image.opacity < 20 ? 'bg-blue-100 text-blue-700' :
                                image.opacity < 40 ? 'bg-green-100 text-green-700' :
                                image.opacity < 70 ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}
                            >
                              {image.opacity}% visibility
                            </Badge>
                            <Badge variant={image.isActive ? "default" : "secondary"} className="text-xs">
                              {image.isActive ? 'Live on Site' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentImageIndex(index)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingImage(image)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteImage(image.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Settings Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Carousel & Visibility Settings
              </CardTitle>
              <CardDescription>
                Control how background images appear to homepage visitors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="autoSlide">Auto-slide</Label>
                  <CompactToggle
                    id="autoSlide"
                    checked={settings.autoSlide}
                    onChange={(checked) =>
                      setSettings(prev => ({ ...prev, autoSlide: checked }))
                    }
                    size="xs"
                  />
                </div>
                
                {settings.autoSlide && (
                  <div className="space-y-2">
                    <Label>Slide Interval: {settings.slideInterval}s</Label>
                    <Slider
                      value={[settings.slideInterval]}
                      onValueChange={(value) =>
                        setSettings(prev => ({ ...prev, slideInterval: value[0] }))
                      }
                      max={30}
                      min={3}
                      step={1}
                      className="w-full"
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="showNavigation">Show Navigation</Label>
                  <CompactToggle
                    id="showNavigation"
                    checked={settings.showNavigation}
                    onChange={(checked) =>
                      setSettings(prev => ({ ...prev, showNavigation: checked }))
                    }
                    size="xs"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Background Visibility for Homepage</Label>
                    <Badge variant="outline" className="text-xs">Live Control</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm text-gray-600">Background Overlay: {settings.overlayOpacity}%</Label>
                      <span className="text-xs text-gray-500">
                        {settings.overlayOpacity < 20 ? 'Very Visible' : 
                         settings.overlayOpacity < 50 ? 'Visible' : 
                         settings.overlayOpacity < 80 ? 'Subtle' : 'Very Subtle'}
                      </span>
                    </div>
                    <Slider
                      value={[settings.overlayOpacity]}
                      onValueChange={(value) =>
                        setSettings(prev => ({ ...prev, overlayOpacity: value[0] }))
                      }
                      max={100}
                      min={0}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500">
                      Controls white overlay intensity - Higher values make text more readable
                    </p>
                  </div>
                </div>
              </div>
              
              <Button
                onClick={() => saveSettings(settings)}
                className="w-full flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Image Dialog */}
      {editingImage && (
        <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editingImage.title}
                  onChange={(e) => setEditingImage(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={editingImage.description || ''}
                  onChange={(e) => setEditingImage(prev => prev ? { ...prev, description: e.target.value } : null)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Background Intensity: {editingImage.opacity}%</Label>
                  <span className="text-xs text-gray-500">
                    {editingImage.opacity < 20 ? 'Subtle' : 
                     editingImage.opacity < 40 ? 'Moderate' : 
                     editingImage.opacity < 70 ? 'Strong' : 'Very Strong'}
                  </span>
                </div>
                <Slider
                  value={[editingImage.opacity]}
                  onValueChange={(value) => setEditingImage(prev => prev ? { ...prev, opacity: value[0] } : null)}
                  max={100}
                  min={5}
                  step={5}
                  className="w-full"
                />
                <p className="text-xs text-gray-500">
                  Controls how prominently this background appears to users
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <CompactToggle
                  checked={editingImage.isActive}
                  onChange={(checked) => setEditingImage(prev => prev ? { ...prev, isActive: checked } : null)}
                  size="sm"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={async () => {
                    if (editingImage) {
                      await updateImage(editingImage.id, editingImage);
                      setEditingImage(null);
                    }
                  }}
                  className="flex-1"
                >
                  Update Image
                </Button>
                <Button variant="outline" onClick={() => setEditingImage(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
