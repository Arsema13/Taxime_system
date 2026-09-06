import React, { useState } from 'react';
import {
  Calendar, ChevronDown, Download, FileText, BarChart3, FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useToast } from '@/contexts';
import { reportService, downloadBlob } from '@/services/report.service';

const TASK_COMPLETION_DATA_YEAR = [
  { month: 'Mar', completed: 45, created: 52, overdue: 8 },
  { month: 'Apr', completed: 58, created: 61, overdue: 12 },
  { month: 'May', completed: 62, created: 55, overdue: 6 },
  { month: 'Jun', completed: 48, created: 50, overdue: 9 },
  { month: 'Jul', completed: 71, created: 65, overdue: 5 },
  { month: 'Aug', completed: 68, created: 72, overdue: 11 },
  { month: 'Sep', completed: 75, created: 60, overdue: 4 },
];

const TASK_COMPLETION_DATA_MONTH = [
  { month: 'W1', completed: 18, created: 20, overdue: 3 },
  { month: 'W2', completed: 22, created: 19, overdue: 2 },
  { month: 'W3', completed: 19, created: 24, overdue: 4 },
  { month: 'W4', completed: 24, created: 18, overdue: 1 },
];

const TASK_COMPLETION_DATA_WEEK = [
  { month: 'Mon', completed: 8, created: 10, overdue: 2 },
  { month: 'Tue', completed: 11, created: 9, overdue: 1 },
  { month: 'Wed', completed: 14, created: 12, overdue: 1 },
  { month: 'Thu', completed: 10, created: 11, overdue: 2 },
  { month: 'Fri', completed: 15, created: 13, overdue: 1 },
  { month: 'Sat', completed: 6, created: 5, overdue: 0 },
  { month: 'Sun', completed: 4, created: 3, overdue: 0 },
];

const PRODUCTIVITY_TREND_DATA = [
  { month: 'Jan', tasks: 120 },
  { month: 'Feb', tasks: 145 },
  { month: 'Mar', tasks: 168 },
  { month: 'Apr', tasks: 195, highlight: true },
  { month: 'May', tasks: 172 },
  { month: 'Jun', tasks: 188 },
  { month: 'Jul', tasks: 210 },
  { month: 'Aug', tasks: 198 },
  { month: 'Sep', tasks: 225 },
];

const PRIORITY_DISTRIBUTION = [
  { name: 'Critical', value: 12, color: '#ef4444' },
  { name: 'High', value: 28, color: '#f97316' },
  { name: 'Medium', value: 42, color: '#f59e0b' },
  { name: 'Low', value: 18, color: '#10b981' },
];

const DEPARTMENT_PERFORMANCE = [
  { name: 'Engineering', tasks: 85, completed: 72, rate: 85 },
  { name: 'Marketing', tasks: 62, completed: 55, rate: 89 },
  { name: 'Operations', tasks: 78, completed: 68, rate: 87 },
  { name: 'Design', tasks: 45, completed: 41, rate: 91 },
  { name: 'Sales', tasks: 58, completed: 48, rate: 83 },
];

const AVG_COMPLETION_TIME = [
  { team: 'Engineering', days: '3.2 days', color: '#FF4D67', widthPct: 32, tag: 'Fast' },
  { team: 'Design', days: '2.8 days', color: '#10b981', widthPct: 28, tag: 'Fastest' },
  { team: 'Marketing', days: '4.5 days', color: '#f59e0b', widthPct: 45, tag: 'Average' },
  { team: 'Operations', days: '5.1 days', color: '#f97316', widthPct: 51, tag: 'Average' },
  { team: 'Sales', days: '6.2 days', color: '#ef4444', widthPct: 62, tag: 'Slow' },
];

