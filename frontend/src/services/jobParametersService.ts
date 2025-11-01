export type SkillItem = { id: string; name: string; category: string; usage: number; status: 'active' | 'inactive' };
export type EmployeeTypeItem = { id: string; name: string; description: string; usage: number; status: 'active' | 'inactive' };
export type LanguageItem = { id: string; name: string; level: string; usage: number; status: 'active' | 'inactive' };
export type JobLevelItem = { id: string; name: string; description: string; usage: number; status: 'active' | 'inactive' };
export type ExperienceItem = { id: string; name: string; range: string; usage: number; status: 'active' | 'inactive' };

export type JobParameters = {
  skills: SkillItem[];
  employeeTypes: EmployeeTypeItem[];
  languages: LanguageItem[];
  jobLevels: JobLevelItem[];
  experience: ExperienceItem[];
};

const STORAGE_KEY = 'job_parameters';

const defaultParameters: JobParameters = {
  skills: [
    { id: '1', name: 'JavaScript', category: 'Programming', usage: 45, status: 'active' },
    { id: '2', name: 'React', category: 'Frontend', usage: 38, status: 'active' },
    { id: '3', name: 'Node.js', category: 'Backend', usage: 32, status: 'active' },
    { id: '4', name: 'Python', category: 'Programming', usage: 41, status: 'active' },
    { id: '5', name: 'Data Analysis', category: 'Analytics', usage: 28, status: 'active' },
    { id: '6', name: 'Project Management', category: 'Management', usage: 35, status: 'active' },
    { id: '7', name: 'Digital Marketing', category: 'Marketing', usage: 25, status: 'active' },
    { id: '8', name: 'UI/UX Design', category: 'Design', usage: 22, status: 'active' }
  ],
  employeeTypes: [
    { id: '1', name: 'Full Time', description: 'Regular full-time employee', usage: 156, status: 'active' },
    { id: '2', name: 'Part Time', description: 'Part-time employee', usage: 78, status: 'active' },
    { id: '3', name: 'Contract', description: 'Contract-based employment', usage: 45, status: 'active' },
    { id: '4', name: 'Internship', description: 'Internship opportunity', usage: 32, status: 'active' },
    { id: '5', name: 'Freelance', description: 'Freelance/Project-based', usage: 28, status: 'active' },
    { id: '6', name: 'Remote', description: 'Remote work position', usage: 89, status: 'active' }
  ],
  languages: [
    { id: '1', name: 'English', level: 'Required', usage: 198, status: 'active' },
    { id: '2', name: 'Nepali', level: 'Native', usage: 201, status: 'active' },
    { id: '3', name: 'Hindi', level: 'Preferred', usage: 67, status: 'active' },
    { id: '4', name: 'Chinese', level: 'Preferred', usage: 23, status: 'active' },
    { id: '5', name: 'Japanese', level: 'Preferred', usage: 18, status: 'active' },
    { id: '6', name: 'Korean', level: 'Preferred', usage: 15, status: 'active' }
  ],
  jobLevels: [
    { id: '1', name: 'Entry Level', description: '0-2 years experience', usage: 89, status: 'active' },
    { id: '2', name: 'Mid Level', description: '2-5 years experience', usage: 76, status: 'active' },
    { id: '3', name: 'Senior Level', description: '5-8 years experience', usage: 54, status: 'active' },
    { id: '4', name: 'Lead Level', description: '8-12 years experience', usage: 32, status: 'active' },
    { id: '5', name: 'Executive Level', description: '12+ years experience', usage: 18, status: 'active' },
    { id: '6', name: 'Internship', description: 'Student/Fresh graduate', usage: 41, status: 'active' }
  ],
  experience: [
    { id: '1', name: 'Fresher', range: '0 years', usage: 78, status: 'active' },
    { id: '2', name: '1-2 years', range: '1-2 years', usage: 89, status: 'active' },
    { id: '3', name: '2-3 years', range: '2-3 years', usage: 76, status: 'active' },
    { id: '4', name: '3-5 years', range: '3-5 years', usage: 65, status: 'active' },
    { id: '5', name: '5-7 years', range: '5-7 years', usage: 45, status: 'active' },
    { id: '6', name: '7-10 years', range: '7-10 years', usage: 32, status: 'active' },
    { id: '7', name: '10+ years', range: '10+ years', usage: 28, status: 'active' }
  ]
};

export function getJobParameters(): JobParameters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultParameters;
    const parsed = JSON.parse(raw);
    return {
      ...defaultParameters,
      ...parsed,
    } as JobParameters;
  } catch (e) {
    return defaultParameters;
  }
}

export function setJobParameters(params: JobParameters) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
}

// Helper to update and persist in one step
export function updateJobParameters(updater: (prev: JobParameters) => JobParameters) {
  const prev = getJobParameters();
  const next = updater(prev);
  setJobParameters(next);
  return next;
}