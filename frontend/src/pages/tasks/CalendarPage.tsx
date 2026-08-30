import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { taskService } from '@/services';
import type { Task } from '@/types';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, ErrorState } from '@/components/ui/Card';
import { PageLoader } from '@/components/ui/Spinner';
import { TaskStatusBadge } from '@/components/task/TaskStatusBadge';
import { TaskPriorityBadge } from '@/components/task/TaskPriorityBadge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { useAuth } from '@/contexts';

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = async () => {
    setLoading(true); setError(false);
    try {
      const start = startOfMonth(currentMonth);
      const end = endOfMonth(currentMonth);
      const res = await taskService.getTasks({
        fromDate: format(start, 'yyyy-MM-dd'),
        toDate: format(end, 'yyyy-MM-dd'),
        limit: 1000,
      });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [currentMonth]);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const today = () => setCurrentMonth(new Date());

  if (error) return <ErrorState message="Could not load calendar." onRetry={load} />;

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
  };

  const canCreateTask = user?.role === 'COMMANDER' || user?.role === 'TEAM_LEAD';

  return (
    <div>
      <PageHeader
        title="Calendar"
        description="View tasks by due date"
        actions={
          canCreateTask && (
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/tasks/new')}>
              New Task
            </Button>
          )
        }
      />

      <Card padding="lg">
        {/* Calendar header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-800">{format(currentMonth, 'MMMM yyyy')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={today}>Today</Button>
            <Button variant="ghost" size="sm" icon={<ChevronLeft className="w-4 h-4" />} onClick={prevMonth} />
            <Button variant="ghost" size="sm" icon={<ChevronRight className="w-4 h-4" />} onClick={nextMonth} />
          </div>
        </div>

        {loading ? (
          <PageLoader />
        ) : (
          <>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-px mb-px bg-slate-200 rounded-t-lg overflow-hidden">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-slate-50 p-3 text-center text-xs font-semibold text-slate-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-b-lg overflow-hidden">
              {days.map((day, i) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentMonth);

                return (
                  <div
                    key={i}
                    className={`bg-white p-2 min-h-[120px] ${!isCurrentMonth ? 'opacity-40' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          isToday
                            ? 'bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center'
                            : isCurrentMonth
                              ? 'text-slate-700'
                              : 'text-slate-400'
                        }`}
                      >
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs font-semibold text-slate-500">{dayTasks.length}</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <button
                          key={task.id}
                          onClick={() => navigate(`/tasks/${task.id}`)}
                          className="text-left p-1.5 rounded hover:bg-slate-50 transition-colors border border-slate-100"
                        >
                          <p className="text-xs font-medium text-slate-700 truncate">{task.title}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              task.priority === 'CRITICAL' ? 'bg-red-500' :
                              task.priority === 'HIGH' ? 'bg-orange-500' :
                              task.priority === 'MEDIUM' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`} />
                            <span className="text-[10px] text-slate-500 truncate">
                              {task.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                        </button>
                      ))}
                      {dayTasks.length > 3 && (
                        <button
                          onClick={() => navigate('/tasks', { state: { date: format(day, 'yyyy-MM-dd') } })}
                          className="text-xs text-teal-600 hover:underline font-medium py-1"
                        >
                          +{dayTasks.length - 3} more
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Legend */}
      <Card padding="md" className="mt-4">
        <div className="flex items-center gap-6 text-xs">
          <span className="font-semibold text-slate-700">Priority:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-slate-600">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-slate-600">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="text-slate-600">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-slate-600">Low</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
