import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Play, ExternalLink, NewspaperIcon } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  link: string;
  type: 'youtube' | 'link';
  description?: string;
  thumbnail?: string;
  published?: string;
}

interface NewsAnnouncementProps {
  newsItems?: NewsItem[];
}

export const NewsAnnouncement: React.FC<NewsAnnouncementProps> = ({ newsItems = [] }) => {
  const [managedNewsItems, setManagedNewsItems] = React.useState<NewsItem[]>([]);

  // Load news items from backend API (managed by admin)
  React.useEffect(() => {
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
    })();
  }, []);

  // Default news items if none provided
  const defaultNewsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Career Development Tips',
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube',
      description: 'Essential tips for career growth in Nepal',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      published: '2 days ago'
    },
    {
      id: '2',
      title: 'Job Market Updates',
      link: '#',
      type: 'link',
      description: 'Latest trends in Nepal job market',
      published: '1 day ago'
    },
    {
      id: '3',
      title: 'Interview Success Guide',
      link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'youtube',
      description: 'How to ace your job interviews',
      thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
      published: '3 days ago'
    }
  ];

  // Use managed items if available, otherwise use provided or default items
  const displayItems = managedNewsItems.length > 0 ? managedNewsItems : 
                      (newsItems.length > 0 ? newsItems : defaultNewsItems);
  const featuredVideo = displayItems.find(item => item.type === 'youtube');

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/[?&]v=([^&]+)/);
    return match ? match[1] : null;
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = getYouTubeVideoId(url);
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  };

  return (
    <div className="w-full space-y-4">
      {/* Featured Video Section */}
      {featuredVideo && (
        <Card className="bg-white shadow-md rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1 rounded-lg">
              <Play className="w-3 h-3" />
              News & Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {/* YouTube Video Player - Smaller */}
              <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                {getYouTubeEmbedUrl(featuredVideo.link) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(featuredVideo.link) || undefined}
                    title={featuredVideo.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <Play className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              
              {/* Video Title & Description - Condensed */}
              <div>
                <h4 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">
                  {featuredVideo.title}
                </h4>
                {featuredVideo.published && (
                  <span className="text-xs text-gray-500">
                    {featuredVideo.published}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Updates Section - Compact */}
      <Card className="bg-white shadow-md rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5 bg-orange-500 text-white px-2 py-1 rounded-lg">
            <NewspaperIcon className="w-3 h-3" />
            Recent Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            {displayItems
              .filter(item => item.id !== featuredVideo?.id)
              .slice(0, 3)
              .map((item) => (
                <div key={item.id} className="group">
                  <Button
                    variant="ghost"
                    className="w-full justify-start p-1.5 h-auto text-left hover:bg-gray-50 rounded-lg"
                    onClick={() => {
                      if (item.link && item.link !== '#') {
                        window.open(item.link, '_blank', 'noopener,noreferrer');
                      }
                    }}
                  >
                    <div className="flex items-start gap-1.5 w-full">
                      <div className="flex-shrink-0 mt-0.5">
                        {item.type === 'youtube' ? (
                          <Play className="w-2.5 h-2.5 text-red-500" />
                        ) : (
                          <ExternalLink className="w-2.5 h-2.5 text-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-gray-900 group-hover:text-primary line-clamp-2">
                          {item.title}
                        </div>
                        {item.published && (
                          <div className="text-xs text-gray-400 mt-0.5">
                            {item.published}
                          </div>
                        )}
                      </div>
                    </div>
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links Section - Minimal */}
      <Card className="bg-white shadow-md rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5 bg-green-500 text-white px-2 py-1 rounded-lg">
            <ExternalLink className="w-3 h-3" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs p-1.5 h-auto rounded-lg"
              onClick={() => window.open('https://www.megajobnepal.com.np/jobs', '_blank')}
            >
              → Browse Jobs
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs p-1.5 h-auto rounded-lg"
              onClick={() => window.open('https://www.megajobnepal.com.np/companies', '_blank')}
            >
              → Companies
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-xs p-1.5 h-auto rounded-lg"
              onClick={() => window.open('https://www.megajobnepal.com.np/career-guide', '_blank')}
            >
              → Career Guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

