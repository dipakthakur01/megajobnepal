import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Table } from '../ui/table';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api-client';
import { Plus, Trash2, Edit3, Save, X, Eye, Link2 } from 'lucide-react';

interface RecruitmentItem {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  published: boolean;
  sort_order?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export function RecruitmentManagement() {
  const [items, setItems] = useState<RecruitmentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<RecruitmentItem>>({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    link_url: '',
    published: true,
    sort_order: 0,
  });

  const resetForm = () => {
    setForm({ title: '', subtitle: '', description: '', image_url: '', link_url: '', published: true, sort_order: 0 });
    setEditingId(null);
    setCreating(false);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await apiClient.getRecruitmentItems();
      const list: RecruitmentItem[] = Array.isArray(res) ? res : (res?.items || []);
      setItems(list);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load recruitment items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  const handleCreate = async () => {
    try {
      if (!form.title || String(form.title).trim().length < 2) {
        toast.error('Title is required');
        return;
      }
      await apiClient.createRecruitmentItem({
        title: form.title,
        subtitle: form.subtitle || '',
        description: form.description || '',
        image_url: form.image_url || '',
        link_url: form.link_url || '',
        published: !!form.published,
        sort_order: Number(form.sort_order || 0),
      });
      toast.success('Recruitment item created');
      resetForm();
      await loadItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create item');
    }
  };

  const startEdit = (item: RecruitmentItem) => {
    setEditingId(item.id);
    setForm({ ...item });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      if (!form.title || String(form.title).trim().length < 2) {
        toast.error('Title is required');
        return;
      }
      await apiClient.updateRecruitmentItem(editingId, {
        title: form.title,
        subtitle: form.subtitle || '',
        description: form.description || '',
        image_url: form.image_url || '',
        link_url: form.link_url || '',
        published: !!form.published,
        sort_order: Number(form.sort_order || 0),
      });
      toast.success('Recruitment item updated');
      resetForm();
      await loadItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this recruitment item?')) return;
    try {
      await apiClient.deleteRecruitmentItem(id);
      toast.success('Deleted');
      await loadItems();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete');
    }
  };

  const publishedCount = useMemo(() => items.filter(i => i.published).length, [items]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="text-lg">Recruitment Popup Content</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">Published: {publishedCount}</Badge>
            <Button onClick={() => setCreating(v => !v)} variant={creating ? 'secondary' : 'default'} size="sm">
              <Plus className="w-4 h-4 mr-1" /> {creating ? 'Close' : 'New Item'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {creating && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input value={form.title as any} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Subtitle</label>
                <Input value={form.subtitle as any} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea value={form.description as any} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Image URL</label>
                <Input value={form.image_url as any} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium">Link URL</label>
                <Input value={form.link_url as any} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={!!form.published} onCheckedChange={(v) => setForm(f => ({ ...f, published: v }))} />
                <span className="text-sm">Published</span>
              </div>
              <div>
                <label className="text-sm font-medium">Sort Order</label>
                <Input type="number" value={String(form.sort_order ?? 0)} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
              </div>
              <div className="md:col-span-2 flex items-center gap-2">
                <Button onClick={handleCreate} className="bg-primary"><Save className="w-4 h-4 mr-1" /> Save</Button>
                <Button variant="ghost" onClick={resetForm}><X className="w-4 h-4 mr-1" /> Reset</Button>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Title</th>
                  <th className="py-2">Subtitle</th>
                  <th className="py-2">Published</th>
                  <th className="py-2">Link</th>
                  <th className="py-2">Order</th>
                  <th className="py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {!loading && items.map(item => (
                  <tr key={item.id} className="border-b align-top">
                    <td className="py-2">
                      {editingId === item.id ? (
                        <Input value={form.title as any} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                      ) : (
                        <div className="font-medium">{item.title}</div>
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === item.id ? (
                        <Input value={form.subtitle as any} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} />
                      ) : (
                        <div className="text-muted-foreground">{item.subtitle}</div>
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === item.id ? (
                        <div className="flex items-center gap-2"><Switch checked={!!form.published} onCheckedChange={(v) => setForm(f => ({ ...f, published: v }))} /><span>Published</span></div>
                      ) : (
                        item.published ? <Badge className="bg-green-100 text-green-700" variant="outline">Yes</Badge> : <Badge variant="outline">No</Badge>
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === item.id ? (
                        <Input value={form.link_url as any} onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))} />
                      ) : (
                        item.link_url ? <a href={item.link_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-600"><Link2 className="w-3 h-3" />Open</a> : <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="py-2">
                      {editingId === item.id ? (
                        <Input type="number" value={String(form.sort_order ?? 0)} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))} />
                      ) : (
                        item.sort_order ?? 0
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {editingId === item.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" onClick={handleUpdate}><Save className="w-4 h-4 mr-1" /> Save</Button>
                          <Button size="sm" variant="ghost" onClick={resetForm}><X className="w-4 h-4 mr-1" /> Cancel</Button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(item)}><Edit3 className="w-4 h-4 mr-1" /> Edit</Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {loading && (
                  <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">Loading...</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">No items yet. Create one above.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}