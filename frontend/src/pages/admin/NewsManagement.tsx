import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit, Trash2, Play, ExternalLink, Eye, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  type: 'youtube' | 'link';
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
    type: 'link' as 'youtube' | 'link',
    description: '',
    thumbnail: '',
    isActive: true
  });

  // Load news items from backend API on component mount
  useEffect(() => {
    (async () => {
      try {
        const items = await (await import('@/lib/db-service')).dbService.getNews?.({ status: 'all' });
        if (Array.isArray(items)) {
          // Persist a deduped list to the backend and state
          await saveNewsItems(items as NewsItem[]);
        }
      } catch (error) {
        console.error('Error loading news items from API:', error);
      }
    })();
  }, []);

  // Save news items to backend API
  const saveNewsItems = async (items: NewsItem[]) => {
    // Dedupe before persisting
    const deduped = dedupeNewsItems(items);
    try {
      await (await import('@/lib/db-service')).dbService.saveNews?.(deduped);
      setNewsItems(deduped);
      if (items.length !== deduped.length) {
        toast.success(`Removed ${items.length - deduped.length} duplicate${items.length - deduped.length > 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Error saving news items to API:', error);
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

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
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
      const newData = { ...prev, link };
      
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
          <p className="text-gray-600">Manage news items and YouTube videos for the homepage sidebar</p>
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
                    onValueChange={(value: 'youtube' | 'link') => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="link">General Link</SelectItem>
                      <SelectItem value="youtube">YouTube Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {formData.type === 'youtube' ? 'YouTube URL *' : 'Link URL *'}
                </label>
                <Input
                  value={formData.link}
                  onChange={(e) => handleLinkChange(e.target.value)}
                  placeholder={
                    formData.type === 'youtube' 
                      ? "https://www.youtube.com/watch?v=..." 
                      : "https://example.com"
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
              
              {formData.type === 'youtube' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Thumbnail URL</label>
                  <Input
                    value={formData.thumbnail}
                    onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))}
                    placeholder="Auto-generated for YouTube videos"
                  />
                  {formData.thumbnail && (
                    <div className="mt-2">
                      <img
                        src={formData.thumbnail}
                        alt="Thumbnail preview"
                        className="w-32 h-18 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
              
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
            <Card key={`${(item as any)._id || (item as any).id || item.link || item.title || 'item'}-${index}`} className={`${!item.isActive ? 'opacity-60' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        {item.type === 'youtube' ? (
                          <Play className="w-4 h-4 text-red-500" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-blue-500" />
                        )}
                        <h3 className="font-medium text-gray-900">{item.title}</h3>
                      </div>
                      
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      
                      <Badge variant="outline">
                        {item.type === 'youtube' ? 'YouTube' : 'Link'}
                      </Badge>
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Published: {item.published}
                      </span>
                      <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
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
                      -                     variant="destructive"
                      +                     variant="outline"
                      +                     className="border-red-300 text-red-700 hover:bg-red-50"
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
            <strong>General Links:</strong> Add external links that will open in a new tab when clicked.
          </div>
          <div>
            <strong>Active Status:</strong> Only active items will be displayed on the homepage sidebar.
            The first active YouTube video will be featured with a player.
          </div>
          <div>
            <strong>Order:</strong> Items are displayed in the order they were created (newest first).
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
