import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Filter, RefreshCw, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';
import { submittedReportService } from '@/services';
import type { Report, ReportStatus, ReportStats } from '@/types';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  SUBMITTED: { label: 'Submitted', variant: 'info' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  REVISION_NEEDED: { label: 'Revision Needed', variant: 'warning' }
};

export default function MyReportsPage() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  const loadData = async () => {
    setLoading(true);
    try {
      const [reportsData, statsData] = await Promise.all([
        submittedReportService.getReports({ status: statusFilter as ReportStatus || undefined }),
        submittedReportService.getStats()
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [statusFilter]);

  const paginatedReports = reports.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(reports.length / perPage);

  return (
    <div>
      <PageHeader
        title="My Reports"
        description="View and manage your submitted reports"
        breadcrumbs={[{ label: 'Reports', to: '/reports' }, { label: 'My Reports' }]}
        actions={
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/reports/submit')}>
            New Report
          </Button>
        }
      />

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-slate-600" />
              <span className="font-bold text-lg">{stats.total}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-blue-600" />
              <span className="font-bold text-lg">{stats.submitted}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Submitted</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <CheckCircle size={16} className="text-emerald-600" />
              <span className="font-bold text-lg">{stats.approved}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Approved</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <XCircle size={16} className="text-red-600" />
              <span className="font-bold text-lg">{stats.rejected}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Rejected</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-amber-600" />
              <span className="font-bold text-lg">{stats.revisionNeeded}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Needs Revision</p>
          </div>
        </div>
      )}

      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SUBMITTED', label: 'Submitted' },
                { value: 'UNDER_REVIEW', label: 'Under Review' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'REVISION_NEEDED', label: 'Revision Needed' }
              ]}
            />
          </div>
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading reports...</div>
        ) : paginatedReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No reports found</p>
            <Button variant="primary" size="sm" className="mt-3" onClick={() => navigate('/reports/submit')}>
              Create your first report
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-white/30 dark:bg-slate-800/30 border border-white/40 dark:border-slate-700/40 hover:bg-white/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/reports/${report.id}`)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">{report.title}</h4>
                    <Badge variant={STATUS_CONFIG[report.status].variant}>
                      {STATUS_CONFIG[report.status].label}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {report.reportType.replace(/_/g, ' ')} · {format(new Date(report.createdAt), 'MMM d, yyyy')}
                  </p>
                  {report.task && (
                    <p className="text-xs text-slate-400 mt-1">Task: {report.task.title}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{report.progress}%</div>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full mt-1">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${report.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              total={reports.length}
              limit={perPage}
              onPageChange={setPage}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
