import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

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

interface EducationFormProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({ data, onChange }) => {
  const addEducation = () => {
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      endDate: '',
      isCurrentlyStudying: false,
      gpa: '',
      description: '',
      location: ''
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (id: string) => {
    onChange(data.filter(edu => edu.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: string | boolean) => {
    onChange(data.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Education
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {data.map((education, index) => (
          <div key={education.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Education {index + 1}</h3>
              {data.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeEducation(education.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`institution-${education.id}`}>Institution *</Label>
                <Input
                  id={`institution-${education.id}`}
                  placeholder="University of Example"
                  value={education.institution}
                  onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`degree-${education.id}`}>Degree *</Label>
                <Input
                  id={`degree-${education.id}`}
                  placeholder="Bachelor of Science"
                  value={education.degree}
                  onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`fieldOfStudy-${education.id}`}>Field of Study</Label>
                <Input
                  id={`fieldOfStudy-${education.id}`}
                  placeholder="Computer Science"
                  value={education.fieldOfStudy}
                  onChange={(e) => updateEducation(education.id, 'fieldOfStudy', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`location-${education.id}`}>Location</Label>
                <Input
                  id={`location-${education.id}`}
                  placeholder="New York, NY"
                  value={education.location}
                  onChange={(e) => updateEducation(education.id, 'location', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`startDate-${education.id}`}>Start Date</Label>
                <Input
                  id={`startDate-${education.id}`}
                  type="month"
                  value={education.startDate}
                  onChange={(e) => updateEducation(education.id, 'startDate', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`endDate-${education.id}`}>End Date</Label>
                <Input
                  id={`endDate-${education.id}`}
                  type="month"
                  value={education.endDate}
                  onChange={(e) => updateEducation(education.id, 'endDate', e.target.value)}
                  disabled={education.isCurrentlyStudying}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`gpa-${education.id}`}>GPA (Optional)</Label>
                <Input
                  id={`gpa-${education.id}`}
                  placeholder="3.8"
                  value={education.gpa}
                  onChange={(e) => updateEducation(education.id, 'gpa', e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id={`currentlyStudying-${education.id}`}
                checked={education.isCurrentlyStudying}
                onCheckedChange={(checked) => {
                  updateEducation(education.id, 'isCurrentlyStudying', checked as boolean);
                  if (checked) {
                    updateEducation(education.id, 'endDate', '');
                  }
                }}
              />
              <Label htmlFor={`currentlyStudying-${education.id}`}>
                I am currently studying here
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`description-${education.id}`}>Description (Optional)</Label>
              <Textarea
                id={`description-${education.id}`}
                placeholder="Relevant coursework, achievements, honors, etc."
                value={education.description}
                onChange={(e) => updateEducation(education.id, 'description', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Education
        </Button>
      </CardContent>
    </Card>
  );
};

export default EducationForm;