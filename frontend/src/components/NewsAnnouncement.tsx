import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
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
  const [flipFeatured, setFlipFeatured] = React.useState(false);

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

  return (
    <div className="space-y-3 news-announcement-container">{/* Enhanced responsive container */}
      {/* Featured Video Section */}
      {featuredVideo && (
        <Card className="bg-white shadow-md rounded-xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs flex items-center gap-1.5 bg-primary text-primary-foreground px-2 py-1 rounded-lg">
              <Play className="w-3 h-3" />
              News & Announcements
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div 
              className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden"
            >
              {/* Prefer thumbnail; fallback to embed; else show icon */}
              {featuredVideo.thumbnail ? (
                <a
                  href={featuredVideo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={featuredVideo.title || 'Open video on YouTube'}
                  className="block w-full h-full"
                >
                  <img
                    src={featuredVideo.thumbnail}
                    alt={featuredVideo.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </a>
              ) : getYouTubeEmbedUrl(featuredVideo.link) ? (
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
              {/* Clickable overlay for iframe to open video in new tab */}
              {getYouTubeEmbedUrl(featuredVideo.link) && (
                <a
                  href={featuredVideo.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={featuredVideo.title || 'Open video on YouTube'}
                  className="absolute inset-0 z-10"
                  title={featuredVideo.title || 'Open on YouTube'}
                />
              )}
              <div className="absolute top-2 right-2">
                <div className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                  Video
                </div>
              </div>
            </div>
            {/* Metadata under featured video */}
            <div className="mt-2">
              {featuredVideo.title && (
                <h4 className="font-medium text-xs text-gray-900 mb-1 line-clamp-2">
                  {featuredVideo.title}
                </h4>
              )}
              {(featuredVideo.published || featuredVideo.description) && (
                <div className="space-y-1">
                  {featuredVideo.published && (
                    <span className="text-xs text-gray-500 block">
                      {featuredVideo.published}
                    </span>
                  )}
                  {featuredVideo.description && (
                    <p className="text-xs text-gray-600 line-clamp-3">
                      {featuredVideo.description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Latest Updates Section - Enhanced & Attractive Layout */}
      <Card className="bg-gradient-to-br from-white via-orange-50/30 to-red-50/50 shadow-lg rounded-xl border border-orange-100/50 overflow-hidden" style={{ maxHeight: '500px' }}>
        <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-red-500">
          <CardTitle className="text-sm flex items-center gap-2 text-white font-semibold">
            <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
              <NewspaperIcon className="w-3 h-3" />
            </div>
            News & Announcements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 md:p-6 pt-3 sm:pt-4 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-orange-50 hover:scrollbar-thumb-orange-400">
          <div className="space-y-4 sm:space-y-5">
            {displayItems
              .filter(item => item !== featuredVideo)
              .map((item, index) => (
                <div key={`${(item as any)._id || (item as any).id || item.link || item.title || 'item'}-${index}`} className="group relative">
                  <div className="flex items-start gap-3 sm:gap-4 md:gap-5 p-3 sm:p-4 md:p-5 rounded-xl bg-white/80 hover:bg-white hover:shadow-md border border-gray-100/50 hover:border-orange-200/50 transition-all duration-300 cursor-pointer"
                       onClick={() => {
                         if (item.link && item.link !== '#') {
                           window.open(item.link, '_blank', 'noopener,noreferrer');
                         }
                       }}>
                    {/* Type Icon - Properly Sized and Aligned */}
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 group-hover:from-orange-200 group-hover:to-red-200 transition-all duration-300 shadow-sm">
                        {item.type === 'youtube' ? (
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                        ) : (
                          <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                        )}
                      </div>
                    </div>
                    
                    {/* Content - Better Spacing and Layout */}
                    <div className="flex-1 min-w-0 space-y-2 sm:space-y-3 overflow-hidden">
                      <div className="flex items-start justify-between gap-3 sm:gap-4 md:gap-5">
                        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 group-hover:text-orange-700 leading-snug transition-colors duration-300 pr-1 sm:pr-2 flex-1 min-w-0">
                          <span className="line-clamp-2 block">
                            {item.title}
                          </span>
                        </h4>
                        
                        {/* Action Buttons - Better Positioned */}
                        <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 hover:bg-orange-100 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add bookmark functionality here
                            }}
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 sm:h-8 sm:w-8 md:h-9 md:w-9 p-0 hover:bg-orange-100 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Add share functionality here
                            }}
                          >
                            <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500 hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-xs text-gray-600 leading-relaxed pr-2 min-w-0 overflow-hidden">
                          <span className="line-clamp-2 block break-words">
                            {item.description}
                          </span>
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between pt-2 sm:pt-3 gap-3 sm:gap-4">
                        <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap min-w-0 flex-1">
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {item.published && (
                              <span className="flex-shrink-0">{item.published}</span>
                            )}
                          </div>
                          {item.type && (
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="text-gray-300 flex-shrink-0">•</span>
                              <span className="capitalize text-xs px-2 py-1 bg-gradient-to-r from-orange-100 to-red-100 rounded-full text-orange-700 font-medium whitespace-nowrap max-w-full overflow-hidden text-ellipsis">
                                {item.type === 'youtube' ? 'Video' : item.type === 'market-analysis' ? 'Market Analysis' : 'Article'}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Arrow indicator on hover */}
                        <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex-shrink-0">
                          <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links Section */}
      <Card className="bg-white shadow-md rounded-xl overflow-hidden" style={{ maxHeight: '300px' }}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xs flex items-center gap-1.5 bg-blue-500 text-white px-3 py-1.5 rounded-lg font-medium">
            <ExternalLink className="w-3 h-3" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0 overflow-y-auto max-h-48 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-blue-50 hover:scrollbar-thumb-blue-400">
          <div className="space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/jobs', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Browse Jobs</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/companies', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Companies</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/career-guide', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Career Guide</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/salary-guide', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Salary Guide</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/resume-builder', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Resume Builder</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/interview-tips', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Interview Tips</span>
              </div>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs h-7 justify-start px-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
              onClick={() => window.open('https://www.megajobnepal.com.np/contact', '_blank')}
            >
              <div className="flex items-center gap-1.5 w-full min-w-0">
                <ExternalLink className="w-2.5 h-2.5 text-gray-400 flex-shrink-0" />
                <span className="truncate text-left font-medium">Contact Us</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

