import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Send, ArrowLeft } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { submittedReportService } from '@/services';
import type { CreateReportInput, ReportType, ReportPeriod } from '@/types';

export default function SubmitReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');

  const [form, setForm] = useState<CreateReportInput>({
    title: '',
    reportType: 'TASK_REPORT',
    period: 'CUSTOM',
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    summary: '',
    progress: 0,
    timeSpent: undefined,
    blockers: '',
    achievements: '',
    nextSteps: '',
    taskId: taskId || undefined
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof CreateReportInput, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    try {
      await submittedReportService.createReport(form);
      navigate('/reports/my-reports');
    } catch (error) {
      console.error('Failed to save report:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const report = await submittedReportService.createReport(form);
      await submittedReportService.submitReport(report.id);
      navigate('/reports/my-reports');
    } catch (error) {
      console.error('Failed to submit report:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Submit Report"
        description="Create a new report for your assigned tasks"
        breadcrumbs={[
          { label: 'Reports', to: '/reports' },
          { label: 'Submit Report' }
        ]}
        actions={
          <Button variant="outline" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Back
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Report Information</h3>
            <div className="space-y-4">
              <Input
                label="Report Title"
                value={form.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Weekly Progress Report"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Report Type"
                  value={form.reportType}
                  onChange={(e) => handleChange('reportType', e.target.value as ReportType)}
                  options={[
                    { value: 'TASK_REPORT', label: 'Task Report' },
                    { value: 'DAILY_SUMMARY', label: 'Daily Summary' },
                    { value: 'WEEKLY_REPORT', label: 'Weekly Report' },
                    { value: 'MONTHLY_REPORT', label: 'Monthly Report' },
                    { value: 'YEARLY_REPORT', label: 'Yearly Report' }
                  ]}
                />
                <Select
                  label="Period"
                  value={form.period}
                  onChange={(e) => handleChange('period', e.target.value as ReportPeriod)}
                  options={[
                    { value: 'DAILY', label: 'Daily' },
                    { value: 'WEEKLY', label: 'Weekly' },
                    { value: 'MONTHLY', label: 'Monthly' },
                    { value: 'YEARLY', label: 'Yearly' },
                    { value: 'CUSTOM', label: 'Custom' }
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From Date"
                  type="date"
                  value={form.fromDate}
                  onChange={(e) => handleChange('fromDate', e.target.value)}
                />
                <Input
                  label="To Date"
                  type="date"
                  value={form.toDate}
                  onChange={(e) => handleChange('toDate', e.target.value)}
                />
              </div>
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Summary & Progress</h3>
            <div className="space-y-4">
              <Textarea
                label="Summary"
                value={form.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Describe your work progress, accomplishments, and any challenges..."
                required
              />
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                  Progress: {form.progress}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.progress}
                  onChange={(e) => handleChange('progress', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-teal-600"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
              <Input
                label="Time Spent (hours)"
                type="number"
                value={form.timeSpent || ''}
                onChange={(e) => handleChange('timeSpent', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="e.g., 8.5"
              />
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Details</h3>
            <div className="space-y-4">
              <Textarea
                label="Achievements"
                value={form.achievements || ''}
                onChange={(e) => handleChange('achievements', e.target.value)}
                placeholder="What did you accomplish?"
              />
              <Textarea
                label="Blockers"
                value={form.blockers || ''}
                onChange={(e) => handleChange('blockers', e.target.value)}
                placeholder="Any challenges or blockers encountered?"
              />
              <Textarea
                label="Next Steps"
                value={form.nextSteps || ''}
                onChange={(e) => handleChange('nextSteps', e.target.value)}
                placeholder="What are your next steps?"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card padding="lg" className="sticky top-6">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Actions</h3>
            <div className="space-y-3">
              <Button
                variant="primary"
                fullWidth
                icon={<Send className="w-4 h-4" />}
                onClick={handleSubmit}
                loading={loading}
                disabled={!form.title || !form.summary}
              >
                Submit Report
              </Button>
              <Button
                variant="outline"
                fullWidth
                icon={<Save className="w-4 h-4" />}
                onClick={handleSaveDraft}
                loading={saving}
                disabled={!form.title}
              >
                Save as Draft
              </Button>
            </div>
            <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-xs text-slate-600">
              <p className="font-medium mb-1">Tips:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-500">
                <li>Be specific about your accomplishments</li>
                <li>Include metrics when possible</li>
                <li>Mention any blockers that need attention</li>
                <li>Outline clear next steps</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
