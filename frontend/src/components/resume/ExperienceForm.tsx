import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Briefcase, Plus, Trash2 } from 'lucide-react';

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

interface ExperienceFormProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({ data, onChange }) => {
  const addExperience = () => {
    const newExperience: Experience = {
      id: Date.now().toString(),
      jobTitle: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrentJob: false,
      description: '',
      achievements: ['']
    };
    onChange([...data, newExperience]);
  };

  const removeExperience = (id: string) => {
    onChange(data.filter(exp => exp.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    onChange(data.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const addAchievement = (experienceId: string) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      updateExperience(experienceId, 'achievements', [...experience.achievements, '']);
    }
  };

  const removeAchievement = (experienceId: string, achievementIndex: number) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      const newAchievements = experience.achievements.filter((_, index) => index !== achievementIndex);
      updateExperience(experienceId, 'achievements', newAchievements);
    }
  };

  const updateAchievement = (experienceId: string, achievementIndex: number, value: string) => {
    const experience = data.find(exp => exp.id === experienceId);
    if (experience) {
      const newAchievements = experience.achievements.map((achievement, index) =>
        index === achievementIndex ? value : achievement
      );
      updateExperience(experienceId, 'achievements', newAchievements);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Work Experience
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((experience, index) => (
          <div key={experience.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Experience {index + 1}</h3>
              {data.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeExperience(experience.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`jobTitle-${experience.id}`}>Job Title *</Label>
                <Input
                  id={`jobTitle-${experience.id}`}
                  placeholder="Software Engineer"
                  value={experience.jobTitle}
                  onChange={(e) => updateExperience(experience.id, 'jobTitle', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`company-${experience.id}`}>Company *</Label>
                <Input
                  id={`company-${experience.id}`}
                  placeholder="Tech Company Inc."
                  value={experience.company}
                  onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`location-${experience.id}`}>Location</Label>
                <Input
                  id={`location-${experience.id}`}
                  placeholder="San Francisco, CA"
                  value={experience.location}
                  onChange={(e) => updateExperience(experience.id, 'location', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`startDate-${experience.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${experience.id}`}
                  type="month"
                  value={experience.startDate}
                  onChange={(e) => updateExperience(experience.id, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${experience.id}`}>End Date</Label>
                <Input
                  id={`endDate-${experience.id}`}
                  type="month"
                  value={experience.endDate}
                  onChange={(e) => updateExperience(experience.id, 'endDate', e.target.value)}
                  disabled={experience.isCurrentJob}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`currentJob-${experience.id}`}
                checked={experience.isCurrentJob}
                onCheckedChange={(checked) => {
                  updateExperience(experience.id, 'isCurrentJob', checked as boolean);
                  if (checked) {
                    updateExperience(experience.id, 'endDate', '');
                  }
                }}
              />
              <Label htmlFor={`currentJob-${experience.id}`}>
                I currently work here
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${experience.id}`}>Job Description</Label>
              <Textarea
                id={`description-${experience.id}`}
                placeholder="Describe your role and responsibilities..."
                value={experience.description}
                onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label>Key Achievements</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addAchievement(experience.id)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Achievement
                </Button>
              </div>
              
              {experience.achievements.map((achievement, achievementIndex) => (
                <div key={achievementIndex} className="flex gap-2">
                  <Input
                    placeholder="• Increased team productivity by 25%..."
                    value={achievement}
                    onChange={(e) => updateAchievement(experience.id, achievementIndex, e.target.value)}
                    className="flex-1"
                  />
                  {experience.achievements.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAchievement(experience.id, achievementIndex)}
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
          onClick={addExperience}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Experience
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExperienceForm;