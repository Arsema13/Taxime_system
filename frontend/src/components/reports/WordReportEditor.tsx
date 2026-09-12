import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, CheckSquare,
  Table as TableIcon, Minus, Download, Printer, Send, Save,
  RotateCcw, RotateCw, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Sparkles, AlertCircle, FileText, CheckCircle2, ShieldAlert,
  ArrowLeft, Palette, Highlighter, Layers
} from 'lucide-react';
import { submittedReportService } from '@/services';
import { useAuth, useToast } from '@/contexts';
import type { Report } from '@/types';

interface WordReportEditorProps {
  initialReport?: Report | null;
  combinedReports?: Report[];
  initialTitle?: string;
  initialContent?: string;
  onSave?: (data: { title: string; content: string; sendToAdmin?: boolean }) => Promise<void>;
  onBack?: () => void;
  readOnly?: boolean;
}

const FONT_FAMILIES = [
  { label: 'Calibri (Word Default)', value: 'Calibri, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
  { label: 'Segoe UI', value: '"Segoe UI", sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Inter', value: 'Inter, sans-serif' }
];

const FONT_SIZES = [
  { label: '9 pt', value: '1' },
  { label: '10 pt', value: '2' },
  { label: '11 pt (Body)', value: '3' },
  { label: '14 pt (Subtitle)', value: '4' },
  { label: '18 pt (Heading 2)', value: '5' },
  { label: '24 pt (Heading 1)', value: '6' },
  { label: '32 pt (Title)', value: '7' }
];

const TEXT_COLORS = [
  { name: 'Default Dark', value: '#0f172a' },
  { name: 'Taxime Gold', value: '#e89b1a' },
  { name: 'Corporate Blue', value: '#1d4ed8' },
  { name: 'Emerald Green', value: '#15803d' },
  { name: 'Ruby Red', value: '#b91c1c' },
  { name: 'Slate Gray', value: '#64748b' }
];

const HIGHLIGHT_COLORS = [
  { name: 'None', value: 'transparent' },
  { name: 'Yellow', value: '#fef08a' },
  { name: 'Green', value: '#bbf7d0' },
  { name: 'Cyan', value: '#a5f3fc' },
  { name: 'Pink', value: '#fbcfe8' },
  { name: 'Amber', value: '#fde68a' }
];

export const WordReportEditor: React.FC<WordReportEditorProps> = ({
  initialReport,
  combinedReports = [],
  initialTitle = '',
  initialContent = '',
  onSave,
  onBack,
  readOnly = false
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const editorRef = useRef<HTMLDivElement>(null);

  // Document state
  const [docTitle, setDocTitle] = useState(
    initialTitle ||
    initialReport?.title ||
    (combinedReports.length > 0
      ? `Consolidated Operations Report - ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      : 'Untitled Operations Report')
  );

  const [activeTab, setActiveTab] = useState<'home' | 'insert' | 'layout' | 'export'>('home');
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [pageMargins, setPageMargins] = useState<'normal' | 'narrow' | 'wide'>('normal');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [adminNote, setAdminNote] = useState('');

  // Live document statistics
  const [stats, setStats] = useState({ words: 0, characters: 0, readingTime: 1 });

  // Formatting state
  const [currentFont, setCurrentFont] = useState('Calibri, sans-serif');
  const [currentSize, setCurrentSize] = useState('3');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrike, setIsStrike] = useState(false);
  const [_textColor, setTextColor] = useState('#0f172a');
  const [_highlightColor, setHighlightColor] = useState('transparent');

  const isTeamLead = user?.role === 'TEAM_LEAD';
  const isAdmin = user?.role === 'ADMIN';

  // Build initial HTML template if starting fresh or combining
  const generateInitialHtml = (): string => {
    if (initialContent) return initialContent;
    if (initialReport) {
      return `
        <h1 style="color: #e89b1a; font-size: 26pt; margin-bottom: 4px; text-align: center;">${initialReport.title}</h1>
        <p style="text-align: center; color: #64748b; font-size: 11pt; margin-bottom: 24px;">
          <strong>Author:</strong> ${initialReport.author?.firstName || ''} ${initialReport.author?.lastName || ''} &nbsp;|&nbsp;
          <strong>Period:</strong> ${initialReport.period || 'CUSTOM'} &nbsp;|&nbsp;
          <strong>Progress:</strong> ${initialReport.progress}% &nbsp;|&nbsp;
          <strong>Status:</strong> ${(initialReport.status || 'DRAFT').replace(/_/g, ' ')}
        </p>
        <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 16px 0;" />
        
        <h2 style="color: #0f172a; font-size: 16pt; margin-top: 20px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px;">Executive Summary</h2>
        <p style="font-size: 11pt; line-height: 1.6;">${initialReport.summary ? initialReport.summary.replace(/\n/g, '<br/>') : 'No summary provided.'}</p>
        
        ${initialReport.achievements ? `
          <h2 style="color: #15803d; font-size: 16pt; margin-top: 24px; border-bottom: 1px solid #bbf7d0; padding-bottom: 4px;">Key Achievements</h2>
          <p style="font-size: 11pt; line-height: 1.6;">${initialReport.achievements.replace(/\n/g, '<br/>')}</p>
        ` : ''}

        ${initialReport.blockers ? `
          <h2 style="color: #b91c1c; font-size: 16pt; margin-top: 24px; border-bottom: 1px solid #fecaca; padding-bottom: 4px;">Blockers & Challenges</h2>
          <p style="font-size: 11pt; line-height: 1.6;">${initialReport.blockers.replace(/\n/g, '<br/>')}</p>
        ` : ''}

        ${initialReport.nextSteps ? `
          <h2 style="color: #1d4ed8; font-size: 16pt; margin-top: 24px; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px;">Action Items & Next Steps</h2>
          <p style="font-size: 11pt; line-height: 1.6;">${initialReport.nextSteps.replace(/\n/g, '<br/>')}</p>
        ` : ''}

        ${initialReport.reviewerComment ? `
          <div style="background-color: #f8fafc; border-left: 4px solid #e89b1a; padding: 12px 16px; margin-top: 28px; border-radius: 4px;">
            <p style="margin: 0; font-weight: bold; color: #0f172a;">Reviewer Comment:</p>
            <p style="margin: 4px 0 0 0; color: #475569; font-style: italic;">"${initialReport.reviewerComment}"</p>
          </div>
        ` : ''}
      `;
    }

    if (combinedReports.length > 0) {
      const totalHours = combinedReports.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      const avgProgress = Math.round(combinedReports.reduce((sum, r) => sum + (r.progress || 0), 0) / combinedReports.length);
      const nowFormatted = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

      return `
        <h1 style="color: #e89b1a; font-size: 26pt; margin-bottom: 6px; text-align: center; font-weight: bold;">
          Consolidated Operations Report
        </h1>
        <p style="text-align: center; color: #64748b; font-size: 11pt; margin-bottom: 24px;">
          Generated: ${nowFormatted} &nbsp;|&nbsp;
          <strong>${combinedReports.length} Submitted Reports Consolidated</strong> &nbsp;|&nbsp;
          Avg Completion: <strong>${avgProgress}%</strong> &nbsp;|&nbsp;
          Total Hours: <strong>${totalHours} hrs</strong>
        </p>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 10pt;">
          <thead>
            <tr style="background-color: #0b1628; color: #ffffff;">
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left;">Contributor</th>
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left;">Report Title</th>
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Progress</th>
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Hours</th>
              <th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${combinedReports.map((r, i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; font-weight: bold;">${r.author?.firstName || ''} ${r.author?.lastName || ''}</td>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1;">${r.title}</td>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${r.progress}%</td>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${r.timeSpent ?? 0}h</td>
                <td style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: center;">${(r.status || 'SUBMITTED').replace(/_/g, ' ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <h2 style="color: #0f172a; font-size: 16pt; margin-top: 24px; border-bottom: 2px solid #e89b1a; padding-bottom: 4px;">
          1. Executive Summary & Team Overview
        </h2>
        <p style="font-size: 11pt; line-height: 1.6;">
          This consolidated report compiles contributions and operational updates from ${combinedReports.length} team reports. 
          Overall team progress stands at <strong>${avgProgress}%</strong> with a total of <strong>${totalHours} hours</strong> invested across the reporting period.
        </p>

        <h2 style="color: #0f172a; font-size: 16pt; margin-top: 28px; border-bottom: 2px solid #e89b1a; padding-bottom: 4px;">
          2. Combined Key Achievements
        </h2>
        <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
          ${combinedReports.filter(r => r.achievements).map(r => `
            <li><strong>${r.author?.firstName || 'Member'} ${r.author?.lastName || ''}:</strong> ${r.achievements}</li>
          `).join('') || '<li>All operational objectives progressing according to scheduled timelines.</li>'}
        </ul>

        <h2 style="color: #0f172a; font-size: 16pt; margin-top: 28px; border-bottom: 2px solid #e89b1a; padding-bottom: 4px;">
          3. Critical Blockers & Escalations
        </h2>
        <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
          ${combinedReports.filter(r => r.blockers).map(r => `
            <li><span style="color: #b91c1c; font-weight: bold;">[${r.author?.firstName || 'Member'} ${r.author?.lastName || ''}]:</span> ${r.blockers}</li>
          `).join('') || '<li>No major critical blockers reported at this stage.</li>'}
        </ul>

        <h2 style="color: #0f172a; font-size: 16pt; margin-top: 28px; border-bottom: 2px solid #e89b1a; padding-bottom: 4px;">
          4. Recommended Next Steps & Roadmap
        </h2>
        <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
          ${combinedReports.filter(r => r.nextSteps).map(r => `
            <li><strong>${r.author?.firstName || 'Member'}:</strong> ${r.nextSteps}</li>
          `).join('') || '<li>Continue scheduled monitoring and milestone deliverables.</li>'}
        </ul>

        <h2 style="color: #0f172a; font-size: 16pt; margin-top: 32px; border-bottom: 2px solid #e89b1a; padding-bottom: 4px;">
          5. Individual Member Reports
        </h2>
        ${combinedReports.map(r => `
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 18px; margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <h3 style="margin: 0; font-size: 13pt; color: #0b1628;">${r.author?.firstName || ''} ${r.author?.lastName || ''} — ${r.title}</h3>
              <span style="font-weight: bold; color: #e89b1a;">${r.progress}% Complete</span>
            </div>
            <p style="margin: 4px 0 8px 0; font-size: 10.5pt; color: #334155;"><strong>Summary:</strong> ${r.summary}</p>
            ${r.achievements ? `<p style="margin: 4px 0; font-size: 10pt; color: #15803d;"><strong>Achievements:</strong> ${r.achievements}</p>` : ''}
            ${r.blockers ? `<p style="margin: 4px 0; font-size: 10pt; color: #b91c1c;"><strong>Blockers:</strong> ${r.blockers}</p>` : ''}
          </div>
        `).join('')}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; font-size: 10pt; color: #64748b;">
          <div>
            <p><strong>Prepared By:</strong> ${user?.firstName || 'Team Lead'} ${user?.lastName || ''}</p>
            <p><strong>Role:</strong> ${(user?.role || 'TEAM_LEAD').replace(/_/g, ' ')}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Approved / Submitted Date:</strong> ${nowFormatted}</p>
            <p><strong>Status:</strong> Ready for Admin Review</p>
          </div>
        </div>
      `;
    }

    return `
      <h1 style="color: #e89b1a; font-size: 26pt; margin-bottom: 8px; text-align: center;">Operations Report Title</h1>
      <p style="text-align: center; color: #64748b; font-size: 11pt; margin-bottom: 24px;">
        Author: ${user?.firstName || ''} ${user?.lastName || ''} &nbsp;|&nbsp; Date: ${new Date().toLocaleDateString()}
      </p>
      <hr style="border: none; border-top: 2px solid #e2e8f0; margin: 16px 0;" />
      
      <h2 style="color: #0f172a; font-size: 16pt; margin-top: 20px;">1. Executive Summary</h2>
      <p style="font-size: 11pt; line-height: 1.6;">Type or paste your report summary here. You can format it just like in Microsoft Word using the ribbon toolbar above.</p>
      
      <h2 style="color: #15803d; font-size: 16pt; margin-top: 24px;">2. Key Achievements</h2>
      <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
        <li>Key milestone completed on schedule</li>
        <li>Operational efficiency improvement</li>
      </ul>

      <h2 style="color: #b91c1c; font-size: 16pt; margin-top: 24px;">3. Blockers & Challenges</h2>
      <p style="font-size: 11pt; line-height: 1.6;">Describe any impediments or write 'None' if operations are smooth.</p>

      <h2 style="color: #1d4ed8; font-size: 16pt; margin-top: 24px;">4. Next Steps</h2>
      <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
        <li>Priority deliverables for the upcoming period</li>
      </ul>
    `;
  };

  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = generateInitialHtml();
      updateStats();
    }
  }, []);

  const updateStats = () => {
    if (!editorRef.current) return;
    const text = editorRef.current.innerText || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const characters = text.length;
    const readingTime = Math.max(1, Math.ceil(words / 200));
    setStats({ words, characters, readingTime });
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      updateStats();
      checkActiveFormatting();
    }
  };

  const checkActiveFormatting = () => {
    setIsBold(document.queryCommandState('bold'));
    setIsItalic(document.queryCommandState('italic'));
    setIsUnderline(document.queryCommandState('underline'));
    setIsStrike(document.queryCommandState('strikeThrough'));
  };

  const insertHtmlAtCursor = (html: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHTML', false, html);
    updateStats();
  };

  const insertExecutiveSummaryBlock = () => {
    insertHtmlAtCursor(`
      <h2 style="color: #0f172a; font-size: 16pt; margin-top: 24px; border-bottom: 2px solid #e89b1a; padding-bottom: 4px;">
        Executive Summary
      </h2>
      <p style="font-size: 11pt; line-height: 1.6;">Enter executive summary overview here...</p>
    `);
  };

  const insertAchievementsBlock = () => {
    insertHtmlAtCursor(`
      <h2 style="color: #15803d; font-size: 16pt; margin-top: 24px; border-bottom: 2px solid #15803d; padding-bottom: 4px;">
        Key Achievements
      </h2>
      <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
        <li>Major achievement 1</li>
        <li>Major achievement 2</li>
      </ul>
    `);
  };

  const insertBlockersBlock = () => {
    insertHtmlAtCursor(`
      <div style="background-color: #fef2f2; border-left: 4px solid #b91c1c; padding: 12px 16px; margin: 18px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 6px 0; color: #b91c1c; font-size: 13pt;">Critical Blockers & Risks</h3>
        <p style="margin: 0; color: #7f1d1d; font-size: 10.5pt;">Detail any blockers or support requested from leadership...</p>
      </div>
    `);
  };

  const insertNextStepsBlock = () => {
    insertHtmlAtCursor(`
      <h2 style="color: #1d4ed8; font-size: 16pt; margin-top: 24px; border-bottom: 2px solid #1d4ed8; padding-bottom: 4px;">
        Action Items & Next Steps
      </h2>
      <ul style="font-size: 11pt; line-height: 1.6; margin-left: 20px;">
        <li>Action item 1 - Assigned to: Owner</li>
        <li>Action item 2 - Assigned to: Owner</li>
      </ul>
    `);
  };

  const insertTableBlock = (rows: number = 3, cols: number = 3) => {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 10.5pt;">';
    tableHtml += '<thead><tr style="background-color: #0b1628; color: #ffffff;">';
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th style="padding: 8px 12px; border: 1px solid #cbd5e1; text-align: left;">Header ${c + 1}</th>`;
    }
    tableHtml += '</tr></thead><tbody>';
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr style="background-color: ${r % 2 === 0 ? '#f8fafc' : '#ffffff'};">`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="padding: 8px 12px; border: 1px solid #cbd5e1;">Data cell ${r + 1},${c + 1}</td>`;
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</tbody></table>';
    insertHtmlAtCursor(tableHtml);
  };

  const insertSignOffBlock = () => {
    insertHtmlAtCursor(`
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10pt;">
        <div>
          <p style="margin: 0 0 4px 0;"><strong>Prepared By:</strong> ________________________</p>
          <p style="margin: 0; color: #64748b;">${user?.firstName || ''} ${user?.lastName || ''} (${user?.position || 'Operations'})</p>
        </div>
        <div style="text-align: right;">
          <p style="margin: 0 0 4px 0;"><strong>Approved By:</strong> ________________________</p>
          <p style="margin: 0; color: #64748b;">Operations Director / Commander</p>
        </div>
      </div>
    `);
  };

  // Multi-Format Export Handlers
  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      if (initialReport) {
        const blob = await submittedReportService.exportReportWord(initialReport.id);
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.docx`);
      } else if (combinedReports.length > 0) {
        const blob = await submittedReportService.exportCombinedWord({
          reportIds: combinedReports.map(r => r.id),
          title: docTitle,
          summary: editorRef.current?.innerText.slice(0, 500),
          notes: adminNote
        });
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.docx`);
      } else {
        const content = editorRef.current?.innerHTML || '';
        const wordHtml = `
          <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head><meta charset='utf-8'><title>${docTitle}</title>
          <style>
            @page { margin: 1in; size: letter; }
            body { font-family: 'Segoe UI', Calibri, Arial, sans-serif; font-size: 11pt; line-height: 1.6; color: #0f172a; max-width: 800px; margin: 0 auto; }
            h1 { color: #e89b1a; font-size: 24pt; text-align: center; margin-bottom: 8px; }
            h2 { color: #0b1628; font-size: 15pt; border-bottom: 2px solid #e89b1a; padding-bottom: 4px; margin-top: 24px; }
            h3 { color: #1e293b; font-size: 12pt; margin-top: 16px; }
            table { width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 10pt; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
            th { background-color: #0b1628; color: #ffffff; font-weight: bold; }
            tr:nth-child(even) td { background-color: #f8fafc; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-weight: bold; font-size: 9pt; }
            .header-banner { background-color: #0b1628; color: #ffffff; padding: 12px 20px; border-radius: 6px; margin-bottom: 24px; text-align: center; }
          </style>
          </head>
          <body>
            <div class="header-banner">
              <strong style="color: #e89b1a; font-size: 14pt;">TAXIME OPERATIONS MANAGEMENT</strong><br/>
              <span style="font-size: 9pt; color: #94a3b8;">CONFIDENTIAL OPERATIONAL RECORD</span>
            </div>
            ${content}
          </body>
          </html>
        `;
        const blob = new Blob(['\ufeff' + wordHtml], { type: 'application/msword' });
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.doc`);
      }
      success('Exported', 'Word document exported successfully!');
    } catch {
      error('Export Failed', 'Failed to generate Word document.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    try {
      if (initialReport) {
        const blob = await submittedReportService.exportReportPdf(initialReport.id);
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.pdf`);
        success('Exported', 'PDF document downloaded successfully!');
      } else if (combinedReports.length > 0) {
        const blob = await submittedReportService.exportCombinedPdf({
          reportIds: combinedReports.map(r => r.id),
          title: docTitle,
          summary: editorRef.current?.innerText.slice(0, 500),
          notes: adminNote
        });
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.pdf`);
        success('Exported', 'Consolidated PDF exported successfully!');
      } else {
        handlePrint();
      }
    } catch {
      error('Export Failed', 'Failed to export PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      if (initialReport) {
        const blob = await submittedReportService.exportReportExcel(initialReport.id);
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.xlsx`);
        success('Exported', 'Excel spreadsheet exported successfully!');
      } else if (combinedReports.length > 0) {
        const blob = await submittedReportService.exportCombinedExcel({
          reportIds: combinedReports.map(r => r.id),
          title: docTitle,
          summary: editorRef.current?.innerText.slice(0, 500),
          notes: adminNote
        });
        submittedReportService.downloadBlob(blob, `${docTitle.replace(/\s+/g, '_')}.xlsx`);
        success('Exported', 'Consolidated Excel workbook exported successfully!');
      } else {
        const rows = [
          ['TAXIME OPERATIONS MANAGEMENT SYSTEM - REPORT SUMMARY'],
          ['Document Title', docTitle],
          ['Generated Date', new Date().toLocaleString()],
          ['Author', `${user?.firstName || ''} ${user?.lastName || ''}`],
          ['Total Words', stats.words.toString()],
          ['Total Characters', stats.characters.toString()]
        ];
        const csvContent = rows.map(e => e.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(',')).join('\n');
        submittedReportService.downloadText(csvContent, `${docTitle.replace(/\s+/g, '_')}.csv`, 'text/csv');
        success('Exported', 'CSV summary exported successfully!');
      }
    } catch {
      error('Export Failed', 'Failed to export Excel/CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportHtml = () => {
    const content = editorRef.current?.innerHTML || '';
    const standaloneHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${docTitle}</title>
  <style>
    @media print { body { padding: 0; } }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      max-width: 860px;
      margin: 30px auto;
      padding: 30px 40px;
      color: #0f172a;
      line-height: 1.65;
      background-color: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border-radius: 8px;
    }
    .header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #e89b1a;
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    .brand-title { color: #e89b1a; font-size: 20pt; font-weight: 800; margin: 0; }
    .brand-sub { color: #64748b; font-size: 9pt; margin: 2px 0 0 0; }
    h1 { color: #0b1628; font-size: 22pt; margin-top: 10px; margin-bottom: 8px; }
    h2 { color: #0b1628; border-bottom: 2px solid #e89b1a; padding-bottom: 4px; font-size: 15pt; margin-top: 26px; }
    h3 { color: #1e293b; font-size: 12pt; margin-top: 18px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 10pt; }
    th, td { border: 1px solid #cbd5e1; padding: 10px 14px; text-align: left; }
    th { background: #0b1628; color: #ffffff; font-weight: 600; }
    tr:nth-child(even) td { background-color: #f8fafc; }
    ul, ol { padding-left: 24px; }
    li { margin-bottom: 6px; }
    .footer-bar {
      margin-top: 40px;
      padding-top: 14px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 9pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header-bar">
    <div>
      <h2 class="brand-title">TAXIME</h2>
      <p class="brand-sub">OPERATIONS MANAGEMENT SYSTEM</p>
    </div>
    <div style="text-align: right;">
      <span style="background: #0b1628; color: #e89b1a; padding: 4px 10px; border-radius: 4px; font-size: 8pt; font-weight: bold;">OFFICIAL RECORD</span>
      <p class="brand-sub">${new Date().toLocaleDateString()}</p>
    </div>
  </div>
  ${content}
  <div class="footer-bar">
    <span>Taxime Operations System • Confidential</span>
    <span>Generated: ${new Date().toLocaleString()}</span>
  </div>
</body>
</html>`;
    submittedReportService.downloadText(standaloneHtml, `${docTitle.replace(/\s+/g, '_')}.html`, 'text/html');
    success('Exported', 'HTML document exported successfully!');
  };

  const handleExportMarkdown = () => {
    const content = editorRef.current?.innerText || '';
    const md = `# ${docTitle}\n\n**Generated:** ${new Date().toLocaleDateString()} | **Author:** ${user?.firstName} ${user?.lastName} | **Taxime Operations System**\n\n---\n\n${content}\n\n---\n*Confidential Operational Record • Taxime System*`;
    submittedReportService.downloadText(md, `${docTitle.replace(/\s+/g, '_')}.md`, 'text/markdown');
    success('Exported', 'Markdown document exported successfully!');
  };

  const handleExportText = () => {
    const text = editorRef.current?.innerText || '';
    const formattedText = `=======================================================\nTAXIME OPERATIONS MANAGEMENT SYSTEM\nREPORT: ${docTitle.toUpperCase()}\nDate: ${new Date().toLocaleDateString()}\n=======================================================\n\n${text}\n\n=======================================================\nConfidential Operational Record\n=======================================================`;
    submittedReportService.downloadText(formattedText, `${docTitle.replace(/\s+/g, '_')}.txt`, 'text/plain');
    success('Exported', 'Plain text exported successfully!');
  };

  const handlePrint = () => {
    window.print();
  };

  // Save handler
  const handleSaveDocument = async (sendToAdmin: boolean = false) => {
    if (!editorRef.current) return;
    setIsSaving(true);
    try {
      const content = editorRef.current.innerHTML;

      if (onSave) {
        await onSave({ title: docTitle, content, sendToAdmin });
      } else if (combinedReports.length > 0) {
        await submittedReportService.combineReports({
          reportIds: combinedReports.map(r => r.id),
          title: docTitle,
          summary: editorRef.current.innerText.slice(0, 1000),
          reviewerComment: adminNote,
          sendToAdmin
        });
        success(
          sendToAdmin ? 'Submitted to Admin' : 'Saved Draft',
          sendToAdmin
            ? 'Consolidated report submitted to Admin successfully!'
            : 'Combined report saved to database.'
        );
      } else if (initialReport) {
        await submittedReportService.updateReport(initialReport.id, {
          title: docTitle,
          summary: editorRef.current.innerText.slice(0, 1000),
          reviewerComment: adminNote || initialReport.reviewerComment
        });
        success('Saved', 'Report updated successfully!');
      } else {
        await submittedReportService.createReport({
          title: docTitle,
          fromDate: new Date().toISOString(),
          toDate: new Date().toISOString(),
          summary: editorRef.current.innerText.slice(0, 1000),
          progress: 100
        });
        success('Created', 'New report saved successfully!');
      }

      setShowSendModal(false);
    } catch {
      error('Save Failed', 'Could not save the document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`flex flex-col bg-[#e5e7eb] dark:bg-[#0f172a] select-none ${isFullscreen ? 'fixed inset-0 z-50 overflow-hidden' : 'min-h-screen'}`}>
      
      {/* ── MS WORD TOP TITLE BAR ── */}
      <div className="bg-[#0b1628] text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-700 shrink-0">
        <div className="flex items-center space-x-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
          )}

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-[#e89b1a] flex items-center justify-center text-[#0b1628] font-black text-sm shadow-md">
              W
            </div>
            <div className="flex flex-col">
              <input
                type="text"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                disabled={readOnly}
                className="bg-transparent text-white font-bold text-sm tracking-tight border-b border-transparent hover:border-slate-500 focus:border-[#e89b1a] outline-none px-1 py-0.5 rounded transition-colors w-64 md:w-96"
                placeholder="Enter report title..."
              />
              <span className="text-[10px] text-slate-400 px-1">Taxime Word Processor &bull; Auto-saved</span>
            </div>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center space-x-2">
          {isTeamLead && (
            <button
              onClick={() => setShowSendModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#e89b1a] hover:bg-[#d48c15] text-[#0b1628] font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <Send size={14} />
              <span>Send to Admin</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => handleSaveDocument(false)}
              disabled={isSaving}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Approve & Save</span>
            </button>
          )}

          <button
            onClick={() => handleSaveDocument(false)}
            disabled={isSaving}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-all active:scale-95 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* ── MS WORD RIBBON TABS ── */}
      <div className="bg-[#f8fafc] dark:bg-[#1e293b] border-b border-slate-300 dark:border-slate-700 shrink-0">
        <div className="flex items-center space-x-1 px-4 pt-1">
          <button
            onClick={() => setActiveTab('home')}
            className={`px-4 py-1.5 text-xs font-bold rounded-t-md transition-colors border-t-2 cursor-pointer ${
              activeTab === 'home'
                ? 'bg-white dark:bg-[#0f172a] text-[#e89b1a] border-[#e89b1a]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('insert')}
            className={`px-4 py-1.5 text-xs font-bold rounded-t-md transition-colors border-t-2 cursor-pointer ${
              activeTab === 'insert'
                ? 'bg-white dark:bg-[#0f172a] text-[#e89b1a] border-[#e89b1a]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
            }`}
          >
            Insert
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`px-4 py-1.5 text-xs font-bold rounded-t-md transition-colors border-t-2 cursor-pointer ${
              activeTab === 'layout'
                ? 'bg-white dark:bg-[#0f172a] text-[#e89b1a] border-[#e89b1a]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
            }`}
          >
            Page Layout
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`px-4 py-1.5 text-xs font-bold rounded-t-md transition-colors border-t-2 cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white dark:bg-[#0f172a] text-[#e89b1a] border-[#e89b1a]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 border-transparent'
            }`}
          >
            Export & Send
          </button>
        </div>

        {/* ── RIBBON TOOLBAR CONTENT ── */}
        <div className="bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-700 px-4 py-2 flex flex-wrap items-center gap-3 shadow-xs">
          
          {/* TAB 1: HOME */}
          {activeTab === 'home' && (
            <>
              {/* Undo / Redo */}
              <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                <button onClick={() => execCommand('undo')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Undo (Ctrl+Z)">
                  <RotateCcw size={15} />
                </button>
                <button onClick={() => execCommand('redo')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Redo (Ctrl+Y)">
                  <RotateCw size={15} />
                </button>
              </div>

              {/* Font Family & Size */}
              <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                <select
                  value={currentFont}
                  onChange={(e) => {
                    setCurrentFont(e.target.value);
                    execCommand('fontName', e.target.value);
                  }}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
                >
                  {FONT_FAMILIES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>

                <select
                  value={currentSize}
                  onChange={(e) => {
                    setCurrentSize(e.target.value);
                    execCommand('fontSize', e.target.value);
                  }}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-800 dark:text-slate-200 outline-none w-20 cursor-pointer"
                >
                  {FONT_SIZES.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Text Styling (B, I, U, S) */}
              <div className="flex items-center space-x-0.5 border-r border-slate-200 dark:border-slate-700 pr-2">
                <button
                  onClick={() => execCommand('bold')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${isBold ? 'bg-[#e89b1a]/20 text-[#e89b1a] font-bold' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Bold (Ctrl+B)"
                >
                  <Bold size={15} />
                </button>
                <button
                  onClick={() => execCommand('italic')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${isItalic ? 'bg-[#e89b1a]/20 text-[#e89b1a] italic' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Italic (Ctrl+I)"
                >
                  <Italic size={15} />
                </button>
                <button
                  onClick={() => execCommand('underline')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${isUnderline ? 'bg-[#e89b1a]/20 text-[#e89b1a] underline' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Underline (Ctrl+U)"
                >
                  <Underline size={15} />
                </button>
                <button
                  onClick={() => execCommand('strikeThrough')}
                  className={`p-1.5 rounded transition-colors cursor-pointer ${isStrike ? 'bg-[#e89b1a]/20 text-[#e89b1a] line-through' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
                  title="Strikethrough"
                >
                  <Strikethrough size={15} />
                </button>
              </div>

              {/* Color & Highlight */}
              <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-700 pr-2">
                <div className="flex items-center space-x-0.5" title="Font Color">
                  <Palette size={14} className="text-slate-500 mr-1" />
                  {TEXT_COLORS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => {
                        setTextColor(c.value);
                        execCommand('foreColor', c.value);
                      }}
                      className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform cursor-pointer"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    />
                  ))}
                </div>

                <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1" />

                <div className="flex items-center space-x-0.5" title="Text Highlight Color">
                  <Highlighter size={14} className="text-slate-500 mr-1" />
                  {HIGHLIGHT_COLORS.map(h => (
                    <button
                      key={h.value}
                      onClick={() => {
                        setHighlightColor(h.value);
                        execCommand('hiliteColor', h.value);
                      }}
                      className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 hover:scale-110 transition-transform flex items-center justify-center text-[8px] cursor-pointer"
                      style={{ backgroundColor: h.value === 'transparent' ? '#ffffff' : h.value }}
                      title={h.name}
                    >
                      {h.value === 'transparent' && '×'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alignment */}
              <div className="flex items-center space-x-0.5 border-r border-slate-200 dark:border-slate-700 pr-2">
                <button onClick={() => execCommand('justifyLeft')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Align Left">
                  <AlignLeft size={15} />
                </button>
                <button onClick={() => execCommand('justifyCenter')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Align Center">
                  <AlignCenter size={15} />
                </button>
                <button onClick={() => execCommand('justifyRight')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Align Right">
                  <AlignRight size={15} />
                </button>
                <button onClick={() => execCommand('justifyFull')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Justify">
                  <AlignJustify size={15} />
                </button>
              </div>

              {/* Lists */}
              <div className="flex items-center space-x-0.5 border-r border-slate-200 dark:border-slate-700 pr-2">
                <button onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Bullet List">
                  <List size={15} />
                </button>
                <button onClick={() => execCommand('insertOrderedList')} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer" title="Numbered List">
                  <ListOrdered size={15} />
                </button>
              </div>

              {/* Heading Styles */}
              <div className="flex items-center space-x-1">
                <button onClick={() => execCommand('formatBlock', '<h1>')} className="px-2 py-1 text-xs font-black rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-[#e89b1a] cursor-pointer" title="Heading 1">
                  H1
                </button>
                <button onClick={() => execCommand('formatBlock', '<h2>')} className="px-2 py-1 text-xs font-bold rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer" title="Heading 2">
                  H2
                </button>
                <button onClick={() => execCommand('formatBlock', '<h3>')} className="px-2 py-1 text-xs font-semibold rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 cursor-pointer" title="Heading 3">
                  H3
                </button>
                <button onClick={() => execCommand('formatBlock', '<p>')} className="px-2 py-1 text-xs rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-pointer" title="Normal Text">
                  Body
                </button>
              </div>
            </>
          )}

          {/* TAB 2: INSERT */}
          {activeTab === 'insert' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => insertTableBlock(3, 4)}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <TableIcon size={14} className="text-[#e89b1a]" />
                <span>Insert Table (3x4)</span>
              </button>

              <button
                onClick={insertExecutiveSummaryBlock}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                <Sparkles size={14} className="text-amber-500" />
                <span>Summary Block</span>
              </button>

              <button
                onClick={insertAchievementsBlock}
                className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 rounded text-xs font-medium cursor-pointer"
              >
                <CheckCircle2 size={14} />
                <span>Achievements Section</span>
              </button>

              <button
                onClick={insertBlockersBlock}
                className="flex items-center space-x-1.5 px-3 py-1 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-700 dark:text-red-300 rounded text-xs font-medium cursor-pointer"
              >
                <ShieldAlert size={14} />
                <span>Blockers Callout</span>
              </button>

              <button
                onClick={insertNextStepsBlock}
                className="flex items-center space-x-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 rounded text-xs font-medium cursor-pointer"
              >
                <CheckSquare size={14} />
                <span>Action Items</span>
              </button>

              <button
                onClick={insertSignOffBlock}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium cursor-pointer"
              >
                <Layers size={14} />
                <span>Sign-off / Signatures</span>
              </button>

              <button
                onClick={() => execCommand('insertHorizontalRule')}
                className="flex items-center space-x-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded text-xs font-medium cursor-pointer"
              >
                <Minus size={14} />
                <span>Horizontal Divider</span>
              </button>
            </div>
          )}

          {/* TAB 3: PAGE LAYOUT */}
          {activeTab === 'layout' && (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold">Paper Size:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(e.target.value as 'a4' | 'letter')}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 cursor-pointer"
                >
                  <option value="a4">A4 (210mm &times; 297mm)</option>
                  <option value="letter">US Letter (8.5" &times; 11")</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-500 font-semibold">Margins:</span>
                <select
                  value={pageMargins}
                  onChange={(e) => setPageMargins(e.target.value as any)}
                  className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 cursor-pointer"
                >
                  <option value="normal">Normal (1 inch / 48px)</option>
                  <option value="narrow">Narrow (0.5 inch / 24px)</option>
                  <option value="wide">Wide (1.5 inch / 72px)</option>
                </select>
              </div>

              <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-700 pl-3">
                <span className="text-xs text-slate-500 font-semibold">Zoom Canvas:</span>
                <button
                  onClick={() => setZoom(Math.max(60, zoom - 10))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-xs font-mono font-bold w-12 text-center">{zoom}%</span>
                <button
                  onClick={() => setZoom(Math.min(160, zoom + 10))}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button
                  onClick={() => setZoom(100)}
                  className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                >
                  Reset 100%
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: EXPORT & SEND */}
          {activeTab === 'export' && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportWord}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <FileText size={14} />
                <span>Export Word (.docx)</span>
              </button>

              <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>Export PDF (.pdf)</span>
              </button>

              <button
                onClick={handleExportExcel}
                disabled={isExporting}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Download size={14} />
                <span>Export Excel / CSV</span>
              </button>

              <button
                onClick={handleExportHtml}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export HTML</span>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Export Markdown (.md)</span>
              </button>

              <button
                onClick={handleExportText}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-xs font-medium transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>Plain Text (.txt)</span>
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-md text-xs font-medium transition-all cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>
            </div>
          )}

        </div>
      </div>

      {/* ── MS WORD PAPER CANVAS AREA ── */}
      <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center items-start">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out'
          }}
          className="my-2"
        >
          {/* Authentic White Paper Page */}
          <div
            className={`bg-white text-slate-900 shadow-2xl border border-slate-300 relative transition-all rounded-xs ${
              pageSize === 'a4'
                ? 'w-[794px] min-h-[1123px]'
                : 'w-[816px] min-h-[1056px]'
            } ${
              pageMargins === 'narrow'
                ? 'p-6 md:p-8'
                : pageMargins === 'wide'
                ? 'p-12 md:p-16'
                : 'p-8 md:p-12'
            }`}
          >
            {/* Printable Word Header */}
            <div className="border-b border-[#e89b1a]/40 pb-2 mb-8 flex items-center justify-between text-xs text-slate-400 font-sans tracking-wide">
              <div className="flex items-center space-x-2">
                <span className="font-bold text-[#e89b1a] tracking-wider uppercase">TAXIME OPERATIONS</span>
                <span>&bull;</span>
                <span>OFFICIAL MANAGEMENT REPORT</span>
              </div>
              <div>CONFIDENTIAL &bull; FOR INTERNAL USE</div>
            </div>

            {/* The Document Editable Core */}
            <div
              ref={editorRef}
              contentEditable={!readOnly}
              onInput={updateStats}
              onKeyUp={checkActiveFormatting}
              onMouseUp={checkActiveFormatting}
              className="outline-none min-h-[850px] font-sans leading-relaxed text-[11pt] text-slate-800 selection:bg-[#e89b1a]/30"
              style={{
                fontFamily: currentFont,
                wordBreak: 'break-word'
              }}
              spellCheck={true}
            />

            {/* Printable Word Footer */}
            <div className="border-t border-slate-200 mt-12 pt-3 flex items-center justify-between text-[10px] text-slate-400 font-sans">
              <div>Taxime Operations Management System &bull; Confidential</div>
              <div className="font-semibold text-slate-500">Page 1 of 1</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MS WORD STATUS BAR ── */}
      <div className="bg-[#0b1628] text-slate-400 px-4 py-1.5 text-xs flex items-center justify-between border-t border-slate-700 shrink-0 font-sans">
        <div className="flex items-center space-x-4">
          <span>Page 1 of 1</span>
          <span>{stats.words.toLocaleString()} words</span>
          <span>{stats.characters.toLocaleString()} characters</span>
          <span className="hidden sm:inline">&bull; {stats.readingTime} min read</span>
          {combinedReports.length > 0 && (
            <span className="text-[#e89b1a] font-bold">
              {combinedReports.length} reports merged
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px]">Zoom:</span>
            <input
              type="range"
              min="60"
              max="150"
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-20 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#e89b1a]"
            />
            <span className="w-8 text-right font-mono text-[11px]">{zoom}%</span>
          </div>

          <div className="flex items-center space-x-1 border-l border-slate-700 pl-2">
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {pageSize.toUpperCase()} &bull; {pageMargins}
            </span>
          </div>
        </div>
      </div>

      {/* ── MODAL: SUBMIT CONSOLIDATED REPORT TO ADMIN ── */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#e89b1a]/20 text-[#e89b1a] flex items-center justify-center">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Send Consolidated Report to Admin
                </h3>
                <p className="text-xs text-slate-500">
                  Submit this team report directly to the Operations Director / Admin queue.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Report Title
                </label>
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-slate-900 dark:text-white outline-none focus:border-[#e89b1a]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">
                  Team Lead Notes / Transmittal Message (Optional)
                </label>
                <textarea
                  rows={3}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="e.g. Please find our team's consolidated weekly report for dispatch and fleet operations. All major deliverables completed on schedule..."
                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white outline-none focus:border-[#e89b1a]"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start space-x-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>
                  Once submitted, this consolidated report will appear in the Admin Review dashboard with status <strong>SUBMITTED</strong> and real-time notification will be dispatched to Admin.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowSendModal(false)}
                className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveDocument(true)}
                disabled={isSaving}
                className="flex items-center space-x-2 px-5 py-2 bg-[#e89b1a] hover:bg-[#d48c15] text-[#0b1628] font-bold text-sm rounded-xl shadow-lg transition-all active:scale-95 cursor-pointer"
              >
                <Send size={16} />
                <span>{isSaving ? 'Submitting...' : 'Confirm & Submit to Admin'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default WordReportEditor;
