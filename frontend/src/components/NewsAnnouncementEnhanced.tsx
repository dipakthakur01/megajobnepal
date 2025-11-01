import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Play, 
  ExternalLink, 
  NewspaperIcon, 
  TrendingUp, 
  Clock, 
  Eye,
  Share2,
  Bookmark,
  ChevronRight,
  Calendar,
  Users,
  Star,
  Bell,
  ArrowUpRight
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  type: 'youtube' | 'link' | 'article' | 'announcement' | 'image' | 'banner' | 'svg' | 'poster' | 'video';
  description?: string;
  thumbnail?: string;
  published?: string;
  category?: string;
  views?: number;
  isNew?: boolean;
  isPinned?: boolean;
  author?: string;
}

interface NewsAnnouncementEnhancedProps {
  newsItems?: NewsItem[];
  showViewCount?: boolean;
  enableBookmarks?: boolean;
  maxItems?: number;
}

export const NewsAnnouncementEnhanced: React.FC<NewsAnnouncementEnhancedProps> = ({ 
  newsItems = [], 
  showViewCount = true,
  enableBookmarks = true,
  maxItems = 5
}) => {
  const [managedNewsItems, setManagedNewsItems] = useState<NewsItem[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [headerTitle, setHeaderTitle] = useState<string>('News & Announcements');
  const [flipFeatured, setFlipFeatured] = useState(false);

  // Load news items from backend API (managed by admin)
  useEffect(() => {
    (async () => {
      try {
        const svc = (await import('@/lib/db-service')).dbService;
        const items = await svc.getNews?.({ status: 'all' });
        if (Array.isArray(items)) {
          const activeItems = items.filter((item: any) => item.isActive);
          setManagedNewsItems(activeItems);
        }
      } catch (error) {
        console.error('Error loading news items from API:', error);
      }

      // Load editable header from site settings
      try {
        const settings = await apiClient.getSectionSettings('news_announcement');
        const title = settings?.config?.headerTitle;
        if (title && typeof title === 'string') {
          setHeaderTitle(title);
        }
      } catch (err) {
        // keep default
      }
    })();

    // Load bookmarked items (user preference stays client-side)
    const bookmarks = localStorage.getItem('megajobnepal_bookmarked_news');
    if (bookmarks) {
      try {
        setBookmarkedItems(JSON.parse(bookmarks));
      } catch (error) {
        console.error('Error loading bookmarks:', error);
      }
    }
  }, []);

  // Enhanced default news items with more variety
  const defaultNewsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Career Development Tips for 2024',
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube',
      description: 'Essential tips for career growth in Nepal\'s evolving job market',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      published: '2 days ago',
      category: 'Career Tips',
      views: 1250,
      isNew: true,
      author: 'Career Expert'
    },
    {
      id: '2',
      title: 'Top IT Companies Hiring in Nepal',
      link: '#',
      type: 'article',
      description: 'Discover the leading technology companies actively recruiting in Nepal',
      published: '1 day ago',
      category: 'Job Market',
      views: 890,
      isPinned: true,
      author: 'Job Market Analyst'
    },
    {
      id: '3',
      title: 'Salary Negotiation Strategies',
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube',
      description: 'Learn how to negotiate better salaries in the Nepali job market',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      published: '3 days ago',
      category: 'Career Growth',
      views: 2100,
      author: 'HR Professional'
    },
    {
      id: '4',
      title: 'Government Job Exam Updates',
      link: '#',
      type: 'announcement',
      description: 'Latest updates on upcoming government job examinations and requirements',
      published: '2 days ago',
      category: 'Government Jobs',
      views: 3200,
      isPinned: false,
      author: 'Government Affairs'
    },
    {
      id: '5',
      title: 'Freelancing in Nepal: Getting Started',
      link: '#',
      type: 'link',
      description: 'A comprehensive guide to starting your freelancing career from Nepal',
      published: '5 days ago',
      category: 'Freelancing',
      views: 1420,
      author: 'Freelance Expert'
    }
  ];

  const displayItems = managedNewsItems.length > 0 ? managedNewsItems : 
                      (newsItems.length > 0 ? newsItems : defaultNewsItems);
  
  // Sort items: pinned first, then by date
  const sortedItems = [...displayItems]
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    })
    .slice(0, maxItems);

  const featuredVideo = sortedItems.find(item => item.type === 'youtube');

  const getYouTubeVideoId = (url: string) => {
    const m1 = url.match(/[?&]v=([^&]+)/);
    if (m1 && m1[1]) return m1[1];
    const m2 = url.match(/youtu\.be\/([^?&#\s]+)/);
    if (m2 && m2[1]) return m2[1];
    const m3 = url.match(/embed\/([a-zA-Z0-9_-]+)/);
    return m3 ? m3[1] : null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  const getYouTubeThumbnail = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'youtube': return <Play className="w-3 h-3 text-red-500" />;
      case 'article': return <NewspaperIcon className="w-3 h-3 text-blue-500" />;
      case 'announcement': return <Bell className="w-3 h-3 text-orange-500" />;
      default: return <ExternalLink className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'youtube': return 'bg-red-100 text-red-700 border-red-200';
      case 'article': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'announcement': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleBookmark = (itemId: string) => {
    if (!enableBookmarks) return;
    
    const newBookmarks = bookmarkedItems.includes(itemId)
      ? bookmarkedItems.filter(id => id !== itemId)
      : [...bookmarkedItems, itemId];
    
    setBookmarkedItems(newBookmarks);
    localStorage.setItem('megajobnepal_bookmarked_news', JSON.stringify(newBookmarks));
  };

  const handleShare = (item: NewsItem) => {
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: item.description,
        url: item.link
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${item.title} - ${item.link}`);
    }
  };

  return (
    <div className="w-64 space-y-3">
      {/* Featured Video Section - Enhanced */}
      {featuredVideo && (
        <Card className="bg-white shadow-lg rounded-xl border-0 overflow-hidden group hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-red-50 to-pink-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs flex items-center gap-1.5 bg-red-500 text-white px-3 py-1.5 rounded-full font-medium">
                <Play className="w-3 h-3" />
                {headerTitle}
              </CardTitle>
              {featuredVideo.isNew && (
                <Badge className="bg-green-500 text-white text-xs px-2 py-0.5">
                  NEW
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            <div className="space-y-2">

              {/* Enhanced Video Player / Thumbnail with click-through */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
                {featuredVideo.thumbnail ? (
                  <a
                    href={featuredVideo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                    aria-label={featuredVideo.title || 'Open video on YouTube'}
                  >
                    <img
                      src={featuredVideo.thumbnail}
                      alt={featuredVideo.title || 'YouTube video thumbnail'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </a>
                ) : getYouTubeThumbnail(featuredVideo.link) ? (
                  <a
                    href={featuredVideo.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full"
                    aria-label={featuredVideo.title || 'Open video on YouTube'}
                  >
                    <img
                      src={getYouTubeThumbnail(featuredVideo.link) || undefined}
                      alt={featuredVideo.title || 'YouTube video thumbnail'}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </a>
                ) : getYouTubeEmbedUrl(featuredVideo.link) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(featuredVideo.link) || undefined}
                    title={featuredVideo.title || 'YouTube video'}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <Play className="w-12 h-12 text-gray-400" />
                  </div>
                )}

                {/* Overlay CTA for thumbnails */}
                {(featuredVideo.thumbnail || getYouTubeThumbnail(featuredVideo.link)) && (
                  <div className="absolute bottom-2 right-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs bg-white/90 hover:bg-white"
                      onClick={() => window.open(featuredVideo.link, '_blank')}
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" /> Open
                    </Button>
                  </div>
                )}
              </div>

              {/* Metadata: title, date, description */}
              <div className="space-y-1">
                <a
                  href={featuredVideo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-700 hover:underline line-clamp-2"
                >
                  {featuredVideo.title || 'YouTube Video'}
                </a>
                {featuredVideo.description && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {featuredVideo.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>{featuredVideo.published || 'Recently added'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}


      {/* Enhanced Quick Links Section */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-xs flex items-center gap-1.5 bg-green-500 text-white px-3 py-1.5 rounded-full font-medium">
            <Users className="w-3 h-3" />
            Quick Access
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="space-y-2">
            {[
              { label: 'Browse All Jobs', url: '/jobs', icon: '🔍' },
              { label: 'Top Companies', url: '/companies', icon: '🏢' },
              { label: 'Career Resources', url: '/career-guide', icon: '📚' },
              { label: 'Salary Guide', url: '/salary-guide', icon: '💰' }
            ].map((link, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs p-2.5 h-auto rounded-lg hover:bg-white/70 hover:shadow-sm transition-all duration-200 group"
                onClick={() => window.open(`https://www.megajobnepal.com.np${link.url}`, '_blank')}
              >
                <span className="mr-2 group-hover:scale-110 transition-transform duration-200">
                  {link.icon}
                </span>
                {link.label}
                <ChevronRight className="w-3 h-3 ml-auto text-gray-400 group-hover:text-green-600 group-hover:translate-x-0.5 transition-all duration-200" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
