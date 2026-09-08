import React, { useState, useEffect, useMemo } from 'react';
import {
  Filter, RefreshCw, FileText, CheckCircle, XCircle, AlertCircle,
  Download, Edit3, Save, X, ChevronDown, ChevronUp,
  Calendar, Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Pagination } from '@/components/ui/Pagination';
import { submittedReportService } from '@/services';
import type { Report, ReportStatus, ReportStats } from '@/types';
import { format, startOfWeek, startOfMonth, startOfYear } from 'date-fns';
import { useToast } from '@/contexts';

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  SUBMITTED: { label: 'Submitted', variant: 'info' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  REVISION_NEEDED: { label: 'Revision Needed', variant: 'warning' },
};

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Today' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
  { value: 'yearly', label: 'This Year' },
  { value: 'all', label: 'All Time' },
];

function getDateRange(period: string): { fromDate: string; toDate: string } {
  const now = new Date();
  const today = format(now, 'yyyy-MM-dd');
  switch (period) {
    case 'daily':
      return { fromDate: today, toDate: today };
    case 'weekly':
      return { fromDate: format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd'), toDate: today };
    case 'monthly':
      return { fromDate: format(startOfMonth(now), 'yyyy-MM-dd'), toDate: today };
    case 'yearly':
      return { fromDate: format(startOfYear(now), 'yyyy-MM-dd'), toDate: today };
    default:
      return { fromDate: '', toDate: '' };
  }
}

export default function ReviewReportsPage() {
  const { success, error } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('all');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; summary: string; reviewerComment: string }>({
    title: '', summary: '', reviewerComment: '',
  });

  // Combine/export state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const dateRange = getDateRange(period);
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (dateRange.fromDate) filters.fromDate = dateRange.fromDate;
      if (dateRange.toDate) filters.toDate = dateRange.toDate;

      const [reportsData, statsData] = await Promise.all([
        submittedReportService.getReports(filters),
        submittedReportService.getStats(),
      ]);
      setReports(reportsData);
      setStats(statsData);
    } catch {
      error('Error', 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [period, statusFilter]);

  const filteredReports = useMemo(() => {
    return reports;
  }, [reports]);

  const paginatedReports = filteredReports.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(filteredReports.length / perPage);

  // Inline edit handlers
  const startEditing = (report: Report) => {
    setEditingId(report.id);
    setEditForm({
      title: report.title,
      summary: report.summary,
      reviewerComment: report.reviewerComment || '',
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({ title: '', summary: '', reviewerComment: '' });
  };

  const saveEditing = async (id: string) => {
    try {
      await submittedReportService.updateReport(id, {
        title: editForm.title,
        summary: editForm.summary,
        reviewerComment: editForm.reviewerComment,
      });
      success('Saved', 'Report updated successfully');
      setEditingId(null);
      loadData();
    } catch {
      error('Error', 'Failed to update report');
    }
  };

  // Selection handlers
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === paginatedReports.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedReports.map(r => r.id)));
    }
  };

  // Export handlers
  const exportSingle = async (report: Report, format: 'pdf' | 'excel' | 'word') => {
    try {
      let blob: Blob;
      let ext: string;
      if (format === 'pdf') {
        blob = await submittedReportService.exportReportPdf(report.id);
        ext = 'pdf';
      } else if (format === 'excel') {
        blob = await submittedReportService.exportReportExcel(report.id);
        ext = 'xlsx';
      } else {
        blob = await submittedReportService.exportReportWord(report.id);
        ext = 'docx';
      }
      submittedReportService.downloadBlob(blob, `report-${report.title.replace(/\s+/g, '_')}.${ext}`);
      success('Exported', `Report exported as ${format.toUpperCase()}`);
    } catch {
      error('Error', 'Failed to export report');
    }
  };

  const exportCombined = async (format: 'pdf' | 'excel' | 'word') => {
    const idsToExport = selectedIds.size > 0
      ? Array.from(selectedIds)
      : filteredReports.map(r => r.id);

    if (idsToExport.length === 0) {
      error('Error', 'No reports to export');
      return;
    }

    try {
      const blobs = await Promise.all(
        idsToExport.map(id => {
          if (format === 'pdf') return submittedReportService.exportReportPdf(id);
          if (format === 'excel') return submittedReportService.exportReportExcel(id);
          return submittedReportService.exportReportWord(id);
        })
      );

      const ext = format === 'excel' ? 'xlsx' : format === 'word' ? 'docx' : 'pdf';
      for (let i = 0; i < blobs.length; i++) {
        const report = filteredReports.find(r => r.id === idsToExport[i]);
        const filename = `report-${(report?.title || 'combined').replace(/\s+/g, '_')}.${ext}`;
        submittedReportService.downloadBlob(blobs[i], filename);
      }

      success('Exported', `${idsToExport.length} reports exported`);
    } catch {
      error('Error', 'Failed to export reports');
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports"
        description="View, edit, and export team reports"
        breadcrumbs={[{ label: 'Reports', to: '/reports' }, { label: 'Review' }]}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={loadData}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => exportCombined('pdf')}>
              Export PDF
            </Button>
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => exportCombined('excel')}>
              Export Excel
            </Button>
            <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => exportCombined('word')}>
              Export Word
            </Button>
          </div>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <FileText size={16} className="text-slate-600" />
              <span className="font-bold text-lg">{stats.total}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total Reports</p>
          </div>
          <div className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/40 dark:border-slate-700/40">
            <div className="flex items-center space-x-2">
              <Clock size={16} className="text-blue-600" />
              <span className="font-bold text-lg">{stats.submitted + stats.revisionNeeded}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending Review</p>
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

      {/* Filters */}
      <Card padding="lg" className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Period:</span>
            <div className="flex gap-1">
              {PERIOD_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setPeriod(opt.value)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    period === opt.value
                      ? 'bg-[#e89b1a] text-white'
                      : 'bg-slate-100 dark:bg-slate-700/50 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-500 dark:text-slate-400" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Status:</span>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="REVISION_NEEDED">Revision Needed</option>
            </Select>
          </div>

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-slate-600">{selectedIds.size} selected</span>
              <Button size="sm" variant="outline" onClick={() => exportCombined('pdf')} icon={<Download className="w-3 h-3" />}>
                Export Selected PDF
              </Button>
              <Button size="sm" variant="outline" onClick={() => exportCombined('excel')} icon={<Download className="w-3 h-3" />}>
                Export Selected Excel
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Reports List */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={paginatedReports.length > 0 && selectedIds.size === paginatedReports.length}
              onChange={selectAll}
              className="w-4 h-4 text-teal-600 rounded border-slate-300"
            />
            <span className="text-sm text-slate-600">
              Select all ({filteredReports.length} reports)
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400">No reports found for this period</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedReports.map((report) => {
              const isEditing = editingId === report.id;
              const isExpanded = expandedId === report.id;
              const isSelected = selectedIds.has(report.id);

              return (
                <div
                  key={report.id}
                  className={`rounded-2xl border transition-colors ${
                    isSelected ? 'bg-teal-50/50 border-teal-200' : 'bg-white/30 dark:bg-slate-800/30 border-white/40 dark:border-slate-700/40 hover:bg-white/50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Main Row */}
                  <div className="flex items-center gap-3 p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(report.id)}
                      className="w-4 h-4 text-teal-600 rounded border-slate-300"
                    />

                    <Avatar src={report.author.avatar} name={`${report.author.firstName} ${report.author.lastName}`} size="sm" />

                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <Input
                          value={editForm.title}
                          onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                          className="text-sm font-medium"
                        />
                      ) : (
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-800 dark:text-slate-200 truncate">{report.title}</h4>
                          <Badge variant={STATUS_CONFIG[report.status].variant}>
                            {STATUS_CONFIG[report.status].label}
                          </Badge>
                        </div>
                      )}
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {report.author.firstName} {report.author.lastName} · {report.reportType.replace(/_/g, ' ')} · {format(new Date(report.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={() => saveEditing(report.id)} icon={<Save className="w-3 h-3" />}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={cancelEditing} icon={<X className="w-3 h-3" />}>Cancel</Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => startEditing(report)} icon={<Edit3 className="w-3 h-3" />}>
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => setExpandedId(isExpanded ? null : report.id)}>
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => exportSingle(report, 'pdf')} icon={<Download className="w-3 h-3" />}>
                            PDF
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => exportSingle(report, 'excel')} icon={<Download className="w-3 h-3" />}>
                            Excel
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => exportSingle(report, 'word')} icon={<Download className="w-3 h-3" />}>
                            Word
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded Detail */}
                  {isExpanded && !isEditing && (
                    <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div>
                          <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Summary</h5>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.summary || 'No summary provided'}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 dark:text-slate-400">Progress:</span>
                            <div className="flex-1 h-2 bg-slate-200 rounded-full">
                              <div className="h-full bg-teal-500 rounded-full" style={{ width: `${report.progress}%` }} />
                            </div>
                            <span className="font-medium text-slate-700 dark:text-slate-300">{report.progress}%</span>
                          </div>
                          {report.timeSpent && (
                            <div className="flex items-center gap-2 text-sm">
                              <Clock size={14} className="text-slate-400" />
                              <span className="text-slate-500 dark:text-slate-400">Time spent:</span>
                              <span className="text-slate-700 dark:text-slate-300">{report.timeSpent}h</span>
                            </div>
                          )}
                          {report.achievements && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Achievements</h5>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{report.achievements}</p>
                            </div>
                          )}
                          {report.blockers && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Blockers</h5>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{report.blockers}</p>
                            </div>
                          )}
                          {report.nextSteps && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Next Steps</h5>
                              <p className="text-sm text-slate-700 dark:text-slate-300">{report.nextSteps}</p>
                            </div>
                          )}
                          {report.reviewerComment && (
                            <div>
                              <h5 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Your Comment</h5>
                              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{report.reviewerComment}"</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quick Comment */}
                      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1 block">Add Comment</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a comment on this report..."
                            value={editingId === report.id ? editForm.reviewerComment : report.reviewerComment || ''}
                            onChange={e => {
                              if (editingId === report.id) {
                                setEditForm(f => ({ ...f, reviewerComment: e.target.value }));
                              } else {
                                // Quick comment saves directly
                              }
                            }}
                          />
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await submittedReportService.updateReport(report.id, {
                                  reviewerComment: editingId === report.id ? editForm.reviewerComment : '',
                                });
                                success('Saved', 'Comment saved');
                                loadData();
                              } catch {
                                error('Error', 'Failed to save comment');
                              }
                            }}
                          >
                            Save Comment
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} total={filteredReports.length} limit={perPage} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  );
}
