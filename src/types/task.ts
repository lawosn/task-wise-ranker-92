export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: Date;
  importance: 'none' | 'low' | 'medium' | 'high' | 'critical';
  subject?: string;
  completed: boolean;
  createdAt: Date;
  rank: number;
}

export interface TaskFormData {
  title: string;
  description: string;
  dueDate?: Date;
  importance: 'none' | 'low' | 'medium' | 'high' | 'critical';
  subject: string;
}

export const subjects = [
  'Clear Subject',
  'Mathematics',
  'Science', 
  'English',
  'History',
  'Computer Science',
  'Art',
  'Music',
  'Physical Education',
  'Other'
];

export const importanceOptions = [
  { value: 'none' as const, label: 'No Priority', color: 'muted' },
  { value: 'low' as const, label: 'Low Priority', color: 'importance-low' },
  { value: 'medium' as const, label: 'Medium Priority', color: 'importance-medium' },
  { value: 'high' as const, label: 'High Priority', color: 'importance-high' },
  { value: 'critical' as const, label: 'Critical', color: 'importance-critical' }
];