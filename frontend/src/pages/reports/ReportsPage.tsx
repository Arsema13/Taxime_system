import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar, ChevronDown, Download, FileText, FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { useToast } from '@/contexts';
import { dashboardService } from '@/services/dashboard.service';
import { reportService, downloadBlob } from '@/services/report.service';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import type { CommanderDashboard } from '@/types';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';

interface DateRange {
  fromDate: string;
  toDate: string;
}

const DATE_PRESETS = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Year', value: 'year' },
  { label: 'All Time', value: 'all' },
  { label: 'Custom', value: 'custom' },
];

function getPresetRange(preset: string): DateRange {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  switch (preset) {
    case 'today':
      return { fromDate: today, toDate: today };
    case 'week':
      return { fromDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'), toDate: today };
    case 'month':
      return { fromDate: format(startOfMonth(now), 'yyyy-MM-dd'), toDate: today };
    case 'year':
      return { fromDate: format(startOfYear(now), 'yyyy-MM-dd'), toDate: today };
    default:
      return { fromDate: '', toDate: '' };
  }
}

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#f59e0b',
  LOW: '#10b981',
};

const PRIORITY_LABELS: Record<string, string> = {
  CRITICAL: 'Critical',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export default function ReportsPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Date range
  const [datePreset, setDatePreset] = useState('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Data
  const [dashboard, setDashboard] = useState<CommanderDashboard | null>(null);
  const [taskSummary, setTaskSummary] = useState<any>(null);
  const [teamPerformance, setTeamPerformance] = useState<any[]>([]);
  const [completionTimeline, setCompletionTimeline] = useState<any[]>([]);

  // Chart filters
  const [taskPeriod, setTaskPeriod] = useState<'Week' | 'Month' | 'Year'>('Month');

  const dateRange = useMemo<DateRange>(() => {
    if (datePreset === 'custom') {
      return { fromDate: customFrom, toDate: customTo };
    }
    return getPresetRange(datePreset);
  }, [datePreset, customFrom, customTo]);

  const dateLabel = useMemo(() => {
    if (datePreset === 'custom' && customFrom && customTo) {
      return `${format(new Date(customFrom), 'MMM d, yyyy')} - ${format(new Date(customTo), 'MMM d, yyyy')}`;
    }
    const found = DATE_PRESETS.find(p => p.value === datePreset);
    return found?.label || 'All Time';
  }, [datePreset, customFrom, customTo]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (dateRange.fromDate) params.dateFrom = dateRange.fromDate;
      if (dateRange.toDate) params.dateTo = dateRange.toDate;

      const [dashData, summaryData, teamData, timelineData] = await Promise.all([
        dashboardService.getCommanderDashboard(),
        reportService.getReport('task-summary', params),
        reportService.getReport('team-performance'),
        reportService.getReport('completion-timeline', params),
      ]);

      setDashboard(dashData);
      setTaskSummary(summaryData);
      setTeamPerformance(teamData?.data || []);
      setCompletionTimeline(timelineData?.data || []);
    } catch {
      error('Error', 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadData(); }, [dateRange.fromDate, dateRange.toDate]);

  // ── Derived chart data ──────────────────────────────────────────────────

  const kpis = useMemo(() => {
    if (!dashboard) return { total: 0, completed: 0, inProgress: 0, overdue: 0, rate: 0 };
    const s = dashboard.stats;
    return {
      total: s.totalTasks,
      completed: s.completedTasks,
      inProgress: s.inProgressTasks,
      overdue: s.overdueTasks,
      rate: s.completionRate,
    };
  }, [dashboard]);

  const taskChartData = useMemo(() => {
    if (!completionTimeline.length) return [];
    const data = completionTimeline;
    if (taskPeriod === 'Week') {
      const last7 = data.slice(-7);
      return last7.map(d => ({
        month: format(new Date(d.date), 'EEE'),
        completed: d.count,
        created: 0,
        overdue: 0,
      }));
    }
    if (taskPeriod === 'Month') {
      const last4 = data.slice(-4);
      return last4.map(d => ({
        month: format(new Date(d.date), 'MMM d'),
        completed: d.count,
        created: 0,
        overdue: 0,
      }));
    }
    // Year: group by month
    const monthly: Record<string, number> = {};
    data.forEach(d => {
      const key = format(new Date(d.date), 'MMM');
      monthly[key] = (monthly[key] || 0) + d.count;
    });
    return Object.entries(monthly).map(([month, completed]) => ({
      month, completed, created: 0, overdue: 0,
    }));
  }, [completionTimeline, taskPeriod]);

  const priorityData = useMemo(() => {
    if (!taskSummary?.byPriority) return [];
    const total = taskSummary.byPriority.reduce((s: number, p: any) => s + p.count, 0);
    return taskSummary.byPriority.map((p: any) => ({
      name: PRIORITY_LABELS[p.priority] || p.priority,
      value: total > 0 ? Math.round((p.count / total) * 100) : 0,
      count: p.count,
      color: PRIORITY_COLORS[p.priority] || '#94a3b8',
    }));
  }, [taskSummary]);

  const teamData = useMemo(() => {
    return teamPerformance.map((t: any) => ({
      name: t.name,
      tasks: t.totalTasks,
      completed: t.completedTasks,
      rate: t.completionRate,
      avgDays: t.avgCompletionTimeHours ? (t.avgCompletionTimeHours / 24).toFixed(1) : 'N/A',
      avgHours: t.avgCompletionTimeHours,
    }));
  }, [teamPerformance]);

  // ── Export handlers ─────────────────────────────────────────────────────

  const handleExport = async (format: 'PDF' | 'Excel' | 'Word') => {
    setIsExporting(true);
    try {
      const params: Record<string, string> = {};
      if (dateRange.fromDate) params.dateFrom = dateRange.fromDate;
      if (dateRange.toDate) params.dateTo = dateRange.toDate;

      let blob: Blob;
      const ext = format === 'PDF' ? 'pdf' : format === 'Excel' ? 'xlsx' : 'docx';
      const filename = `taxime-analytics-${datePreset}-${format(new Date(), 'yyyy-MM-dd')}.${ext}`;

      if (format === 'PDF') {
        blob = await reportService.exportAnalyticsPdf(params);
      } else if (format === 'Excel') {
        blob = await reportService.exportAnalyticsExcel(params);
      } else {
        blob = await reportService.exportAnalyticsWord(params);
      }
      downloadBlob(blob, filename);
      success('Exported', `Analytics report exported as ${format.toUpperCase()}`);
    } catch {
      error('Export Failed', `Could not export report as ${format}`);
    } finally {
      setIsExporting(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────────────────

  if (loading && !dashboard) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#e89b1a]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-12 font-sans">
      {/* ── PAGE HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Analytics"
          description="Task performance metrics and team productivity insights"
          breadcrumbs={[{ label: 'Reports', to: '/reports' }, { label: 'Analytics' }]}
          actions={
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
                onClick={() => handleExport('Excel')}
                disabled={isExporting}
              >
                Excel
              </Button>
              <Button
                size="sm"
                variant="outline"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => handleExport('Word')}
                disabled={isExporting}
              >
                Word
              </Button>
              <Button
                size="sm"
                icon={<FileText className="w-3.5 h-3.5" />}
                onClick={() => handleExport('PDF')}
                disabled={isExporting}
              >
                PDF Report
              </Button>
            </div>
          }
        />
      </div>

      {/* ── DATE RANGE FILTER ── */}
      <div className="flex items-center justify-end">
        <div className="relative">
          <button
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 px-4 py-2 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-xs text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
          >
            <Calendar size={14} className="text-slate-400" />
            <span>{dateLabel}</span>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {showDatePicker && (
            <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 z-50 w-72 animate-fade-in">
              <div className="space-y-1">
                {DATE_PRESETS.map(preset => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setDatePreset(preset.value);
                      if (preset.value !== 'custom') setShowDatePicker(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                      datePreset === preset.value
                        ? 'bg-[#e89b1a] text-white'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {datePreset === 'custom' && (
                <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">From</label>
                    <input
                      type="date"
                      value={customFrom}
                      onChange={e => setCustomFrom(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase">To</label>
                    <input
                      type="date"
                      value={customTo}
                      onChange={e => setCustomTo(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                    />
                  </div>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    disabled={!customFrom || !customTo}
                    className="w-full py-1.5 text-sm font-bold bg-[#e89b1a] text-white rounded-lg disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── 5 KPI CARDS ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-[#e89b1a] text-white rounded-[22px] p-4.5 shadow-md shadow-[#e89b1a]/10 flex flex-col justify-between">
          <p className="text-xs font-semibold text-white/80">Total Tasks</p>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{kpis.total.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-[#E5F7E4] text-[#0B1628] dark:text-slate-100 rounded-[22px] p-4.5 border border-emerald-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-600">Completed</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{kpis.completed.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{kpis.total > 0 ? Math.round((kpis.completed / kpis.total) * 100) : 0}% of total</span>
          </div>
        </div>

        <div className="bg-[#E5F5FC] text-[#0B1628] dark:text-slate-100 rounded-[22px] p-4.5 border border-sky-100 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-600">In Progress</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{kpis.inProgress.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{kpis.total > 0 ? Math.round((kpis.inProgress / kpis.total) * 100) : 0}% of total</span>
          </div>
        </div>

        <div className="bg-[#FDEAE8] text-[#0B1628] dark:text-slate-100 rounded-[22px] p-4.5 border border-[#e89b1a]/20 flex flex-col justify-between">
          <p className="text-xs font-bold text-slate-600">Overdue</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{kpis.overdue.toLocaleString()}</span>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{kpis.total > 0 ? Math.round((kpis.overdue / kpis.total) * 100) : 0}% of total</span>
          </div>
        </div>

        <div className="bg-[#EBEBFD] text-[#0B1628] dark:text-slate-100 rounded-[22px] p-4.5 border border-indigo-100 flex flex-col justify-between col-span-2 lg:col-span-1">
          <p className="text-xs font-bold text-slate-600">Completion Rate</p>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black tracking-tight leading-none">{kpis.rate}%</span>
            <span className="text-[11px] font-semibold text-emerald-600">overall</span>
          </div>
        </div>
      </div>

      {/* ── MIDDLE ROW: 2 CHARTS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Completion Bar Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#0B1628] dark:text-slate-100">Task Completion</h2>
            <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-700/50 rounded-full text-xs font-bold">
              {(['Week', 'Month', 'Year'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTaskPeriod(period)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    taskPeriod === period
                      ? 'bg-[#e89b1a] text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-[#0B1628] dark:hover:text-slate-100'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskChartData} barSize={26}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const completed = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
                      return (
                        <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl text-xs min-w-[140px] animate-fade-in">
                          <p className="font-bold text-slate-200 mb-1.5">{label}</p>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-emerald-300">
                              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed</span>
                              <span className="font-bold">{completed}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="completed" fill="#A1E7A0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex-wrap">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700 bg-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> Completed Tasks
            </span>
          </div>
        </div>

        {/* Productivity Trend Line Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black text-[#0B1628] dark:text-slate-100">Completion Trend</h2>
          </div>

          <div className="w-full h-64 pt-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94A3B8' }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white rounded-2xl p-3 shadow-xl text-xs min-w-[140px] animate-fade-in">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Period</p>
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
                  dataKey="completed"
                  stroke="#e89b1a"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#e89b1a', strokeWidth: 1 }}
                  activeDot={{ r: 6, fill: '#e89b1a', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-700/50 flex-wrap overflow-x-auto text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-amber-700 bg-amber-100">
              <span className="w-2 h-2 rounded-full bg-[#e89b1a]" /> Completion Over Time
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM ROW: 3 INSIGHT CARDS ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority Distribution Donut */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Priority Distribution</h3>
          </div>

          {priorityData.length > 0 ? (
            <div className="flex items-center justify-between gap-4 mt-2">
              <div className="relative w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      innerRadius={44}
                      outerRadius={65}
                      paddingAngle={3}
                    >
                      {priorityData.map((entry, i) => (
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
                {priorityData.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-600 truncate font-medium">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cat.color }} />
                      <span className="truncate">{cat.name}</span>
                    </span>
                    <span className="font-bold text-[#0B1628] dark:text-slate-100 ml-2">{cat.count} ({cat.value}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No data available</div>
          )}
        </div>

        {/* Team Performance */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Team Performance</h3>
          </div>

          {teamData.length > 0 ? (
            <div className="space-y-3 mt-3">
              {teamData.map((dept, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <span className="w-2 h-2 rounded-full shrink-0 bg-slate-300" />
                      {dept.name}
                    </span>
                    <span className="font-extrabold text-[#0B1628] dark:text-slate-100">{dept.rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
                    <div
                      style={{ width: `${dept.rate}%` }}
                      className="bg-[#e89b1a] h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">No data available</div>
          )}
        </div>

        {/* Avg Completion Time */}
        <div className="bg-white dark:bg-slate-800 rounded-[26px] p-6 border border-slate-200/70 dark:border-slate-700/70 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#0B1628] dark:text-slate-100">Avg. Completion Time</h3>
            </div>

            {teamData.length > 0 ? (
              <div className="space-y-3 mt-3">
                {teamData.sort((a, b) => (a.avgHours || 999) - (b.avgHours || 999)).map((item, i) => {
                  const maxHours = Math.max(...teamData.filter(t => t.avgHours).map(t => t.avgHours));
                  const widthPct = maxHours > 0 && item.avgHours ? Math.round((item.avgHours / maxHours) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3 text-xs">
                      <span className="w-20 text-slate-600 font-medium truncate shrink-0">{item.name}</span>
                      <div className="flex-1 bg-slate-100 dark:bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                        <div
                          style={{ width: `${widthPct}%` }}
                          className="bg-[#e89b1a] h-full rounded-full transition-all duration-500"
                        />
                      </div>
                      <span className="w-16 text-right font-extrabold text-[#0B1628] dark:text-slate-100 shrink-0">
                        {item.avgDays !== 'N/A' ? `${item.avgDays}d` : 'N/A'}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No data available</div>
            )}
          </div>

          <div className="flex items-center justify-between gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-700/50 mt-4 text-[11px] font-bold">
            <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full">Fast</span>
            <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full">Average</span>
            <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full">Slow</span>
          </div>
        </div>
      </div>
    </div>
  );
}
