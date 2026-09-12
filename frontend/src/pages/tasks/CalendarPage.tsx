import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { taskService } from '@/services';
import type { Task } from '@/types';
import { useAuth } from '@/contexts';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths,
} from 'date-fns';

function getStatusColor(task: Task) {
  const now = new Date();
  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED';
  if (isOverdue)                    return { bg: 'bg-red-100 dark:bg-red-900/40',     text: 'text-red-700 dark:text-red-300',     dot: 'bg-red-500',     border: 'border-l-red-500' };
  if (task.status === 'COMPLETED')  return { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', dot: 'bg-emerald-500', border: 'border-l-emerald-500' };
  if (task.status === 'IN_PROGRESS')return { bg: 'bg-amber-100 dark:bg-amber-900/40',  text: 'text-amber-700 dark:text-amber-300',  dot: 'bg-amber-500',   border: 'border-l-amber-500' };
  if (task.status === 'PENDING')    return { bg: 'bg-blue-100 dark:bg-blue-900/40',    text: 'text-blue-700 dark:text-blue-300',    dot: 'bg-blue-500',    border: 'border-l-blue-500' };
  return                                   { bg: 'bg-slate-100 dark:bg-slate-700/50',  text: 'text-slate-600 dark:text-slate-300',  dot: 'bg-slate-400',   border: 'border-l-slate-400' };
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());
  const [showDayPanel, setShowDayPanel] = useState(false);

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
    } catch { setError(true); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [currentMonth]);

  const goToday = () => { setCurrentMonth(new Date()); setSelectedDay(new Date()); };
  const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentMonth)),
    end:   endOfWeek(endOfMonth(currentMonth)),
  });

  // Pad to always 42 cells
  while (days.length < 42) days.push(addMonths(days[days.length - 1], 0));

  const getTasksForDay = (day: Date) =>
    tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const completedTasks  = safeTasks.filter(t => t.status === 'COMPLETED').length;
  const inProgressTasks = safeTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const overdueTasks    = safeTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED').length;
  const canCreateTask   = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD';
  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  if (error) return (
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <p className="text-slate-500 mb-4">Could not load calendar.</p>
        <button onClick={load} className="text-[#e89b1a] font-semibold text-sm hover:underline">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[calc(100vh-8rem)]">

      {/* ── Main calendar ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between px-3 sm:px-5 py-2.5 sm:py-4 border-b border-slate-100 dark:border-slate-700 gap-2">
          <div className="flex items-center gap-1 sm:gap-3">
            <button onClick={prevMonth} className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Previous month">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <h2 className="text-sm sm:text-lg font-black text-slate-800 dark:text-slate-100 min-w-[120px] sm:min-w-[160px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button onClick={nextMonth} className="p-1.5 sm:p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Next month">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={goToday}
              className="px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              Today
            </button>
            {canCreateTask && (
              <button
                onClick={() => navigate('/tasks/new')}
                className="inline-flex items-center gap-1 sm:gap-1.5 bg-[#e89b1a] text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow hover:bg-[#f4b728] transition-colors"
              >
                <Plus size={14} /> <span>New</span>
              </button>
            )}
          </div>
        </div>

        {/* Day name headers */}
        <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700">
          {DAYS_OF_WEEK.map(d => (
            <div key={d} className="py-2 text-center text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span className="hidden sm:inline">{d}</span>
              <span className="sm:hidden">{d.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e89b1a]" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-7 grid-rows-6 overflow-hidden min-h-[360px] sm:min-h-[500px]">
            {days.slice(0, 42).map((day, idx) => {
              const dayTasks       = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday        = isSameDay(day, new Date());
              const isSelected     = selectedDay && isSameDay(day, selectedDay);

              return (
                <div
                  key={idx}
                  onClick={() => { setSelectedDay(day); setShowDayPanel(true); }}
                  className={[
                    'border-r border-b border-slate-100 dark:border-slate-700/50 p-1 sm:p-1.5 flex flex-col cursor-pointer transition-colors min-h-[52px] sm:min-h-[70px]',
                    !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-900/20' : 'hover:bg-[#e89b1a]/5',
                    isSelected ? 'ring-1 ring-inset ring-[#e89b1a]/40 bg-[#e89b1a]/5' : '',
                  ].join(' ')}
                >
                  {/* Date number */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={[
                      'w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold',
                      isToday ? 'bg-[#e89b1a] text-white shadow' : '',
                      !isToday && isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : '',
                      !isToday && !isCurrentMonth ? 'text-slate-300 dark:text-slate-600' : '',
                    ].join(' ')}>
                      {format(day, 'd')}
                    </span>
                    {dayTasks.length > 0 && (
                      <span className="text-[9px] font-bold text-[#e89b1a] bg-[#e89b1a]/10 rounded-full px-1.5 py-0.5">
                        {dayTasks.length}
                      </span>
                    )}
                  </div>

                  {/* Task pills */}
                  <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 3).map(task => {
                      const c = getStatusColor(task);
                      return (
                        <div
                          key={task.id}
                          onClick={e => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                          className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border-l-2 ${c.bg} ${c.text} ${c.border} hover:opacity-75 transition-opacity`}
                          title={task.title}
                        >
                          {task.title}
                        </div>
                      );
                    })}
                    {dayTasks.length > 3 && (
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium pl-1">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Right sidebar ─────────────────────────────────────────────────── */}
      <div className="hidden lg:flex w-72 flex-col gap-4">

        {/* Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">This Month</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Completed',   value: completedTasks,  color: 'emerald' },
              { label: 'In Progress', value: inProgressTasks, color: 'amber' },
              { label: 'Overdue',     value: overdueTasks,    color: 'red' },
              { label: 'Total',       value: safeTasks.length, color: 'slate' },
            ].map(({ label, value, color }) => (
              <div key={label} className={`bg-${color}-50 dark:bg-${color}-900/20 p-3 rounded-xl border border-${color}-100 dark:border-${color}-800/30`}>
                <p className={`text-[10px] font-semibold text-${color}-500 dark:text-${color}-400`}>{label}</p>
                <p className={`text-xl font-black text-${color}-700 dark:text-${color}-300 mt-0.5`}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Legend</h3>
          <div className="flex flex-col gap-2">
            {[
              { color: 'bg-emerald-500', label: 'Completed' },
              { color: 'bg-amber-500',   label: 'In Progress' },
              { color: 'bg-blue-500',    label: 'Pending' },
              { color: 'bg-red-500',     label: 'Overdue' },
              { color: 'bg-slate-400',   label: 'Draft / Other' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className={`w-2.5 h-2.5 rounded-full ${color} shrink-0`} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Selected day tasks */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 overflow-y-auto">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
            {selectedDay
              ? isSameDay(selectedDay, new Date()) ? 'Today' : format(selectedDay, 'MMM d, yyyy')
              : 'Select a day'}
          </h3>
          {selectedDayTasks.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">No tasks due this day</p>
          ) : (
            <div className="flex flex-col gap-2">
              {selectedDayTasks.map(task => {
                const c = getStatusColor(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className={`p-3 rounded-xl border-l-4 ${c.bg} ${c.border} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <p className={`text-xs font-bold ${c.text} mb-1`}>{task.title}</p>
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-medium ${c.text} opacity-70`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      {task.priority && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${c.bg} ${c.text}`}>
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile day bottom sheet ────────────────────────────────────────── */}
      {showDayPanel && selectedDay && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDayPanel(false)} />
          <div className="relative w-full bg-white dark:bg-slate-800 rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  {isSameDay(selectedDay, new Date()) ? 'Today' : format(selectedDay, 'EEEE, MMM d')}
                </h3>
                <p className="text-[11px] text-slate-400">{selectedDayTasks.length} task{selectedDayTasks.length !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={() => setShowDayPanel(false)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
              {selectedDayTasks.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">No tasks due this day</p>
              ) : selectedDayTasks.map(task => {
                const c = getStatusColor(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => { setShowDayPanel(false); navigate(`/tasks/${task.id}`); }}
                    className={`p-3 rounded-xl border-l-4 ${c.bg} ${c.border} cursor-pointer active:opacity-70`}
                  >
                    <p className={`text-sm font-bold ${c.text}`}>{task.title}</p>
                    <span className={`text-[11px] font-medium ${c.text} opacity-70`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
