import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { submittedReportService } from '@/services';
import { WordReportEditor } from '@/components/reports/WordReportEditor';
import type { Report } from '@/types';

export default function ReportEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [report, setReport] = useState<Report | null>(null);
  const [combinedReports, setCombinedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const state = location.state as { reports?: Report[]; title?: string } | null;

    if (state?.reports && state.reports.length > 0) {
      // Navigated here with pre-selected reports to combine
      setCombinedReports(state.reports);
      setLoading(false);
    } else if (id) {
      // Navigated to edit a specific report
      submittedReportService.getReport(id)
        .then(data => {
          setReport(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      // New blank report
      setLoading(false);
    }
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#e5e7eb] dark:bg-[#0f172a]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#e89b1a] flex items-center justify-center text-[#0b1628] font-black text-xl shadow-lg animate-pulse">
            W
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Word Editor...</p>
        </div>
      </div>
    );
  }

  return (
    <WordReportEditor
      initialReport={report}
      combinedReports={combinedReports}
      initialTitle={(location.state as any)?.title}
      onBack={() => navigate(-1)}
    />
  );
}
