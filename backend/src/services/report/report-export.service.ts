import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  Header, Footer, PageNumber,
} from 'docx';

// ── Brand colours ────────────────────────────────────────────────────────────
const GOLD        = 'E89B1A';
const DARK        = '0B1628';
const SLATE_DARK  = '1E293B';
const GRAY        = '64748B';
const LIGHT_GRAY  = 'E2E8F0';
const LIGHT       = 'F8FAFC';
const WHITE       = 'FFFFFF';
const GREEN       = '16A34A';
const RED         = 'DC2626';
const BLUE        = '2563EB';
const AMBER       = 'D97706';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Convert camelCase / UPPER_SNAKE to "Title Case" */
function label(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^./, (s) => s.toUpperCase());
}

/** Format any raw value into a readable string */
function fmt(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'object') {
    if (Array.isArray(value)) {
      return (value as unknown[]).map((v) => fmt(v)).join(', ') || '—';
    }
    if ((value as any).name) return String((value as any).name);
    if ((value as any).firstName) return `${(value as any).firstName} ${(value as any).lastName || ''}`.trim();
    return Object.entries(value as object)
      .filter(([, v]) => typeof v !== 'object')
      .map(([k, v]) => `${label(k)}: ${v}`)
      .join(' | ') || '—';
  }
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  if (/^[A-Z_]{3,}$/.test(str)) return str.replace(/_/g, ' ');
  return str;
}

const SKIP_KEYS = new Set(['id', 'type', 'password', 'avatar', 'templateId', 'creatorId', 'departmentId', 'teamId', 'userId', 'taskId', 'authorId', 'assignerId']);

function cleanRow(row: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(row)) {
    if (SKIP_KEYS.has(k)) continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v) && !(v as any).name && !(v as any).firstName) continue;
    out[label(k)] = fmt(v);
  }
  return out;
}

// ════════════════════════════════════════════════════════════════════════════
// REPORT EXPORT SERVICE
// ════════════════════════════════════════════════════════════════════════════
export class ReportExportService {

  // ──────────────────────────────────────────────────────────────────────────
  // 1. SINGLE SUBMITTED REPORT — PDF (EXECUTIVE STRUCTURED)
  // ──────────────────────────────────────────────────────────────────────────
  async exportSubmittedReportToPDF(report: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = doc.page.width - 80; // 515.28 pt content width
      const startX = 40;

      // ── Header Banner ──
      doc.rect(0, 0, doc.page.width, 68).fill('#0B1628');
      doc.fillColor('#E89B1A').fontSize(22).font('Helvetica-Bold').text('TAXIME', startX, 16);
      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text('OPERATIONS & TASK MANAGEMENT SYSTEM', startX, 42);
      
      doc.fillColor('#E89B1A').fontSize(11).font('Helvetica-Bold').text('OFFICIAL REPORT', doc.page.width - 200, 20, { align: 'right', width: 160 });
      doc.fillColor('#64748B').fontSize(8).font('Helvetica').text('CONFIDENTIAL • INTERNAL USE', doc.page.width - 200, 38, { align: 'right', width: 160 });
      
      doc.rect(0, 68, doc.page.width, 3).fill('#E89B1A');

      // ── Title & Status ──
      doc.y = 86;
      const titleY = doc.y;
      doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold')
        .text(report.title || 'Operational Report', startX, titleY, { width: pageW - 120 });

      // Status Badge
      const status = (report.status || 'DRAFT').toUpperCase();
      let badgeBg = '#F1F5F9';
      let badgeTextColor = '#475569';
      if (status === 'APPROVED') { badgeBg = '#DCFCE7'; badgeTextColor = '#15803D'; }
      else if (status === 'SUBMITTED') { badgeBg = '#DBEAFE'; badgeTextColor = '#1D4ED8'; }
      else if (status === 'UNDER_REVIEW') { badgeBg = '#FEF3C7'; badgeTextColor = '#B45309'; }
      else if (status === 'REVISION_NEEDED') { badgeBg = '#FFEDD5'; badgeTextColor = '#C2410C'; }
      else if (status === 'REJECTED') { badgeBg = '#FFE4E6'; badgeTextColor = '#BE123C'; }

      const badgeW = 100;
      const badgeH = 22;
      const badgeX = doc.page.width - 40 - badgeW;
      doc.roundedRect(badgeX, titleY + 2, badgeW, badgeH, 4).fill(badgeBg);
      doc.fillColor(badgeTextColor).fontSize(9).font('Helvetica-Bold')
        .text(status.replace(/_/g, ' '), badgeX, titleY + 7, { width: badgeW, align: 'center' });

      // Subtitle info
      const authorName = `${report.author?.firstName || ''} ${report.author?.lastName || ''}`.trim() || 'Team Member';
      doc.y = Math.max(doc.y + 4, titleY + 36);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica')
        .text(`Author: ${authorName} (${report.author?.email || 'N/A'})  •  Type: ${(report.reportType || 'TASK_REPORT').replace(/_/g, ' ')}  •  Period: ${(report.period || 'CUSTOM').replace(/_/g, ' ')}`);

      doc.moveDown(0.8);

      // ── Metadata Card Box ──
      const metaBoxY = doc.y;
      const metaBoxH = 68;
      doc.roundedRect(startX, metaBoxY, pageW, metaBoxH, 6).fillAndStroke('#F8FAFC', '#E2E8F0');

      const colW = pageW / 4;
      // Col 1: Dates
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('REPORTING PERIOD', startX + 12, metaBoxY + 12);
      const fromStr = report.fromDate ? new Date(report.fromDate).toLocaleDateString() : '—';
      const toStr = report.toDate ? new Date(report.toDate).toLocaleDateString() : '—';
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica').text(`${fromStr} to ${toStr}`, startX + 12, metaBoxY + 26, { width: colW - 16 });

      // Col 2: Hours
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('TIME LOGGED', startX + colW + 12, metaBoxY + 12);
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text(`${report.timeSpent ?? 0} hrs`, startX + colW + 12, metaBoxY + 25);

      // Col 3: Progress
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('COMPLETION PROGRESS', startX + colW * 2 + 12, metaBoxY + 12);
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text(`${report.progress ?? 0}%`, startX + colW * 2 + 12, metaBoxY + 25);
      // Progress Bar
      const pBarX = startX + colW * 2 + 12;
      const pBarY = metaBoxY + 44;
      const pBarW = colW - 24;
      doc.roundedRect(pBarX, pBarY, pBarW, 6, 3).fill('#E2E8F0');
      const progFillW = Math.max(2, Math.min(pBarW, (pBarW * (report.progress || 0)) / 100));
      doc.roundedRect(pBarX, pBarY, progFillW, 6, 3).fill('#16A34A');

      // Col 4: Linked Task
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('ASSOCIATED TASK', startX + colW * 3 + 12, metaBoxY + 12);
      doc.fillColor('#0F172A').fontSize(9).font('Helvetica').text(report.task?.title || 'None / General', startX + colW * 3 + 12, metaBoxY + 26, { width: colW - 20, ellipsis: true });

      doc.y = metaBoxY + metaBoxH + 18;

      // ── Structured Content Sections ──
      const renderSection = (title: string, content: string | undefined, accentColor: string, bgColor: string, iconSymbol: string) => {
        if (!content || !content.trim()) return;

        // Estimate height
        doc.fontSize(9.5).font('Helvetica');
        const textHeight = doc.heightOfString(content, { width: pageW - 36, lineGap: 3 });
        const sectionH = textHeight + 42;

        if (doc.y + sectionH > doc.page.height - 60) {
          doc.addPage();
          doc.y = 40;
        }

        const secY = doc.y;
        doc.roundedRect(startX, secY, pageW, sectionH, 6).fillAndStroke(bgColor, '#E2E8F0');
        // Left accent stripe
        doc.roundedRect(startX, secY, 4, sectionH, 2).fill(accentColor);

        // Header inside card
        doc.fillColor(accentColor).fontSize(10).font('Helvetica-Bold')
          .text(`${iconSymbol}  ${title.toUpperCase()}`, startX + 16, secY + 10);

        // Body text
        doc.fillColor('#1E293B').fontSize(9.5).font('Helvetica')
          .text(content, startX + 16, secY + 28, { width: pageW - 32, lineGap: 3 });

        doc.y = secY + sectionH + 12;
      };

      renderSection('Executive Summary', report.summary, '#E89B1A', '#FFFDF9', '▪');
      renderSection('Key Achievements & Milestones', report.achievements, '#16A34A', '#F0FDF4', '✔');
      renderSection('Critical Blockers & Challenges', report.blockers, '#DC2626', '#FFF1F2', '⚠');
      renderSection('Recommended Next Steps & Action Items', report.nextSteps, '#2563EB', '#EFF6FF', '➔');
      renderSection('Reviewer Evaluation & Feedback', report.reviewerComment, '#D97706', '#FFFBEB', '✎');

      // ── Sign-off Block ──
      if (doc.y + 70 > doc.page.height - 60) {
        doc.addPage();
        doc.y = 40;
      }

      const signY = doc.y + 8;
      const boxW = (pageW - 20) / 2;

      // Author Signature Box
      doc.roundedRect(startX, signY, boxW, 58, 4).stroke('#E2E8F0');
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('SUBMITTED BY', startX + 10, signY + 8);
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text(authorName, startX + 10, signY + 20);
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`Date: ${new Date(report.createdAt || Date.now()).toLocaleDateString()}`, startX + 10, signY + 38);

