import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, CalendarIcon, Flag, BookOpen, X } from 'lucide-react';
import { Task, TaskFormData, subjects, importanceOptions } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';

interface TaskEditDialogProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
}

export const TaskEditDialog = ({ task, isOpen, onClose, onSave }: TaskEditDialogProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    importance: 'medium',
    subject: ''
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        dueDate: task.dueDate,
        importance: task.importance,
        subject: task.subject || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        importance: 'medium',
        subject: ''
      });
    }
  }, [task, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter' && isOpen) {
        e.preventDefault();
        if (formData.title.trim()) {
          onSave(formData);
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, formData, onSave, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSave(formData);
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md mx-4 rounded-3xl bg-card">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-semibold text-card-foreground">
            {task ? 'Edit Task' : 'Create Task'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-card-foreground font-medium">
              Task Title
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter task title..."
              className="rounded-xl border-border/50"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground font-medium">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details about this task..."
              className="rounded-xl border-border/50 resize-none"
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label className="text-card-foreground font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date (Optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal rounded-xl border-border/50",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1 ml-1 h-4 w-4" />
                  {formData.dueDate ? format(formData.dueDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={formData.dueDate}
                  onSelect={(date) => setFormData({ ...formData, dueDate: date })}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label className="text-card-foreground font-medium flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Subject
            </Label>
            <Select 
              value={formData.subject} 
              onValueChange={(value) => setFormData({ ...formData, subject: value })}
            >
              <SelectTrigger className="rounded-xl border-border/50">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Importance */}
          <div className="space-y-2">
            <Label className="text-card-foreground font-medium flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Importance Level
            </Label>
            <Select 
              value={formData.importance} 
              onValueChange={(value: TaskFormData['importance']) => 
                setFormData({ ...formData, importance: value })
              }
            >
              <SelectTrigger className="rounded-xl border-border/50">
                <SelectValue placeholder="Select importance" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {importanceOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", `bg-${option.color}`)} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 rounded-xl border-border/50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-xl bg-primary hover:bg-primary/90"
            >
              {task ? 'Save Changes' : 'Create Task'}
              <span className="ml-2 text-xs opacity-70">(Ctrl+Enter)</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};