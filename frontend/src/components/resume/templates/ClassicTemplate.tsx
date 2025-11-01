import React from 'react';
import { Badge } from '../../ui/badge';
import { Calendar, MapPin, Mail, Phone, Globe, Linkedin, Github } from 'lucide-react';

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
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  projects: Project[];
}

interface ClassicTemplateProps {
  data: ResumeData;
}

const ClassicTemplate: React.FC<ClassicTemplateProps> = ({ data }) => {
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

  const groupedSkills = groupSkillsByCategory(data.skills);

  return (
    <div className="bg-white p-8 shadow-lg max-w-4xl mx-auto" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-6 mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-wide">
          {data.personalInfo.fullName.toUpperCase()}
        </h1>
        <div className="flex flex-wrap justify-center gap-6 text-gray-700 text-sm">
          {data.personalInfo.email && (
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span>{data.personalInfo.email}</span>
            </div>
          )}
          {data.personalInfo.phone && (
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              <span>{data.personalInfo.phone}</span>
            </div>
          )}
          {(data.personalInfo.city || data.personalInfo.state) && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>
                {[data.personalInfo.city, data.personalInfo.state]
                  .filter(Boolean)
                  .join(', ')}
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-6 mt-3">
          {data.personalInfo.linkedin && (
            <a
              href={data.personalInfo.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:text-blue-800 text-sm"
            >
              <Linkedin className="h-4 w-4" />
              <span>LinkedIn</span>
            </a>
          )}
          {data.personalInfo.website && (
            <a
              href={data.personalInfo.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:text-blue-800 text-sm"
            >
              <Globe className="h-4 w-4" />
              <span>Website</span>
            </a>
          )}
          {data.personalInfo.github && (
            <a
              href={data.personalInfo.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:text-blue-800 text-sm"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </a>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3 border-b border-gray-400 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-1">
            PROFESSIONAL EXPERIENCE
          </h2>
          <div className="space-y-6">
            {data.experience.map((exp, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{exp.jobTitle}</h3>
                    <p className="text-lg text-gray-800 font-semibold">{exp.company}</p>
                    {exp.location && (
                      <p className="text-gray-600 italic">{exp.location}</p>
                    )}
                  </div>
                  <div className="text-right text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
                {exp.description && (
                  <p className="text-gray-700 mb-3 text-justify">{exp.description}</p>
                )}
                {exp.achievements.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
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
      {data.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-1">
            EDUCATION
          </h2>
          <div className="space-y-4">
            {data.education.map((edu, index) => (
              <div key={index}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{edu.degree}</h3>
                    <p className="text-lg text-gray-800 font-semibold">{edu.institution}</p>
                    <p className="text-gray-600">{edu.fieldOfStudy}</p>
                    {edu.gpa && (
                      <p className="text-gray-600">GPA: {edu.gpa}</p>
                    )}
                  </div>
                  <div className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{formatDate(edu.startDate)} - {formatDate(edu.endDate)}</span>
                    </div>
                  </div>
                </div>
                {edu.description && (
                  <p className="text-gray-700 mt-2 text-justify">{edu.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-1">
            TECHNICAL SKILLS
          </h2>
          <div className="space-y-3">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{category}:</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <span key={index} className="text-gray-700">
                      {skill.name}
                      <span className="text-gray-500 text-sm ml-1">
                        ({skill.proficiency})
                      </span>
                      {index < skills.length - 1 && <span className="text-gray-500 ml-2">•</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-400 pb-1">
            PROJECTS
          </h2>
          <div className="space-y-6">
            {data.projects.map((project, index) => (
              <div key={index}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{project.name}</h3>
                    <div className="flex gap-4 mt-1">
                      {project.projectUrl && (
                        <a
                          href={project.projectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-800 text-sm underline"
                        >
                          View Project
                        </a>
                      )}
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-700 hover:text-blue-800 text-sm underline"
                        >
                          GitHub
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">{formatDate(project.startDate)} - {formatDate(project.endDate)}</span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-3 text-justify">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="mb-3">
                    <span className="font-semibold text-gray-800">Technologies: </span>
                    <span className="text-gray-700">{project.technologies.join(', ')}</span>
                  </div>
                )}
                {project.highlights.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
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
  );
};

export default ClassicTemplate;