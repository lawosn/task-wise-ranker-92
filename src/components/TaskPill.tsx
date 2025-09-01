import { useState } from 'react';
import { Circle, CheckCircle, Calendar, Flag } from 'lucide-react';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskPillProps {
  task: Task;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export const TaskPill = ({ task, onToggleComplete, onEdit }: TaskPillProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const formatDueDate = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days < 7) return `${days} days`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getImportanceColor = (importance: Task['importance']) => {
    const colors = {
      low: 'text-importance-low',
      medium: 'text-importance-medium', 
      high: 'text-importance-high',
      critical: 'text-importance-critical'
    };
    return colors[importance];
  };

  return (
    <div 
      className={cn(
        'task-pill group fade-in',
        task.completed && 'opacity-60'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onEdit(task)}
    >
      <div className="flex items-center gap-4 min-h-[60px]">
        {/* Complete toggle */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task.id);
          }}
          className="shrink-0 transition-all duration-200 hover:scale-110"
        >
          {task.completed ? (
            <CheckCircle className="w-6 h-6 text-primary" />
          ) : (
            <Circle className="w-6 h-6 text-muted-foreground hover:text-primary" />
          )}
        </button>

        {/* Task content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            'font-medium text-lg text-card-foreground leading-tight',
            task.completed && 'line-through'
          )}>
            {task.title}
          </h3>
          {task.description && (
            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {task.subject && (
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-accent text-accent-foreground">
                {task.subject}
              </span>
            )}
          </div>
        </div>

        {/* Task metadata */}
        <div className="shrink-0 flex flex-col items-end gap-2 min-w-[120px]">
          {task.dueDate && (
            <div className="flex items-center gap-1 text-muted-foreground text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            getImportanceColor(task.importance)
          )}>
            <Flag className="w-4 h-4" />
            <span className="capitalize">{task.importance}</span>
          </div>
        </div>
      </div>
    </div>
  );
};