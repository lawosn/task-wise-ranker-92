import { Task, TaskFormData } from '@/types/task';

// Calculate task ranking based on multiple factors
export const calculateTaskRank = (task: Task): number => {
  let rank = 0;

  // Due date factor (more urgent = higher rank)
  if (task.dueDate) {
    const now = new Date();
    const daysUntilDue = Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilDue < 0) {
      rank += 100; // Overdue tasks get highest priority
    } else if (daysUntilDue === 0) {
      rank += 80; // Due today
    } else if (daysUntilDue === 1) {
      rank += 60; // Due tomorrow
    } else if (daysUntilDue <= 3) {
      rank += 40; // Due within 3 days
    } else if (daysUntilDue <= 7) {
      rank += 20; // Due within a week
    }
  }

  // Importance factor
  const importanceValues = {
    critical: 50,
    high: 35,
    medium: 20,
    low: 10,
    none: 0
  };
  rank += importanceValues[task.importance];

  // Recency factor (newer tasks get slight boost)
  const daysSinceCreated = Math.floor((Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceCreated === 0) rank += 5;

  return rank;
};

// Generate unique ID for tasks
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Create new task from form data
export const createTaskFromForm = (formData: TaskFormData): Task => {
  const task: Task = {
    id: generateId(),
    title: formData.title,
    description: formData.description || undefined,
    dueDate: formData.dueDate,
    importance: formData.importance,
    subject: formData.subject || undefined,
    completed: false,
    createdAt: new Date(),
    rank: 0
  };

  task.rank = calculateTaskRank(task);
  return task;
};

// Update existing task with form data
export const updateTaskFromForm = (existingTask: Task, formData: TaskFormData): Task => {
  const updatedTask: Task = {
    ...existingTask,
    title: formData.title,
    description: formData.description || undefined,
    dueDate: formData.dueDate,
    importance: formData.importance,
    subject: formData.subject || undefined
  };

  updatedTask.rank = calculateTaskRank(updatedTask);
  return updatedTask;
};