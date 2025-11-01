import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { safeStorage } from '../../lib/safe-storage';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  Save, 
  Download, 
  Eye, 
  FileText,
  User,
  GraduationCap,
  Briefcase,
  Settings,
  FolderOpen
} from 'lucide-react';

// Import form components
import PersonalInfoForm from './PersonalInfoForm';
import SummaryForm from './SummaryForm';
import EducationForm from './EducationForm';
import ExperienceForm from './ExperienceForm';
import SkillsForm from './SkillsForm';
import ProjectsForm from './ProjectsForm';
import ResumePreview from './ResumePreview';

// Types
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

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  isCurrentlyStudying: boolean;
  gpa: string;
  description: string;
  location: string;
}

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
  achievements: string[];
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  projectUrl: string;
  githubUrl: string;
  highlights: string[];
}

interface ResumeData {
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  template: string;
}

const steps = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'summary', label: 'Summary', icon: FileText },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Settings },
  { id: 'projects', label: 'Projects', icon: FolderOpen }
];

const ResumeBuilder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(!!id);
  const [resumeData, setResumeData] = useState<ResumeData>({
    title: 'My Resume',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      linkedin: '',
      website: '',
      github: ''
    },
    summary: '',
    education: [{
      id: '1',
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      gpa: '',
      description: '',
      location: ''
    }],
    experience: [{
      id: '1',
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      description: '',
      achievements: ['']
    }],
    skills: [],
    projects: [],
    template: 'modern'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-save functionality
  useEffect(() => {
    const autoSave = setTimeout(() => {
      handleSave(true); // Silent save
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(autoSave);
  }, [resumeData]);

  useEffect(() => {
    loadUserData();
  }, []);

  // Load existing resume if editing
  useEffect(() => {
    if (id) {
      loadExistingResume();
    }
  }, [id]);

  const loadExistingResume = async () => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      if (!token) return;

      const response = await fetch(`/api/resumes/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        setResumeData(result.data);
      } else {
        console.error('Failed to load resume');
      }
    } catch (error) {
      console.error('Error loading resume:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserData = async () => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      if (!token) return;

      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        const user = result.user;
        setResumeData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: user?.full_name || prev.personalInfo.fullName,
            email: user?.email || prev.personalInfo.email,
            phone: user?.phone || prev.personalInfo.phone,
            location: user?.location || prev.personalInfo.address
          }
        }));
      }
    } catch (error) {
      /* noop */
    }
  };

  const handleSave = async (silent = false) => {
    if (!silent) setIsSaving(true);
    
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      if (!token) throw new Error('No authentication token');

      const url = id ? `/api/resumes/${id}` : '/api/resumes';
      const method = id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        // Try to surface server validation errors
        let message = 'Failed to save resume';
        try {
          const errJson = await response.json();
          if (errJson?.errors && Array.isArray(errJson.errors) && errJson.errors.length) {
            message = errJson.errors.join('\n');
          } else if (errJson?.message) {
            message = errJson.message;
          }
        } catch {/* ignore parse errors */}
        throw new Error(message);
      }

      // On success, sync with server response and set route id after create
      const result = await response.json().catch(() => null);
      const saved = result?.data || null;
      if (saved) {
        setResumeData(saved);
        if (!id && saved._id) {
          navigate(`/resume-builder/${saved._id}`, { replace: true });
        }
      }

      if (!silent) {
        console.log('Resume saved successfully');
      }
    } catch (error: any) {
      console.error('Error saving resume:', error);
      if (!silent) {
        alert(error?.message || 'Failed to save resume. Please try again.');
      }
    } finally {
      if (!silent) setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      if (!token) throw new Error('No authentication token');

      const response = await fetch('/api/resumes/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.fullName || 'resume'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('Failed to download resume. Please try again.');
    }
  };

  const handleDownloadDocx = async () => {
    try {
      const token = safeStorage.getItem('megajobnepal_auth_token');
      if (!token) throw new Error('No authentication token');
  
      const response = await fetch('/api/resumes/export/docx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(resumeData)
      });
  
      if (!response.ok) {
        throw new Error('Failed to generate DOCX');
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${resumeData.personalInfo.fullName || 'resume'}.docx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading resume DOCX:', error);
      alert('Failed to download Word file. Please try again.');
    }
  };

  if (showPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <Button
              variant="outline"
              onClick={() => setShowPreview(false)}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </Button>
              <Button onClick={handleDownloadDocx}>
                <Download className="h-4 w-4 mr-2" />
                Download Word
              </Button>
            </div>
          </div>
          <ResumePreview
            data={resumeData}
            onTemplateChange={(template) => setResumeData(prev => ({ ...prev, template }))}
          />
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
          <p className="text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Resume Builder</h1>
            <p className="text-gray-600">Step {currentStep + 1} of {steps.length}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button onClick={() => handleSave(false)} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <div className="space-y-2">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${currentStep === index ? 'bg-gray-100' : ''}`}
                      onClick={() => setCurrentStep(index)}
                    >
                      <div className="flex items-center">
                        <step.icon className="h-5 w-5 mr-2" />
                        <span>{step.label}</span>
                      </div>
                      <Badge variant="success">{index <= currentStep ? '✓' : ''}</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setCurrentStep(Math.max(currentStep - 1, 0))}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(Math.min(currentStep + 1, steps.length - 1))}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="col-span-3">
                <Tabs value={steps[currentStep].id}>
                  <TabsList className="grid grid-cols-6 w-full">
                    {steps.map((step) => (
                      <TabsTrigger key={step.id} value={step.id}>
                        {step.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  <TabsContent value="personal">
                    <PersonalInfoForm
                      data={resumeData.personalInfo}
                      onChange={(data) => setResumeData(prev => ({ ...prev, personalInfo: data }))}
                    />
                  </TabsContent>

                  <TabsContent value="summary">
                    <SummaryForm
                      data={resumeData.summary}
                      onChange={(data) => setResumeData(prev => ({ ...prev, summary: data }))}
                    />
                  </TabsContent>

                  <TabsContent value="experience">
                    <ExperienceForm
                      data={resumeData.experience}
                      onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))}
                    />
                  </TabsContent>

                  <TabsContent value="education">
                    <EducationForm
                      data={resumeData.education}
                      onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))}
                    />
                  </TabsContent>

                  <TabsContent value="skills">
                    <SkillsForm
                      data={resumeData.skills}
                      onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))}
                    />
                  </TabsContent>

                  <TabsContent value="projects">
                    <ProjectsForm
                      data={resumeData.projects}
                      onChange={(data) => setResumeData(prev => ({ ...prev, projects: data }))}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumeBuilder;