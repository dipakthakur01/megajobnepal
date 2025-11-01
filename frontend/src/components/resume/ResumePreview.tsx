import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Linkedin, 
  Github, 
  ExternalLink,
  Calendar
} from 'lucide-react';
import ClassicTemplate from './templates/ClassicTemplate';
import CreativeTemplate from './templates/CreativeTemplate';

// Types (same as ResumeBuilder)
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

interface ResumePreviewProps {
  data: ResumeData;
  onTemplateChange?: (template: string) => void;
}

const templates = [
  { id: 'modern', name: 'Modern', description: 'Clean and contemporary design' },
  { id: 'professional', name: 'Professional', description: 'ATS-friendly structured layout' },
  { id: 'classic', name: 'Classic', description: 'Traditional professional layout' },
  { id: 'creative', name: 'Creative', description: 'Bold and eye-catching design' }
];

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, onTemplateChange }) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatDateRange = (startDate: string, endDate: string, isCurrent: boolean) => {
    const start = formatDate(startDate);
    const end = isCurrent ? 'Present' : formatDate(endDate);
    return `${start} - ${end}`;
  };

  const getFullAddress = () => {
    const { address, city, state, zipCode, country } = data.personalInfo;
    const parts = [address, city, state, zipCode, country].filter(Boolean);
    return parts.join(', ');
  };

  const groupSkillsByCategory = () => {
    return data.skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {} as Record<string, Skill[]>);
  };

  const renderModernTemplate = () => (
    <div className="bg-white shadow-lg max-w-4xl mx-auto" style={{ minHeight: '11in' }}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8">
        <h1 className="text-4xl font-bold mb-2">{data.personalInfo.fullName}</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            {data.personalInfo.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>{data.personalInfo.email}</span>
              </div>
            )}
            {data.personalInfo.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>{data.personalInfo.phone}</span>
              </div>
            )}
            {getFullAddress() && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{getFullAddress()}</span>
              </div>
            )}
          </div>
          <div className="space-y-2">
            {data.personalInfo.linkedin && (
              <div className="flex items-center gap-2">
                <Linkedin className="h-4 w-4" />
                <span className="truncate">{data.personalInfo.linkedin}</span>
              </div>
            )}
            {data.personalInfo.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span className="truncate">{data.personalInfo.website}</span>
              </div>
            )}
            {data.personalInfo.github && (
              <div className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                <span className="truncate">{data.personalInfo.github}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Summary */}
        {data.summary && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">{data.summary}</p>
          </section>
        )}

        {/* Experience */}
        {data.experience.length > 0 && data.experience[0].jobTitle && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
              Professional Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{exp.jobTitle}</h3>
                      <p className="text-lg text-blue-600 font-medium">{exp.company}</p>
                      {exp.location && <p className="text-gray-600">{exp.location}</p>}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDateRange(exp.startDate, exp.endDate, exp.isCurrentJob)}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-gray-700 mb-3">{exp.description}</p>
                  )}
                  {exp.achievements.length > 0 && exp.achievements[0] && (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {exp.achievements.filter(achievement => achievement.trim()).map((achievement, index) => (
                        <li key={index}>{achievement}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {data.education.length > 0 && data.education[0].institution && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{edu.degree}</h3>
                      <p className="text-blue-600 font-medium">{edu.institution}</p>
                      {edu.fieldOfStudy && <p className="text-gray-600">{edu.fieldOfStudy}</p>}
                      {edu.location && <p className="text-gray-600">{edu.location}</p>}
                      {edu.gpa && <p className="text-gray-600">GPA: {edu.gpa}</p>}
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDateRange(edu.startDate, edu.endDate, edu.isCurrentlyStudying)}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
              Skills
            </h2>
            <div className="space-y-4">
              {Object.entries(groupSkillsByCategory()).map(([category, skills]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{category}</h3>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill.id} variant="secondary" className="bg-blue-100 text-blue-800">
                        {skill.name} ({skill.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {data.projects.length > 0 && data.projects[0].name && (
          <section>
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 border-blue-600 pb-2">
              Projects
            </h2>
            <div className="space-y-6">
              {data.projects.map((project) => (
                <div key={project.id} className="border-l-4 border-blue-200 pl-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800">{project.name}</h3>
                      <div className="flex gap-4 mt-1">
                        {project.projectUrl && (
                          <a href={project.projectUrl} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a href={project.githubUrl} className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                            <Github className="h-3 w-3" />
                            GitHub
                          </a>
                        )}
                      </div>
                    </div>
                    <span className="text-gray-500 text-sm">
                      {formatDateRange(project.startDate, project.endDate, false)}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="mb-3">
                      <span className="text-sm font-medium text-gray-600">Technologies: </span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {project.technologies.map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.highlights.length > 0 && project.highlights[0] && (
                    <ul className="list-disc list-inside text-gray-700 space-y-1">
                      {project.highlights.filter(highlight => highlight.trim()).map((highlight, index) => (
                        <li key={index}>{highlight}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderTemplate = () => {
    switch (data.template) {
      case 'classic':
        return <ClassicTemplate data={data} />;
      case 'creative':
        return <CreativeTemplate data={data} />;
      case 'professional':
      case 'modern':
      default:
        return renderModernTemplate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Template Selector */}
      {onTemplateChange && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Resume Template</h3>
                <p className="text-sm text-gray-600">Choose a template for your resume</p>
              </div>
              <Select value={data.template} onValueChange={onTemplateChange}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resume Preview */}
      <div className="bg-gray-100 p-8 rounded-lg">
        <div className="transform scale-75 origin-top">
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;