export default function ReportsPage() {
  const { success, error } = useToast();
  const [taskPeriod, setTaskPeriod] = useState<'Week' | 'Month' | 'Year'>('Year');
  const [trendPeriod, setTrendPeriod] = useState<'Week' | 'Month' | 'Year'>('Year');
  const [activeTaskFilter, setActiveTaskFilter] = useState<'all' | 'completed' | 'created' | 'overdue'>('all');
  const [activePriorityFilter, setActivePriorityFilter] = useState<string>('All');
  const [dateRange] = useState('Jan 01, 2026 - Sep 20, 2026');
  const [isExporting, setIsExporting] = useState(false);

  const getTaskData = () => {
    if (taskPeriod === 'Week') return TASK_COMPLETION_DATA_WEEK;
    if (taskPeriod === 'Month') return TASK_COMPLETION_DATA_MONTH;
    return TASK_COMPLETION_DATA_YEAR;
  };

  const handleExport = async (format: 'PDF' | 'Excel' | 'Word') => {
    setIsExporting(true);
    try {
      if (format === 'PDF') {
        const blob = await reportService.exportAnalyticsPdf();
        downloadBlob(blob, 'analytics-report.pdf');
      } else if (format === 'Excel') {
        const blob = await reportService.exportAnalyticsExcel();
        downloadBlob(blob, 'analytics-report.xlsx');
      } else {
        const blob = await reportService.exportAnalyticsWord();
        downloadBlob(blob, 'analytics-report.docx');
      }
      success('Report Exported', `Analytics summary exported as ${format.toUpperCase()}`);
    } catch {
      error('Export Failed', `Could not export report as ${format}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 font-sans">
      {/* ── TOP SECONDARY NAV TABS ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-black italic tracking-wider text-[#FF4D67] pr-3 border-r border-slate-200 dark:border-slate-700">
            TAXIME
          </span>
          <div className="inline-flex items-center p-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-xs">
            <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF4D67] text-white shadow-xs">
              <BarChart3 size={13} />
              Analytics
            </button>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('Excel')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all"
          >
            <FileSpreadsheet size={13} className="text-slate-400" />
            Export Excel
          </button>
          <button
            onClick={() => handleExport('Word')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-xs transition-all"
          >
            <Download size={13} className="text-slate-400" />
            Export Word
          </button>
          <button
            onClick={() => handleExport('PDF')}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 bg-[#FF4D67] text-white hover:bg-[#E83D58] px-4 py-1.5 rounded-full text-xs font-bold shadow-md shadow-red-500/20 transition-all"
          >
            <FileText size={13} />
            PDF Report
          </button>
        </div>
      </div>

      {/* ── PAGE TITLE + DATE PICKER PILL ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">Task performance metrics and team productivity insights</p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors self-start sm:self-auto">
          <Calendar size={14} className="text-slate-400" />
          <span>{dateRange}</span>
          <ChevronDown size={14} className="text-slate-400" />
        </div>
      </div>

      {/* ── 5 KPI CARDS ROW ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Tasks */}
        <div className="bg-[#FF4D67] text-white rounded-[22px] p-4.5 shadow-md shadow-red-500/10 flex flex-col justify-between">
          <p className="text-xs font-semibold text-white/80">Total Tasks</p>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none">1,248</p>
          </div>
        </div>

        {/* Completed */}
        <div className="bg-[#E5F7E4] text-slate-900 dark:text-slate-100 rounded-[22px] p-4.5 border border-emerald-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-600">Completed</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">1,052</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">84% of total</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-[#E5F5FC] text-slate-900 dark:text-slate-100 rounded-[22px] p-4.5 border border-sky-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-600">In Progress</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">142</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">11% of total</span>
          </div>
        </div>

        {/* Overdue */}
        <div className="bg-[#FDEAE8] text-slate-900 dark:text-slate-100 rounded-[22px] p-4.5 border border-rose-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-600">Overdue</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">54</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">4% of total</span>
          </div>
        </div>

        {/* Completion Rate */}
        <div className="bg-[#EBEBFD] text-slate-900 dark:text-slate-100 rounded-[22px] p-4.5 border border-indigo-100 flex flex-col justify-between col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-slate-600">Completion Rate</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">84%</span>
            <span className="text-[11px] font-semibold text-emerald-600">+5% this month</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW: 2 BIG ANALYTICAL CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── CARD LEFT: Task Completion Stacked Bar Chart ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Task Completion</h2>
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-700/50 rounded-full text-xs font-bold">
              {(['Week', 'Month', 'Year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTaskPeriod(period)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    taskPeriod === period
                      ? 'bg-[#FF4D67] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getTaskData()} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const completed = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
                      const created = payload.find((p) => p.dataKey === 'created')?.value ?? 0;
                      const overdue = payload.find((p) => p.dataKey === 'overdue')?.value ?? 0;
                      const total = Number(completed) + Number(created) + Number(overdue);
                      return (
                        <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl text-xs min-w-[150px] animate-fade-in">
                          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-emerald-300">
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</span>
                              <span className="font-bold">{completed} ({Math.round((Number(completed)/total)*100)}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-sky-300">
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-400" /> Created</span>
                              <span className="font-bold">{created} ({Math.round((Number(created)/total)*100)}%)</span>
                            </div>
                            <div className="flex items-center justify-between text-rose-300">
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Overdue</span>
                              <span className="font-bold">{overdue} ({Math.round((Number(overdue)/total)*100)}%)</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="overdue" stackId="a" fill="#F8A5B0" radius={[0, 0, 8, 8]} />
                <Bar dataKey="created" stackId="a" fill="#88D3F8" />
                <Bar dataKey="completed" stackId="a" fill="#A1E7A0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex-wrap">
            <button
              onClick={() => setActiveTaskFilter('all')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTaskFilter === 'all'
                  ? 'bg-[#FF4D67] text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600/50'
              }`}
            >
              ● All
            </button>
            <button
              onClick={() => setActiveTaskFilter('completed')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTaskFilter === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Completed
            </button>
            <button
              onClick={() => setActiveTaskFilter('created')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTaskFilter === 'created'
                  ? 'bg-sky-100 text-sky-800 font-bold border border-sky-200'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-sky-400" />
              Created
            </button>
            <button
              onClick={() => setActiveTaskFilter('overdue')}
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeTaskFilter === 'overdue'
                  ? 'bg-rose-100 text-rose-800 font-bold border border-rose-200'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              Overdue
            </button>
          </div>
        </div>

        {/* ── CARD RIGHT: Productivity Trend Line Chart ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">Productivity Trend</h2>
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-700/50 rounded-full text-xs font-bold">
              {(['Week', 'Month', 'Year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTrendPeriod(period)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    trendPeriod === period
                      ? 'bg-[#FF4D67] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-64 pt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={PRODUCTIVITY_TREND_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#94A3B8' }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl text-xs min-w-[140px] animate-fade-in">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Month</p>
                          <p className="font-bold text-white mb-1.5">{label}</p>
                          <div className="space-y-0.5">
                            <p className="text-[10px] text-slate-400">Tasks Completed</p>
                            <p className="text-sm font-black text-white">{payload[0].value}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="tasks"
                  stroke="#FF4D67"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#FF4D67', strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: '#FF4D67', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex-wrap overflow-x-auto text-xs">
            {['All', 'Critical', 'High', 'Medium', 'Low'].map((priority) => (
              <button
                key={priority}
                onClick={() => setActivePriorityFilter(priority)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  activePriorityFilter === priority
                    ? 'bg-[#FF4D67] text-white font-bold shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 font-medium'
                }`}
              >
                {priority}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: 3 INSIGHT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* ── CARD 1: Priority Distribution Donut Chart ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Priority Distribution</h3>
          </div>

          <div className="flex items-center justify-between gap-4 mt-2">
            <div className="relative w-36 h-36 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={PRIORITY_DISTRIBUTION}
                    dataKey="value"
                    innerRadius={44}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {PRIORITY_DISTRIBUTION.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">All<br />Priorities</span>
              </div>
            </div>

            <div className="flex-1 space-y-1.5 text-xs">
              {PRIORITY_DISTRIBUTION.map((cat, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-600 truncate font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                    <span className="truncate">{cat.name}</span>
                  </span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 ml-2">{cat.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CARD 2: Department Performance ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Team Performance</h3>
          </div>

          <div className="space-y-3 mt-3">
            {DEPARTMENT_PERFORMANCE.map((dept, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                    {dept.name}
                  </span>
                  <span className="font-extrabold text-slate-900 dark:text-slate-100">{dept.rate}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${dept.rate}%` }}
                    className="bg-[#FF4D67] h-full rounded-full transition-all duration-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CARD 3: Avg Completion Time ── */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Avg. Completion Time</h3>
            </div>

            <div className="space-y-3 mt-3">
              {AVG_COMPLETION_TIME.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <span className="w-20 text-slate-600 font-medium truncate shrink-0">{item.team}</span>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                    <div
                      style={{ width: `${item.widthPct}%`, background: item.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                  <span className="w-16 text-right font-extrabold text-slate-900 dark:text-slate-100 shrink-0">{item.days}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4 text-[11px] font-bold">
            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">
              Fast
            </span>
            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">
              Average
            </span>
            <span className="bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full">
              Slow
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
