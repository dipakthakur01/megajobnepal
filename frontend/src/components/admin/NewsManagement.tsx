import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit, Trash2, Play, ExternalLink, Eye, Calendar, Image as ImageIcon, FileVideo, FileText, Megaphone } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  type: 'youtube' | 'link' | 'image' | 'banner' | 'svg' | 'poster' | 'video' | 'announcement' | 'article';
  description?: string;
  thumbnail?: string;
  published: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const NewsManagement: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NewsItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    link: '',
    type: 'link' as NewsItem['type'],
    description: '',
    thumbnail: '',
    isActive: true
  });

  // Editable header title for sidebar
  const [headerTitle, setHeaderTitle] = useState<string>('News & Announcements');
  const [isSavingHeader, setIsSavingHeader] = useState<boolean>(false);

  // Load news items and header settings from backend API on component mount
  useEffect(() => {
    (async () => {
      // Load items from backend only; keep empty state if unavailable
      try {
        const apiResult = await apiClient.getNews({ status: 'all', limit: 20 });
        const items = Array.isArray((apiResult as any)?.news)
          ? (apiResult as any).news
          : Array.isArray(apiResult)
            ? (apiResult as any)
            : [];
        if (Array.isArray(items)) {
          const normalized = items.map((raw: any, idx: number) => ({
            id: String(raw?.id ?? raw?._id ?? `${raw?.link || raw?.title || 'item'}-${idx}`),
            title: String(raw?.title ?? 'Untitled'),
            link: String(raw?.link ?? raw?.url ?? '#'),
            type: (raw?.type ?? ((raw?.link && (String(raw.link).includes('youtube.com') || String(raw.link).includes('youtu.be'))) ? 'youtube' : 'link')),
            description: raw?.description ?? raw?.excerpt ?? '',
            thumbnail: raw?.thumbnail ?? raw?.image_url ?? undefined,
            published: raw?.published ?? raw?.publishDate ?? (raw?.published_at ? new Date(raw.published_at).toLocaleDateString() : ''),
            isActive: raw?.isActive !== undefined ? !!raw.isActive : true,
            createdAt: new Date(raw?.createdAt ?? raw?.created_at ?? raw?.updatedAt ?? raw?.updated_at ?? Date.now()),
            updatedAt: new Date(raw?.updatedAt ?? raw?.updated_at ?? raw?.publishDate ?? raw?.published_at ?? raw?.createdAt ?? raw?.created_at ?? Date.now()),
          } as any));
          // Dedupe normalized items before setting state
          const deduped = dedupeNewsItems(normalized as any);
          setNewsItems(deduped as any);

          // Targeted cleanup: remove specific test items and ensure featured first
          try {
            let cleaned = (deduped as any).filter((it: any) => {
              const t = String(it?.title || '').trim();
              return t !== 'Testing' && t !== 'Thakur Testing';
            });
            const featuredIdx = cleaned.findIndex((it: any) => String(it?.title || '').trim().toLowerCase() === 'thakur motivational song');
            if (featuredIdx > 0) {
              const featured = cleaned[featuredIdx];
              cleaned = [featured, ...cleaned.slice(0, featuredIdx), ...cleaned.slice(featuredIdx + 1)];
            }
            if ((cleaned as any).length !== (deduped as any).length) {
              await saveNewsItems(cleaned as any);
            }
          } catch {}
        }
      } catch (error) {
        // Keep empty state; UI will show helpful message
        console.warn('News load failed:', error);
      }

      // Load header title from site section settings
      try {
        const res = await apiClient.getSectionSettings('news_announcement');
        const title = (res as any)?.config?.headerTitle;
        if (title && typeof title === 'string') {
          setHeaderTitle(title);
        }
      } catch (err) {
        // keep default
      }
    })();
  }, []);

  // Save news items to backend API
  const saveNewsItems = async (items: NewsItem[]) => {
    // Dedupe before persisting
    const deduped = dedupeNewsItems(items);
    try {
      const svc = (await import('@/lib/db-service')).dbService;
      await svc.saveNews?.(deduped);
      setNewsItems(deduped);
      if (items.length !== deduped.length) {
        toast.success(`Removed ${items.length - deduped.length} duplicate${items.length - deduped.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Failed to save news items:', error);
      toast.error('Failed to save news items');
    }
  };

  // Save header title to site section settings
  const saveHeaderTitle = async () => {
    try {
      setIsSavingHeader(true);
      await apiClient.saveSectionSettings('news_announcement', { headerTitle }, true);
      toast.success('Header saved');
    } catch (error) {
      console.error('Error saving header title:', error);
      toast.error('Failed to save header');
    } finally {
      setIsSavingHeader(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.link.trim()) {
      toast.error('Title and link are required');
      return;
    }

    const now = new Date();
    
    if (editingItem) {
      // Update existing item
      const updatedItems = newsItems.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              ...formData,
              updatedAt: now
            }
          : item
      );
      saveNewsItems(updatedItems);
      toast.success('News item updated successfully');
    } else {
      // Create new item
      const newItem: NewsItem = {
        id: Date.now().toString(),
        ...formData,
        published: new Date().toLocaleDateString(),
        createdAt: now,
        updatedAt: now
      };
      
      const updatedItems = [newItem, ...newsItems];
      saveNewsItems(updatedItems);
      toast.success('News item created successfully');
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      link: '',
      type: 'link',
      description: '',
      thumbnail: '',
      isActive: true
    });
    setEditingItem(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (item: NewsItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      link: item.link,
      type: item.type,
      description: item.description || '',
      thumbnail: item.thumbnail || '',
      isActive: item.isActive
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this news item?')) {
      const updatedItems = newsItems.filter(item => item.id !== id);
      saveNewsItems(updatedItems);
      toast.success('News item deleted successfully');
    }
  };

  const toggleActive = (id: string) => {
    const updatedItems = newsItems.map(item =>
      item.id === id
        ? { ...item, isActive: !item.isActive, updatedAt: new Date() }
        : item
    );
    saveNewsItems(updatedItems);
    toast.success('Status updated successfully');
  };

  // NEW: Reset all news & video items
  const resetAllNewsItems = async () => {
    const confirmed = confirm('This will permanently remove all News & Video items. Continue?');
    if (!confirmed) return;
    try {
      await saveNewsItems([]);
      toast.success('All news & video items have been reset');
    } catch (err) {
      toast.error('Failed to reset items');
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&#\s]+)/);
    if (match && match[1]) return match[1];
    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    return embedMatch ? embedMatch[1] : null;
  };

  const generateYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  // --- Deduplication helpers ---
  const normalizeLink = (link?: string) => (link || '').trim().toLowerCase().replace(/\/$/, '');
  const getUniqueKey = (item: NewsItem) => {
    if (item.type === 'youtube') {
      const vid = getYouTubeVideoId(item.link);
      if (vid) return `yt:${vid}`;
    }
    if (item.link) return `link:${normalizeLink(item.link)}`;
    return `title:${(item.title || '').trim().toLowerCase()}`;
  };
  const dedupeNewsItems = (items: NewsItem[]) => {
    const map = new Map<string, NewsItem>();
    for (const it of items) {
      const key = getUniqueKey(it);
      const existing = map.get(key);
      if (!existing) {
        map.set(key, it);
      } else {
        // Keep the newest/most recently updated
        const existingUpdated = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
        const currentUpdated = it.updatedAt ? new Date(it.updatedAt).getTime() : 0;
        map.set(key, currentUpdated >= existingUpdated ? { ...existing, ...it } : existing);
      }
    }
    return Array.from(map.values()).sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  };

  const handleLinkChange = (link: string) => {
    setFormData(prev => {
      const newData: any = { ...prev, link };
      
      // Auto-detect YouTube links and generate thumbnail
      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        newData.type = 'youtube';
        const thumbnail = generateYouTubeThumbnail(link);
        if (thumbnail) {
          newData.thumbnail = thumbnail;
        }
      }
      
      return newData;
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">News & Announcements</h2>
          <p className="text-gray-600">Manage news items, media banners and videos for the homepage sidebar</p>
          {/* Editable header title */}
          <div className="mt-3 flex items-center gap-2">
            <Input
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Sidebar header title (e.g., News & Announcements)"
              className="max-w-xs"
            />
            <Button onClick={saveHeaderTitle} disabled={isSavingHeader}>
              {isSavingHeader ? 'Saving...' : 'Save Header'}
            </Button>
            {/* NEW: Reset All button */}
            <Button
              type="button"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={resetAllNewsItems}
            >
              Reset All
            </Button>
          </div>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="w-4 h-4 mr-2" />
              Add News Item
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl" aria-describedby="news-form-description">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit News Item' : 'Add News Item'}
              </DialogTitle>
              <DialogDescription id="news-form-description">
                {editingItem ? 'Update the news announcement details below.' : 'Create a new news announcement for the homepage.'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter news title"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: NewsItem['type']) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">General Link</SelectItem>
                      <SelectItem value="youtube">YouTube Video</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="banner">Banner</SelectItem>
                      <SelectItem value="svg">Animated SVG</SelectItem>
                      <SelectItem value="poster">Poster</SelectItem>
                      <SelectItem value="video">Video (MP4/Embed)</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {formData.type === 'youtube' ? 'YouTube URL *' : 'Link or Media URL *'}
                </label>
                <Input
                  value={formData.link}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder={
                    formData.type === 'youtube' 
                      ? "https://www.youtube.com/watch?v=..." 
                      : "https://example.com or https://cdn.com/image.jpg"
                  }
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Thumbnail URL (optional)</label>
                <Input
                  value={formData.thumbnail}
                  onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                  placeholder={formData.type === 'youtube' ? 'Auto-generated for YouTube if empty' : 'Provide a small preview image URL'}
                />
                {formData.thumbnail && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formData.thumbnail}
                      alt="Thumbnail preview"
                      className="w-32 h-18 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <Badge variant="outline" className="flex items-center gap-1">
                      {formData.type === 'youtube' ? <Play className="w-3 h-3" /> : null}
                      {['image','banner','poster','svg'].includes(formData.type) ? <ImageIcon className="w-3 h-3" /> : null}
                      {formData.type === 'video' ? <FileVideo className="w-3 h-3" /> : null}
                      {formData.type === 'announcement' ? <Megaphone className="w-3 h-3" /> : null}
                      {formData.type === 'article' ? <FileText className="w-3 h-3" /> : null}
                      <span className="text-xs">{formData.type}</span>
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium">
                  Active (visible on homepage)
                </label>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingItem ? 'Update' : 'Create'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* News Items List */}
      <div className="grid gap-4">
        {newsItems.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No news items yet. Create your first announcement!</p>
            </CardContent>
          </Card>
        ) : (
          newsItems.map((item, index) => (
            <Card key={(item as any).id || (item as any)._id || `${item.link || item.title}-${index}`} className={`${!item.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {item.type === 'youtube' ? (
                          <Play className="w-4 h-4 text-red-500" />
                        ) : ['image','banner','poster','svg'].includes(item.type) ? (
                          <ImageIcon className="w-4 h-4 text-green-600" />
                        ) : item.type === 'video' ? (
                          <FileVideo className="w-4 h-4 text-purple-600" />
                        ) : item.type === 'announcement' ? (
                          <Megaphone className="w-4 h-4 text-orange-600" />
                        ) : item.type === 'article' ? (
                          <FileText className="w-4 h-4 text-blue-600" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                        )}
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                      </div>
                      
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <Badge variant="outline">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Published: {item.published || '—'}
                      </span>
                      <span>Updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '—'}</span>
                    </div>
                    
                    <div className="mt-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline break-all"
                      >
                        {item.link}
                      </a>
                    </div>
                  </div>
                  
                  {/* Thumbnail */}
                  {item.thumbnail && (
                    <div className="ml-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-20 h-12 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="ml-4 flex gap-2 flex-nowrap items-center">
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => window.open(item.link, '_blank')}
                       aria-label="Preview"
                     >
                       <Eye className="w-4 h-4" />
                     </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => handleEdit(item)}
                       aria-label="Edit"
                     >
                       <Edit className="w-4 h-4" />
                     </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => toggleActive(item.id)}
                       aria-label={item.isActive ? 'Hide' : 'Show'}
                     >
                       {item.isActive ? 'Hide' : 'Show'}
                     </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       className="border-red-300 text-red-700 hover:bg-red-50"
                       onClick={() => handleDelete(item.id)}
                       aria-label="Delete"
                     >
                       <Trash2 className="w-4 h-4 mr-1" />
                       Delete
                     </Button>
                   </div>
                 </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Usage Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <div>
            <strong>YouTube Videos:</strong> Paste any YouTube URL to automatically create a video player in the sidebar.
            The thumbnail will be auto-generated.
          </div>
          <div>
            <strong>Images/Banners/Posters/SVG:</strong> Provide a media URL and optional thumbnail for preview.
          </div>
          <div>
            <strong>General Links & Articles:</strong> Add external links that will open in a new tab when clicked.
          </div>
          <div>
            <strong>Active Status:</strong> Only active items will be displayed on the homepage sidebar.
            The first active YouTube video will be featured.
          </div>
          <div>
            <strong>Header Title:</strong> Use the header input above to change the sidebar header text.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
