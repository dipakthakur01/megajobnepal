import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Save,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { useApp } from '@/pages/providers/AppProvider';
import { apiClient } from '@/lib/api-client';
import { normalizeMediaUrl } from '@/utils/media';

// Hero types
interface HeroImage {
  id: string;
  url: string;
  title: string;
  description?: string;
  opacity: number;
  isActive: boolean;
  order: number;
}

interface HeroSettings {
  autoSlide: boolean;
  slideInterval: number;
  showNavigation: boolean;
  overlayOpacity: number;
  enableGradient: boolean;
  gradientDirection: string;
}

export function SiteManagement() {
  const { siteSettings, setSiteSettings } = useApp();
  const [siteInfo, setSiteInfo] = useState(siteSettings || {
    siteName: 'MegaJobNepal',
    siteUrl: 'https://megajobnepal.com.np',
    tagline: "Nepal's Premier Job Portal",
    description: 'Connect talented professionals with leading employers across Nepal. Find your dream job or hire the perfect candidate.',
    metaDescription: 'MegaJobNepal - Leading job portal in Nepal. Find jobs, post jobs, connect with employers and job seekers.',
    keywords: 'jobs nepal, employment, careers, hiring, job search, kathmandu jobs',
    email: 'info@megajobnepal.com.np',
    phone: '+977-1-4123456',
    // Department phones (used by Contact page)
    mainPhone: '+977-1-4444567',
    supportPhone: '+977-1-4444568',
    salesPhone: '+977-1-4444569',
    hrPhone: '+977-1-4444570',
    address: 'Kathmandu, Nepal',
    // Department emails (used by Contact page)
    supportEmail: 'support@megajobnepal.com.np',
    businessEmail: 'business@megajobnepal.com.np',
    salesEmail: 'sales@megajobnepal.com.np',
    careersEmail: 'hr@megajobnepal.com.np',
    contactRecipientEmail: 'support@megajobnepal.com.np',
    // Head office details for Contact page
    addressLine1: 'Putalisadak, Kathmandu',
    addressLine2: 'Bagmati Province, Nepal',
    poBox: 'P.O. Box: 12345',
    companyLocation: 'Putalisadak, Kathmandu, Nepal',
    mapUrl: 'https://maps.google.com/maps?q=Putalisadak+Kathmandu&output=embed',
    googleMapsLink: 'https://goo.gl/maps/example',
    coordinates: {
      latitude: '27.7172',
      longitude: '85.3240'
    },
    facebook: 'https://facebook.com/megajobnepal',
    instagram: 'https://instagram.com/megajobnepal',
    twitter: 'https://twitter.com/megajobnepal',
    linkedin: 'https://linkedin.com/company/megajobnepal',
    youtube: 'https://youtube.com/megajobnepal',
    companyName: 'MegaJobNepal Pvt. Ltd.',
    registrationNumber: 'REG12345',
    taxNumber: 'TAX67890',
    establishedYear: '2020'
    ,
    // Business Hours shown on public Contact page
    weekdayHours: 'Monday - Friday: 9:00 AM - 6:00 PM',
    saturdayHours: 'Saturday: 10:00 AM - 4:00 PM',
    sundayHours: 'Sunday: Closed',
    holidayHours: 'Public Holidays: Closed',
    jobBadgeLabel: (siteSettings as any)?.jobBadgeLabel || 'mega_job'
  });

  useEffect(() => {
    if (siteSettings) {
      setSiteInfo((prev) => {
        const ss: any = siteSettings || {};
        return {
          ...prev,
          ...ss,
          coordinates: {
            ...(prev?.coordinates || { latitude: '', longitude: '' }),
            ...(ss?.coordinates || {})
          }
        } as any;
      });
    }
  }, [siteSettings]);

  // Load site_info from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const section = await apiClient.getSectionSettings('site_info');
        const config = (section && (section as any).config) ? (section as any).config : section;
        if (mounted && config && typeof config === 'object') {
          setSiteInfo((prev) => ({ ...prev, ...(config as any) }));
          // sync into app context for other consumers
          try { setSiteSettings(config as any); } catch {}
        }
      } catch (err) {
        console.warn('Failed to load site_info from backend:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const [isLoading, setSaveLoading] = useState(false);

  // Upload helpers for site logos/images
  const handleSiteImageUpload = async (
    field: 'logoUrl' | 'faviconUrl' | 'defaultImageUrl',
    file?: File
  ) => {
    try {
      if (!file) return;
      const res = await apiClient.uploadSectionImage('site_info', file);
      const url: string = (res && (res.url || res.location || res.path)) ? (res.url || res.location || res.path) : '';
      if (!url) {
        toast.warning('Upload succeeded, but no URL returned');
        return;
      }
      const normalized = normalizeMediaUrl(url) || url;
      setSiteInfo(prev => ({ ...prev, [field]: normalized } as any));
      toast.success('Image uploaded and URL set');
    } catch (err) {
      console.error('Failed to upload site image:', err);
      toast.error('Failed to upload image');
    }
  };

  // SEO keywords normalization
  const normalizeKeywords = (input: string): string => {
    const parts = (input || '')
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);
    // Deduplicate while preserving order
    const seen = new Set<string>();
    const deduped: string[] = [];
    for (const p of parts) {
      const key = p.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(p);
      }
    }
    return deduped.join(', ');
  };

  // Hero editor state
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroSettings, setHeroSettings] = useState<HeroSettings>({
    autoSlide: true,
    slideInterval: 5,
    showNavigation: true,
    overlayOpacity: 20,
    enableGradient: true,
    gradientDirection: 'from-blue-50 via-white to-blue-50'
  });
  const [isHeroSaving, setIsHeroSaving] = useState(false);
  const [uploadingImageId, setUploadingImageId] = useState<string | null>(null);

  useEffect(() => {
    // Load hero config from backend API only
    const loadHero = async () => {
      try {
        const section = await apiClient.getSectionSettings('homepage_hero');
        const config = (section && (section as any).config) ? (section as any).config : section;
        
        // Load images from API
        if ((config as any)?.images && Array.isArray((config as any).images)) {
          setHeroImages((config as any).images);
        }
        
        // Load settings from API
        if ((config as any)?.settings) {
          setHeroSettings((config as any).settings);
        }
      } catch (err) {
        console.error('Error loading hero config from backend:', err);
        // Keep default empty state - no localStorage fallback
      }
    };
    loadHero();
  }, []);

  const saveHero = async () => {
    setIsHeroSaving(true);
    try {
      await apiClient.saveSectionSettings('homepage_hero', { images: heroImages, settings: heroSettings }, true);
      toast.success('Homepage hero updated successfully!');
    } catch (error) {
      console.error('Error saving hero config:', error);
      toast.error('Failed to update homepage hero');
    } finally {
      setIsHeroSaving(false);
    }
  };

  const addHeroImage = () => {
    const nextOrder = (heroImages.reduce((max, img) => Math.max(max, img.order || 0), 0) || 0) + 1;
    setHeroImages([
      ...heroImages,
      {
        id: Math.random().toString(36).slice(2),
        url: '',
        title: '',
        description: '',
        opacity: 30,
        isActive: true,
        order: nextOrder
      }
    ]);
  };

  const removeHeroImage = (id: string) => {
    setHeroImages(heroImages.filter(img => img.id !== id));
  };

  const moveHeroImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...heroImages];
    if (direction === 'up' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    }
    if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
    }
    // Reassign order numbers based on new position
    setHeroImages(newImages.map((img, i) => ({ ...img, order: i + 1 })));
  };

  const updateHeroImage = (index: number, field: keyof HeroImage, value: any) => {
    const newImages = [...heroImages];
    newImages[index] = { ...newImages[index], [field]: value } as HeroImage;
    setHeroImages(newImages);
  };

  const handleHeroImageUpload = async (index: number, file: File) => {
    if (!file) return;
    const current = heroImages[index];
    setUploadingImageId(current.id);
    try {
      const res = await apiClient.uploadHomepageHeroImage(file);
      const url = (res && (res.url || res.location || res.path)) ? (res.url || res.location || res.path) : '';
      if (url) {
        updateHeroImage(index, 'url', url);
        toast.success('Image uploaded and URL set');
      } else {
        toast.warning('Upload succeeded, but no URL returned');
      }
    } catch (err) {
      toast.error('Failed to upload image');
    } finally {
      setUploadingImageId(null);
    }
  };

  const handleSave = async () => {
    setSaveLoading(true);
    try {
      // Persist site_info to backend
      await apiClient.saveSectionSettings('site_info', siteInfo as any, true);
      // Update global site settings in context for immediate UI sync
      try { setSiteSettings(siteInfo as any); } catch {}
      // Save hero configuration to backend
      await saveHero();
      toast.success('Site information saved to server');
    } catch (error) {
      console.error('Failed saving site_info:', error);
      toast.error('Failed to save site information');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Site Management</h2>
          <p className="text-gray-600">Configure site information, contact details, and social media</p>
        </div>
        <Button onClick={handleSave} disabled={isLoading} className="flex items-center space-x-2">
          <Save className="h-4 w-4" />
          <span>{isLoading ? 'Saving...' : 'Save All Changes'}</span>
        </Button>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="company">Company Info</TabsTrigger>
          <TabsTrigger value="hero">Homepage Hero</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteInfo.siteName}
                    onChange={(e) => setSiteInfo({ ...siteInfo, siteName: e.target.value })}
                    placeholder="Your site name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={siteInfo.siteUrl}
                    onChange={(e) => setSiteInfo({ ...siteInfo, siteUrl: e.target.value })}
                    placeholder="https://yoursite.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={siteInfo.tagline}
                  onChange={(e) => setSiteInfo({ ...siteInfo, tagline: e.target.value })}
                  placeholder="Your site tagline"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Site Description</Label>
                <Textarea
                  id="description"
                  value={siteInfo.description}
                  onChange={(e) => setSiteInfo({ ...siteInfo, description: e.target.value })}
                  placeholder="Describe your website"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description (SEO)</Label>
                <Textarea
                  id="metaDescription"
                  value={siteInfo.metaDescription || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, metaDescription: e.target.value })}
                  placeholder="SEO meta description (160 characters max)"
                  rows={2}
                />
                <p className="text-xs text-gray-500">{(siteInfo.metaDescription?.length ?? 0)}/160 characters</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="keywords">SEO Keywords</Label>
                <Input
                  id="keywords"
                  value={siteInfo.keywords}
                  onChange={(e) => setSiteInfo({ ...siteInfo, keywords: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      setSiteInfo(prev => {
                        const v = String(prev.keywords || '');
                        const next = v.endsWith(',') ? v : (v.length ? v + ', ' : '');
                        return { ...prev, keywords: next } as any;
                      });
                    }
                  }}
                  onBlur={(e) => {
                    setSiteInfo(prev => ({ ...prev, keywords: normalizeKeywords(String(prev.keywords || '')) } as any));
                  }}
                  placeholder="job, employment, career, nepal (comma separated)"
                />
              </div>

              {/* Job card badge label editable by admin/super admin */}
              <div className="space-y-2">
                <Label htmlFor="jobBadgeLabel">Job card badge text</Label>
                <Input
                  id="jobBadgeLabel"
                  value={(siteInfo as any).jobBadgeLabel || ''}
                  onChange={(e) => setSiteInfo({ ...siteInfo, jobBadgeLabel: e.target.value })}
                  placeholder="mega_job"
                />
                <p className="text-xs text-gray-500">Controls badge label shown on all job cards.</p>
              </div>
            </CardContent>
          </Card>

          {/* Logo & Images */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Site Logos & Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Main Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {siteInfo.logoUrl ? (
                      <img src={normalizeMediaUrl(siteInfo.logoUrl)} alt="Site logo" className="max-h-24 mx-auto mb-2 object-contain" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <input
                      id="site-logo-input"
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      className="hidden"
                      onChange={(e) => handleSiteImageUpload('logoUrl', e.target.files?.[0])}
                    />
                    <Button variant="outline" size="sm" onClick={() => {
                      const el = document.getElementById('site-logo-input') as HTMLInputElement | null;
                      el?.click();
                    }}>Upload Logo</Button>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG (max ~2MB)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {siteInfo.faviconUrl ? (
                      <img src={normalizeMediaUrl(siteInfo.faviconUrl)} alt="Favicon" className="max-h-16 mx-auto mb-2 object-contain" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <input
                      id="site-favicon-input"
                      type="file"
                      accept="image/x-icon,image/vnd.microsoft.icon,image/png"
                      className="hidden"
                      onChange={(e) => handleSiteImageUpload('faviconUrl', e.target.files?.[0])}
                    />
                    <Button variant="outline" size="sm" onClick={() => {
                      const el = document.getElementById('site-favicon-input') as HTMLInputElement | null;
                      el?.click();
                    }}>Upload Favicon</Button>
                    <p className="text-xs text-gray-500 mt-1">ICO or PNG (32x32px)</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Default Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {siteInfo.defaultImageUrl ? (
                      <img src={normalizeMediaUrl(siteInfo.defaultImageUrl)} alt="Default share image" className="max-h-24 mx-auto mb-2 object-contain" />
                    ) : (
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    )}
                    <input
                      id="site-default-image-input"
                      type="file"
                      accept="image/png,image/jpeg"
                      className="hidden"
                      onChange={(e) => handleSiteImageUpload('defaultImageUrl', e.target.files?.[0])}
                    />
                    <Button variant="outline" size="sm" onClick={() => {
                      const el = document.getElementById('site-default-image-input') as HTMLInputElement | null;
                      el?.click();
                    }}>Upload Image</Button>
                    <p className="text-xs text-gray-500 mt-1">Used for social sharing previews</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contact Information */}
        <TabsContent value="contact" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={siteInfo.email}
                    onChange={(e) => setSiteInfo({ ...siteInfo, email: e.target.value })}
                    placeholder="info@yoursite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Primary Phone</Label>
                  <Input
                    id="phone"
                    value={siteInfo.phone}
                    onChange={(e) => setSiteInfo({ ...siteInfo, phone: e.target.value })}
                    placeholder="+977-1-1234567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={siteInfo.supportEmail}
                    onChange={(e) => setSiteInfo({ ...siteInfo, supportEmail: e.target.value })}
                    placeholder="support@yoursite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Business Email</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={siteInfo.businessEmail}
                    onChange={(e) => setSiteInfo({ ...siteInfo, businessEmail: e.target.value })}
                    placeholder="business@yoursite.com"
                  />
                </div>
              </div>

              {/* Department Phone Numbers */}
              <div className="space-y-2">
                <Label>Department Phone Numbers</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mainPhone">Main Phone</Label>
                    <Input
                      id="mainPhone"
                      value={siteInfo.mainPhone || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, mainPhone: e.target.value })}
                      placeholder="+977-1-4444567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      value={siteInfo.supportPhone || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, supportPhone: e.target.value })}
                      placeholder="+977-1-4444568"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salesPhone">Sales Phone</Label>
                    <Input
                      id="salesPhone"
                      value={siteInfo.salesPhone || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, salesPhone: e.target.value })}
                      placeholder="+977-1-4444569"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hrPhone">HR Phone</Label>
                    <Input
                      id="hrPhone"
                      value={siteInfo.hrPhone || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, hrPhone: e.target.value })}
                      placeholder="+977-1-4444570"
                    />
                  </div>
                </div>
              </div>

              {/* Department Emails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salesEmail">Sales Email</Label>
                  <Input
                    id="salesEmail"
                    type="email"
                    value={siteInfo.salesEmail || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, salesEmail: e.target.value })}
                    placeholder="sales@yoursite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="careersEmail">Careers Email</Label>
                  <Input
                    id="careersEmail"
                    type="email"
                    value={siteInfo.careersEmail || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, careersEmail: e.target.value })}
                    placeholder="hr@yoursite.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactRecipientEmail">Contact Recipient Email</Label>
                  <Input
                    id="contactRecipientEmail"
                    type="email"
                    value={siteInfo.contactRecipientEmail || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, contactRecipientEmail: e.target.value })}
                    placeholder="Recipient for Contact form submissions"
                  />
                  <p className="text-xs text-gray-500">Messages from the Contact page will be sent to this address.</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Office Address</Label>
                <Textarea
                  id="address"
                  value={siteInfo.address}
                  onChange={(e) => setSiteInfo({ ...siteInfo, address: e.target.value })}
                  placeholder="Your office address"
                  rows={3}
                />
              </div>

              {/* Optional detailed address lines for Contact page */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addressLine1">Address Line 1</Label>
                  <Input
                    id="addressLine1"
                    value={siteInfo.addressLine1 || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, addressLine1: e.target.value })}
                    placeholder="Putalisadak, Kathmandu"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addressLine2">Address Line 2</Label>
                  <Input
                    id="addressLine2"
                    value={siteInfo.addressLine2 || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, addressLine2: e.target.value })}
                    placeholder="Bagmati Province, Nepal"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="poBox">P.O. Box</Label>
                  <Input
                    id="poBox"
                    value={siteInfo.poBox || ''}
                    onChange={(e) => setSiteInfo({ ...siteInfo, poBox: e.target.value })}
                    placeholder="P.O. Box: 12345"
                  />
                </div>
              </div>

              {/* Business Hours (appears on Contact page) */}
              <div className="space-y-2 mt-4">
                <Label>Business Hours</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekdayHours">Weekday Hours</Label>
                    <Input
                      id="weekdayHours"
                      value={siteInfo.weekdayHours || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, weekdayHours: e.target.value })}
                      placeholder="Monday - Friday: 9:00 AM - 6:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="saturdayHours">Saturday Hours</Label>
                    <Input
                      id="saturdayHours"
                      value={siteInfo.saturdayHours || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, saturdayHours: e.target.value })}
                      placeholder="Saturday: 10:00 AM - 4:00 PM"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sundayHours">Sunday Hours</Label>
                    <Input
                      id="sundayHours"
                      value={siteInfo.sundayHours || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, sundayHours: e.target.value })}
                      placeholder="Sunday: Closed"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="holidayHours">Public Holiday Hours</Label>
                    <Input
                      id="holidayHours"
                      value={siteInfo.holidayHours || ''}
                      onChange={(e) => setSiteInfo({ ...siteInfo, holidayHours: e.target.value })}
                      placeholder="Public Holidays: Closed"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Company Location & Map Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Company Location & Map
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyLocation">Company Location *</Label>
                <Textarea
                  id="companyLocation"
                  value={siteInfo.companyLocation}
                  onChange={(e) => setSiteInfo({ ...siteInfo, companyLocation: e.target.value })}
                  placeholder="Complete company address for maps and contact page"
                  rows={2}
                />
                <p className="text-xs text-gray-500">This will be displayed on the contact page and used for the map</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mapUrl">Google Maps Embed URL</Label>
                  <Textarea
                    id="mapUrl"
                    value={siteInfo.mapUrl}
                    onChange={(e) => setSiteInfo({ ...siteInfo, mapUrl: e.target.value })}
                    placeholder="https://maps.google.com/maps?q=YourLocation&output=embed"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500">Get this from Google Maps → Share → Embed a map</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMapsLink">Google Maps Share Link</Label>
                  <Input
                    id="googleMapsLink"
                    value={siteInfo.googleMapsLink}
                    onChange={(e) => setSiteInfo({ ...siteInfo, googleMapsLink: e.target.value })}
                    placeholder="https://goo.gl/maps/yourlink"
                  />
                  <p className="text-xs text-gray-500">Short link for "Get Directions" button</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    value={siteInfo.coordinates?.latitude || ''}
                    onChange={(e) => setSiteInfo({ 
                      ...siteInfo, 
                      coordinates: { ...(siteInfo.coordinates || { latitude: '', longitude: '' }), latitude: e.target.value }
                    })}
                    placeholder="27.7172"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    value={siteInfo.coordinates?.longitude || ''}
                    onChange={(e) => setSiteInfo({ 
                      ...siteInfo, 
                      coordinates: { ...(siteInfo.coordinates || { latitude: '', longitude: '' }), longitude: e.target.value }
                    })}
                    placeholder="85.3240"
                  />
                </div>
              </div>

              {/* Map Preview */}
              <div className="space-y-2">
                <Label>Map Preview</Label>
                <div className="border rounded-lg overflow-hidden">
                  {siteInfo.mapUrl ? (
                    <iframe
                      src={siteInfo.mapUrl}
                      width="100%"
                      height="200"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Company Location"
                    />
                  ) : (
                    <div className="h-48 bg-gray-100 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <MapPin className="w-8 h-8 mx-auto mb-2" />
                        <p>Enter map URL to preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Map Setup Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">How to get Google Maps URLs:</h4>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Maps</a></li>
                  <li>Search for your company address</li>
                  <li>Click "Share" → "Embed a map" → Copy the iframe src URL</li>
                  <li>For the share link: Click "Share" → "Copy link"</li>
                  <li>For coordinates: Right-click on your location and copy the numbers</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Accounts</CardTitle>
              <p className="text-sm text-gray-600">Manage your social media presence</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Facebook className="h-5 w-5 text-blue-600" />
                  <div className="flex-1">
                    <Label htmlFor="facebook">Facebook Page</Label>
                    <Input
                      id="facebook"
                      value={siteInfo.facebook}
                      onChange={(e) => setSiteInfo({ ...siteInfo, facebook: e.target.value })}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Instagram className="h-5 w-5 text-pink-600" />
                  <div className="flex-1">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={siteInfo.instagram}
                      onChange={(e) => setSiteInfo({ ...siteInfo, instagram: e.target.value })}
                      placeholder="https://instagram.com/youraccount"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <div className="flex-1">
                    <Label htmlFor="twitter">Twitter/X</Label>
                    <Input
                      id="twitter"
                      value={siteInfo.twitter}
                      onChange={(e) => setSiteInfo({ ...siteInfo, twitter: e.target.value })}
                      placeholder="https://twitter.com/youraccount"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Linkedin className="h-5 w-5 text-blue-700" />
                  <div className="flex-1">
                    <Label htmlFor="linkedin">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={siteInfo.linkedin}
                      onChange={(e) => setSiteInfo({ ...siteInfo, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/yourcompany"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Youtube className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <Label htmlFor="youtube">YouTube Channel</Label>
                    <Input
                      id="youtube"
                      value={siteInfo.youtube}
                      onChange={(e) => setSiteInfo({ ...siteInfo, youtube: e.target.value })}
                      placeholder="https://youtube.com/yourchannel"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Information */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <p className="text-sm text-gray-600">Legal and business information</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Legal Company Name</Label>
                  <Input
                    id="companyName"
                    value={siteInfo.companyName}
                    onChange={(e) => setSiteInfo({ ...siteInfo, companyName: e.target.value })}
                    placeholder="Your Legal Company Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="establishedYear">Established Year</Label>
                  <Input
                    id="establishedYear"
                    value={siteInfo.establishedYear}
                    onChange={(e) => setSiteInfo({ ...siteInfo, establishedYear: e.target.value })}
                    placeholder="2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={siteInfo.registrationNumber}
                    onChange={(e) => setSiteInfo({ ...siteInfo, registrationNumber: e.target.value })}
                    placeholder="Company registration number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxNumber">Tax Number</Label>
                  <Input
                    id="taxNumber"
                    value={siteInfo.taxNumber}
                    onChange={(e) => setSiteInfo({ ...siteInfo, taxNumber: e.target.value })}
                    placeholder="Tax identification number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Homepage Hero */}
        <TabsContent value="hero" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Hero Settings</CardTitle>
              <p className="text-sm text-gray-600">Control the homepage hero behavior and overlay</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="autoSlide">Auto Slide</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="autoSlide"
                      type="checkbox"
                      checked={heroSettings.autoSlide}
                      onChange={(e) => setHeroSettings({ ...heroSettings, autoSlide: e.target.checked })}
                    />
                    <span className="text-sm text-gray-600">Automatically change slides</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slideInterval">Slide Interval (seconds)</Label>
                  <Input
                    id="slideInterval"
                    type="number"
                    min={3}
                    value={heroSettings.slideInterval}
                    onChange={(e) => setHeroSettings({ ...heroSettings, slideInterval: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="showNavigation">Show Navigation</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="showNavigation"
                      type="checkbox"
                      checked={heroSettings.showNavigation}
                      onChange={(e) => setHeroSettings({ ...heroSettings, showNavigation: e.target.checked })}
                    />
                    <span className="text-sm text-gray-600">Show arrows for manual navigation</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overlayOpacity">Overlay Opacity</Label>
                  <input
                    id="overlayOpacity"
                    type="range"
                    min={0}
                    max={100}
                    value={heroSettings.overlayOpacity}
                    onChange={(e) => setHeroSettings({ ...heroSettings, overlayOpacity: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="enableGradient">Enable Gradient Background</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id="enableGradient"
                      type="checkbox"
                      checked={heroSettings.enableGradient}
                      onChange={(e) => setHeroSettings({ ...heroSettings, enableGradient: e.target.checked })}
                    />
                    <span className="text-sm text-gray-600">Background gradient behind images</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gradientDirection">Gradient Direction</Label>
                  <select
                    id="gradientDirection"
                    value={heroSettings.gradientDirection}
                    onChange={(e) => setHeroSettings({ ...heroSettings, gradientDirection: e.target.value })}
                    className="border rounded-md p-2"
                  >
                    <option value="from-blue-50 via-white to-blue-50">Blue → White → Blue</option>
                    <option value="from-gray-50 via-white to-blue-50">Gray → White → Blue</option>
                    <option value="from-indigo-50 via-white to-indigo-100">Indigo → White → Indigo</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hero Images</CardTitle>
              <p className="text-sm text-gray-600">Manage the background images shown in the homepage hero</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                {heroImages.length === 0 && (
                  <div className="text-sm text-gray-600">No images yet. Add one below.</div>
                )}
                {heroImages.map((img, index) => (
                  <div key={img.id} className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div
                          className="w-full h-28 rounded-md bg-gray-100 border"
                          style={{ backgroundImage: img.url ? `url('${img.url}')` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <div className="mt-2">
                          <Label htmlFor={`file-${img.id}`}>Upload Image</Label>
                          <input
                            id={`file-${img.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleHeroImageUpload(index, file);
                            }}
                          />
                          {uploadingImageId === img.id && (
                            <p className="text-xs text-gray-500 mt-1">Uploading...</p>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input value={img.url} onChange={(e) => updateHeroImage(index, 'url', e.target.value)} placeholder="https://..." />
                        <Label>Title</Label>
                        <Input value={img.title} onChange={(e) => updateHeroImage(index, 'title', e.target.value)} placeholder="Title" />
                        <Label>Description</Label>
                        <RichTextEditor 
                          value={img.description || ''} 
                          onChange={(value) => updateHeroImage(index, 'description', value)} 
                          placeholder="Hero image description..."
                          showImageUpload={false}
                          showLinkInsert={false}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Opacity</Label>
                        <input type="range" min={0} max={100} value={img.opacity} onChange={(e) => updateHeroImage(index, 'opacity', Number(e.target.value))} />
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={img.isActive} onChange={(e) => updateHeroImage(index, 'isActive', e.target.checked)} id={`active-${img.id}`} />
                          <Label htmlFor={`active-${img.id}`}>Active</Label>
                        </div>
                        <Label>Order</Label>
                        <Input type="number" value={img.order} onChange={(e) => updateHeroImage(index, 'order', Number(e.target.value))} />
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => moveHeroImage(index, 'up')}>Move Up</Button>
                          <Button variant="outline" size="sm" onClick={() => moveHeroImage(index, 'down')}>Move Down</Button>
                          <Button variant="destructive" size="sm" onClick={() => removeHeroImage(img.id)}>Remove</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={addHeroImage}>Add Image</Button>
                <Button onClick={saveHero} disabled={isHeroSaving}>
                  {isHeroSaving ? 'Saving...' : 'Save Hero'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

