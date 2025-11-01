import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Settings, Plus, X } from 'lucide-react';

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

interface SkillsFormProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

const skillCategories = [
  'Programming Languages',
  'Frameworks & Libraries',
  'Databases',
  'Tools & Technologies',
  'Soft Skills',
  'Languages',
  'Certifications',
  'Other'
];

const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const;

const SkillsForm: React.FC<SkillsFormProps> = ({ data, onChange }) => {
  const [newSkill, setNewSkill] = useState({
    name: '',
    category: 'Programming Languages',
    level: 'Intermediate' as const
  });

  const addSkill = () => {
    if (newSkill.name.trim()) {
      const skill: Skill = {
        id: Date.now().toString(),
        name: newSkill.name.trim(),
        category: newSkill.category,
        level: newSkill.level
      };
      onChange([...data, skill]);
      setNewSkill({
        name: '',
        category: 'Programming Languages',
        level: 'Intermediate'
      });
    }
  };

  const removeSkill = (id: string) => {
    onChange(data.filter(skill => skill.id !== id));
  };

  const updateSkill = (id: string, field: keyof Skill, value: string) => {
    onChange(data.map(skill => 
      skill.id === id ? { ...skill, [field]: value } : skill
    ));
  };

  const groupedSkills = data.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-gray-100 text-gray-800';
      case 'Intermediate': return 'bg-blue-100 text-blue-800';
      case 'Advanced': return 'bg-green-100 text-green-800';
      case 'Expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Skills
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Skill */}
        <div className="border rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium">Add New Skill</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skillName">Skill Name</Label>
              <Input
                id="skillName"
                placeholder="React, Python, Leadership..."
                value={newSkill.name}
                onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillCategory">Category</Label>
              <Select
                value={newSkill.category}
                onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="skillLevel">Proficiency Level</Label>
              <Select
                value={newSkill.level}
                onValueChange={(value) => setNewSkill({ ...newSkill, level: value as typeof newSkill.level })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map(level => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={addSkill} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Skill
              </Button>
            </div>
          </div>
        </div>

        {/* Skills by Category */}
        {Object.keys(groupedSkills).length > 0 ? (
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-lg font-medium text-gray-900">{category}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {skills.map(skill => (
                    <div key={skill.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                          className="font-medium"
                        />
                        <div className="flex gap-2">
                          <Select
                            value={skill.category}
                            onValueChange={(value) => updateSkill(skill.id, 'category', value)}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {skillCategories.map(cat => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Select
                            value={skill.level}
                            onValueChange={(value) => updateSkill(skill.id, 'level', value)}
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {skillLevels.map(level => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeSkill(skill.id)}
                        className="ml-2 text-red-600 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No skills added yet. Add your first skill above!</p>
          </div>
        )}

        {/* Skills Preview */}
        {data.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">Skills Preview</h3>
            <div className="flex flex-wrap gap-2">
              {data.map(skill => (
                <Badge
                  key={skill.id}
                  variant="secondary"
                  className={`${getLevelColor(skill.level)} px-3 py-1`}
                >
                  {skill.name} ({skill.level})
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsForm;