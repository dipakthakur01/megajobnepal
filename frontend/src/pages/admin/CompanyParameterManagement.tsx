import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Factory,
  Building2,
  Plus, 
  Edit, 
  Trash2,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import { confirmDelete } from '../../utils/confirmDelete';
import companyParameterService from '../../services/companyParameterService';

export function CompanyParameterManagement() {
  const [activeTab, setActiveTab] = useState<'industry' | 'company_type'>('industry');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [industries, setIndustries] = useState<any[]>([]);
  const [companyTypes, setCompanyTypes] = useState<any[]>([]);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    range: ''
  });

  // Config limited to server-supported types
  const parameterConfigs = useMemo(() => ({
    industry: {
      title: 'Industries Management',
      description: 'Manage industry categories and classifications',
      icon: Factory,
      fields: ['name', 'description'],
      columns: ['Industry', 'Description', 'Usage', 'Status', 'Actions']
    },
    company_type: {
      title: 'Company Types',
      description: 'Manage company type classifications',
      icon: Building2,
      fields: ['name', 'description'],
      columns: ['Type', 'Description', 'Usage', 'Status', 'Actions']
    }
  }), []);

  const currentConfig = parameterConfigs[activeTab];
  const currentData = activeTab === 'industry' ? industries : companyTypes;

  const filteredData = currentData.filter((item: any) => 
    (item?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item?.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initial load
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [ind, types] = await Promise.all([
          companyParameterService.list('industry'),
          companyParameterService.list('company_type'),
        ]);
        if (!mounted) return;
        setIndustries(Array.isArray(ind?.items) ? ind.items : (Array.isArray(ind) ? ind : []));
        setCompanyTypes(Array.isArray(types?.items) ? types.items : (Array.isArray(types) ? types : []));
      } catch (err) {
        console.warn('Failed to load company parameters:', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleAdd = async () => {
    if (!newItem.name) {
      toast.error('Name is required');
      return;
    }
    try {
      const res = await companyParameterService.create(activeTab, {
        name: newItem.name,
        description: newItem.description,
        range: newItem.range?.trim() || undefined,
        status: 'active',
      });
      const created = (res?.item) || res;
      if (activeTab === 'industry') {
        setIndustries(prev => [...prev, created]);
      } else {
        setCompanyTypes(prev => [...prev, created]);
      }
      setNewItem({ name: '', description: '', range: '' });
      setIsAddDialogOpen(false);
      toast.success(`${currentConfig.title} item added successfully!`);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to add item');
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
  };

  const handleUpdate = async () => {
    if (!editingItem || !editingItem.name) {
      toast.error('Name is required');
      return;
    }
    try {
      const id = editingItem._id || editingItem.id;
      const res = await companyParameterService.update(activeTab, id, {
        name: editingItem.name,
        description: editingItem.description,
        range: editingItem.range,
        status: editingItem.status,
      });
      const updated = (res?.item) || res;
      if (activeTab === 'industry') {
        setIndustries(prev => prev.map(i => (i._id || i.id) === id ? updated : i));
      } else {
        setCompanyTypes(prev => prev.map(i => (i._id || i.id) === id ? updated : i));
      }
      setEditingItem(null);
      toast.success(`${currentConfig.title} item updated successfully!`);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to update item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirmDelete()) return;
    try {
      await companyParameterService.remove(activeTab, id);
      if (activeTab === 'industry') {
        setIndustries(prev => prev.filter(i => (i._id || i.id) !== id));
      } else {
        setCompanyTypes(prev => prev.filter(i => (i._id || i.id) !== id));
      }
      toast.success(`${currentConfig.title} item deleted successfully!`);
    } catch (err: any) {
      toast.error(err?.error || 'Failed to delete item');
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const list = activeTab === 'industry' ? industries : companyTypes;
      const item = list.find(i => (i._id || i.id) === id);
      if (!item) return;
      const nextStatus = item.status === 'active' ? 'inactive' : 'active';
      const res = await companyParameterService.update(activeTab, id, { status: nextStatus });
      const updated = (res?.item) || res;
      if (activeTab === 'industry') {
        setIndustries(prev => prev.map(i => (i._id || i.id) === id ? updated : i));
      } else {
        setCompanyTypes(prev => prev.map(i => (i._id || i.id) === id ? updated : i));
      }
      toast.success('Status updated successfully!');
    } catch (err: any) {
      toast.error(err?.error || 'Failed to update status');
    }
  };

  const renderTableRow = (item: any) => {
    const rowId = item._id || item.id;
    return (
      <tr key={rowId} className="border-b hover:bg-gray-50">
        <td className="py-3 px-4 font-medium">{item.name}</td>
        <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
        <td className="py-3 px-4">{item.usage ?? 0} companies</td>
        <td className="py-3 px-4">
          <Badge className={item.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
            {item.status}
          </Badge>
        </td>
        <td className="py-3 px-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => toggleStatus(rowId)}
              className={item.status === 'active' ? 'text-red-600' : 'text-green-600'}
            >
              {item.status === 'active' ? 'Deactivate' : 'Activate'}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleDelete(rowId)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
    );
  };

  const renderAddForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="itemName">Name</Label>
        <Input
          id="itemName"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          placeholder={`Enter ${activeTab === 'industry' ? 'industry' : 'company type'} name`}
        />
      </div>

      {/* Range is optional; keep for forward-compatibility */}
      {currentConfig.fields.includes('range') && (
        <div className="space-y-2">
          <Label htmlFor="itemRange">Range</Label>
          <Input
            id="itemRange"
            value={newItem.range}
            onChange={(e) => setNewItem({ ...newItem, range: e.target.value })}
            placeholder="e.g., 1-10, 11-50"
          />
        </div>
      )}

      {currentConfig.fields.includes('description') && (
        <div className="space-y-2">
          <Label htmlFor="itemDescription">Description</Label>
          <Textarea
            id="itemDescription"
            value={newItem.description}
            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
            placeholder="Enter description"
            rows={3}
          />
        </div>
      )}
    </div>
  );

  const renderEditForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="editItemName">Name</Label>
        <Input
          id="editItemName"
          value={editingItem?.name || ''}
          onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
        />
      </div>

      {currentConfig.fields.includes('range') && (
        <div className="space-y-2">
          <Label htmlFor="editItemRange">Range</Label>
          <Input
            id="editItemRange"
            value={editingItem?.range || ''}
            onChange={(e) => setEditingItem({ ...editingItem, range: e.target.value })}
          />
        </div>
      )}

      {currentConfig.fields.includes('description') && (
        <div className="space-y-2">
          <Label htmlFor="editItemDescription">Description</Label>
          <Textarea
            id="editItemDescription"
            value={editingItem?.description || ''}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            rows={3}
          />
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Company Parameter Management</h2>
          <p className="text-gray-600">Manage company-related parameters and classifications</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="industry">Industries</TabsTrigger>
          <TabsTrigger value="company_type">Company Types</TabsTrigger>
        </TabsList>

        {Object.keys(parameterConfigs).map((tabKey) => (
          <TabsContent key={tabKey} value={tabKey as any} className="space-y-6">
            {/* Tab Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(parameterConfigs[tabKey as keyof typeof parameterConfigs].icon, { className: "h-8 w-8 text-blue-600" })}
                    <div>
                      <h3 className="text-lg font-semibold">{parameterConfigs[tabKey as keyof typeof parameterConfigs].title}</h3>
                      <p className="text-sm text-gray-600">{parameterConfigs[tabKey as keyof typeof parameterConfigs].description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus className="h-4 w-4 mr-2" />
                          Add {tabKey === 'industry' ? 'industry' : 'company type'}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add {parameterConfigs[tabKey as keyof typeof parameterConfigs].title.replace('Management','').trim()}</DialogTitle>
                          <DialogDescription>
                            Create a new {tabKey === 'industry' ? 'industry' : 'company type'} entry.
                          </DialogDescription>
                        </DialogHeader>
                        {renderAddForm()}
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAdd}>Add</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Items</p>
                      <p className="text-2xl font-bold text-blue-600">{(tabKey === 'industry' ? industries : companyTypes).length}</p>
                    </div>
                    {React.createElement(parameterConfigs[tabKey as keyof typeof parameterConfigs].icon, { className: "h-8 w-8 text-blue-600" })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {(tabKey === 'industry' ? industries : companyTypes).filter((item: any) => item.status === 'active').length}
                      </p>
                    </div>
                    {React.createElement(parameterConfigs[tabKey as keyof typeof parameterConfigs].icon, { className: "h-8 w-8 text-green-600" })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Most Used</p>
                      <p className="text-lg font-bold text-purple-600">
                        {(tabKey === 'industry' ? industries : companyTypes).reduce((max: any, item: any) => (item.usage ?? 0) > (max?.usage ?? 0) ? item : max, (tabKey === 'industry' ? industries : companyTypes)[0])?.name || 'N/A'}
                      </p>
                    </div>
                    {React.createElement(parameterConfigs[tabKey as keyof typeof parameterConfigs].icon, { className: "h-8 w-8 text-purple-600" })}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Usage</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {(tabKey === 'industry' ? industries : companyTypes).reduce((sum: number, item: any) => sum + (item.usage ?? 0), 0)}
                      </p>
                    </div>
                    {React.createElement(parameterConfigs[tabKey as keyof typeof parameterConfigs].icon, { className: "h-8 w-8 text-orange-600" })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>{parameterConfigs[tabKey as keyof typeof parameterConfigs].title} ({filteredData.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {parameterConfigs[tabKey as keyof typeof parameterConfigs].columns.map(column => (
                          <th key={column} className="text-left py-3 px-4">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((item: any) => renderTableRow(item))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => { if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {(activeTab === 'industry' ? parameterConfigs.industry.title : parameterConfigs.company_type.title).replace('Management','').trim()}</DialogTitle>
            <DialogDescription>
              Update the {activeTab === 'industry' ? 'industry' : 'company type'} information.
            </DialogDescription>
          </DialogHeader>
          {renderEditForm()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
