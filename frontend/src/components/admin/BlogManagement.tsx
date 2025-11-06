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
import { blogService } from '@/services/blogService';

export function BlogManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);

  // Remove mock data: always start empty and use backend data only
  const defaultMockBlogs: any[] = [];

  const [blogs, setBlogs] = useState<any[]>([]);

  // Remove auto-save on every change to avoid heavy JSON stringify and network writes
  // Saving is now explicit via the "Save" button only.

  useEffect(() => {
    const normalize = (b: any) => ({
      ...b,
      id: b?.id || b?._id || String(b?._id || b?.id || Date.now())
    });
    const loadBlogs = async () => {
      try {
        // Limit initial payload to reduce render cost on load
        const res = await blogService.list({ limit: 20 });
        const list = Array.isArray(res) ? res : (res?.blogs || res?.items || []);
        if (Array.isArray(list) && list.length) {
          setBlogs(list.map(normalize));
          return;
        }
      } catch (err) {
        console.warn('Failed to load blogs from backend, falling back:', err);
      }
      // No local/mock fallback: show empty list if backend returns nothing
      setBlogs(defaultMockBlogs);
    };

    loadBlogs();
  }, []);

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

  const filteredBlogs = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return blogs.filter((blog) => {
      const title = String(blog.title || '').toLowerCase();
      const excerpt = String(blog.excerpt || '').toLowerCase();
      const tagsArr = Array.isArray(blog.tags) ? blog.tags : String(blog.tags || '').split(',');
      const matchesSearch = title.includes(term) ||
        excerpt.includes(term) ||
        tagsArr.some((tag: string) => String(tag).toLowerCase().includes(term));
      const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [blogs, searchTerm, statusFilter, categoryFilter]);

  const handleCreatePost = async () => {
    if (!newPost.title.trim()) {
      toast.error('Title is required');
      return;
    }
    const payload: any = {
      title: newPost.title,
      slug: newPost.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      excerpt: newPost.excerpt,
      content: newPost.content,
      author: 'Super Admin',
      category: newPost.category,
      status: newPost.status,
      published: newPost.status === 'published',
      published_at: new Date().toISOString(),
      featured: newPost.featured,
      tags: newPost.tags.split(',').map(t => t.trim()).filter(Boolean),
      seoTitle: newPost.seoTitle,
      seoDescription: newPost.seoDescription
    };
    try {
      const created = await blogService.create(payload);
      const normalized = (Array.isArray(created) ? created[0] : created) || payload;
      setBlogs([ { ...(normalized as any), id: (normalized as any)?.id || (normalized as any)?._id || String(Date.now()) }, ...blogs ]);
      setNewPost({ title: '', excerpt: '', content: '', category: '', tags: '', featured: false, seoTitle: '', seoDescription: '', status: 'draft' });
      toast.success('Blog post created');
      setIsCreateOpen(false);
    } catch (err: any) {
      console.error('Create blog failed, saving locally:', err);
      const fallback = {
        id: Date.now().toString(),
        ...payload
      };
      setBlogs([fallback, ...blogs]);
      setIsCreateOpen(false);
      toast.warning('Backend unavailable. Created locally as fallback.');
    }
  };

  const handleEditPost = (post: any) => {
    setEditingPost({ ...post, tags: Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || '') });
  };

  const handleUpdatePost = async () => {
    if (!editingPost) return;
    const id = editingPost.id || editingPost._id;
    const updatePayload: any = {
      title: editingPost.title,
      excerpt: editingPost.excerpt,
      content: editingPost.content,
      category: editingPost.category,
      status: editingPost.status,
      featured: !!editingPost.featured,
      tags: String(editingPost.tags || '').split(',').map((t: string) => t.trim()).filter(Boolean)
    };
    try {
      await blogService.update(id, updatePayload);
      setBlogs(blogs.map(blog => 
        (blog.id === id || blog._id === id)
          ? { ...blog, ...updatePayload }
          : blog
      ));
      setEditingPost(null);
      toast.success('Blog post updated successfully!');
    } catch (err) {
      console.error('Update blog failed, applying local change:', err);
      setBlogs(blogs.map(blog => 
        (blog.id === id || blog._id === id)
          ? { ...blog, ...updatePayload }
          : blog
      ));
      setEditingPost(null);
      toast.warning('Backend unavailable. Updated locally as fallback.');
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await blogService.remove(id);
      setBlogs(blogs.filter(blog => (blog.id !== id && blog._id !== id)));
      toast.success('Blog post deleted successfully!');
    } catch (err) {
      console.error('Delete blog failed, removing locally:', err);
      setBlogs(blogs.filter(blog => (blog.id !== id && blog._id !== id)));
      toast.warning('Backend unavailable. Deleted locally as fallback.');
    }
  };

  const togglePostStatus = async (id: string) => {
    const current = blogs.find(b => b.id === id || b._id === id);
    const newStatus = current?.status === 'published' ? 'draft' : 'published';
    try {
      await blogService.update(id, { status: newStatus, published: newStatus === 'published' });
      setBlogs(blogs.map(blog => 
        (blog.id === id || blog._id === id) 
          ? { ...blog, status: newStatus }
          : blog
      ));
      toast.success('Post status updated!');
    } catch (err) {
      console.error('Status toggle failed, applying locally:', err);
      setBlogs(blogs.map(blog => 
        (blog.id === id || blog._id === id) 
          ? { ...blog, status: newStatus }
          : blog
      ));
      toast.warning('Backend unavailable. Status updated locally.');
    }
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
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-gray-600">Manage blog posts and content</p>
        </div>
        <Button onClick={() => { try { dbService.saveBlogs?.(blogs); toast.success('Content saved'); } catch {} }} className="flex items-center gap-2">
          <Save className="h-4 w-4" /> Save
        </Button>
      </div>

      <Tabs defaultValue="blogs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="blogs">Blog Posts</TabsTrigger>
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

        {/* News Articles removed — managed under separate News & Video section */}
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