      // Reviewer Signature Box
      doc.roundedRect(startX + boxW + 20, signY, boxW, 58, 4).stroke('#E2E8F0');
      doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text('REVIEWED / APPROVED BY', startX + boxW + 30, signY + 8);
      const reviewerName = report.assigner ? `${report.assigner.firstName} ${report.assigner.lastName}` : (report.reviewerComment ? 'Authorized Reviewer' : 'Pending Review');
      doc.fillColor('#0F172A').fontSize(10).font('Helvetica-Bold').text(reviewerName, startX + boxW + 30, signY + 20);
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica').text(`Status: ${status.replace(/_/g, ' ')}`, startX + boxW + 30, signY + 38);

      // ── Page numbering and footers ──
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        // Footer line
        const fY = doc.page.height - 30;
        doc.moveTo(startX, fY - 6).lineTo(doc.page.width - startX, fY - 6).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
        doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
          .text(`Taxime Operations System • Official Confidential Report • Page ${i + 1} of ${range.count}`,
                startX, fY, { align: 'center', width: pageW });
      }

      doc.end();
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. SINGLE SUBMITTED REPORT — EXCEL (ORGANIZED CORPORATE SHEET)
  // ──────────────────────────────────────────────────────────────────────────
  async exportSubmittedReportToExcel(report: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Taxime Operations';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Report Overview', {
      views: [{ showGridLines: true }]
    });

    // Column sizing
    sheet.columns = [
      { key: 'colA', width: 22 },
      { key: 'colB', width: 26 },
      { key: 'colC', width: 20 },
      { key: 'colD', width: 26 },
      { key: 'colE', width: 18 },
      { key: 'colF', width: 24 }
    ];

    // ── Row 1 & 2: Brand Banner ──
    sheet.mergeCells('A1:F2');
    const headerCell = sheet.getCell('A1');
    headerCell.value = 'TAXIME OPERATIONS MANAGEMENT SYSTEM';
    headerCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF' + GOLD } };
    headerCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK } };
    headerCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Subtitle Row
    sheet.mergeCells('A3:F3');
    const subCell = sheet.getCell('A3');
    subCell.value = `Official Report Export  |  Generated: ${new Date().toLocaleString()}  |  ID: ${report.id}`;
    subCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF' + GRAY } };
    subCell.alignment = { horizontal: 'center' };

    sheet.addRow([]); // Blank spacer

    // ── Metadata Table Block ──
    const addMetaRow = (label1: string, val1: string, label2: string, val2: string, label3: string, val3: string) => {
      const row = sheet.addRow([label1, val1, label2, val2, label3, val3]);
      row.height = 22;
      [1, 3, 5].forEach(colIdx => {
        const c = row.getCell(colIdx);
        c.font = { bold: true, size: 10, color: { argb: 'FF' + DARK } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } };
        c.alignment = { vertical: 'middle' };
      });
      [2, 4, 6].forEach(colIdx => {
        const c = row.getCell(colIdx);
        c.font = { size: 10, color: { argb: 'FF' + DARK } };
        c.alignment = { vertical: 'middle' };
      });
      return row;
    };

    const authorName = `${report.author?.firstName || ''} ${report.author?.lastName || ''}`.trim() || 'Team Member';
    const statusText = (report.status || 'DRAFT').replace(/_/g, ' ');

    addMetaRow('Report Title', report.title || 'Untitled', 'Status', statusText, 'Report Type', (report.reportType || 'TASK').replace(/_/g, ' '));
    addMetaRow('Author', authorName, 'Email', report.author?.email || '—', 'Period', (report.period || 'CUSTOM').replace(/_/g, ' '));
    addMetaRow(
      'Progress', `${report.progress ?? 0}%`,
      'Hours Logged', `${report.timeSpent ?? 0} hrs`,
      'Associated Task', report.task?.title || 'None'
    );
    addMetaRow(
      'From Date', report.fromDate ? new Date(report.fromDate).toLocaleDateString() : '—',
      'To Date', report.toDate ? new Date(report.toDate).toLocaleDateString() : '—',
      'Submitted At', report.createdAt ? new Date(report.createdAt).toLocaleDateString() : '—'
    );

    sheet.addRow([]); // Blank spacer

    // ── Content Sections Function ──
    const addSection = (title: string, content: string | undefined, headerArgb: string) => {
      if (!content || !content.trim()) return;

      // Section Header Row
      const hRow = sheet.addRow([title, '', '', '', '', '']);
      sheet.mergeCells(`A${hRow.number}:F${hRow.number}`);
      const hCell = sheet.getCell(`A${hRow.number}`);
      hCell.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      hCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerArgb } };
      hCell.alignment = { vertical: 'middle', indent: 1 };
      hRow.height = 24;

      // Section Content Row
      const cRow = sheet.addRow([content, '', '', '', '', '']);
      sheet.mergeCells(`A${cRow.number}:F${cRow.number}`);
      const cCell = sheet.getCell(`A${cRow.number}`);
      cCell.font = { size: 10, color: { argb: 'FF1E293B' } };
      cCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      cCell.alignment = { vertical: 'top', wrapText: true, indent: 1 };

      // Set height based on content length
      const lines = Math.max(3, Math.ceil(content.length / 90));
      cRow.height = Math.min(180, lines * 18);

      sheet.addRow([]); // Spacer
    };

    addSection('1. EXECUTIVE SUMMARY', report.summary, 'FF0B1628');
    addSection('2. KEY ACHIEVEMENTS & MILESTONES', report.achievements, 'FF15803D');
    addSection('3. CRITICAL BLOCKERS & RISKS', report.blockers, 'FFB91C1C');
    addSection('4. RECOMMENDED NEXT STEPS & ACTION ITEMS', report.nextSteps, 'FF1D4ED8');
    addSection('5. REVIEWER NOTES & FEEDBACK', report.reviewerComment, 'FFD97706');

    // Add borders to used cells
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber > 3) {
        row.eachCell((cell) => {
          if (!cell.border) {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
              right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
            };
          }
        });
      }
    });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. COMBINED REPORTS — PDF (EXECUTIVE CONSOLIDATED)
  // ──────────────────────────────────────────────────────────────────────────
  async exportCombinedReportsToPDF(title: string, reports: any[], summary?: string, notes?: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const pageW = doc.page.width - 80;
      const startX = 40;

      // ── Header Banner ──
      doc.rect(0, 0, doc.page.width, 68).fill('#0B1628');
      doc.fillColor('#E89B1A').fontSize(22).font('Helvetica-Bold').text('TAXIME', startX, 16);
      doc.fillColor('#94A3B8').fontSize(9).font('Helvetica').text('OPERATIONS & TASK MANAGEMENT SYSTEM', startX, 42);

      doc.fillColor('#E89B1A').fontSize(11).font('Helvetica-Bold').text('CONSOLIDATED REPORT', doc.page.width - 240, 20, { align: 'right', width: 200 });
      doc.fillColor('#64748B').fontSize(8).font('Helvetica').text('MULTI-MEMBER OPERATIONS SUMMARY', doc.page.width - 240, 38, { align: 'right', width: 200 });

      doc.rect(0, 68, doc.page.width, 3).fill('#E89B1A');

      // Title
      doc.y = 86;
      doc.fillColor('#0F172A').fontSize(18).font('Helvetica-Bold').text(title || 'Consolidated Operations Report', startX, doc.y);
      
      const totalHours = reports.reduce((sum, r) => sum + (r.timeSpent || 0), 0);
      const avgProgress = reports.length > 0 ? Math.round(reports.reduce((sum, r) => sum + (r.progress || 0), 0) / reports.length) : 0;
      const approvedCount = reports.filter(r => r.status === 'APPROVED').length;

      doc.moveDown(0.3);
      doc.fillColor('#64748B').fontSize(9).font('Helvetica')
        .text(`Compiled on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}  •  ${reports.length} Reports Included  •  Confidential Operations Record`);

      doc.moveDown(0.8);

      // ── KPI Summary Cards (4 Cards across) ──
      const kpiY = doc.y;
      const cardW = (pageW - 30) / 4;
      const cardH = 50;

      const drawKpi = (idx: number, label: string, val: string, color: string) => {
        const x = startX + idx * (cardW + 10);
        doc.roundedRect(x, kpiY, cardW, cardH, 5).fillAndStroke('#F8FAFC', '#E2E8F0');
        doc.fillColor('#64748B').fontSize(8).font('Helvetica-Bold').text(label, x + 10, kpiY + 10, { width: cardW - 20 });
        doc.fillColor(color).fontSize(14).font('Helvetica-Bold').text(val, x + 10, kpiY + 24, { width: cardW - 20 });
      };

      drawKpi(0, 'TOTAL REPORTS', `${reports.length}`, '#0F172A');
      drawKpi(1, 'TOTAL HOURS', `${totalHours} hrs`, '#0F172A');
      drawKpi(2, 'AVG COMPLETION', `${avgProgress}%`, '#16A34A');
      drawKpi(3, 'APPROVED', `${approvedCount} / ${reports.length}`, '#2563EB');

      doc.y = kpiY + cardH + 16;

      // ── Executive Summary ──
      if (summary && summary.trim()) {
        const sumH = doc.heightOfString(summary, { width: pageW - 24, lineGap: 3 }) + 36;
        doc.roundedRect(startX, doc.y, pageW, sumH, 5).fillAndStroke('#FFFDF9', '#E89B1A');
        doc.fillColor('#E89B1A').fontSize(10).font('Helvetica-Bold').text('EXECUTIVE OVERVIEW', startX + 12, doc.y + 10);
        doc.fillColor('#1E293B').fontSize(9.5).font('Helvetica').text(summary, startX + 12, doc.y + 26, { width: pageW - 24, lineGap: 3 });
        doc.y += sumH + 16;
      }

      // ── Contributor Table ──
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('Team Contributions Overview', startX, doc.y);
      doc.moveDown(0.4);

      const tHeaderY = doc.y;
      const colWidths = [120, 165, 70, 70, 90];
      doc.rect(startX, tHeaderY, pageW, 20).fill('#0B1628');

      const headers = ['Contributor', 'Report Title', 'Progress', 'Hours', 'Status'];
      let curX = startX;
      headers.forEach((h, i) => {
        doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold').text(h, curX + 6, tHeaderY + 6, { width: colWidths[i] - 12 });
        curX += colWidths[i];
      });

      doc.y = tHeaderY + 20;

      reports.forEach((r, idx) => {
        const rowH = 18;
        if (doc.y + rowH > doc.page.height - 60) {
          doc.addPage();
          doc.y = 40;
        }
        const rY = doc.y;
        doc.rect(startX, rY, pageW, rowH).fill(idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF');

        curX = startX;
        const author = `${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'Member';
        
        doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica-Bold').text(author, curX + 6, rY + 5, { width: colWidths[0] - 12, ellipsis: true });
        curX += colWidths[0];
        doc.fillColor('#334155').fontSize(8.5).font('Helvetica').text(r.title || 'Untitled', curX + 6, rY + 5, { width: colWidths[1] - 12, ellipsis: true });
        curX += colWidths[1];
        doc.fillColor('#16A34A').fontSize(8.5).font('Helvetica-Bold').text(`${r.progress ?? 0}%`, curX + 6, rY + 5, { width: colWidths[2] - 12 });
        curX += colWidths[2];
        doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica').text(`${r.timeSpent ?? 0}h`, curX + 6, rY + 5, { width: colWidths[3] - 12 });
        curX += colWidths[3];
        doc.fillColor('#64748B').fontSize(8).font('Helvetica').text((r.status || 'SUBMITTED').replace(/_/g, ' '), curX + 6, rY + 5, { width: colWidths[4] - 12 });

        doc.y = rY + rowH;
      });

      doc.moveDown(1.2);

      // ── Detailed Individual Submissions ──
      doc.fillColor('#0F172A').fontSize(12).font('Helvetica-Bold').text('Detailed Member Submissions', startX, doc.y);
      doc.moveDown(0.4);

      reports.forEach((r) => {
        const author = `${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'Member';
        const cardH = 80;

        if (doc.y + cardH > doc.page.height - 60) {
          doc.addPage();
          doc.y = 40;
        }

        const mY = doc.y;
        doc.roundedRect(startX, mY, pageW, 22, 3).fill('#1E293B');
        doc.fillColor('#FFFFFF').fontSize(9).font('Helvetica-Bold').text(`${author}  —  ${r.title}`, startX + 8, mY + 6);
        doc.fillColor('#E89B1A').fontSize(9).font('Helvetica-Bold').text(`Progress: ${r.progress ?? 0}%  •  ${r.timeSpent ?? 0} hrs`, doc.page.width - 180, mY + 6, { align: 'right', width: 140 });

        doc.y = mY + 28;

        if (r.summary) {
          doc.fillColor('#0F172A').fontSize(8.5).font('Helvetica-Bold').text('Summary: ', startX + 6, doc.y, { continued: true });
          doc.fillColor('#334155').font('Helvetica').text(r.summary);
          doc.moveDown(0.3);
        }
        if (r.achievements) {
          doc.fillColor('#16A34A').fontSize(8.5).font('Helvetica-Bold').text('Key Achievements: ', startX + 6, doc.y, { continued: true });
          doc.fillColor('#334155').font('Helvetica').text(r.achievements);
          doc.moveDown(0.3);
        }
        if (r.blockers) {
          doc.fillColor('#DC2626').fontSize(8.5).font('Helvetica-Bold').text('Blockers & Risks: ', startX + 6, doc.y, { continued: true });
          doc.fillColor('#334155').font('Helvetica').text(r.blockers);
          doc.moveDown(0.3);
        }
        if (r.nextSteps) {
          doc.fillColor('#2563EB').fontSize(8.5).font('Helvetica-Bold').text('Next Steps: ', startX + 6, doc.y, { continued: true });
          doc.fillColor('#334155').font('Helvetica').text(r.nextSteps);
          doc.moveDown(0.3);
        }

        doc.moveDown(0.6);
      });

      // Supervisor Notes
      if (notes && notes.trim()) {
        if (doc.y + 70 > doc.page.height - 60) {
          doc.addPage();
          doc.y = 40;
        }
        doc.roundedRect(startX, doc.y, pageW, 55, 4).fillAndStroke('#FFFBEB', '#D97706');
        doc.fillColor('#D97706').fontSize(10).font('Helvetica-Bold').text('SUPERVISOR & TEAM LEAD NOTES', startX + 12, doc.y + 8);
        doc.fillColor('#1E293B').fontSize(9).font('Helvetica').text(notes, startX + 12, doc.y + 24, { width: pageW - 24 });
        doc.y += 65;
      }

      // Page numbers on all pages
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const fY = doc.page.height - 30;
        doc.moveTo(startX, fY - 6).lineTo(doc.page.width - startX, fY - 6).strokeColor('#E2E8F0').lineWidth(0.8).stroke();
        doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
          .text(`Taxime Operations System • Consolidated Report • Page ${i + 1} of ${range.count}`,
                startX, fY, { align: 'center', width: pageW });
      }

      doc.end();
    });
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. COMBINED REPORTS — EXCEL (CONSOLIDATED DASHBOARD & DETAILS)
  // ──────────────────────────────────────────────────────────────────────────
  async exportCombinedReportsToExcel(title: string, reports: any[], summary?: string, notes?: string): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Taxime Operations';
    workbook.created = new Date();

    // ── Sheet 1: Summary Dashboard ──
    const sheet1 = workbook.addWorksheet('Summary Dashboard', {
      views: [{ showGridLines: true }]
    });

    sheet1.columns = [
      { key: 'col1', width: 6 },
      { key: 'col2', width: 22 },
      { key: 'col3', width: 26 },
      { key: 'col4', width: 26 },
      { key: 'col5', width: 14 },
      { key: 'col6', width: 14 },
      { key: 'col7', width: 16 },
      { key: 'col8', width: 24 }
    ];

    // Banner
    sheet1.mergeCells('A1:H2');
    const bCell = sheet1.getCell('A1');
    bCell.value = 'TAXIME OPERATIONS — CONSOLIDATED TEAM REPORT';
    bCell.font = { name: 'Segoe UI', size: 16, bold: true, color: { argb: 'FF' + GOLD } };
    bCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK } };
    bCell.alignment = { vertical: 'middle', horizontal: 'center' };

    // Subtitle
    sheet1.mergeCells('A3:H3');
    const sCell = sheet1.getCell('A3');
    sCell.value = `${title || 'Operations Summary'}  |  Compiled: ${new Date().toLocaleDateString()}  |  ${reports.length} Reports Consolidated`;
    sCell.font = { name: 'Segoe UI', size: 9, italic: true, color: { argb: 'FF' + GRAY } };
    sCell.alignment = { horizontal: 'center' };

    sheet1.addRow([]);

    // KPI Cards Row
    const totalHours = reports.reduce((acc, r) => acc + (r.timeSpent || 0), 0);
    const avgProgress = reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.progress || 0), 0) / reports.length) : 0;
    const approved = reports.filter(r => r.status === 'APPROVED').length;

    sheet1.mergeCells('A5:B6');
    sheet1.getCell('A5').value = `REPORTS\n${reports.length}`;
    sheet1.getCell('A5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet1.getCell('A5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1628' } };
    sheet1.getCell('A5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    sheet1.mergeCells('C5:D6');
    sheet1.getCell('C5').value = `TOTAL HOURS\n${totalHours} hrs`;
    sheet1.getCell('C5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet1.getCell('C5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1628' } };
    sheet1.getCell('C5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    sheet1.mergeCells('E5:F6');
    sheet1.getCell('E5').value = `AVG PROGRESS\n${avgProgress}%`;
    sheet1.getCell('E5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet1.getCell('E5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF15803D' } };
    sheet1.getCell('E5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    sheet1.mergeCells('G5:H6');
    sheet1.getCell('G5').value = `APPROVED\n${approved} / ${reports.length}`;
    sheet1.getCell('G5').font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet1.getCell('G5').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1D4ED8' } };
    sheet1.getCell('G5').alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

    sheet1.addRow([]);
    sheet1.addRow([]);

    // Table Header
    const tHeaders = ['#', 'Contributor', 'Email', 'Report Title', 'Progress (%)', 'Hours (h)', 'Status', 'Associated Task'];
    const hRow = sheet1.addRow(tHeaders);
    hRow.height = 24;
    hRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1628' } };
      cell.alignment = { vertical: 'middle' };
    });

    reports.forEach((r, idx) => {
      const author = `${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'Team Member';
      const row = sheet1.addRow([
        idx + 1,
        author,
        r.author?.email || '—',
        r.title || 'Untitled',
        r.progress ?? 0,
        r.timeSpent ?? 0,
        (r.status || 'SUBMITTED').replace(/_/g, ' '),
        r.task?.title || 'None'
      ]);
      row.height = 20;
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'middle' };
      });
    });

    // ── Sheet 2: Detailed Submissions ──
    const sheet2 = workbook.addWorksheet('Detailed Submissions', {
      views: [{ showGridLines: true }]
    });

    sheet2.columns = [
      { key: 'c1', width: 22 },
      { key: 'c2', width: 24 },
      { key: 'c3', width: 14 },
      { key: 'c4', width: 14 },
      { key: 'c5', width: 35 },
      { key: 'c6', width: 35 },
      { key: 'c7', width: 35 },
      { key: 'c8', width: 35 }
    ];

    const dHeaders = ['Contributor', 'Report Title', 'Progress', 'Hours', 'Summary', 'Key Achievements', 'Critical Blockers', 'Next Steps'];
    const dHRow = sheet2.addRow(dHeaders);
    dHRow.height = 24;
    dHRow.eachCell((cell) => {
      cell.font = { bold: true, size: 10, color: { argb: 'FFFFFFFF' } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0B1628' } };
      cell.alignment = { vertical: 'middle' };
    });

    reports.forEach((r, idx) => {
      const author = `${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'Team Member';
      const row = sheet2.addRow([
        author,
        r.title || 'Untitled',
        `${r.progress ?? 0}%`,
        `${r.timeSpent ?? 0}h`,
        r.summary || '—',
        r.achievements || '—',
        r.blockers || '—',
        r.nextSteps || '—'
      ]);
      row.height = 45;
      if (idx % 2 === 0) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
        });
      }
      row.eachCell((cell) => {
        cell.alignment = { vertical: 'top', wrapText: true };
      });
    });

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. SINGLE SUBMITTED REPORT — WORD (.DOCX)
  // ──────────────────────────────────────────────────────────────────────────
  async exportSubmittedReportToWord(report: any): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: report.title || 'Operational Report', bold: true, size: 48, font: 'Calibri', color: GOLD })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }));

    // Status badge & meta line
    const status = (report.status || 'DRAFT').replace(/_/g, ' ');
    const statusColor = report.status === 'APPROVED' ? GREEN : report.status === 'REJECTED' ? RED : DARK;
    const authorName = `${report.author?.firstName || ''} ${report.author?.lastName || ''}`.trim() || 'Team Member';

    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Status: ', bold: true, size: 22, font: 'Calibri', color: DARK }),
        new TextRun({ text: status, bold: true, size: 22, font: 'Calibri', color: statusColor }),
        new TextRun({ text: `  |  Author: ${authorName}`, size: 20, font: 'Calibri', color: GRAY }),
        new TextRun({ text: `  |  Type: ${(report.reportType || 'TASK_REPORT').replace(/_/g, ' ')}`, size: 20, font: 'Calibri', color: GRAY }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }));

    // Meta Table
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Progress', 'Time Spent', 'Reporting Period', 'Linked Task'].map((h) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: DARK, fill: DARK },
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: WHITE })] })],
            })
          ),
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.progress ?? 0}%`, bold: true, size: 20, font: 'Calibri', color: GREEN })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.timeSpent ?? 0} hours`, size: 20, font: 'Calibri' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.fromDate ? new Date(report.fromDate).toLocaleDateString() : '—'} to ${report.toDate ? new Date(report.toDate).toLocaleDateString() : '—'}`, size: 18, font: 'Calibri' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: report.task?.title || 'None', size: 18, font: 'Calibri' })] })] }),
          ],
        }),
      ],
    }));

    const addSection = (heading: string, content: string | undefined, color = DARK) => {
      if (!content || !content.trim()) return;
      children.push(new Paragraph({
        children: [new TextRun({ text: heading, bold: true, size: 26, font: 'Calibri', color })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: content, size: 22, font: 'Calibri' })],
        spacing: { after: 200 },
      }));
    };

    addSection('1. Executive Summary', report.summary);
    addSection('2. Key Achievements & Milestones', report.achievements, GREEN);
    addSection('3. Critical Blockers & Impediments', report.blockers, RED);
    addSection('4. Recommended Next Steps & Roadmap', report.nextSteps, BLUE);
    if (report.reviewerComment) addSection('5. Reviewer Evaluation & Feedback', report.reviewerComment, AMBER);

    // Signatures
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Sign-off & Approvals', bold: true, size: 24, font: 'Calibri', color: DARK })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 360, after: 150 },
    }));

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: [
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Submitted by Author:', bold: true, size: 18, font: 'Calibri' })] }),
                new Paragraph({ children: [new TextRun({ text: authorName, size: 20, font: 'Calibri' })] }),
                new Paragraph({ children: [new TextRun({ text: `Date: ${new Date(report.createdAt || Date.now()).toLocaleDateString()}`, size: 16, font: 'Calibri', color: GRAY })] }),
              ]
            }),
            new TableCell({
              width: { size: 50, type: WidthType.PERCENTAGE },
              children: [
                new Paragraph({ children: [new TextRun({ text: 'Reviewed & Approved by:', bold: true, size: 18, font: 'Calibri' })] }),
                new Paragraph({ children: [new TextRun({ text: report.assigner ? `${report.assigner.firstName} ${report.assigner.lastName}` : (report.reviewerComment ? 'Authorized Reviewer' : 'Pending Verification'), size: 20, font: 'Calibri' })] }),
                new Paragraph({ children: [new TextRun({ text: `Status: ${status}`, size: 16, font: 'Calibri', color: GRAY })] }),
              ]
            })
          ]
        })
      ]
    }));

    return this._buildWordDoc(report.title || 'Operational Report', children);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. COMBINED REPORTS — WORD (.DOCX)
  // ──────────────────────────────────────────────────────────────────────────
  async exportCombinedReportsToWord(title: string, reports: any[], summary?: string, notes?: string): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: title || 'Consolidated Operations Report', bold: true, size: 48, font: 'Calibri', color: GOLD })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }));

    // Subtitle
    const totalHours = reports.reduce((acc, r) => acc + (r.timeSpent || 0), 0);
    const avgProgress = reports.length > 0 ? Math.round(reports.reduce((acc, r) => acc + (r.progress || 0), 0) / reports.length) : 0;

    children.push(new Paragraph({
      children: [
        new TextRun({ text: `Compiled on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 20, font: 'Calibri', color: GRAY }),
        new TextRun({ text: `  |  ${reports.length} Reports Included`, bold: true, size: 20, font: 'Calibri', color: DARK }),
        new TextRun({ text: `  |  Avg Progress: ${avgProgress}%`, bold: true, size: 20, font: 'Calibri', color: GREEN }),
        new TextRun({ text: `  |  Total Hours: ${totalHours}h`, bold: true, size: 20, font: 'Calibri', color: DARK }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }));

    // Executive Summary
    if (summary && summary.trim()) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Executive Overview', bold: true, size: 28, font: 'Calibri', color: DARK })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 120 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: summary, size: 22, font: 'Calibri' })],
        spacing: { after: 260 },
      }));
    }

    // Consolidated Metrics Table
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Contributors & Task Summary', bold: true, size: 26, font: 'Calibri', color: DARK })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 200, after: 150 },
    }));

    const tableHeaders = ['Contributor', 'Report Title', 'Progress', 'Hours', 'Status'];
    const colPct = Math.floor(100 / tableHeaders.length);

    const headerRow = new TableRow({
      tableHeader: true,
      children: tableHeaders.map((h) => new TableCell({
        width: { size: colPct, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.SOLID, color: DARK, fill: DARK },
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: WHITE })] })],
      })),
    });

    const dataRows = reports.map((r, idx) => new TableRow({
      children: [
        new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: `${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'Team Member', size: 18, font: 'Calibri', bold: true })] })],
        }),
        new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: r.title || 'Untitled', size: 18, font: 'Calibri' })] })],
        }),
        new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: `${r.progress ?? 0}%`, size: 18, font: 'Calibri' })] })],
        }),
        new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: `${r.timeSpent ?? 0}h`, size: 18, font: 'Calibri' })] })],
        }),
        new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: (r.status || 'DRAFT').replace(/_/g, ' '), size: 18, font: 'Calibri' })] })],
        }),
      ],
    }));

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }));

    // Individual Reports Breakdown
    children.push(new Paragraph({
      children: [new TextRun({ text: 'Individual Reports Breakdown', bold: true, size: 28, font: 'Calibri', color: DARK })],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    }));

    for (const r of reports) {
      const authorName = `${r.author?.firstName || ''} ${r.author?.lastName || ''}`.trim() || 'Contributor';

      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${authorName}: ${r.title}`, bold: true, size: 24, font: 'Calibri', color: GOLD }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
      }));

      children.push(new Paragraph({
        children: [
          new TextRun({ text: `Progress: ${r.progress ?? 0}%  |  Time: ${r.timeSpent ?? 0}h  |  Status: ${(r.status || '').replace(/_/g, ' ')}`, size: 18, font: 'Calibri', color: GRAY, italics: true }),
        ],
        spacing: { after: 120 },
      }));

      if (r.summary) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Summary: ', bold: true, size: 20, font: 'Calibri' }), new TextRun({ text: r.summary, size: 20, font: 'Calibri' })],
          spacing: { after: 100 },
        }));
      }

      if (r.achievements) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Achievements: ', bold: true, size: 20, font: 'Calibri', color: GREEN }), new TextRun({ text: r.achievements, size: 20, font: 'Calibri' })],
          spacing: { after: 100 },
        }));
      }

      if (r.blockers) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Blockers / Challenges: ', bold: true, size: 20, font: 'Calibri', color: RED }), new TextRun({ text: r.blockers, size: 20, font: 'Calibri' })],
          spacing: { after: 100 },
        }));
      }

      if (r.nextSteps) {
        children.push(new Paragraph({
          children: [new TextRun({ text: 'Next Steps: ', bold: true, size: 20, font: 'Calibri', color: BLUE }), new TextRun({ text: r.nextSteps, size: 20, font: 'Calibri' })],
          spacing: { after: 160 },
        }));
      }
    }

    if (notes && notes.trim()) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Supervisor & Team Lead Notes', bold: true, size: 26, font: 'Calibri', color: DARK })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 120 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: notes, size: 22, font: 'Calibri', italics: true })],
        spacing: { after: 200 },
      }));
    }

    return this._buildWordDoc(title || 'Consolidated Report', children);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // LEGACY SYSTEM EXPORT SUPPORT (General Dashboard Analytics)
  // ──────────────────────────────────────────────────────────────────────────
  async exportToExcel(reportData: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Taxime Operations';
    workbook.created = new Date();

    const title = fmt(reportData.type) || 'Report';

    const cover = workbook.addWorksheet('Cover');
    cover.mergeCells('A1:D2');
    const titleCell = cover.getCell('A1');
    titleCell.value = `Taxime — ${title}`;
    titleCell.font = { name: 'Calibri', size: 20, bold: true, color: { argb: 'FF' + GOLD } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

    cover.mergeCells('A3:D3');
    const dateCell = cover.getCell('A3');
    dateCell.value = `Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`;
    dateCell.font = { name: 'Calibri', size: 12, color: { argb: 'FF' + GRAY }, italic: true };
    dateCell.alignment = { horizontal: 'center' };

    cover.getRow(1).height = 40;
    cover.getRow(3).height = 22;

    const summarySheet = workbook.addWorksheet('Summary');
    summarySheet.getColumn('A').width = 30;
    summarySheet.getColumn('B').width = 40;

    const sumHeader = summarySheet.addRow(['Field', 'Value']);
    sumHeader.font = { bold: true, name: 'Calibri', size: 12, color: { argb: 'FF' + WHITE } };
    sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + GOLD } };
    sumHeader.height = 20;

    for (const [k, v] of Object.entries(reportData)) {
      if (k === 'type' || k === 'data') continue;
      if (Array.isArray(v)) {
        summarySheet.addRow([label(k), `${(v as unknown[]).length} records`]);
      } else if (typeof v === 'object' && v !== null) {
        continue;
      } else {
        const row = summarySheet.addRow([label(k), fmt(v)]);
        row.font = { name: 'Calibri', size: 11 };
      }
    }

    summarySheet.eachRow((row, i) => {
      if (i === 1) return;
      if (i % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });

    const rawData: any[] = reportData.data && Array.isArray(reportData.data)
      ? reportData.data
      : this._flatten(reportData);

    if (rawData.length > 0) {
      const dataSheet = workbook.addWorksheet('Details');
      const cleaned = rawData.map(cleanRow);
      const headers = Object.keys(cleaned[0]);

      const hRow = dataSheet.addRow(headers);
      hRow.font = { bold: true, name: 'Calibri', size: 11, color: { argb: 'FF' + WHITE } };
      hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK } };
      hRow.height = 20;
      hRow.alignment = { vertical: 'middle' };

      headers.forEach((h, i) => {
        dataSheet.getColumn(i + 1).width = Math.max(h.length + 4, 18);
      });

      cleaned.forEach((row, idx) => {
        const r = dataSheet.addRow(Object.values(row));
        r.font = { name: 'Calibri', size: 11 };
        if (idx % 2 === 0) {
          r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } };
        }
        r.alignment = { vertical: 'middle', wrapText: false };
      });

      dataSheet.views = [{ state: 'frozen', ySplit: 1 }];
      dataSheet.addTable({
        name: 'DataTable',
        ref: 'A1',
        headerRow: true,
        style: { theme: 'TableStyleMedium2', showRowStripes: true },
        columns: headers.map((h) => ({ name: h, filterButton: true })),
        rows: cleaned.map((r) => Object.values(r)),
      });
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportToPDF(reportData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const title = fmt(reportData.type) || 'Report';
      const pageW = doc.page.width - 120;

      doc.rect(0, 0, doc.page.width, 80).fill('#0B1628');
      doc.fillColor('#E89B1A').fontSize(22).font('Helvetica-Bold').text('Taxime', 60, 22);
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica').text('Operations & Task Management', 60, 48);

      doc.moveDown(3);
      doc.fillColor('#0B1628').fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(0.4);
      doc.fillColor('#64748B').fontSize(10).font('Helvetica')
        .text(`Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

      doc.moveDown(1);
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#E89B1A').lineWidth(2).stroke();
      doc.moveDown(1);

      let hasSummary = false;
      for (const [k, v] of Object.entries(reportData)) {
        if (k === 'type' || k === 'data') continue;
        if (Array.isArray(v) || (typeof v === 'object' && v !== null)) continue;
        if (!hasSummary) {
          doc.fillColor('#0B1628').fontSize(13).font('Helvetica-Bold').text('Summary');
          doc.moveDown(0.5);
          hasSummary = true;
        }
        doc.fillColor('#0B1628').fontSize(10).font('Helvetica-Bold').text(`${label(k)}:  `, { continued: true });
        doc.fillColor('#334155').font('Helvetica').text(fmt(v));
      }

      if (hasSummary) {
        doc.moveDown(1);
        doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#E2E8F0').lineWidth(1).stroke();
        doc.moveDown(1);
      }

      const rawData: any[] = reportData.data && Array.isArray(reportData.data)
        ? reportData.data
        : this._flatten(reportData);

      if (rawData.length > 0) {
        doc.fillColor('#0B1628').fontSize(13).font('Helvetica-Bold').text('Details');
        doc.moveDown(0.6);

        const cleaned = rawData.map(cleanRow);
        const headers = Object.keys(cleaned[0]);
        const colW = Math.min(pageW / headers.length, 120);
        const rowH = 20;

        let x = 60;
        const headerY = doc.y;
        doc.rect(60, headerY, pageW, rowH).fill('#0B1628');
        headers.forEach((h) => {
          doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
            .text(h, x + 4, headerY + 6, { width: colW - 8, ellipsis: true, lineBreak: false });
          x += colW;
        });

        cleaned.forEach((row, idx) => {
          const rowY = doc.y + rowH;
          if (rowY + rowH > doc.page.height - 80) {
            doc.addPage();
            doc.y = 60;
          }
          doc.rect(60, doc.y + (idx === 0 ? rowH : 0), pageW, rowH)
            .fill(idx % 2 === 0 ? '#F8FAFC' : '#FFFFFF');
          x = 60;
          Object.values(row).forEach((val) => {
            doc.fillColor('#334155').fontSize(8).font('Helvetica')
              .text(String(val), x + 4, doc.y + (idx === 0 ? rowH : 0) + 6, { width: colW - 8, ellipsis: true, lineBreak: false });
            x += colW;
          });
          if (idx === 0) doc.y += rowH;
          doc.y += rowH;
        });
      }

      const footerY = doc.page.height - 40;
      doc.moveTo(60, footerY).lineTo(doc.page.width - 60, footerY).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
        .text('Taxime Operations & Task Management System — Confidential', 60, footerY + 8, { align: 'center', width: pageW });

      doc.end();
    });
  }

  async exportToWord(reportData: any): Promise<Buffer> {
    const title = fmt(reportData.type) || 'Report';
    const children: (Paragraph | Table)[] = [];

    children.push(new Paragraph({
      children: [new TextRun({ text: `Taxime — ${title}`, bold: true, size: 52, font: 'Calibri', color: GOLD })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }));

    children.push(new Paragraph({
      children: [new TextRun({
        text: `Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        size: 20, font: 'Calibri', color: GRAY, italics: true,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }));

    const summaryEntries = Object.entries(reportData).filter(
      ([k, v]) => k !== 'type' && k !== 'data' && !Array.isArray(v) && typeof v !== 'object'
    );

    if (summaryEntries.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Summary', bold: true, size: 30, font: 'Calibri', color: DARK })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }));

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: summaryEntries.map(([k, v], idx) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
                children: [new Paragraph({ children: [new TextRun({ text: label(k), bold: true, size: 20, font: 'Calibri', color: DARK })] })],
              }),
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
                children: [new Paragraph({ children: [new TextRun({ text: fmt(v), size: 20, font: 'Calibri', color: GRAY })] })],
              }),
            ],
          })
        ),
      }));
    }

    return this._buildWordDoc(title, children);
  }

  // ── Internal Helpers ──
  private _flatten(reportData: any): any[] {
    for (const [k, v] of Object.entries(reportData)) {
      if (k !== 'type' && Array.isArray(v) && (v as any[]).length > 0) return v as any[];
    }
    return [];
  }

  private async _buildWordDoc(title: string, children: (Paragraph | Table)[]): Promise<Buffer> {
    const doc = new Document({
      creator: 'Taxime Operations',
      title,
      sections: [{
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'Taxime', bold: true, size: 18, font: 'Calibri', color: GOLD }),
                new TextRun({ text: '  |  Operations & Task Management', size: 16, font: 'Calibri', color: GRAY }),
              ],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [
                new TextRun({ text: 'Page ', size: 16, font: 'Calibri', color: GRAY }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Calibri', color: GRAY }),
                new TextRun({ text: ' of ', size: 16, font: 'Calibri', color: GRAY }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Calibri', color: GRAY }),
                new TextRun({ text: '  |  Taxime — Confidential', size: 16, font: 'Calibri', color: GRAY }),
              ],
              alignment: AlignmentType.CENTER,
            })],
          }),
        },
        children,
      }],
    });

    return await Packer.toBuffer(doc) as Buffer;
  }
}
