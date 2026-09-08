import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, Plus,
  Calendar as CalendarIcon, Clock,
  Grid, List, CheckSquare, AlertTriangle, Bell,
} from 'lucide-react';
import { taskService } from '@/services';
import type { Task } from '@/types';
import { useAuth } from '@/contexts';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths,
  startOfWeek, endOfWeek,
} from 'date-fns';

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: { bg: 'bg-[#e89b1a]/10', text: 'text-[#e89b1a]', border: 'border-[#e89b1a]', dot: 'bg-[#e89b1a]' },
  HIGH:     { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-500', dot: 'bg-orange-500' },
  MEDIUM:   { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-500', dot: 'bg-amber-500' },
  LOW:      { bg: 'bg-sky-100', text: 'text-sky-700', border: 'border-sky-500', dot: 'bg-sky-500' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT:                  { bg: 'bg-slate-100',   text: 'text-slate-600' },
  PENDING:                { bg: 'bg-blue-100',    text: 'text-blue-600' },
  IN_PROGRESS:            { bg: 'bg-amber-100',   text: 'text-amber-600' },
  SUBMITTED_FOR_REVIEW:   { bg: 'bg-purple-100',  text: 'text-purple-600' },
  COMPLETED:              { bg: 'bg-emerald-100', text: 'text-emerald-600' },
  OVERDUE:                { bg: 'bg-[#e89b1a]/10',    text: 'text-[#e89b1a]' },
};

export default function CalendarPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [view, setView] = useState<'Month' | 'Week'>('Month');

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
  const today = () => {
    setCurrentMonth(new Date());
    setSelectedDay(new Date());
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getTasksForDay = (day: Date) => {
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    return safeTasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));
  };

  const safeTasks = Array.isArray(tasks) ? tasks : [];
  const totalTasks = safeTasks.length;
  const completedTasks = safeTasks.filter(t => t.status === 'COMPLETED').length;
  const overdueTasks = safeTasks.filter(t => t.status === 'OVERDUE').length;
  const inProgressTasks = safeTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingTasks = safeTasks.filter(t => t.status === 'PENDING').length;

  const todayTasks = getTasksForDay(new Date());
  const upcomingDeadlines = safeTasks
    .filter(t => t.dueDate && new Date(t.dueDate) > new Date())
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const canCreateTask = user?.role === 'ADMIN' || user?.role === 'TEAM_LEAD';

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Could not load calendar.</p>
          <button onClick={load} className="text-[#e89b1a] font-semibold text-sm hover:underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-700" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-slate-50 dark:bg-slate-900/50 font-sans text-slate-700 dark:text-slate-300 dark:text-slate-300 overflow-hidden rounded-[24px]">
      {/* Main Calendar View */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Schedule Task</h1>
            <div className="flex items-center space-x-3">
              <span className="text-xl font-semibold text-[#e89b1a]">
                {format(currentMonth, 'MMMM, yyyy')}
              </span>
              <div className="flex items-center bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm p-1">
                <button
                  onClick={prevMonth}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={today}
                  className="px-2 py-0.5 text-[10px] font-bold bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded hover:bg-slate-200 transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={nextMonth}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* View Switcher Controls */}
          <div className="flex items-center space-x-3">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400 shadow-sm">
              <span>{view}</span>
              <ChevronRight size={14} className="rotate-90 text-slate-400" />
            </div>
            <div className="flex bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setView('Month')}
                className={`p-1.5 rounded transition-colors ${
                  view === 'Month' ? 'bg-[#e89b1a] text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setView('Week')}
                className={`p-1.5 rounded transition-colors ${
                  view === 'Week' ? 'bg-[#e89b1a] text-white' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid Container */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700/50 shadow-sm p-4 flex flex-col">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700/50 pb-3 mb-2 text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {daysOfWeek.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Calendar Dates Grid */}
          <div className="grid grid-cols-7 grid-rows-5 flex-1 gap-1">
            {days.slice(0, 35).map((day, idx) => {
              const dayTasks = getTasksForDay(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay && isSameDay(day, selectedDay);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDay(day)}
                  className={`border-r border-b border-slate-50 dark:border-slate-700/30 p-1.5 flex flex-col justify-between min-h-[90px] relative cursor-pointer transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-700/50 ${
                    !isCurrentMonth ? 'text-slate-300' : 'text-slate-600'
                  } ${isSelected ? 'bg-[#e89b1a]/5' : ''}`}
                >
                  <div className="flex justify-between items-center text-xs font-medium">
                    <span>{format(day, 'd')}</span>
                    {isToday && (
                      <span className="w-5 h-5 rounded-full bg-[#e89b1a] text-white flex items-center justify-center text-[10px] font-bold">
                        {format(day, 'd')}
                      </span>
                    )}
                  </div>

                  {/* Render Task Cards */}
                  <div className="flex flex-col gap-1">
                    {dayTasks.slice(0, 2).map((task) => {
                      const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
                      return (
                        <div
                          key={task.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tasks/${task.id}`);
                          }}
                          className={`p-1.5 rounded-lg text-xs ${colors.bg} ${colors.text} border-l-3 ${colors.border} shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                        >
                          <p className="font-semibold leading-tight line-clamp-2">{task.title}</p>
                          {task.dueDate && (
                            <div className="flex items-center text-[10px] opacity-80 gap-1 mt-0.5">
                              <Clock size={10} />
                              <span>{format(new Date(task.dueDate), 'hh:mm a')}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {dayTasks.length > 2 && (
                      <span className="text-[10px] text-slate-400 font-medium">
                        +{dayTasks.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-100 dark:border-slate-700/50 p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
        <div className="space-y-6">
          {/* Month Header & Mini Nav */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {format(currentMonth, 'MMMM, yyyy')}
            </h2>
            <div className="flex items-center space-x-1">
              <button onClick={prevMonth} className="p-1 text-slate-400 hover:text-slate-600">
                <ChevronLeft size={16} />
              </button>
              <button onClick={nextMonth} className="p-1 bg-[#e89b1a] text-white rounded-md">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Mini Calendar Widget */}
          <div className="bg-slate-50/50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50">
            <div className="grid grid-cols-7 text-center text-[10px] font-semibold text-slate-400 mb-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
            <div className="grid grid-cols-7 text-center text-xs gap-y-2 text-slate-600">
              {(() => {
                const miniMonthStart = startOfWeek(startOfMonth(currentMonth));
                const miniMonthEnd = endOfWeek(endOfMonth(currentMonth));
                const miniDays = eachDayOfInterval({ start: miniMonthStart, end: miniMonthEnd });
                return miniDays.slice(0, 35).map((day, i) => {
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  return (
                    <div
                      key={i}
                      onClick={() => setSelectedDay(day)}
                      className={`h-6 w-6 mx-auto flex items-center justify-center rounded-full text-[11px] cursor-pointer transition-colors ${
                        isToday
                          ? 'bg-[#e89b1a] text-white font-bold shadow-md shadow-[#e89b1a]/20'
                          : isCurrentMonth
                            ? 'hover:bg-slate-200/50'
                            : 'text-slate-300'
                      }`}
                    >
                      {format(day, 'd')}
                    </div>
                  );
                });
              })()}
            </div>
          </div>

          {/* Add New Task Button */}
          {canCreateTask && (
            <button
              onClick={() => navigate('/tasks/new')}
              className="w-full bg-[#e89b1a] hover:bg-[#f4b728] text-white font-semibold py-3 px-4 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-[#e89b1a]/20 transition-all"
            >
              <div className="bg-white/20 rounded-lg p-0.5">
                <Plus size={16} />
              </div>
              <span>Add New Task</span>
            </button>
          )}

          {/* Key Metrics / Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-700/50 flex flex-col justify-between">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-[11px] font-medium">Total Tasks</span>
                <CheckSquare size={14} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{totalTasks}</p>
                <p className="text-[10px] text-slate-400">{completedTasks} completed</p>
              </div>
            </div>

            <div className="bg-[#e89b1a] text-white p-3 rounded-2xl flex flex-col justify-between shadow-md shadow-[#e89b1a]/20">
              <div className="flex justify-between items-center text-white/70">
                <span className="text-[11px] font-medium">Overdue</span>
                <AlertTriangle size={14} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold">{overdueTasks}</p>
                <p className="text-[10px] text-white/80">needs attention</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-sky-50 p-3 rounded-2xl border border-sky-100 flex flex-col justify-between">
              <div className="flex justify-between items-center text-sky-400">
                <span className="text-[11px] font-medium">In Progress</span>
                <Clock size={14} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold text-sky-800">{inProgressTasks}</p>
                <p className="text-[10px] text-sky-400">active now</p>
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100 flex flex-col justify-between">
              <div className="flex justify-between items-center text-emerald-400">
                <span className="text-[11px] font-medium">Pending</span>
                <Bell size={14} />
              </div>
              <div className="mt-3">
                <p className="text-sm font-bold text-emerald-800">{pendingTasks}</p>
                <p className="text-[10px] text-emerald-400">awaiting review</p>
              </div>
            </div>
          </div>

          {/* Today's Tasks Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Today's Tasks</h3>
              <span className="text-[10px] font-semibold text-slate-400">
                {format(new Date(), 'MMM dd')}
              </span>
            </div>

            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tasks for today</p>
              ) : (
                todayTasks.slice(0, 4).map((task) => {
                  const colors = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM;
                  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.PENDING;
                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className={`p-2 ${colors.bg} ${colors.text} rounded-xl mt-0.5`}>
                        <CheckSquare size={14} />
                      </div>
                      <div className="flex-1 text-xs min-w-0">
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-tight truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                            {task.status.replace(/_/g, ' ')}
                          </span>
                          {task.dueDate && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Clock size={9} />
                              {format(new Date(task.dueDate), 'hh:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Upcoming Deadlines</h3>
            </div>

            <div className="space-y-2">
              {upcomingDeadlines.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No upcoming deadlines</p>
              ) : (
                upcomingDeadlines.slice(0, 4).map((task) => {
                  const daysLeft = Math.ceil(
                    (new Date(task.dueDate!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <div
                      key={task.id}
                      onClick={() => navigate(`/tasks/${task.id}`)}
                      className="flex items-start space-x-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
                    >
                      <div className="p-2 bg-amber-100 text-amber-500 rounded-xl mt-0.5">
                        <CalendarIcon size={14} />
                      </div>
                      <div className="flex-1 text-xs min-w-0">
                        <p className="text-slate-700 dark:text-slate-300 font-medium leading-tight truncate">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] font-semibold ${
                            daysLeft <= 1 ? 'text-red-500' : daysLeft <= 3 ? 'text-orange-500' : 'text-slate-400'
                          }`}>
                            {daysLeft === 0 ? 'Due today' : daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
