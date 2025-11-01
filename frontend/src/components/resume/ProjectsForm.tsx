import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FolderOpen, Plus, Trash2, ExternalLink, Github, X } from 'lucide-react';

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

interface ProjectsFormProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

const ProjectsForm: React.FC<ProjectsFormProps> = ({ data, onChange }) => {
  // Validation functions
  const isValidUrl = (url: string): boolean => {
    if (!url) return true; // Empty URLs are valid (optional field)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: [],
      startDate: '',
      endDate: '',
      projectUrl: '',
      githubUrl: '',
      highlights: ['']
    };
    onChange([...data, newProject]);
  };

  const removeProject = (id: string) => {
    onChange(data.filter(project => project.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    onChange(data.map(project => 
      project.id === id ? { ...project, [field]: value } : project
    ));
  };

  const addTechnology = (projectId: string, technology: string) => {
    if (technology.trim()) {
      const project = data.find(p => p.id === projectId);
      if (project && !project.technologies.includes(technology.trim())) {
        updateProject(projectId, 'technologies', [...project.technologies, technology.trim()]);
      }
    }
  };

  const removeTechnology = (projectId: string, technology: string) => {
    const project = data.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, 'technologies', project.technologies.filter(tech => tech !== technology));
    }
  };

  const addHighlight = (projectId: string) => {
    const project = data.find(p => p.id === projectId);
    if (project) {
      updateProject(projectId, 'highlights', [...project.highlights, '']);
    }
  };

  const removeHighlight = (projectId: string, highlightIndex: number) => {
    const project = data.find(p => p.id === projectId);
    if (project) {
      const newHighlights = project.highlights.filter((_, index) => index !== highlightIndex);
      updateProject(projectId, 'highlights', newHighlights);
    }
  };

  const updateHighlight = (projectId: string, highlightIndex: number, value: string) => {
    const project = data.find(p => p.id === projectId);
    if (project) {
      const newHighlights = project.highlights.map((highlight, index) =>
        index === highlightIndex ? value : highlight
      );
      updateProject(projectId, 'highlights', newHighlights);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderOpen className="h-5 w-5" />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((project, index) => (
          <div key={project.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Project {index + 1}</h3>
              {data.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeProject(project.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`projectName-${project.id}`}>Project Name *</Label>
                <Input
                  id={`projectName-${project.id}`}
                  placeholder="E-commerce Website"
                  value={project.name}
                  onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor={`startDate-${project.id}`}>Start Date</Label>
                  <Input
                    id={`startDate-${project.id}`}
                    type="month"
                    value={project.startDate}
                    onChange={(e) => updateProject(project.id, 'startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`endDate-${project.id}`}>End Date</Label>
                  <Input
                    id={`endDate-${project.id}`}
                    type="month"
                    value={project.endDate}
                    onChange={(e) => updateProject(project.id, 'endDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${project.id}`}>Project Description *</Label>
              <Textarea
                id={`description-${project.id}`}
                placeholder="Describe what this project does, your role, and the impact..."
                value={project.description}
                onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`projectUrl-${project.id}`}>Project URL</Label>
                <div className="relative">
                  <ExternalLink className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`projectUrl-${project.id}`}
                    placeholder="https://myproject.com"
                    className={`pl-10 ${project.projectUrl && !isValidUrl(project.projectUrl) ? 'border-red-500 focus:border-red-500' : ''}`}
                    value={project.projectUrl}
                    onChange={(e) => updateProject(project.id, 'projectUrl', e.target.value)}
                  />
                </div>
                {project.projectUrl && !isValidUrl(project.projectUrl) && (
                  <p className="text-sm text-red-600">Please enter a valid URL</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor={`githubUrl-${project.id}`}>GitHub URL</Label>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id={`githubUrl-${project.id}`}
                    placeholder="https://github.com/username/repo"
                    className={`pl-10 ${project.githubUrl && !isValidUrl(project.githubUrl) ? 'border-red-500 focus:border-red-500' : ''}`}
                    value={project.githubUrl}
                    onChange={(e) => updateProject(project.id, 'githubUrl', e.target.value)}
                  />
                </div>
                {project.githubUrl && !isValidUrl(project.githubUrl) && (
                  <p className="text-sm text-red-600">Please enter a valid URL</p>
                )}
              </div>
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <Label>Technologies Used</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {project.technologies.map((tech, techIndex) => (
                  <Badge key={techIndex} variant="secondary" className="flex items-center gap-1">
                    {tech}
                    <button
                      type="button"
                      onClick={() => removeTechnology(project.id, tech)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add technology (React, Node.js, MongoDB...)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTechnology(project.id, e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addTechnology(project.id, input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Project Highlights */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Key Highlights</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addHighlight(project.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Highlight
                </Button>
              </div>
              
              {project.highlights.map((highlight, highlightIndex) => (
                <div key={highlightIndex} className="flex gap-2">
                  <Input
                    placeholder="• Implemented user authentication system..."
                    value={highlight}
                    onChange={(e) => updateHighlight(project.id, highlightIndex, e.target.value)}
                    className="flex-1"
                  />
                  {project.highlights.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeHighlight(project.id, highlightIndex)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addProject}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </CardContent>
    </Card>
  );
};

export default ProjectsForm;