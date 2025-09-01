import { useState, useEffect } from 'react';
import { Task, TaskFormData } from '@/types/task';
import { TaskInput } from '@/components/TaskInput';
import { TaskPill } from '@/components/TaskPill';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import { saveTasks, loadTasks } from '@/utils/localStorage';
import { createTaskFromForm, updateTaskFromForm, calculateTaskRank } from '@/utils/taskUtils';
import { cn } from '@/lib/utils';

const Index = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const storedTasks = loadTasks();
    setTasks(storedTasks);
  }, []);

  // Save tasks to localStorage when tasks change
  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = (title: string) => {
    const taskData: TaskFormData = {
      title,
      description: '',
      importance: 'none',
      subject: ''
    };
    
    const newTask = createTaskFromForm(taskData);
    setTasks(prevTasks => {
      const updatedTasks = [...prevTasks, newTask];
      return sortTasksByRank(updatedTasks);
    });
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const saveTask = (formData: TaskFormData) => {
    if (editingTask) {
      // Update existing task
      const updatedTask = updateTaskFromForm(editingTask, formData);
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => 
          task.id === editingTask.id ? updatedTask : task
        );
        return sortTasksByRank(updatedTasks);
      });
    } else {
      // Create new task
      const newTask = createTaskFromForm(formData);
      setTasks(prevTasks => {
        const updatedTasks = [...prevTasks, newTask];
        return sortTasksByRank(updatedTasks);
      });
    }
    
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const sortTasksByRank = (tasks: Task[]): Task[] => {
    return tasks
      .map(task => ({ ...task, rank: calculateTaskRank(task) }))
      .sort((a, b) => {
        // Completed tasks go to bottom
        if (a.completed && !b.completed) return 1;
        if (!a.completed && b.completed) return -1;
        // Sort by rank (higher rank first)
        return b.rank - a.rank;
      });
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  const hasTasks = tasks.length > 0;

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className={cn(
        'w-full max-w-4xl mx-auto transition-all duration-700 ease-out',
        hasTasks 
          ? 'pt-8' 
          : 'min-h-screen flex flex-col justify-center'
      )}>
        
        {/* Header */}
        <div className={cn(
          'text-center mb-12 transition-all duration-700',
          hasTasks ? 'mb-8' : 'mb-16'
        )}>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            TaskWise
          </h1>
          <p className="text-muted-foreground text-lg font-light">
            Rank your tasks by importance and stay focused
          </p>
        </div>

        {/* Task Input */}
        <TaskInput 
          onAddTask={addTask}
          hasTasks={hasTasks}
          className={cn(
            'transition-all duration-700',
            !hasTasks && 'transform scale-110'
          )}
        />

        {/* Tasks List */}
        {hasTasks && (
          <div className="space-y-6 fade-in">
            {/* Active Tasks */}
            {activeTasks.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-foreground px-2">
                  Tasks ({activeTasks.length})
                </h2>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto task-list-container">
                  {activeTasks.map((task, index) => (
                    <div 
                      key={task.id}
                      className="slide-up w-full"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <TaskPill
                        task={task}
                        onToggleComplete={toggleTaskComplete}
                        onEdit={editTask}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
              <div className="space-y-4 pt-8 border-t border-border/30">
                <h2 className="text-lg font-medium text-muted-foreground px-2">
                  Completed ({completedTasks.length})
                </h2>
                <div className="space-y-3">
                  {completedTasks.map((task, index) => (
                    <div 
                      key={task.id}
                      className="slide-up w-full"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TaskPill
                        task={task}
                        onToggleComplete={toggleTaskComplete}
                        onEdit={editTask}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!hasTasks && (
          <div className="text-center mt-16 fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-primary/20" />
            </div>
            <p className="text-muted-foreground text-lg font-light">
              Add your first task to get started
            </p>
          </div>
        )}
      </div>

      {/* Task Edit Dialog */}
      <TaskEditDialog
        task={editingTask}
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingTask(null);
        }}
        onSave={saveTask}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default Index;
