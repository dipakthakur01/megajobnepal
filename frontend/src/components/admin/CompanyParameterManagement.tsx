import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  Factory,
  Users,
  Crown,
  Ruler,
  Car,
  Search
} from 'lucide-react';
import { toast } from 'sonner';
import companyParameterService from '../../services/companyParameterService';
import { confirmDelete } from '../../utils/confirmDelete';

export function CompanyParameterManagement() {
  const [activeTab, setActiveTab] = useState('industries');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const remoteTabs = ['industries', 'ownership'] as const;

  // Mock data for different company parameters
  const [parameters, setParameters] = useState({
    industries: [
      { id: '1', name: 'Information Technology', description: 'Software, hardware, and IT services', usage: 89, status: 'active' },
      { id: '2', name: 'Banking & Finance', description: 'Banks, financial services, insurance', usage: 76, status: 'active' },
      { id: '3', name: 'Healthcare & Medical', description: 'Hospitals, clinics, medical services', usage: 54, status: 'active' },
      { id: '4', name: 'Education & Training', description: 'Schools, colleges, training institutes', usage: 67, status: 'active' },
      { id: '5', name: 'Manufacturing', description: 'Production, assembly, industrial', usage: 43, status: 'active' },
      { id: '6', name: 'Retail & E-commerce', description: 'Retail stores, online commerce', usage: 56, status: 'active' },
      { id: '7', name: 'Construction & Real Estate', description: 'Building, property development', usage: 34, status: 'active' },
      { id: '8', name: 'Tourism & Hospitality', description: 'Hotels, restaurants, travel', usage: 45, status: 'active' }
    ],
    departments: [
      { id: '1', name: 'Human Resources', description: 'HR management and recruitment', usage: 125, status: 'active' },
      { id: '2', name: 'Information Technology', description: 'Software development and IT support', usage: 156, status: 'active' },
      { id: '3', name: 'Sales & Marketing', description: 'Sales and marketing activities', usage: 134, status: 'active' },
      { id: '4', name: 'Finance & Accounting', description: 'Financial management and accounting', usage: 98, status: 'active' },
      { id: '5', name: 'Operations', description: 'Daily business operations', usage: 87, status: 'active' },
      { id: '6', name: 'Customer Service', description: 'Customer support and service', usage: 76, status: 'active' },
      { id: '7', name: 'Research & Development', description: 'Product research and development', usage: 54, status: 'active' },
      { id: '8', name: 'Quality Assurance', description: 'Quality control and testing', usage: 43, status: 'active' }
    ],
    ownership: [
      { id: '1', name: 'Private Limited', description: 'Private limited company', usage: 189, status: 'active' },
      { id: '2', name: 'Public Limited', description: 'Public limited company', usage: 67, status: 'active' },
      { id: '3', name: 'Partnership', description: 'Partnership firm', usage: 45, status: 'active' },
      { id: '4', name: 'Sole Proprietorship', description: 'Individual ownership', usage: 34, status: 'active' },
      { id: '5', name: 'Government', description: 'Government organization', usage: 23, status: 'active' },
      { id: '6', name: 'NGO/Non-Profit', description: 'Non-governmental organization', usage: 28, status: 'active' },
      { id: '7', name: 'Cooperative', description: 'Cooperative society', usage: 16, status: 'active' },
      { id: '8', name: 'Multinational', description: 'Multinational corporation', usage: 19, status: 'active' }
    ],
    sizes: [
      { id: '1', name: '1-10 employees', range: '1-10', description: 'Startup/Small business', usage: 156, status: 'active' },
      { id: '2', name: '11-50 employees', range: '11-50', description: 'Small company', usage: 134, status: 'active' },
      { id: '3', name: '51-200 employees', range: '51-200', description: 'Medium company', usage: 89, status: 'active' },
      { id: '4', name: '201-500 employees', range: '201-500', description: 'Large company', usage: 45, status: 'active' },
      { id: '5', name: '501-1000 employees', range: '501-1000', description: 'Enterprise company', usage: 23, status: 'active' },
      { id: '6', name: '1000+ employees', range: '1000+', description: 'Large enterprise', usage: 18, status: 'active' }
    ],
    vehicles: [
      { id: '1', name: 'Two Wheeler', description: 'Motorcycle, scooter provided', usage: 89, status: 'active' },
      { id: '2', name: 'Four Wheeler', description: 'Car provided for transportation', usage: 45, status: 'active' },
      { id: '3', name: 'Company Vehicle', description: 'Official company vehicle', usage: 67, status: 'active' },
      { id: '4', name: 'Transport Allowance', description: 'Monthly transport allowance', usage: 123, status: 'active' },
      { id: '5', name: 'Fuel Allowance', description: 'Fuel reimbursement provided', usage: 78, status: 'active' },
      { id: '6', name: 'Public Transport', description: 'Public transport ticket/pass', usage: 56, status: 'active' },
      { id: '7', name: 'No Vehicle', description: 'No vehicle benefits', usage: 234, status: 'active' }
    ]
  });

  async function refreshRemote(tab: 'industries' | 'ownership') {
    try {
      const type = tab === 'industries' ? 'industry' : 'company_type';
      const res = await companyParameterService.list(type);
      const items = (res.items || res).map((i: any) => ({
        id: i._id || i.id,
        name: i.name,
        description: i.description || '',
        usage: i.usage || 0,
        status: i.status || 'active',
        range: i.range || ''
      }));
      setParameters(prev => ({ ...prev, [tab]: items }));
    } catch (err) {
      // keep local mock if backend not ready
    }
  }

  useEffect(() => {
    if (activeTab === 'industries' || activeTab === 'ownership') {
      refreshRemote(activeTab as 'industries' | 'ownership');
    }
  }, [activeTab]);

  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    range: ''
  });

  const parameterConfigs = {
    industries: {
      title: 'Industries Management',
      description: 'Manage industry categories and classifications',
      icon: Factory,
      fields: ['name', 'description'],
      columns: ['Industry', 'Description', 'Usage', 'Status', 'Actions']
    },
    departments: {
      title: 'Departments',
      description: 'Manage company departments and divisions',
      icon: Building2,
      fields: ['name', 'description'],
      columns: ['Department', 'Description', 'Usage', 'Status', 'Actions']
    },
    ownership: {
      title: 'Company Ownership',
      description: 'Manage company ownership types',
      icon: Crown,
      fields: ['name', 'description'],
      columns: ['Ownership Type', 'Description', 'Usage', 'Status', 'Actions']
    },
    sizes: {
      title: 'Company Size',
      description: 'Manage company size categories',
      icon: Ruler,
      fields: ['name', 'range', 'description'],
      columns: ['Size Category', 'Range', 'Description', 'Usage', 'Actions']
    },
    vehicles: {
      title: 'Vehicle Benefits',
      description: 'Manage vehicle and transport benefits',
      icon: Car,
      fields: ['name', 'description'],
      columns: ['Vehicle Type', 'Description', 'Usage', 'Status', 'Actions']
    }
  };

  const currentConfig = parameterConfigs[activeTab as keyof typeof parameterConfigs];
  const currentData = parameters[activeTab as keyof typeof parameters];

  const filteredData = currentData.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    ((item as any).range && (item as any).range.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAdd = async () => {
    if (!newItem.name) {
      toast.error('Name is required');
      return;
    }
    if (remoteTabs.includes(activeTab as any)) {
      try {
        const type = activeTab === 'industries' ? 'industry' : 'company_type';
        await companyParameterService.create(type, { name: newItem.name, description: newItem.description });
        await refreshRemote(activeTab as 'industries' | 'ownership');
        toast.success('Item added successfully');
      } catch (err) {
        toast.error('Failed to add item');
        return;
      }
    } else {
      const item = {
        id: Date.now().toString(),
        ...newItem,
        usage: 0,
        status: 'active'
      };
      setParameters(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab as keyof typeof prev], item]
      }));
      toast.success(`${currentConfig.title} item added successfully!`);
    }

    setNewItem({ name: '', description: '', range: '' });
    setIsAddDialogOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingItem({ ...item });
  };

  const handleUpdate = async () => {
    if (!editingItem || !editingItem.name) {
      toast.error('Name is required');
      return;
    }
    if (remoteTabs.includes(activeTab as any)) {
      try {
        const type = activeTab === 'industries' ? 'industry' : 'company_type';
        await companyParameterService.update(type, editingItem.id, {
          name: editingItem.name,
          description: editingItem.description,
          status: editingItem.status,
        });
        await refreshRemote(activeTab as 'industries' | 'ownership');
        toast.success('Item updated successfully');
      } catch (err) {
        toast.error('Failed to update item');
        return;
      }
    } else {
      setParameters(prev => ({
        ...prev,
        [activeTab]: prev[activeTab as keyof typeof prev].map(item =>
          item.id === editingItem.id ? editingItem : item
        )
      }));
      toast.success(`${currentConfig.title} item updated successfully!`);
    }

    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirmDelete()) return;
    if (remoteTabs.includes(activeTab as any)) {
      try {
        const type = activeTab === 'industries' ? 'industry' : 'company_type';
        await companyParameterService.remove(type, id);
        await refreshRemote(activeTab as 'industries' | 'ownership');
        toast.success('Item deleted successfully');
      } catch (err) {
        toast.error('Failed to delete item');
      }
      return;
    }
    setParameters(prev => ({
      ...prev,
      [activeTab]: prev[activeTab as keyof typeof prev].filter(item => item.id !== id)
    }));
    toast.success(`${currentConfig.title} item deleted successfully!`);
  };

  const toggleStatus = async (id: string) => {
    if (remoteTabs.includes(activeTab as any)) {
      const items = parameters[activeTab as keyof typeof parameters] as any[];
      const item = items.find(i => i.id === id);
      const newStatus = item?.status === 'active' ? 'inactive' : 'active';
      try {
        const type = activeTab === 'industries' ? 'industry' : 'company_type';
        await companyParameterService.update(type, id, { status: newStatus });
        await refreshRemote(activeTab as 'industries' | 'ownership');
        toast.success('Status updated successfully!');
      } catch (err) {
        toast.error('Failed to update status');
      }
      return;
    }
    setParameters(prev => ({
      ...prev,
      [activeTab]: prev[activeTab as keyof typeof prev].map(item =>
        item.id === id 
          ? { ...item, status: item.status === 'active' ? 'inactive' : 'active' }
          : item
      )
    }));
    toast.success('Status updated successfully!');
  };

  const renderTableRow = (item: any) => {
    switch (activeTab) {
      case 'sizes':
        return (
          <tr key={item.id} className="border-b hover:bg-gray-50">
            <td className="py-3 px-4 font-medium">{item.name}</td>
            <td className="py-3 px-4">
              <Badge variant="outline">{item.range}</Badge>
            </td>
            <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
            <td className="py-3 px-4">{item.usage} companies</td>
            <td className="py-3 px-4">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleStatus(item.id)}
                  className={item.status === 'active' ? 'text-red-600' : 'text-green-600'}
                >
                  {item.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        );

      default:
        return (
          <tr key={item.id} className="border-b hover:bg-gray-50">
            <td className="py-3 px-4 font-medium">{item.name}</td>
            <td className="py-3 px-4 text-sm text-gray-600">{item.description}</td>
            <td className="py-3 px-4">{item.usage} companies</td>
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
                  onClick={() => toggleStatus(item.id)}
                  className={item.status === 'active' ? 'text-red-600' : 'text-green-600'}
                >
                  {item.status === 'active' ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </td>
          </tr>
        );
    }
  };

  const renderAddForm = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="itemName">Name</Label>
        <Input
          id="itemName"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          placeholder={`Enter ${activeTab.slice(0, -1)} name`}
        />
      </div>

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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="industries">Industries</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="ownership">Ownership</TabsTrigger>
          <TabsTrigger value="sizes">Company Size</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle</TabsTrigger>
        </TabsList>

        {Object.keys(parameterConfigs).map(tabKey => (
          <TabsContent key={tabKey} value={tabKey} className="space-y-6">
            {/* Tab Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(parameterConfigs[tabKey as keyof typeof parameterConfigs].icon, { className: "h-8 w-8 text-blue-600" })}
                    <div>
                      <h3 className="text-lg font-semibold">{currentConfig.title}</h3>
                      <p className="text-sm text-gray-600">{currentConfig.description}</p>
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
                          Add {tabKey.slice(0, -1)}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add {currentConfig.title.slice(0, -1)}</DialogTitle>
                          <DialogDescription>
                            Create a new {tabKey.slice(0, -1)} entry.
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
                      <p className="text-2xl font-bold text-blue-600">{currentData.length}</p>
                    </div>
                    <currentConfig.icon className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active</p>
                      <p className="text-2xl font-bold text-green-600">
                        {currentData.filter(item => item.status === 'active').length}
                      </p>
                    </div>
                    <currentConfig.icon className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Most Used</p>
                      <p className="text-lg font-bold text-purple-600">
                        {currentData.reduce((max, item) => item.usage > max.usage ? item : max, currentData[0])?.name || 'N/A'}
                      </p>
                    </div>
                    <currentConfig.icon className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Usage</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {currentData.reduce((sum, item) => sum + item.usage, 0)}
                      </p>
                    </div>
                    <currentConfig.icon className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Table */}
            <Card>
              <CardHeader>
                <CardTitle>{currentConfig.title} ({filteredData.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        {currentConfig.columns.map(column => (
                          <th key={column} className="text-left py-3 px-4">{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map(item => renderTableRow(item))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit {currentConfig.title.slice(0, -1)}</DialogTitle>
            <DialogDescription>
              Update the {activeTab.slice(0, -1)} information.
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
