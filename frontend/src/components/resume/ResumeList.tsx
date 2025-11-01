import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Download, 
  Share, 
  Eye,
  Calendar,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { safeStorage } from '../../lib/safe-storage';

interface Resume {
  _id: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
  };
  template: string;
  isPublic: boolean;
  shareToken?: string;
  createdAt: string;
  updatedAt: string;
}

const ResumeList: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/resumes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setResumes(result.data || []);
      } else {
        console.error('Failed to fetch resumes');
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    navigate('/resume-builder');
  };

  const handleEdit = (resumeId: string) => {
    navigate(`/resume-builder/${resumeId}`);
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      const response = await fetch(`/api/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setResumes(resumes.filter(resume => resume._id !== resumeId));
      } else {
        alert('Failed to delete resume');
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume');
    }
  };

  const handleDownload = async (resumeId: string, fileName: string) => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      const response = await fetch(`/api/resumes/${resumeId}/export/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download resume');
      }
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume');
    }
  };

  const handleShare = async (resumeId: string) => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      const response = await fetch(`/api/resumes/${resumeId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const shareUrl = `${window.location.origin}/resume/shared/${data.shareToken}`;
        
        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('Share link copied to clipboard!');
        }).catch(() => {
          // Fallback for older browsers
          prompt('Copy this link to share your resume:', shareUrl);
        });
      } else {
        alert('Failed to generate share link');
      }
    } catch (error) {
      console.error('Error sharing resume:', error);
      alert('Failed to generate share link');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTemplateDisplayName = (template: string) => {
    const templates: Record<string, string> = {
      'modern': 'Modern',
      'professional': 'Professional',
      'classic': 'Classic',
      'creative': 'Creative'
    };
    return templates[template] || 'Modern';
  };

  const filteredResumes = resumes.filter(resume =>
    resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resume.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Resumes</h1>
          <p className="text-gray-600">Manage your professional resumes</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Resume
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search resumes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Resume Grid */}
      {filteredResumes.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {resumes.length === 0 ? 'No resumes yet' : 'No resumes found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {resumes.length === 0 
                ? 'Create your first professional resume to get started'
                : 'Try adjusting your search terms'
              }
            </p>
            {resumes.length === 0 && (
              <Button onClick={handleCreateNew} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Resume
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResumes.map((resume) => (
            <Card key={resume._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                      {resume.title}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{resume.personalInfo.fullName}</p>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {getTemplateDisplayName(resume.template)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  <span>Updated {formatDate(resume.updatedAt)}</span>
                </div>

                {resume.isPublic && (
                  <Badge variant="outline" className="text-green-600 border-green-200">
                    <Share className="h-3 w-3 mr-1" />
                    Shared
                  </Badge>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(resume._id)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(resume._id, resume.title)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(resume._id)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(resume._id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Resume Limit Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Resume Limit</h3>
              <p className="text-sm text-blue-700">
                You have created {resumes.length} out of 5 allowed resumes
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{resumes.length}/5</div>
              <div className="text-xs text-blue-600">Resumes</div>
            </div>
          </div>
          {resumes.length >= 5 && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                You've reached the maximum number of resumes. Delete an existing resume to create a new one.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeList;