import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  Header, Footer, PageNumber,
} from 'docx';

// ── Brand colours ────────────────────────────────────────────────────────────
const GOLD    = 'E89B1A';
const DARK    = '0B1628';
const GRAY    = '64748B';
const LIGHT   = 'F8FAFC';
const WHITE   = 'FFFFFF';
const GREEN   = '16A34A';
const RED     = 'DC2626';

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
    // Arrays of primitives → comma list
    if (Array.isArray(value)) {
      return (value as unknown[]).map((v) => fmt(v)).join(', ') || '—';
    }
    // Objects with a "name" property → use the name
    if ((value as any).name) return String((value as any).name);
    // Objects with "firstName/lastName" → full name
    if ((value as any).firstName) return `${(value as any).firstName} ${(value as any).lastName || ''}`.trim();
    // Fallback – stringify without brackets
    return Object.entries(value as object)
      .filter(([, v]) => typeof v !== 'object')
      .map(([k, v]) => `${label(k)}: ${v}`)
      .join(' | ') || '—';
  }
  // Detect ISO dates
  const str = String(value);
  if (/^\d{4}-\d{2}-\d{2}T/.test(str)) {
    return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  // Clean up UPPER_CASE enum values
  if (/^[A-Z_]{3,}$/.test(str)) return str.replace(/_/g, ' ');
  return str;
}

