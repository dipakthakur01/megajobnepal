import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Download, 
  Calendar, 
  MapPin, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Github,
  AlertCircle
} from 'lucide-react';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  linkedin?: string;
  website?: string;
  github?: string;
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  description?: string;
}

interface Experience {
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
  name: string;
  category: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface Project {
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate: string;
  projectUrl?: string;
  githubUrl?: string;
  highlights: string[];
}

interface ResumeData {
  _id: string;
  title: string;
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
  template: string;
  createdAt: string;
  updatedAt: string;
}

const SharedResumeView: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchSharedResume();
    }
  }, [token]);

  const fetchSharedResume = async () => {
    try {
      const response = await fetch(`/api/resumes/shared/${token}`);
      
      if (response.ok) {
        const result = await response.json();
        setResume(result.data || result);
      } else if (response.status === 404) {
        setError('Resume not found or sharing link has expired.');
      } else {
        setError('Failed to load resume.');
      }
    } catch (error) {
      console.error('Error fetching shared resume:', error);
      setError('Failed to load resume.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resume || !token) return;

    try {
      const response = await fetch(`/api/resumes/shared/${token}/export/pdf`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.personalInfo.fullName}_Resume.pdf`;
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

  // Add DOCX download handler
  const handleDownloadDocx = async () => {
    if (!resume || !token) return;

    try {
      const response = await fetch(`/api/resumes/shared/${token}/export/docx`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${resume.personalInfo.fullName}_Resume.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to download Word file');
      }
    } catch (error) {
      console.error('Error downloading resume DOCX:', error);
      alert('Failed to download Word file');
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  const groupSkillsByCategory = (skills: Skill[]) => {
    return skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Resume Not Found</h3>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!resume) {
    return null;
  }

  const groupedSkills = groupSkillsByCategory(resume.skills);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{resume.title}</h1>
              <p className="text-gray-600">Shared by {resume.personalInfo.fullName}</p>
            </div>
            <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
            <Button onClick={handleDownloadDocx} className="bg-indigo-600 hover:bg-indigo-700 ml-2">
              <Download className="h-4 w-4 mr-2" />
              Download Word
            </Button>
          </div>
        </div>

        {/* Resume Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          {/* Personal Information */}
          <div className="text-center border-b pb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {resume.personalInfo.fullName}
            </h1>
            <div className="flex flex-wrap justify-center gap-4 text-gray-600 mb-4">
              {resume.personalInfo.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-4 w-4" />
                  <span>{resume.personalInfo.email}</span>
                </div>
              )}
              {resume.personalInfo.phone && (
                <div className="flex items-center gap-1">
                  <Phone className="h-4 w-4" />
                  <span>{resume.personalInfo.phone}</span>
                </div>
              )}
              {(resume.personalInfo.city || resume.personalInfo.state) && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[resume.personalInfo.city, resume.personalInfo.state]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex justify-center gap-4">
              {resume.personalInfo.linkedin && (
                <a
                  href={resume.personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="h-4 w-4" />
                  <span>LinkedIn</span>
                </a>
              )}
              {resume.personalInfo.website && (
                <a
                  href={resume.personalInfo.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Globe className="h-4 w-4" />
                  <span>Website</span>
                </a>
              )}
              {resume.personalInfo.github && (
                <a
                  href={resume.personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>

          {/* Summary */}
          {resume.summary && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Professional Summary</h2>
              <p className="text-gray-700 leading-relaxed">{resume.summary}</p>
            </div>
          )}

          {/* Experience */}
          {resume.experience.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Experience</h2>
              <div className="space-y-6">
                {resume.experience.map((exp, index) => (
                  <div key={index} className="border-l-2 border-blue-200 pl-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{exp.jobTitle}</h3>
                        <p className="text-lg text-blue-600 font-medium">{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-600">{exp.location}</p>
                        )}
                      </div>
                      <div className="text-right text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 mb-3">{exp.description}</p>
                    )}
                    {exp.achievements.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {exp.achievements.map((achievement, achIndex) => (
                          <li key={achIndex}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Education</h2>
              <div className="space-y-4">
                {resume.education.map((edu, index) => (
                  <div key={index} className="border-l-2 border-green-200 pl-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{edu.degree}</h3>
                        <p className="text-lg text-green-600 font-medium">{edu.institution}</p>
                        <p className="text-gray-600">{edu.fieldOfStudy}</p>
                        {edu.gpa && (
                          <p className="text-gray-600">GPA: {edu.gpa}</p>
                        )}
                      </div>
                      <div className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    {edu.description && (
                      <p className="text-gray-700 mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Skills</h2>
              <div className="space-y-4">
                {Object.entries(groupedSkills).map(([category, skills]) => (
                  <div key={category}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {skill.name}
                          <span className="ml-1 text-xs text-gray-500">
                            ({skill.proficiency})
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {resume.projects.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Projects</h2>
              <div className="space-y-6">
                {resume.projects.map((project, index) => (
                  <div key={index} className="border-l-2 border-purple-200 pl-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                        <div className="flex gap-4 mt-1">
                          {project.projectUrl && (
                            <a
                              href={project.projectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              View Project
                            </a>
                          )}
                          {project.githubUrl && (
                            <a
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm"
                            >
                              GitHub
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3">{project.description}</p>
                    {project.technologies.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {project.highlights.length > 0 && (
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {project.highlights.map((highlight, hlIndex) => (
                          <li key={hlIndex}>{highlight}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>This resume was created using MegaJobNepal Resume Builder</p>
        </div>
      </div>
    </div>
  );
};

export default SharedResumeView;