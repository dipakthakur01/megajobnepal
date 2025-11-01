import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { RichTextEditor } from '../ui/rich-text-editor';
import { Label } from '../ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  Search,
  Calendar,
  User,
  Image as ImageIcon,
  Upload,
  Save
} from 'lucide-react';
import { toast } from 'sonner';
import { dbService } from '@/lib/db-service';

export function BlogManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Load blogs/news from local storage (via dbService)
  const [blogs, setBlogs] = useState<any[]>(() => {
    try {
      const data = dbService.getBlogs?.();
      return Array.isArray(data) && data.length ? data : [
        {
          id: '1',
          title: 'Top 10 Interview Tips for Job Seekers in Nepal',
          slug: 'top-10-interview-tips-nepal',
          excerpt: 'Master the art of job interviews with these proven tips specifically tailored for the Nepali job market.',
          content: 'Full content here...',
          author: 'Admin User',
          category: 'Career Tips',
          status: 'published',
          publishDate: '2024-01-15',
          views: 1234,
          featured: true,
          tags: ['interview', 'career', 'tips'],
          seoTitle: 'Top 10 Interview Tips for Job Seekers in Nepal - MegaJobNepal',
          seoDescription: 'Master job interviews in Nepal with these expert tips...'
        },
        {
          id: '2',
          title: 'IT Job Market Trends in Nepal 2024',
          slug: 'it-job-market-trends-nepal-2024',
          excerpt: 'Explore the latest trends and opportunities in the IT sector across Nepal.',
          content: 'Full content here...',
          author: 'Content Manager',
          category: 'Industry News',
          status: 'published',
          publishDate: '2024-01-12',
          views: 987,
          featured: false,
          tags: ['IT', 'market', 'trends'],
          seoTitle: 'IT Job Market Trends in Nepal 2024 - MegaJobNepal',
          seoDescription: 'Latest IT job trends in Nepal...'
        }
      ];
    } catch {
      return [];
    }
  });
  const [news, setNews] = useState<any[]>(() => {
    try {
      const data = dbService.getNews?.();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  });

  useEffect(() => {
    // keep localStorage in sync when blogs or news change
    try { dbService.saveBlogs?.(blogs); } catch { /* noop */ }
    try { dbService.saveNews?.(news); } catch { /* noop */ }
  }, [blogs, news]);

  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured: false,
    seoTitle: '',
    seoDescription: '',
    status: 'draft'
  });

  const categories = [
    'Career Tips',
    'Industry News',
    'Company Spotlight',
    'Job Market Trends',
    'Interview Guides',
    'Resume Writing',
    'Salary Insights',
    'Work Culture'
  ];

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (Array.isArray(blog.tags) ? blog.tags : (blog.tags || '').split(',')).some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleCreatePost = () => {
    if (!newPost.title.trim()) {
      toast.error('Title is required');
      return;
    }
    const post = {
      id: Date.now().toString(),
      ...newPost,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      publishDate: new Date().toISOString(),
      views: 0,
      author: 'Super Admin'
    };
    setBlogs([post, ...blogs]);
    setNewPost({ title: '', excerpt: '', content: '', category: '', tags: '', featured: false, seoTitle: '', seoDescription: '', status: 'draft' });
    toast.success('Blog post created');
    setIsCreateOpen(false);
  };

  const handleEditPost = (post: any) => {
    setEditingPost({ ...post, tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '') });
  };

  const handleUpdatePost = () => {
    if (!editingPost) return;

    setBlogs(blogs.map(blog => 
      blog.id === editingPost.id 
        ? {
            ...editingPost,
            tags: editingPost.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
          }
        : blog
    ));
    setEditingPost(null);
    toast.success('Blog post updated successfully!');
  };

  const handleDeletePost = (id: string) => {
    setBlogs(blogs.filter(blog => blog.id !== id));
    toast.success('Blog post deleted successfully!');
  };

  const togglePostStatus = (id: string) => {
    setBlogs(blogs.map(blog => 
      blog.id === id 
        ? { ...blog, status: blog.status === 'published' ? 'draft' : 'published' }
        : blog
    ));
    toast.success('Post status updated!');
  };

  const renderPostForm = (post: any, setPost: (next: any) => void) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={post.title} onChange={(e) => setPost({ ...post, title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" value={post.category} onChange={(e) => setPost({ ...post, category: e.target.value })} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="excerpt">Excerpt</Label>
        <Textarea id="excerpt" value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <RichTextEditor 
          value={post.content} 
          onChange={(value) => setPost({ ...post, content: value })} 
          placeholder="Write your blog content here..."
          showImageUpload={true}
          showLinkInsert={true}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags (comma separated)</Label>
        <Input id="tags" value={post.tags} onChange={(e) => setPost({ ...post, tags: e.target.value })} />
      </div>
      <div className="flex justify-end">
        <Button onClick={handleCreatePost}>Create Post</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog & News Management</h2>
          <p className="text-gray-600">Manage blog posts, news articles, and content</p>
        </div>
        <Button onClick={() => { try { dbService.saveBlogs?.(blogs); dbService.saveNews?.(news); toast.success('Content saved'); } catch {} }} className="flex items-center gap-2">
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>

      <Tabs defaultValue="blogs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
          <TabsTrigger value="news">News Articles</TabsTrigger>
        </TabsList>

        {/* Blog Posts */}
        <TabsContent value="blogs" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> New Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Blog List */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {filteredBlogs.map((blog: any) => (
                  <div key={blog.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{blog.title}</h3>
                        <p className="text-sm text-gray-600">{blog.excerpt}</p>
                        <div className="text-xs text-gray-500">Category: {blog.category} • Status: {blog.status}</div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditPost(blog)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => togglePostStatus(blog.id)} className={blog.status === 'published' ? 'text-yellow-600' : 'text-green-600'}>
                          {blog.status === 'published' ? 'Unpublish' : 'Publish'}
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDeletePost(blog.id)} className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* News Articles */}
        <TabsContent value="news" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>News Articles ({news.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <Label htmlFor="newsTitle">Title</Label>
                <Input id="newsTitle" value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
              </div>
              <div className="space-y-3">
                <Label htmlFor="newsLink">Link</Label>
                <Input id="newsLink" value={newPost.excerpt} onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <Button onClick={() => {
                  const item = { id: Date.now().toString(), title: newPost.title, link: newPost.excerpt, published: new Date().toLocaleDateString() };
                  setNews([item, ...news]);
                  setNewPost({ ...newPost, title: '', excerpt: '' });
                  toast.success('News item created');
                }}>Add News</Button>
              </div>
              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border rounded p-3">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-blue-600 break-all">{item.link}</div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setNews(news.filter(n => n.id !== item.id))} className="text-red-600">Delete</Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
          </DialogHeader>
          {editingPost && (
            <PostEditor post={editingPost} onSave={handleUpdatePost} onCancel={() => setEditingPost(null)} />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPost(null)}>Cancel</Button>
            <Button onClick={handleUpdatePost}>Update Post</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
          </DialogHeader>
          {renderPostForm(newPost, setNewPost)}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PostEditor({ post, onSave, onCancel }: { post: any, onSave: () => void, onCancel: () => void }) {
  if (!post) return null;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="editTitle">Title</Label>
          <Input id="editTitle" value={post.title} onChange={(e) => post.title = e.target.value} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editCategory">Category</Label>
          <Input id="editCategory" value={post.category} onChange={(e) => post.category = e.target.value} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="editExcerpt">Excerpt</Label>
        <Textarea id="editExcerpt" value={post.excerpt} onChange={(e) => post.excerpt = e.target.value} rows={3} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editContent">Content</Label>
        <RichTextEditor 
          value={post.content} 
          onChange={(value) => post.content = value} 
          placeholder="Write your blog content here..."
          showImageUpload={true}
          showLinkInsert={true}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="editTags">Tags (comma separated)</Label>
        <Input id="editTags" value={post.tags} onChange={(e) => post.tags = e.target.value} />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave}>Save Changes</Button>
      </div>
    </div>
  );
}