/** Keys to always skip in data output */
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
// EXCEL
// ════════════════════════════════════════════════════════════════════════════
export class ReportExportService {
  async exportToExcel(reportData: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Taxime Operations';
    workbook.created = new Date();

    const title = fmt(reportData.type) || 'Report';

    // ── Cover sheet ──────────────────────────────────────────────────────────
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

    // ── Summary stats (non-array top-level keys) ────────────────────────────
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
        // nested arrays → summarise
        summarySheet.addRow([label(k), `${(v as unknown[]).length} records`]);
      } else if (typeof v === 'object' && v !== null) {
        continue; // skip nested objects in summary
      } else {
        const row = summarySheet.addRow([label(k), fmt(v)]);
        row.font = { name: 'Calibri', size: 11 };
      }
    }

    // Alternate row shading
    summarySheet.eachRow((row, i) => {
      if (i === 1) return;
      if (i % 2 === 0) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });

    // ── Data sheet ──────────────────────────────────────────────────────────
    const rawData: any[] = reportData.data && Array.isArray(reportData.data)
      ? reportData.data
      : this._flatten(reportData);

    if (rawData.length > 0) {
      const dataSheet = workbook.addWorksheet('Details');

      const cleaned = rawData.map(cleanRow);
      const headers = Object.keys(cleaned[0]);

      // Header row
      const hRow = dataSheet.addRow(headers);
      hRow.font = { bold: true, name: 'Calibri', size: 11, color: { argb: 'FF' + WHITE } };
      hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + DARK } };
      hRow.height = 20;
      hRow.alignment = { vertical: 'middle' };

      // Auto column width
      headers.forEach((h, i) => {
        dataSheet.getColumn(i + 1).width = Math.max(h.length + 4, 18);
      });

      // Data rows
      cleaned.forEach((row, idx) => {
        const r = dataSheet.addRow(Object.values(row));
        r.font = { name: 'Calibri', size: 11 };
        if (idx % 2 === 0) {
          r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF0F4F8' } };
        }
        r.alignment = { vertical: 'middle', wrapText: false };
      });

      // Freeze header
      dataSheet.views = [{ state: 'frozen', ySplit: 1 }];

      // Add table
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

  // ════════════════════════════════════════════════════════════════════════════
  // PDF
  // ════════════════════════════════════════════════════════════════════════════
  async exportToPDF(reportData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 60, size: 'A4' });
      const chunks: Buffer[] = [];
      doc.on('data', (c: Buffer) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const title = fmt(reportData.type) || 'Report';
      const pageW = doc.page.width - 120;

      // ── Header bar ─────────────────────────────────────────────────────────
      doc.rect(0, 0, doc.page.width, 80).fill('#0B1628');
      doc.fillColor('#E89B1A').fontSize(22).font('Helvetica-Bold')
        .text('Taxime', 60, 22);
      doc.fillColor('#FFFFFF').fontSize(11).font('Helvetica')
        .text('Operations & Task Management', 60, 48);

      // ── Title ──────────────────────────────────────────────────────────────
      doc.moveDown(3);
      doc.fillColor('#0B1628').fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
      doc.moveDown(0.4);
      doc.fillColor('#64748B').fontSize(10).font('Helvetica')
        .text(`Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, { align: 'center' });

      // ── Divider ────────────────────────────────────────────────────────────
      doc.moveDown(1);
      doc.moveTo(60, doc.y).lineTo(doc.page.width - 60, doc.y).strokeColor('#E89B1A').lineWidth(2).stroke();
      doc.moveDown(1);

      // ── Summary key-value pairs ────────────────────────────────────────────
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

      // ── Data table ──────────────────────────────────────────────────────────
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

        // Header row
        let x = 60;
        const headerY = doc.y;
        doc.rect(60, headerY, pageW, rowH).fill('#0B1628');
        headers.forEach((h) => {
          doc.fillColor('#FFFFFF').fontSize(8).font('Helvetica-Bold')
            .text(h, x + 4, headerY + 6, { width: colW - 8, ellipsis: true, lineBreak: false });
          x += colW;
        });

        // Data rows
        cleaned.forEach((row, idx) => {
          const rowY = doc.y + rowH;
          if (rowY + rowH > doc.page.height - 80) {
            doc.addPage();
            doc.y = 60;
          }
          const y = doc.y + rowH;
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

      // ── Footer ─────────────────────────────────────────────────────────────
      const footerY = doc.page.height - 40;
      doc.moveTo(60, footerY).lineTo(doc.page.width - 60, footerY).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#94A3B8').fontSize(8).font('Helvetica')
        .text('Taxime Operations & Task Management System — Confidential', 60, footerY + 8, { align: 'center', width: pageW });

      doc.end();
    });
  }

  // ════════════════════════════════════════════════════════════════════════════
  // WORD
  // ════════════════════════════════════════════════════════════════════════════
  async exportToWord(reportData: any): Promise<Buffer> {
    const title = fmt(reportData.type) || 'Report';
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: `Taxime — ${title}`, bold: true, size: 52, font: 'Calibri', color: GOLD })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }));

    // Date
    children.push(new Paragraph({
      children: [new TextRun({
        text: `Generated on ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
        size: 20, font: 'Calibri', color: GRAY, italics: true,
      })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }));

    // ── Summary section ──────────────────────────────────────────────────────
    const summaryEntries = Object.entries(reportData).filter(
      ([k, v]) => k !== 'type' && k !== 'data' && !Array.isArray(v) && typeof v !== 'object'
    );

    if (summaryEntries.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Summary', bold: true, size: 30, font: 'Calibri', color: DARK })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
      }));

      // Summary table
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

    // ── Data table ───────────────────────────────────────────────────────────
    const rawData: any[] = reportData.data && Array.isArray(reportData.data)
      ? reportData.data
      : this._flatten(reportData);

    if (rawData.length > 0) {
      children.push(new Paragraph({
        children: [new TextRun({ text: 'Details', bold: true, size: 30, font: 'Calibri', color: DARK })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }));

      const cleaned = rawData.map(cleanRow);
      const headers = Object.keys(cleaned[0]);
      const colPct = Math.floor(100 / headers.length);

      const headerRow = new TableRow({
        tableHeader: true,
        children: headers.map((h) => new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, color: DARK, fill: DARK },
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 18, font: 'Calibri', color: WHITE })] })],
        })),
      });

      const dataRows = cleaned.map((row, idx) => new TableRow({
        children: Object.values(row).map((val) => new TableCell({
          width: { size: colPct, type: WidthType.PERCENTAGE },
          shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT, fill: LIGHT } : undefined,
          children: [new Paragraph({ children: [new TextRun({ text: String(val), size: 18, font: 'Calibri' })] })],
        })),
      }));

      children.push(new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [headerRow, ...dataRows],
      }));
    }

    return this._buildWordDoc(title, children);
  }

  // ── Submitted report Word export ────────────────────────────────────────────
  async exportSubmittedReportToWord(report: any): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(new Paragraph({
      children: [new TextRun({ text: report.title || 'Report', bold: true, size: 52, font: 'Calibri', color: GOLD })],
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
    }));

    // Status badge
    const statusColor = report.status === 'APPROVED' ? GREEN : report.status === 'REJECTED' ? RED : DARK;
    children.push(new Paragraph({
      children: [
        new TextRun({ text: 'Status: ', bold: true, size: 22, font: 'Calibri', color: DARK }),
        new TextRun({ text: (report.status || 'Draft').replace(/_/g, ' '), bold: true, size: 22, font: 'Calibri', color: statusColor }),
        new TextRun({ text: `  |  Author: ${report.author?.firstName || ''} ${report.author?.lastName || ''}`, size: 20, font: 'Calibri', color: GRAY }),
        new TextRun({ text: `  |  Type: ${(report.reportType || '').replace(/_/g, ' ')}`, size: 20, font: 'Calibri', color: GRAY }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
    }));

    // Meta table
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        new TableRow({
          children: ['Progress', 'Time Spent', 'Period'].map((h) =>
            new TableCell({
              shading: { type: ShadingType.SOLID, color: GOLD, fill: GOLD },
              children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 20, font: 'Calibri', color: WHITE })] })],
            })
          ),
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.progress ?? 0}%`, size: 20, font: 'Calibri' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.timeSpent ?? 0} hours`, size: 20, font: 'Calibri' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.fromDate ? new Date(report.fromDate).toLocaleDateString() : '—'} to ${report.toDate ? new Date(report.toDate).toLocaleDateString() : '—'}`, size: 20, font: 'Calibri' })] })] }),
          ],
        }),
      ],
    }));

    const addSection = (heading: string, content: string, color = DARK) => {
      if (!content) return;
      children.push(new Paragraph({
        children: [new TextRun({ text: heading, bold: true, size: 28, font: 'Calibri', color })],
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 300, after: 150 },
      }));
      children.push(new Paragraph({
        children: [new TextRun({ text: content, size: 22, font: 'Calibri' })],
        spacing: { after: 200 },
      }));
    };

    addSection('Summary', report.summary);
    addSection('Achievements', report.achievements, GREEN);
    addSection('Blockers', report.blockers, RED);
    addSection('Next Steps', report.nextSteps, '2563EB');
    if (report.reviewerComment) addSection('Reviewer Comments', report.reviewerComment, GRAY);
    if (report.task?.title) addSection('Linked Task', report.task.title, GOLD);

    return this._buildWordDoc(report.title || 'Report', children);
  }

  // ── Internal helpers ──────────────────────────────────────────────────────

  /** Flatten nested arrays from report data into a flat list */
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
