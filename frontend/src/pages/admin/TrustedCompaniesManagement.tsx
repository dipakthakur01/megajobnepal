import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Upload,
  Save,
  Eye,
  EyeOff,
  Move,
  Palette,
  RefreshCw,
  Type,
  Settings,
  Bold,
  Italic,
  Underline
} from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface TrustedCompany {
  id: number;
  name: string;
  color: string;
  logo: string | null;
  isActive: boolean;
  order: number;
}

export function TrustedCompaniesManagement() {
  const [companies, setCompanies] = useState<TrustedCompany[]>([
    { 
      id: 1,
      name: 'Netflix', 
      color: '#E50914',
      logo: null,
      isActive: true,
      order: 1
    },
    { 
      id: 2,
      name: 'Meta', 
      color: '#1877F2',
      logo: null,
      isActive: true,
      order: 2
    },
    { 
      id: 3,
      name: 'Microsoft', 
      color: '#00A1F1',
      logo: null,
      isActive: true,
      order: 3
    },
    { 
      id: 4,
      name: 'Pinterest', 
      color: '#E60023',
      logo: null,
      isActive: true,
      order: 4
    },
    { 
      id: 5,
      name: 'Slack', 
      color: '#4A154B',
      logo: null,
      isActive: true,
      order: 5
    },
    { 
      id: 6,
      name: 'Spotify', 
      color: '#1DB954',
      logo: null,
      isActive: true,
      order: 6
    },
    { 
      id: 7,
      name: 'Google', 
      color: '#4285F4',
      logo: null,
      isActive: true,
      order: 7
    },
    { 
      id: 8,
      name: 'Apple', 
      color: '#FF6600',
      logo: null,
      isActive: true,
      order: 8
    },
    { 
      id: 9,
      name: 'Amazon', 
      color: '#FF9900',
      logo: null,
      isActive: true,
      order: 9
    },
    { 
      id: 10,
      name: 'Tesla', 
      color: '#007ACC',
      logo: null,
      isActive: true,
      order: 10
    },
    { 
      id: 11,
      name: 'Uber', 
      color: '#FF6600',
      logo: null,
      isActive: true,
      order: 11
    },
    { 
      id: 12,
      name: 'Airbnb', 
      color: '#FF5A5F',
      logo: null,
      isActive: true,
      order: 12
    },
    { 
      id: 13,
      name: 'Zoom', 
      color: '#007ACC',
      logo: null,
      isActive: true,
      order: 13
    },
    { 
      id: 14,
      name: 'Adobe', 
      color: '#FF6600',
      logo: null,
      isActive: true,
      order: 14
    },
    { 
      id: 15,
      name: 'Salesforce', 
      color: '#007ACC',
      logo: null,
      isActive: true,
      order: 15
    }
  ]);

  const [editingCompany, setEditingCompany] = useState<TrustedCompany | null>(null);
  const [newCompany, setNewCompany] = useState<Partial<TrustedCompany>>({
    name: '',
    color: '#FF6600',
    logo: null,
    isActive: true
  });
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sectionSettings, setSectionSettings] = useState({
    headingText: 'Trusted By 1000+ Companies',
    headingSize: 'text-2xl md:text-3xl',
    headingWeight: 'font-medium',
    headingColor: '#1F2937',
    accentColor: '#3B82F6',
    subheadingText: 'Leading organizations across industries choose MegaJobNepal',
    subheadingSize: 'text-base',
    subheadingColor: '#6B7280',
    companyTextSize: 'text-xl',
    companyTextWeight: 'font-medium'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sortedCompanies = [...companies].sort((a, b) => a.order - b.order);
  const activeCompanies = sortedCompanies.filter(company => company.isActive);

  const handleAddCompany = async () => {
    if (!newCompany.name) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);
    try {
      const company: TrustedCompany = {
        id: Math.max(...companies.map(c => c.id), 0) + 1,
        name: newCompany.name,
        color: newCompany.color || '#FF6600',
        logo: newCompany.logo || null,
        isActive: true,
        order: companies.length + 1
      };

      setCompanies([...companies, company]);
      setNewCompany({
        name: '',
        color: '#FF6600',
        logo: null,
        isActive: true
      });
      toast.success('Company added successfully!');
    } catch (error) {
      toast.error('Failed to add company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompany = (company: TrustedCompany) => {
    setEditingCompany({ ...company });
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany || !editingCompany.name) {
      toast.error('Company name is required');
      return;
    }

    setIsLoading(true);
    try {
      setCompanies(companies.map(company => 
        company.id === editingCompany.id ? editingCompany : company
      ));
      setEditingCompany(null);
      toast.success('Company updated successfully!');
    } catch (error) {
      toast.error('Failed to update company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (id: number) => {
    if (!confirm('Are you sure you want to delete this company?')) {
      return;
    }

    setIsLoading(true);
    try {
      setCompanies(companies.filter(company => company.id !== id));
      toast.success('Company deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete company');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleActive = async (id: number) => {
    setIsLoading(true);
    try {
      setCompanies(companies.map(company => 
        company.id === id ? { ...company, isActive: !company.isActive } : company
      ));
      toast.success('Company status updated!');
    } catch (error) {
      toast.error('Failed to update company status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveCompany = (id: number, direction: 'up' | 'down') => {
    const company = companies.find(c => c.id === id);
    if (!company) return;

    const newOrder = direction === 'up' ? company.order - 1 : company.order + 1;
    const swapCompany = companies.find(c => c.order === newOrder);

    if (swapCompany) {
      setCompanies(companies.map(c => {
        if (c.id === id) return { ...c, order: newOrder };
        if (c.id === swapCompany.id) return { ...c, order: company.order };
        return c;
      }));
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const logoUrl = e.target?.result as string;
        if (isEditing && editingCompany) {
          setEditingCompany({ ...editingCompany, logo: logoUrl });
        } else {
          setNewCompany({ ...newCompany, logo: logoUrl });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const generateRandomColor = () => {
    const colors = ['#FF6600', '#007ACC', '#E50914', '#1877F2', '#4285F4', '#1DB954', '#E60023', '#FF9900', '#4A154B', '#FF5A5F'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Trusted Companies Management</h2>
          <p className="text-gray-600">Manage companies displayed in the scrolling section</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2"
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="py-12 px-4 bg-white overflow-hidden">
              <div className="max-w-full mx-auto">
                <div className="text-center mb-8">
                  <h2 
                    className={`${sectionSettings.headingSize} ${sectionSettings.headingWeight} mb-2`}
                    style={{ color: sectionSettings.headingColor }}
                  >
                    {sectionSettings.headingText.split(' ').map((word, index) => 
                      word.includes('1000+') ? (
                        <span key={index} style={{ color: sectionSettings.accentColor }}>{word} </span>
                      ) : (
                        <span key={index}>{word} </span>
                      )
                    )}
                  </h2>
                  <p 
                    className={sectionSettings.subheadingSize}
                    style={{ color: sectionSettings.subheadingColor }}
                  >
                    {sectionSettings.subheadingText}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="flex animate-scroll-right-to-left items-center">
                    {activeCompanies.map((company, index) => (
                      <div
                        key={`preview-${index}`}
                        className="flex items-center justify-center min-w-[280px] h-16 mx-8 group"
                      >
                        {company.logo ? (
                          <div className="flex items-center space-x-3">
                            <ImageWithFallback
                              src={company.logo}
                              alt={company.name}
                              className="w-10 h-10 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            />
                            <span 
                              className={`${sectionSettings.companyTextSize} ${sectionSettings.companyTextWeight} whitespace-nowrap text-gray-600 hover:text-gray-800 transition-colors duration-300`}
                              style={{ color: company.color }}
                            >
                              {company.name}
                            </span>
                          </div>
                        ) : (
                          <span 
                            className={`${sectionSettings.companyTextSize} ${sectionSettings.companyTextWeight} whitespace-nowrap text-gray-600 hover:text-gray-800 transition-all duration-300`}
                            style={{ color: company.color }}
                          >
                            {company.name}
                          </span>
                        )}
                      </div>
                    ))}
                    {/* Duplicate set for seamless loop */}
                    {activeCompanies.map((company, index) => (
                      <div
                        key={`preview-dup-${index}`}
                        className="flex items-center justify-center min-w-[280px] h-16 mx-8 group"
                      >
                        {company.logo ? (
                          <div className="flex items-center space-x-3">
                            <ImageWithFallback
                              src={company.logo}
                              alt={company.name}
                              className="w-10 h-10 object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                            />
                            <span 
                              className={`${sectionSettings.companyTextSize} ${sectionSettings.companyTextWeight} whitespace-nowrap text-gray-600 hover:text-gray-800 transition-colors duration-300`}
                              style={{ color: company.color }}
                            >
                              {company.name}
                            </span>
                          </div>
                        ) : (
                          <span 
                            className={`${sectionSettings.companyTextSize} ${sectionSettings.companyTextWeight} whitespace-nowrap text-gray-600 hover:text-gray-800 transition-all duration-300`}
                            style={{ color: company.color }}
                          >
                            {company.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-white to-transparent pointer-events-none z-10"></div>
                  <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-white to-transparent pointer-events-none z-10"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Section Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Section Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Heading Settings */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Type className="h-4 w-4" />
              Main Heading
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heading Text</Label>
                <Input
                  value={sectionSettings.headingText}
                  onChange={(e) => setSectionSettings({ ...sectionSettings, headingText: e.target.value })}
                  placeholder="Trusted By 1000+ Companies"
                />
              </div>
              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select
                  value={sectionSettings.headingSize}
                  onValueChange={(value) => setSectionSettings({ ...sectionSettings, headingSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-lg md:text-xl">Small (text-lg)</SelectItem>
                    <SelectItem value="text-xl md:text-2xl">Medium (text-xl)</SelectItem>
                    <SelectItem value="text-2xl md:text-3xl">Large (text-2xl)</SelectItem>
                    <SelectItem value="text-3xl md:text-4xl">Extra Large (text-3xl)</SelectItem>
                    <SelectItem value="text-4xl md:text-5xl">2X Large (text-4xl)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select
                  value={sectionSettings.headingWeight}
                  onValueChange={(value) => setSectionSettings({ ...sectionSettings, headingWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-light">Light</SelectItem>
                    <SelectItem value="font-normal">Normal</SelectItem>
                    <SelectItem value="font-medium">Medium</SelectItem>
                    <SelectItem value="font-semibold">Semi Bold</SelectItem>
                    <SelectItem value="font-bold">Bold</SelectItem>
                    <SelectItem value="font-extrabold">Extra Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={sectionSettings.headingColor}
                    onChange={(e) => setSectionSettings({ ...sectionSettings, headingColor: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={sectionSettings.headingColor}
                    onChange={(e) => setSectionSettings({ ...sectionSettings, headingColor: e.target.value })}
                    placeholder="#1F2937"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accent Color (1000+)</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={sectionSettings.accentColor}
                    onChange={(e) => setSectionSettings({ ...sectionSettings, accentColor: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={sectionSettings.accentColor}
                    onChange={(e) => setSectionSettings({ ...sectionSettings, accentColor: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Subheading Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-900">Subheading</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subheading Text</Label>
                <Input
                  value={sectionSettings.subheadingText}
                  onChange={(e) => setSectionSettings({ ...sectionSettings, subheadingText: e.target.value })}
                  placeholder="Leading organizations across industries choose MegaJobNepal"
                />
              </div>
              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select
                  value={sectionSettings.subheadingSize}
                  onValueChange={(value) => setSectionSettings({ ...sectionSettings, subheadingSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-xs">Extra Small (text-xs)</SelectItem>
                    <SelectItem value="text-sm">Small (text-sm)</SelectItem>
                    <SelectItem value="text-base">Base (text-base)</SelectItem>
                    <SelectItem value="text-lg">Large (text-lg)</SelectItem>
                    <SelectItem value="text-xl">Extra Large (text-xl)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={sectionSettings.subheadingColor}
                    onChange={(e) => setSectionSettings({ ...sectionSettings, subheadingColor: e.target.value })}
                    className="w-20 h-10 p-1"
                  />
                  <Input
                    value={sectionSettings.subheadingColor}
                    onChange={(e) => setSectionSettings({ ...sectionSettings, subheadingColor: e.target.value })}
                    placeholder="#6B7280"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Company Names Settings */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium text-gray-900">Company Names</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Text Size</Label>
                <Select
                  value={sectionSettings.companyTextSize}
                  onValueChange={(value) => setSectionSettings({ ...sectionSettings, companyTextSize: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text-sm">Small (text-sm)</SelectItem>
                    <SelectItem value="text-base">Base (text-base)</SelectItem>
                    <SelectItem value="text-lg">Large (text-lg)</SelectItem>
                    <SelectItem value="text-xl">Extra Large (text-xl)</SelectItem>
                    <SelectItem value="text-2xl">2X Large (text-2xl)</SelectItem>
                    <SelectItem value="text-3xl">3X Large (text-3xl)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Font Weight</Label>
                <Select
                  value={sectionSettings.companyTextWeight}
                  onValueChange={(value) => setSectionSettings({ ...sectionSettings, companyTextWeight: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="font-light">Light</SelectItem>
                    <SelectItem value="font-normal">Normal</SelectItem>
                    <SelectItem value="font-medium">Medium</SelectItem>
                    <SelectItem value="font-semibold">Semi Bold</SelectItem>
                    <SelectItem value="font-bold">Bold</SelectItem>
                    <SelectItem value="font-extrabold">Extra Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t">
            <Button 
              onClick={() => toast.success('Section settings saved!')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Settings
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                setSectionSettings({
                  headingText: 'Trusted By 1000+ Companies',
                  headingSize: 'text-2xl md:text-3xl',
                  headingWeight: 'font-medium',
                  headingColor: '#1F2937',
                  accentColor: '#3B82F6',
                  subheadingText: 'Leading organizations across industries choose MegaJobNepal',
                  subheadingSize: 'text-base',
                  subheadingColor: '#6B7280',
                  companyTextSize: 'text-xl',
                  companyTextWeight: 'font-medium'
                });
                toast.success('Settings reset to defaults!');
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add New Company */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Company
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newName">Company Name *</Label>
              <Input
                id="newName"
                value={newCompany.name}
                onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                placeholder="Enter company name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newColor">Brand Color</Label>
              <div className="flex gap-2">
                <Input
                  id="newColor"
                  type="color"
                  value={newCompany.color}
                  onChange={(e) => setNewCompany({ ...newCompany, color: e.target.value })}
                  className="w-20 h-10 p-1"
                />
                <Input
                  value={newCompany.color}
                  onChange={(e) => setNewCompany({ ...newCompany, color: e.target.value })}
                  placeholder="#FF6600"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setNewCompany({ ...newCompany, color: generateRandomColor() })}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Company Logo (Optional)</Label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e)}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Logo (64x64px recommended)
                </Button>
              </div>
              {newCompany.logo && (
                <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden">
                  <ImageWithFallback
                    src={newCompany.logo}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500">
              Recommended: Square logo, 64x64px, PNG or JPG format, max 2MB
            </p>
          </div>

          <Button onClick={handleAddCompany} disabled={isLoading} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {isLoading ? 'Adding...' : 'Add Company'}
          </Button>
        </CardContent>
      </Card>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Companies ({companies.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedCompanies.map((company) => (
              <div key={company.id} className="border rounded-lg p-4">
                {editingCompany?.id === company.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Company Name *</Label>
                        <Input
                          value={editingCompany.name}
                          onChange={(e) => setEditingCompany({ ...editingCompany, name: e.target.value })}
                          placeholder="Enter company name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Brand Color</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={editingCompany.color}
                            onChange={(e) => setEditingCompany({ ...editingCompany, color: e.target.value })}
                            className="w-20 h-10 p-1"
                          />
                          <Input
                            value={editingCompany.color}
                            onChange={(e) => setEditingCompany({ ...editingCompany, color: e.target.value })}
                            placeholder="#FF6600"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Company Logo</Label>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleLogoUpload(e, true)}
                            className="hidden"
                            id={`logo-upload-${company.id}`}
                          />
                          <Button
                            variant="outline"
                            onClick={() => document.getElementById(`logo-upload-${company.id}`)?.click()}
                            className="w-full"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {editingCompany.logo ? 'Change Logo' : 'Upload Logo'}
                          </Button>
                        </div>
                        {editingCompany.logo && (
                          <div className="w-16 h-16 rounded-lg border-2 border-gray-200 overflow-hidden">
                            <ImageWithFallback
                              src={editingCompany.logo}
                              alt={editingCompany.name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleUpdateCompany} disabled={isLoading}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setEditingCompany(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveCompany(company.id, 'up')}
                          disabled={company.order === 1}
                        >
                          <Move className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-500">#{company.order}</span>
                      </div>
                      
                      {company.logo && (
                        <div className="w-12 h-12 rounded-lg border overflow-hidden">
                          <ImageWithFallback
                            src={company.logo}
                            alt={company.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span 
                            className="font-semibold text-lg"
                            style={{ color: company.color }}
                          >
                            {company.name}
                          </span>
                          <div 
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{ backgroundColor: company.color }}
                          />
                        </div>
                        <div className="text-sm text-gray-500">
                          Color: {company.color} • Order: {company.order}
                        </div>
                      </div>
                      
                      <Badge variant={company.isActive ? "default" : "secondary"}>
                        {company.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(company.id)}
                        disabled={isLoading}
                      >
                        {company.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCompany(company)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCompany(company.id)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
