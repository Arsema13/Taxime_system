import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { taskService } from '@/services';
import type { Task } from '@/types';
import { useAuth } from '@/contexts';
import { Select } from '@/components/ui/Input';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, startOfWeek, endOfWeek, addMonths, subMonths,
} from 'date-fns';

function getStatusColor(task: Task) {
  const now = new Date();
  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'COMPLETED';
  if (isOverdue) return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', border: 'border-red-400' };
  if (task.status === 'COMPLETED') return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500', border: 'border-emerald-400' };
  if (task.status === 'IN_PROGRESS') return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', border: 'border-amber-400' };
  if (task.status === 'PENDING') return { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500', border: 'border-blue-400' };
  return { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-600 dark:text-slate-400', dot: 'bg-slate-400', border: 'border-slate-300' };
}

const MONTH_OPTIONS = Array.from({ length: 24 }, (_, i) => {
  const d = addMonths(new Date(), -12 + i);
  return { value: format(d, 'yyyy-MM'), label: format(d, 'MMMM yyyy') };
});

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
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

  const today = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  const prevMonth = () => setCurrentMonth(m => subMonths(m, 1));
  const nextMonth = () => setCurrentMonth(m => addMonths(m, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter(t => {
      if (!t.dueDate) return false;
      return isSameDay(new Date(t.dueDate), day);
    });
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(t => t.status === 'COMPLETED').length;
  const overdueTasks = safeTasks.filter(t => {
    return t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'COMPLETED';
  }).length;
  const inProgressTasks = safeTasks.filter(t => t.status === 'IN_PROGRESS').length;

  const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const canCreateTask = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD';

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setShowDayPanel(true);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Could not load calendar.</p>
          <button onClick={load} className="text-[#e89b1a] font-semibold text-sm hover:underline">Try again</button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e89b1a]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-8rem)] bg-slate-50 dark:bg-slate-900/50 font-sans text-slate-700 dark:text-slate-300 overflow-hidden rounded-[24px]">
      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col p-3 sm:p-6 overflow-y-auto min-w-0">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">Calendar</h1>
            <Select
              value={format(currentMonth, 'yyyy-MM')}
              onChange={e => {
                const [y, m] = e.target.value.split('-').map(Number);
                setCurrentMonth(new Date(y, m - 1, 1));
              }}
              className="w-40 sm:w-48 text-xs sm:text-sm"
            >
              {MONTH_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={today}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
            >
              Today
            </button>
            {canCreateTask && (
              <button
                onClick={() => navigate('/tasks/new')}
                className="inline-flex items-center gap-1.5 bg-[#e89b1a] text-white hover:bg-[#f4b728] px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                <Plus size={14} /> <span className="hidden sm:inline">New Task</span><span className="sm:hidden">New</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile month nav arrows */}
        <div className="flex items-center justify-between mb-2 lg:hidden">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-2 sm:p-4 flex flex-col min-h-0">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700/50 pb-2 sm:pb-3 mb-1 sm:mb-2 text-center text-[10px] sm:text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {daysOfWeek.map(day => <div key={day}>{day}</div>)}
          </div>

          {/* Calendar Dates Grid */}
          <div className="grid grid-cols-7 grid-rows-5 flex-1 gap-px sm:gap-1">
            {days.slice(0, 35).map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <div
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`border-r border-b border-slate-50 dark:border-slate-700/30 p-0.5 sm:p-1.5 flex flex-col min-h-[48px] sm:min-h-[90px] relative cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${
                    !isCurrentMonth ? 'opacity-40' : ''
                  } ${isSelected ? 'bg-[#e89b1a]/5 ring-1 ring-[#e89b1a]/20' : ''}`}
                >
                  <div className="flex justify-between items-center text-[10px] sm:text-xs font-medium mb-0.5 sm:mb-1">
                    <span className={`${isToday ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#e89b1a] text-white flex items-center justify-center text-[9px] sm:text-[10px] font-bold' : 'text-slate-600 dark:text-slate-400'}`}>
                      {format(day, 'd')}
                    </span>
                  </div>

                  <div className="flex flex-col gap-px sm:gap-0.5 flex-1 overflow-hidden">
                    {dayTasks.slice(0, 2).map(task => {
                      const colors = getStatusColor(task);
                      return (
                        <div
                          key={task.id}
                          onClick={e => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                          className={`px-0.5 sm:px-1.5 py-0.5 sm:py-1 rounded text-[8px] sm:text-[10px] font-medium ${colors.bg} ${colors.text} border-l-2 ${colors.border} cursor-pointer hover:opacity-80 transition-opacity truncate hidden sm:block`}
                        >
                          <span className="truncate block">{task.title}</span>
                        </div>
                      );
                    })}
                    {dayTasks.slice(0, 1).map(task => {
                      const colors = getStatusColor(task);
                      return (
                        <div
                          key={`m-${task.id}`}
                          onClick={e => { e.stopPropagation(); navigate(`/tasks/${task.id}`); }}
                          className={`w-1.5 h-1.5 sm:hidden rounded-full ${colors.dot} shrink-0`}
                        />
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="text-[8px] sm:text-[10px] text-slate-400 font-medium pl-0.5 sm:pl-1 hidden sm:block">+{dayTasks.length - 2} more</span>
                    )}
                    {dayTasks.length > 1 && (
                      <span className="text-[8px] sm:hidden text-slate-400 font-medium">+{dayTasks.length - 1}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Mobile stats row */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto sm:hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-full border border-emerald-100 dark:border-emerald-800/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">{completedTasks}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-full border border-amber-100 dark:border-amber-800/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">{inProgressTasks}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-100 dark:border-red-800/30 shrink-0">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-bold text-red-700 dark:text-red-300">{overdueTasks}</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-700/30 rounded-full border border-slate-100 dark:border-slate-700/50 shrink-0">
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200">{totalTasks} total</span>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Desktop */}
      <div className="hidden lg:flex w-80 bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700/50 p-6 flex-col overflow-y-auto">
        <SidebarContent
          selectedDay={selectedDay}
          selectedDayTasks={selectedDayTasks}
          completedTasks={completedTasks}
          inProgressTasks={inProgressTasks}
          overdueTasks={overdueTasks}
          totalTasks={totalTasks}
          getTasksForDay={getTasksForDay}
          navigate={navigate}
        />
      </div>

      {/* Mobile Day Panel (bottom sheet) */}
      {showDayPanel && selectedDay && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowDayPanel(false)} />
          <div className="relative w-full bg-white dark:bg-slate-800 rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {isSameDay(selectedDay, new Date()) ? 'Today' : format(selectedDay, 'MMM d, yyyy')}
              </h3>
              <button onClick={() => setShowDayPanel(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarContent
                selectedDay={selectedDay}
                selectedDayTasks={selectedDayTasks}
                completedTasks={completedTasks}
                inProgressTasks={inProgressTasks}
                overdueTasks={overdueTasks}
                totalTasks={totalTasks}
                getTasksForDay={getTasksForDay}
                navigate={navigate}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarContent({
  selectedDay, selectedDayTasks, completedTasks, inProgressTasks,
  overdueTasks, totalTasks, getTasksForDay, navigate,
}: {
  selectedDay: Date | null;
  selectedDayTasks: Task[];
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalTasks: number;
  getTasksForDay: (day: Date) => Task[];
  navigate: (path: string) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Legend */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Legend</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-emerald-500" /> Completed
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-amber-500" /> In Progress
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-blue-500" /> Pending
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="w-3 h-3 rounded-full bg-red-500" /> Overdue
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
          <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">Completed</p>
          <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-1">{completedTasks}</p>
        </div>
        <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-2xl border border-amber-100 dark:border-amber-800/30">
          <p className="text-[10px] font-medium text-amber-600 dark:text-amber-400">In Progress</p>
          <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-1">{inProgressTasks}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl border border-red-100 dark:border-red-800/30">
          <p className="text-[10px] font-medium text-red-600 dark:text-red-400">Overdue</p>
          <p className="text-lg font-black text-red-700 dark:text-red-300 mt-1">{overdueTasks}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Total</p>
          <p className="text-lg font-black text-slate-700 dark:text-slate-200 mt-1">{totalTasks}</p>
        </div>
      </div>

      {/* Selected Day Tasks */}
      {selectedDay && (
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">
            {isSameDay(selectedDay, new Date()) ? 'Today' : format(selectedDay, 'MMM d, yyyy')}
          </h3>
          <div className="flex flex-col gap-2">
            {selectedDayTasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No tasks due this day</p>
            ) : (
              selectedDayTasks.map(task => {
                const colors = getStatusColor(task);
                const assignees = task.assignees ?? [];
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className={`p-3 rounded-xl ${colors.bg} border-l-3 ${colors.border} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <p className={`text-xs font-semibold ${colors.text} truncate`}>{task.title}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className={`text-[10px] font-medium ${colors.text} opacity-70`}>
                        {task.status.replace(/_/g, ' ')}
                      </span>
                      {assignees.length > 0 && (
                        <div className="flex items-center -space-x-1">
                          {assignees.slice(0, 3).map(a => (
                            <div key={a.id} className="w-5 h-5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center">
                              <span className="text-[8px] font-bold text-slate-600 dark:text-slate-300">
                                {a.user.firstName?.[0]}{a.user.lastName?.[0]}
                              </span>
                            </div>
                          ))}
                          {assignees.length > 3 && (
                            <span className="text-[9px] text-slate-400 ml-1">+{assignees.length - 3}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Today's Tasks */}
      {!selectedDay && (
        <div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3">Today's Tasks</h3>
          <div className="flex flex-col gap-2">
            {getTasksForDay(new Date()).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No tasks for today</p>
            ) : (
              getTasksForDay(new Date()).slice(0, 5).map(task => {
                const colors = getStatusColor(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => navigate(`/tasks/${task.id}`)}
                    className={`p-3 rounded-xl ${colors.bg} border-l-3 ${colors.border} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <p className={`text-xs font-semibold ${colors.text} truncate`}>{task.title}</p>
                    <span className={`text-[10px] font-medium ${colors.text} opacity-70`}>
                      {task.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
