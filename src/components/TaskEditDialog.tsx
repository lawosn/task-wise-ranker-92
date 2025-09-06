import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar, CalendarIcon, Flag, BookOpen, X, Trash2, Sparkles } from 'lucide-react';
import { Task, TaskFormData, subjects, importanceOptions } from '@/types/task';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface TaskEditDialogProps {
  task?: Task;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TaskFormData) => void;
  onDelete?: (taskId: string) => void;
}

export const TaskEditDialog = ({ task, isOpen, onClose, onSave, onDelete }: TaskEditDialogProps) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    importance: 'none',
    subject: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

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
        importance: 'none',
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

  const handleDelete = () => {
    if (task && onDelete) {
      onDelete(task.id);
      onClose();
    }
  };

  const analyzeTaskPriority = async () => {
    if (!formData.title.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a task title before analyzing priority.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-task-priority', {
        body: {
          title: formData.title,
          description: formData.description,
          dueDate: formData.dueDate,
          subject: formData.subject
        }
      });

      if (error) throw error;

      if (data?.priority) {
        setFormData({ ...formData, importance: data.priority });
        toast({
          title: "Priority Analyzed",
          description: `AI suggests ${data.priority} priority for this task.`,
        });
      }
    } catch (error) {
      console.error('Error analyzing task priority:', error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze task priority. Please set it manually.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeTitle = async () => {
    if (!formData.title.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-task-priority', {
        body: {
          title: formData.title,
          subject: formData.subject,
          action: 'optimize-title',
        },
      });

      if (error) throw error;

      if (data?.optimizedTitle) {
        setFormData(prev => ({ ...prev, title: data.optimizedTitle }));
        toast({
          title: "Title Optimized",
          description: "Task title has been improved with AI",
        });
      }
    } catch (error) {
      console.error('Error optimizing title:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not optimize title.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const optimizeDescription = async () => {
    if (!formData.description.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-task-priority', {
        body: {
          title: formData.title,
          description: formData.description,
          subject: formData.subject,
          action: 'optimize-description',
        },
      });

      if (error) throw error;

      if (data?.optimizedDescription) {
        setFormData(prev => ({ ...prev, description: data.optimizedDescription }));
        toast({
          title: "Description Optimized",
          description: "Task description has been improved with AI",
        });
      }
    } catch (error) {
      console.error('Error optimizing description:', error);
      toast({
        title: "Optimization Failed",
        description: "Could not optimize description.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
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
            <div className="relative">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter task title..."
                className="rounded-xl border-border/50 pr-10"
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={optimizeTitle}
                disabled={isAnalyzing || !formData.title.trim()}
                className="absolute right-1 top-1 h-8 w-8 hover:bg-accent"
                title="Optimize title with AI"
              >
                <Sparkles className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-card-foreground font-medium">
              Description (Optional)
            </Label>
            <div className="relative">
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add details about this task..."
                className="rounded-xl border-border/50 resize-none pr-10"
                rows={3}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={optimizeDescription}
                disabled={isAnalyzing || !formData.description.trim()}
                className="absolute right-1 top-1 h-8 w-8 hover:bg-accent"
                title="Optimize description with AI"
              >
                <Sparkles className={cn("h-4 w-4", isAnalyzing && "animate-spin")} />
              </Button>
            </div>
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
              onValueChange={(value) => setFormData({ 
                ...formData, 
                subject: value === 'Clear Subject' ? '' : value 
              })}
            >
              <SelectTrigger className="rounded-xl border-border/50">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border z-50">
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    <span className={subject === 'Clear Subject' ? 'text-muted-foreground italic' : ''}>
                      {subject}
                    </span>
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
            <div className="flex gap-2">
              <Select 
                value={formData.importance} 
                onValueChange={(value: TaskFormData['importance']) => 
                  setFormData({ ...formData, importance: value })
                }
              >
                <SelectTrigger className="rounded-xl border-border/50 flex-1">
                  <SelectValue placeholder="Select importance" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border z-50">
                  {importanceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-3 h-3 rounded-full",
                          option.value === 'none' ? 'bg-muted' :
                          option.value === 'low' ? 'bg-importance-low' :
                          option.value === 'medium' ? 'bg-importance-medium' :
                          option.value === 'high' ? 'bg-importance-high' :
                          'bg-importance-critical'
                        )} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={analyzeTaskPriority}
                disabled={isAnalyzing}
                className="rounded-xl border-border/50 px-3"
                title="Analyze priority with AI"
              >
                <Sparkles className={cn("w-4 h-4", isAnalyzing && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {task && onDelete && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDelete}
                className="rounded-xl border-destructive/50 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
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