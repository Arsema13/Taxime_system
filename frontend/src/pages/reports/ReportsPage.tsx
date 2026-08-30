import React, { useState, useEffect } from 'react';
import { Download, FileText, Calendar, Filter, BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import { reportService, departmentService, userService } from '@/services';
import type { TaskReport, Department, User } from '@/types';
import { PageLoader } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, ErrorState } from '@/components/ui/Card';
import { useToast } from '@/contexts';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

const COLORS = ['#14b8a6', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

interface ReportFilters {
  startDate: string;
  endDate: string;
  departmentId?: string;
  userId?: string;
}

export default function ReportsPage() {
  const { success, error } = useToast();

  const [report, setReport] = useState<TaskReport | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [exporting, setExporting] = useState<'pdf' | 'excel' | null>(null);

  const [filters, setFilters] = useState<ReportFilters>({
    startDate: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const load = async () => {
    setLoading(true); setLoadError(false);
    try {
      const [reportData, deptsRes, usersRes] = await Promise.all([
        reportService.getTaskReport(filters),
        departmentService.getDepartments({ page: 1, limit: 100 }),
        userService.getUsers({ page: 1, limit: 100 }),
      ]);
      setReport(reportData);
      setDepartments(deptsRes.data);
      setUsers(usersRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [JSON.stringify(filters)]);

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format);
    try {
      const blob = await reportService.exportReport(filters, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-report-${filters.startDate}-${filters.endDate}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Exported', `Report exported as ${format.toUpperCase()}`);
    } catch {
      error('Error', `Could not export report as ${format.toUpperCase()}`);
    } finally {
      setExporting(null);
    }
  };

  if (loadError) return <ErrorState message="Could not load report." onRetry={load} />;

  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        description="Task performance insights and metrics"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<Download className="w-4 h-4" />}
              onClick={() => handleExport('excel')}
              loading={exporting === 'excel'}
            >
              Excel
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<FileText className="w-4 h-4" />}
              onClick={() => handleExport('pdf')}
              loading={exporting === 'pdf'}
            >
              PDF
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card padding="md" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <Input
            type="date"
            label="Start Date"
            value={filters.startDate}
            onChange={e => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
          <Input
            type="date"
            label="End Date"
            value={filters.endDate}
            onChange={e => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
          <Select
            label="Department"
            value={filters.departmentId ?? ''}
            onChange={e => setFilters(f => ({ ...f, departmentId: e.target.value || undefined }))}
          >
            <option value="">All Departments</option>
            {Array.isArray(departments) && departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
          <Select
            label="User"
            value={filters.userId ?? ''}
            onChange={e => setFilters(f => ({ ...f, userId: e.target.value || undefined }))}
          >
            <option value="">All Users</option>
            {Array.isArray(users) && users.map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
          </Select>
        </div>
      </Card>

      {loading ? (
        <PageLoader />
      ) : !report ? (
        <ErrorState message="No data available for the selected filters." />
      ) : (
        <div className="flex flex-col gap-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card padding="lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-teal-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{report.totalTasks}</p>
                  <p className="text-xs text-slate-500">Total Tasks</p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{report.completedTasks}</p>
                  <p className="text-xs text-slate-500">Completed</p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{report.inProgressTasks}</p>
                  <p className="text-xs text-slate-500">In Progress</p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{report.overdueTasks}</p>
                  <p className="text-xs text-slate-500">Overdue</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks by Status */}
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-slate-600" />
                Tasks by Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={report.tasksByStatus}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={(entry) => `${entry.status.replace(/_/g, ' ')}: ${entry.count}`}
                  >
                    {Array.isArray(report.tasksByStatus) && report.tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Tasks by Priority */}
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-600" />
                Tasks by Priority
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.tasksByPriority}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#14b8a6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks by Category */}
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Tasks by Category</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.tasksByCategory} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Completion Rate Trend */}
            {report.completionTrend && (
              <Card padding="lg">
                <h3 className="font-semibold text-slate-800 mb-4">Completion Rate Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={report.completionTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>

          {/* Top Performers */}
          {report.topPerformers && report.topPerformers.length > 0 && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {Array.isArray(report.topPerformers) && report.topPerformers.map((performer, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center text-sm font-bold text-teal-700">
                      #{i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{performer.name}</p>
                      <p className="text-xs text-slate-500">{performer.completedTasks} tasks completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Department Performance */}
          {report.departmentPerformance && report.departmentPerformance.length > 0 && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Department Performance</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={report.departmentPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="completed" fill="#10b981" name="Completed" />
                  <Bar dataKey="inProgress" fill="#f59e0b" name="In Progress" />
                  <Bar dataKey="overdue" fill="#ef4444" name="Overdue" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
