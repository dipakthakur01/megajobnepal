import React from 'react';
import { Badge } from '../../ui/badge';
import { Calendar, MapPin, Mail, Phone, Globe, Linkedin, Github, Star } from 'lucide-react';

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

interface CreativeTemplateProps {
  data: ResumeData;
}

const CreativeTemplate: React.FC<CreativeTemplateProps> = ({ data }) => {
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

  const getProficiencyStars = (proficiency: string) => {
    const levels = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3, 'Expert': 4 };
    const level = levels[proficiency as keyof typeof levels] || 1;
    return Array.from({ length: 4 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${i < level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const groupedSkills = groupSkillsByCategory(data.skills);

  return (
    <div className="bg-white shadow-lg max-w-4xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 text-white p-8">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-2">
              {data.personalInfo.fullName}
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm opacity-90">
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
              {(data.personalInfo.city || data.personalInfo.state) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {[data.personalInfo.city, data.personalInfo.state]
                      .filter(Boolean)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-4 mt-4">
              {data.personalInfo.linkedin && (
                <a
                  href={data.personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition-all"
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
                  className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition-all"
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
                  className="flex items-center gap-1 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm hover:bg-opacity-30 transition-all"
                >
                  <Github className="h-4 w-4" />
                  <span>GitHub</span>
                </a>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="text-6xl font-bold">
                {data.personalInfo.fullName.split(' ').map(name => name[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Summary */}
        {data.summary && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-purple-600 to-blue-600 mr-3 rounded"></div>
              About Me
            </h2>
            <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border-l-4 border-purple-600">
              {data.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {data.experience.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-teal-600 mr-3 rounded"></div>
              Experience
            </h2>
            <div className="space-y-6">
              {data.experience.map((exp, index) => (
                <div key={index} className="relative pl-8 border-l-2 border-blue-200">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-600 rounded-full"></div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">{exp.jobTitle}</h3>
                        <p className="text-lg text-blue-600 font-semibold">{exp.company}</p>
                        {exp.location && (
                          <p className="text-gray-600 flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {exp.location}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-gray-600 border-gray-300">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(exp.startDate)} - {exp.isCurrentJob ? 'Present' : formatDate(exp.endDate)}
                        </Badge>
                      </div>
                    </div>
                    {exp.description && (
                      <p className="text-gray-700 mb-3">{exp.description}</p>
                    )}
                    {exp.achievements.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2">Key Achievements:</h4>
                        <ul className="space-y-1">
                          {exp.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="flex items-start gap-2 text-gray-700">
                              <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-teal-600 to-green-600 mr-3 rounded"></div>
              Education
            </h2>
            <div className="grid gap-4">
              {data.education.map((edu, index) => (
                <div key={index} className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-200 rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{edu.degree}</h3>
                      <p className="text-lg text-teal-600 font-semibold">{edu.institution}</p>
                      <p className="text-gray-600">{edu.fieldOfStudy}</p>
                      {edu.gpa && (
                        <Badge variant="secondary" className="mt-2">
                          GPA: {edu.gpa}
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-300">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                    </Badge>
                  </div>
                  {edu.description && (
                    <p className="text-gray-700 mt-3">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-green-600 to-yellow-600 mr-3 rounded"></div>
              Skills & Expertise
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {Object.entries(groupedSkills).map(([category, skills]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">{category}</h3>
                  <div className="space-y-3">
                    {skills.map((skill, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700 font-medium">{skill.name}</span>
                        <div className="flex items-center gap-1">
                          {getProficiencyStars(skill.proficiency)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <div className="w-1 h-8 bg-gradient-to-b from-yellow-600 to-red-600 mr-3 rounded"></div>
              Featured Projects
            </h2>
            <div className="grid gap-6">
              {data.projects.map((project, index) => (
                <div key={index} className="bg-gradient-to-r from-yellow-50 to-red-50 border border-yellow-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                      <div className="flex gap-3 mt-2">
                        {project.projectUrl && (
                          <a
                            href={project.projectUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700 transition-colors"
                          >
                            <Globe className="h-3 w-3" />
                            Live Demo
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-gray-800 text-white px-3 py-1 rounded-full text-sm hover:bg-gray-900 transition-colors"
                          >
                            <Github className="h-3 w-3" />
                            Code
                          </a>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-gray-600 border-gray-300">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(project.startDate)} - {formatDate(project.endDate)}
                    </Badge>
                  </div>
                  <p className="text-gray-700 mb-4">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-800 mb-2">Technologies:</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="bg-white border border-gray-300">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {project.highlights.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Highlights:</h4>
                      <ul className="space-y-1">
                        {project.highlights.map((highlight, hlIndex) => (
                          <li key={hlIndex} className="flex items-start gap-2 text-gray-700">
                            <div className="w-2 h-2 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreativeTemplate;