import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Send, CheckCircle, Save, Trash2, Download, FileText, FileSpreadsheet } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ConfirmDialog } from '@/components/ui/Modal';
import { submittedReportService } from '@/services';
import { useAuth } from '@/contexts';
import type { Report, ReportStatus, ReviewReportInput } from '@/types';
import { format } from 'date-fns';

const STATUS_CONFIG: Record<ReportStatus, { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' }> = {
  DRAFT: { label: 'Draft', variant: 'default' },
  SUBMITTED: { label: 'Submitted', variant: 'info' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'warning' },
  APPROVED: { label: 'Approved', variant: 'success' },
  REJECTED: { label: 'Rejected', variant: 'danger' },
  REVISION_NEEDED: { label: 'Revision Needed', variant: 'warning' }
};

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    summary: '',
    progress: 0,
    timeSpent: '',
    blockers: '',
    achievements: '',
    nextSteps: '',
    reviewerComment: ''
  });

  const [reviewForm, setReviewForm] = useState<ReviewReportInput>({
    status: 'APPROVED',
    reviewerComment: ''
  });

  const loadReport = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await submittedReportService.getReport(id);
      setReport(data);
      setForm({
        title: data.title,
        summary: data.summary,
        progress: data.progress,
        timeSpent: data.timeSpent?.toString() || '',
        blockers: data.blockers || '',
        achievements: data.achievements || '',
        nextSteps: data.nextSteps || '',
        reviewerComment: data.reviewerComment || ''
      });
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReport(); }, [id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await submittedReportService.updateReport(id, {
        ...form,
        timeSpent: form.timeSpent ? parseFloat(form.timeSpent) : undefined
      });
      setEditing(false);
      loadReport();
    } catch (error) {
      console.error('Failed to save report:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await submittedReportService.submitReport(id);
      loadReport();
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await submittedReportService.reviewReport(id, reviewForm);
      setShowReview(false);
      loadReport();
    } catch (error) {
      console.error('Failed to review report:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await submittedReportService.deleteReport(id);
      navigate('/reports/my-reports');
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPdf = async () => {
    setExporting(true);
    try {
      const blob = await submittedReportService.exportReportPdf(report.id);
      submittedReportService.downloadBlob(blob, `report-${report.id}.pdf`);
    } catch (error) {
      console.error('Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await submittedReportService.exportReportExcel(report.id);
      submittedReportService.downloadBlob(blob, `report-${report.id}.xlsx`);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500">Loading report...</div>;
  if (!report) return <div className="text-center py-20 text-slate-500">Report not found</div>;

  const isAuthor = user?.id === report.authorId;
  const isCommander = user?.role === 'COMMANDER';
  const isTeamLead = user?.role === 'TEAM_LEAD';
  const isReviewer = (isCommander || isTeamLead) && !isAuthor;
  
  // Author can edit drafts and revision-needed reports
  const authorCanEdit = isAuthor && (report.status === 'DRAFT' || report.status === 'REVISION_NEEDED');
  // Commander/Team Lead can edit any report
  const reviewerCanEdit = isReviewer;
  const canEdit = authorCanEdit || reviewerCanEdit;
  
  const canSubmit = isAuthor && (report.status === 'DRAFT' || report.status === 'REVISION_NEEDED');
  const canReview = isReviewer && (report.status === 'SUBMITTED' || report.status === 'UNDER_REVIEW');
  const canDelete = isAuthor && report.status === 'DRAFT';

  return (
    <div>
      <PageHeader
        title={editing ? 'Edit Report' : report.title}
        breadcrumbs={[
          { label: 'Reports', to: '/reports' },
          { label: isAuthor ? 'My Reports' : 'Review Reports', to: isAuthor ? '/reports/my-reports' : '/reports/review' },
          { label: report.title }
        ]}
        actions={
          <div className="flex items-center gap-2">
            {canEdit && !editing && (
              <Button variant="outline" size="sm" icon={<Edit2 className="w-4 h-4" />} onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            {canSubmit && (
              <Button variant="primary" size="sm" icon={<Send className="w-4 h-4" />} onClick={handleSubmit} loading={saving}>
                Submit
              </Button>
            )}
            {canReview && (
              <Button variant="primary" size="sm" icon={<CheckCircle className="w-4 h-4" />} onClick={() => setShowReview(true)}>
                Review
              </Button>
            )}
            <div className="relative group">
              <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />}>
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-white/90 backdrop-blur-md rounded-xl border border-white/40 shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                <button
                  onClick={handleExportPdf}
                  disabled={exporting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-white/40 rounded-t-xl transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Export PDF
                </button>
                <button
                  onClick={handleExportExcel}
                  disabled={exporting}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-white/40 rounded-b-xl transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  Export Excel
                </button>
              </div>
            </div>
            <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
              Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {editing ? (
            <Card padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-800">
                  {isReviewer ? 'Edit Report (Commander)' : 'Edit Report'}
                </h3>
                {isReviewer && (
                  <Badge variant="info">Commander Edit</Badge>
                )}
              </div>
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  label="Summary"
                  value={form.summary}
                  onChange={(e) => setForm(prev => ({ ...prev, summary: e.target.value }))}
                />
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Progress: {form.progress}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={form.progress}
                    onChange={(e) => setForm(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                  />
                </div>
                <Input
                  label="Time Spent (hours)"
                  type="number"
                  value={form.timeSpent}
                  onChange={(e) => setForm(prev => ({ ...prev, timeSpent: e.target.value }))}
                />
                <Textarea
                  label="Achievements"
                  value={form.achievements}
                  onChange={(e) => setForm(prev => ({ ...prev, achievements: e.target.value }))}
                />
                <Textarea
                  label="Blockers"
                  value={form.blockers}
                  onChange={(e) => setForm(prev => ({ ...prev, blockers: e.target.value }))}
                />
                <Textarea
                  label="Next Steps"
                  value={form.nextSteps}
                  onChange={(e) => setForm(prev => ({ ...prev, nextSteps: e.target.value }))}
                />
                {isReviewer && (
                  <Textarea
                    label="Reviewer Notes (internal)"
                    value={form.reviewerComment}
                    onChange={(e) => setForm(prev => ({ ...prev, reviewerComment: e.target.value }))}
                    placeholder="Add internal notes about this report..."
                  />
                )}
                <div className="flex gap-2">
                  <Button variant="primary" onClick={handleSave} loading={saving}>Save Changes</Button>
                  <Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Report Content</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-slate-500 mb-1">Summary</h4>
                  <p className="text-slate-700 whitespace-pre-wrap">{report.summary}</p>
                </div>
                {report.achievements && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Achievements</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{report.achievements}</p>
                  </div>
                )}
                {report.blockers && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Blockers</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{report.blockers}</p>
                  </div>
                )}
                {report.nextSteps && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-500 mb-1">Next Steps</h4>
                    <p className="text-slate-700 whitespace-pre-wrap">{report.nextSteps}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {report.reviewerComment && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Reviewer Comments</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{report.reviewerComment}</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Report Details</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Status</span>
                <Badge variant={STATUS_CONFIG[report.status].variant}>
                  {STATUS_CONFIG[report.status].label}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Type</span>
                <span className="text-sm font-medium text-slate-700">{report.reportType.replace(/_/g, ' ')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Period</span>
                <span className="text-sm font-medium text-slate-700">{report.period}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Progress</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700">{report.progress}%</span>
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${report.progress}%` }} />
                  </div>
                </div>
              </div>
              {report.timeSpent && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Time Spent</span>
                  <span className="text-sm font-medium text-slate-700">{report.timeSpent}h</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">From</span>
                <span className="text-sm font-medium text-slate-700">{format(new Date(report.fromDate), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">To</span>
                <span className="text-sm font-medium text-slate-700">{format(new Date(report.toDate), 'MMM d, yyyy')}</span>
              </div>
              {report.task && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Task</span>
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[150px]">{report.task.title}</span>
                </div>
              )}
              {report.submittedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Submitted</span>
                  <span className="text-sm font-medium text-slate-700">{format(new Date(report.submittedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}
              {report.reviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Reviewed</span>
                  <span className="text-sm font-medium text-slate-700">{format(new Date(report.reviewedAt), 'MMM d, yyyy h:mm a')}</span>
                </div>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Author</h3>
            <div className="flex items-center gap-3">
              <Avatar src={report.author.avatar} name={`${report.author.firstName} ${report.author.lastName}`} size="md" />
              <div>
                <p className="font-medium text-slate-800">{report.author.firstName} {report.author.lastName}</p>
                {report.author.email && <p className="text-xs text-slate-500">{report.author.email}</p>}
              </div>
            </div>
          </Card>

          {report.assigner && (
            <Card padding="lg">
              <h3 className="font-semibold text-slate-800 mb-4">Assigned To</h3>
              <div className="flex items-center gap-3">
                <Avatar src={report.assigner.avatar} name={`${report.assigner.firstName} ${report.assigner.lastName}`} size="md" />
                <div>
                  <p className="font-medium text-slate-800">{report.assigner.firstName} {report.assigner.lastName}</p>
                </div>
              </div>
            </Card>
          )}

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 mb-4">Export</h3>
            <div className="space-y-2">
              <Button variant="outline" fullWidth icon={<FileText className="w-4 h-4" />} onClick={handleExportPdf} loading={exporting}>
                Download PDF
              </Button>
              <Button variant="outline" fullWidth icon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleExportExcel} loading={exporting}>
                Download Excel
              </Button>
            </div>
          </Card>

          {canDelete && (
            <Card padding="lg">
              <Button variant="danger" fullWidth icon={<Trash2 className="w-4 h-4" />} onClick={() => setShowDelete(true)}>
                Delete Draft
              </Button>
            </Card>
          )}
        </div>
      </div>

      {showReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowReview(false)} />
          <div className="relative bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md p-6 border border-white/40">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Review Report</h3>
            <div className="space-y-4">
              <Select
                label="Decision"
                value={reviewForm.status}
                onChange={(e) => setReviewForm(prev => ({ ...prev, status: e.target.value as any }))}
                options={[
                  { value: 'APPROVED', label: 'Approve' },
                  { value: 'REJECTED', label: 'Reject' },
                  { value: 'REVISION_NEEDED', label: 'Request Revision' }
                ]}
              />
              <Textarea
                label="Comments"
                value={reviewForm.reviewerComment || ''}
                onChange={(e) => setReviewForm(prev => ({ ...prev, reviewerComment: e.target.value }))}
                placeholder="Add your feedback..."
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={handleReview} loading={saving}>Submit Review</Button>
                <Button variant="outline" onClick={() => setShowReview(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this draft report? This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
