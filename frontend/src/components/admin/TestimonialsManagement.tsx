import React, { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Users, Plus, Save, Trash2, Image as ImageIcon, Edit2, X } from 'lucide-react';

type Testimonial = {
  id?: string;
  _id?: string;
  name: string;
  role?: string;
  company?: string;
  avatar_url?: string;
  text: string;
};

export function TestimonialsManagement() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState<Testimonial>({ name: '', text: '', role: '', company: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const effectiveId = (t: Testimonial) => t.id || (typeof t._id === 'string' ? t._id : (t._id as any)?.toString?.());

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getTestimonials();
      setItems(Array.isArray(data) ? data : (data?.items || []));
    } catch (e: any) {
      setError(e?.message || 'Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async () => {
    if (!creating.name?.trim() || !creating.text?.trim()) return;
    try {
      const created = await apiClient.createTestimonial({
        name: creating.name.trim(),
        text: creating.text.trim(),
        role: creating.role?.trim() || '',
        company: creating.company?.trim() || '',
        avatar_url: creating.avatar_url || ''
      });
      setItems([created, ...items]);
      setCreating({ name: '', text: '', role: '', company: '' });
    } catch (e: any) {
      setError(e?.message || 'Failed to create testimonial');
    }
  };

  const handleUpdate = async (id: string, updated: Testimonial) => {
    try {
      const saved = await apiClient.updateTestimonial(id, {
        name: updated.name,
        text: updated.text,
        role: updated.role || '',
        company: updated.company || '',
        avatar_url: updated.avatar_url || ''
      });
      setItems(items.map(i => (effectiveId(i) === id ? saved : i)));
      setEditingId(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to update testimonial');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    try {
      await apiClient.deleteTestimonial(id);
      setItems(items.filter(i => effectiveId(i) !== id));
    } catch (e: any) {
      setError(e?.message || 'Failed to delete testimonial');
    }
  };

  const handleUpload = async (id: string, file: File | null) => {
    if (!file) return;
    setUploadingId(id);
    try {
      const res = await apiClient.uploadTestimonialAvatar(id, file);
      const url = res?.url || res?.secure_url || res?.testimonial?.avatar_url;
      setItems(items.map(i => (effectiveId(i) === id ? { ...i, avatar_url: url } : i)));
    } catch (e: any) {
      setError(e?.message || 'Failed to upload image');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Testimonials</h2>
        </div>
      </div>

      <Card className="p-4">
        <h3 className="font-medium mb-3">Add New Testimonial</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Name" value={creating.name} onChange={(e) => setCreating({ ...creating, name: e.target.value })} />
          <Input placeholder="Role (optional)" value={creating.role || ''} onChange={(e) => setCreating({ ...creating, role: e.target.value })} />
          <Input placeholder="Company (optional)" value={creating.company || ''} onChange={(e) => setCreating({ ...creating, company: e.target.value })} />
          <Textarea placeholder="Testimonial text" value={creating.text} onChange={(e) => setCreating({ ...creating, text: e.target.value })} />
        </div>
        <div className="mt-3">
          <Button onClick={handleCreate} disabled={!creating.name || !creating.text}>
            <Plus className="h-4 w-4 mr-1" /> Add Testimonial
          </Button>
        </div>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Existing Testimonials</h3>
          <Button variant="outline" size="sm" onClick={fetchItems}>Refresh</Button>
        </div>
        {loading ? (
          <div className="text-sm text-gray-600">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-gray-600">No testimonials yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((t) => {
              const id = effectiveId(t)!;
              const isEditing = editingId === id;
              // Use an inner component to isolate state per-row
              const Row: React.FC = () => {
                const [state, setState] = useState<Testimonial>(t);
                useEffect(() => setState(t), [t]);
                return (
                  <div className="border rounded p-3 flex items-start gap-3">
                    <img
                      src={state.avatar_url || '/placeholder-avatar.png'}
                      alt={state.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div className="flex-1 space-y-2">
                      {isEditing ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <Input value={state.name} onChange={(e) => setState({ ...state, name: e.target.value })} />
                          <Input placeholder="Role" value={state.role || ''} onChange={(e) => setState({ ...state, role: e.target.value })} />
                          <Input placeholder="Company" value={state.company || ''} onChange={(e) => setState({ ...state, company: e.target.value })} />
                          <Textarea value={state.text} onChange={(e) => setState({ ...state, text: e.target.value })} />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium">{state.name}</div>
                          <div className="text-sm text-gray-600">{[state.role, state.company].filter(Boolean).join(' • ')}</div>
                          <div className="text-sm mt-1">{state.text}</div>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <Button size="sm" onClick={() => handleUpdate(id, state)}>
                              <Save className="h-4 w-4 mr-1" /> Save
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                              <X className="h-4 w-4 mr-1" /> Cancel
                            </Button>
                          </>
                        ) : (
                          <Button variant="outline" size="sm" onClick={() => setEditingId(id)}>
                            <Edit2 className="h-4 w-4 mr-1" /> Edit
                          </Button>
                        )}
                        <label className="inline-flex items-center">
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => handleUpload(id, e.target.files?.[0] || null)}
                          />
                          <Button variant="outline" size="sm" disabled={uploadingId === id}>
                            <ImageIcon className="h-4 w-4 mr-1" /> {uploadingId === id ? 'Uploading...' : 'Upload Image'}
                          </Button>
                        </label>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(id)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              };
              return <Row key={id} />;
            })}
          </div>
        )}
      </Card>
    </div>
  );
}