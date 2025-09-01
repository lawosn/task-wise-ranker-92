import { useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskInputProps {
  onAddTask: (title: string) => void;
  hasTasks: boolean;
  className?: string;
}

export const TaskInput = ({ onAddTask, hasTasks, className }: TaskInputProps) => {
  const [title, setTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim());
      setTitle('');
    }
  };

  return (
    <div className={cn(
      'w-full max-w-2xl mx-auto transition-all duration-500 ease-out',
      hasTasks ? 'mb-8' : '',
      className
    )}>
      <form onSubmit={handleSubmit} className="task-pill">
        <div className="flex items-center gap-4 min-h-[60px]">
          <Plus className="w-5 h-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you need to do?"
            className="flex-1 bg-transparent border-0 outline-0 text-card-foreground placeholder:text-muted-foreground font-light text-lg"
          />
        </div>
      </form>
    </div>
  );
};