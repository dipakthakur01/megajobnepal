import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { User, Mail, Phone, MapPin, Globe, Linkedin, Github } from 'lucide-react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  linkedin: string;
  website: string;
  github: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ data, onChange }) => {
  const handleChange = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isValidPhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phone === '' || phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const isValidUrl = (url: string) => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={data.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                className={`pl-10 ${data.email && !isValidEmail(data.email) ? 'border-red-500 focus:border-red-500' : ''}`}
                value={data.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
            {data.email && !isValidEmail(data.email) && (
              <p className="text-sm text-red-600">Please enter a valid email address</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                className={`pl-10 ${data.phone && !isValidPhone(data.phone) ? 'border-red-500 focus:border-red-500' : ''}`}
                value={data.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
              />
            </div>
            {data.phone && !isValidPhone(data.phone) && (
              <p className="text-sm text-red-600">Please enter a valid phone number</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="address"
                placeholder="123 Main Street"
                className="pl-10"
                value={data.address}
                onChange={(e) => handleChange('address', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              placeholder="New York"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Input
              id="state"
              placeholder="NY"
              value={data.state}
              onChange={(e) => handleChange('state', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP/Postal Code</Label>
            <Input
              id="zipCode"
              placeholder="10001"
              value={data.zipCode}
              onChange={(e) => handleChange('zipCode', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              placeholder="United States"
              value={data.country}
              onChange={(e) => handleChange('country', e.target.value)}
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Professional Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn Profile</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="linkedin"
                  placeholder="https://linkedin.com/in/yourprofile"
                  className={`pl-10 ${data.linkedin && !isValidUrl(data.linkedin) ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={data.linkedin}
                  onChange={(e) => handleChange('linkedin', e.target.value)}
                />
              </div>
              {data.linkedin && !isValidUrl(data.linkedin) && (
                <p className="text-sm text-red-600">Please enter a valid URL</p>
              )}
            </div>
            <div className="space-y-2">
                <Label htmlFor="website">Personal Website</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    className={`pl-10 ${data.website && !isValidUrl(data.website) ? 'border-red-500 focus:border-red-500' : ''}`}
                    value={data.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                  />
                </div>
                {data.website && !isValidUrl(data.website) && (
                  <p className="text-sm text-red-600">Please enter a valid URL</p>
                )}
              </div>
            <div className="space-y-2">
              <Label htmlFor="github">GitHub Profile</Label>
              <div className="relative">
                <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="github"
                  placeholder="https://github.com/yourusername"
                  className={`pl-10 ${data.github && !isValidUrl(data.github) ? 'border-red-500 focus:border-red-500' : ''}`}
                  value={data.github}
                  onChange={(e) => handleChange('github', e.target.value)}
                />
              </div>
              {data.github && !isValidUrl(data.github) && (
                <p className="text-sm text-red-600">Please enter a valid URL</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;