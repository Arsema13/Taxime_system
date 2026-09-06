import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  Header, Footer, PageNumber, NumberFormat, TabStopPosition, TabStopType,
  convertInchesToTwip,
} from 'docx';

const CORAL = 'FF4D67';
const DARK = '1E293B';
const GRAY = '64748B';
const LIGHT_BG = 'F8FAFC';
const WHITE = 'FFFFFF';

function buildTableFromData(data: any[]): Table {
  if (data.length === 0) return new Table({ rows: [] });

  const keys = Object.keys(data[0]).filter((k) => typeof data[0][k] !== 'object');

  const headerRow = new TableRow({
    tableHeader: true,
    children: keys.map(
      (key) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: key, bold: true, color: WHITE, size: 20, font: 'Calibri' })] })],
          shading: { type: ShadingType.SOLID, color: CORAL, fill: CORAL },
          width: { size: Math.floor(100 / keys.length), type: WidthType.PERCENTAGE },
        }),
    ),
  });

  const dataRows = data.map(
    (row, idx) =>
      new TableRow({
        children: keys.map(
          (key) =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: String(row[key] ?? ''), size: 20, font: 'Calibri' })] })],
              shading: idx % 2 === 0 ? { type: ShadingType.SOLID, color: LIGHT_BG, fill: LIGHT_BG } : undefined,
            }),
        ),
      }),
  );

  return new Table({
    rows: [headerRow, ...dataRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
  });
}

function buildKeyValueSection(data: any): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'type' || key === 'data') return;
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}: `, bold: true, size: 22, font: 'Calibri', color: DARK }),
          new TextRun({ text: typeof value === 'object' ? JSON.stringify(value) : String(value ?? ''), size: 22, font: 'Calibri', color: GRAY }),
        ],
        spacing: { after: 120 },
      }),
    );
  });
  return paragraphs;
}

export class ReportExportService {
  async exportToExcel(reportData: any): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(reportData.type);

    if (reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
      const headers = Object.keys(reportData.data[0])
        .filter((k) => typeof reportData.data[0][k] !== 'object');
      sheet.addRow(headers);
      reportData.data.forEach((row: any) => {
        sheet.addRow(headers.map((h) => row[h]));
      });
    } else {
      sheet.addRow([reportData.type]);
      Object.entries(reportData).forEach(([key, value]) => {
        if (key !== 'type' && key !== 'data') {
          sheet.addRow([key, String(value)]);
        }
      });
    }

    return workbook.xlsx.writeBuffer() as unknown as Promise<Buffer>;
  }

  async exportToPDF(reportData: any): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      doc.fontSize(20).text(reportData.type, { align: 'center' });
      doc.moveDown();

      if (reportData.data && Array.isArray(reportData.data)) {
        reportData.data.forEach((item: any) => {
          doc.fontSize(10).text(JSON.stringify(item, null, 2));
          doc.moveDown(0.5);
        });
      } else {
        Object.entries(reportData).forEach(([key, value]) => {
          if (key !== 'type') {
            doc.fontSize(12).text(`${key}: ${JSON.stringify(value)}`);
          }
        });
      }

      doc.end();
    });
  }

  async exportToWord(reportData: any): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        children: [new TextRun({ text: reportData.type || 'Report', bold: true, size: 48, font: 'Calibri', color: CORAL })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );

    // Subtitle with date
    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 22, font: 'Calibri', color: GRAY, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );

    // Divider line
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '━'.repeat(60), color: CORAL, size: 16 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
    );

    // If data is an array of objects → table
    if (reportData.data && Array.isArray(reportData.data) && reportData.data.length > 0) {
      // Section heading
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Report Data', bold: true, size: 28, font: 'Calibri', color: DARK })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
      );

      children.push(buildTableFromData(reportData.data));
    } else {
      // Key-value pairs
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Report Details', bold: true, size: 28, font: 'Calibri', color: DARK })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
      );

      children.push(...buildKeyValueSection(reportData));
    }

    const doc = new Document({
      creator: 'Taxime Task Management',
      title: reportData.type || 'Report',
      description: `Report generated by Taxime System`,
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Taxime', bold: true, size: 18, font: 'Calibri', color: CORAL }),
                    new TextRun({ text: '  |  Operations & Task Management', size: 16, font: 'Calibri', color: GRAY }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Page ', size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ text: ' of ', size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ text: '  |  Generated by Taxime System', size: 16, font: 'Calibri', color: GRAY }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children,
        },
      ],
    });

    return await Packer.toBuffer(doc) as Buffer;
  }

  async exportSubmittedReportToWord(report: any): Promise<Buffer> {
    const children: (Paragraph | Table)[] = [];

    // Title
    children.push(
      new Paragraph({
        children: [new TextRun({ text: report.title || 'Report', bold: true, size: 48, font: 'Calibri', color: CORAL })],
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
    );

    // Status & metadata
    const statusColor = report.status === 'APPROVED' ? '16A34A' : report.status === 'REJECTED' ? 'DC2626' : DARK;
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Status: `, bold: true, size: 22, font: 'Calibri', color: DARK }),
          new TextRun({ text: report.status?.replace(/_/g, ' ') || 'Draft', bold: true, size: 22, font: 'Calibri', color: statusColor }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
    );

    children.push(
      new Paragraph({
        children: [new TextRun({ text: `Author: ${report.author?.firstName || ''} ${report.author?.lastName || ''}  |  Type: ${(report.reportType || 'TASK_REPORT').replace(/_/g, ' ')}  |  Period: ${(report.period || 'N/A').replace(/_/g, ' ')}`, size: 20, font: 'Calibri', color: GRAY, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
    );

    // Divider
    children.push(
      new Paragraph({
        children: [new TextRun({ text: '━'.repeat(60), color: CORAL, size: 16 })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      }),
    );

    // Summary section
    if (report.summary) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Summary', bold: true, size: 28, font: 'Calibri', color: DARK })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: report.summary, size: 22, font: 'Calibri' })],
          spacing: { after: 200 },
        }),
      );
    }

    // Progress & Time
    const metaTable = new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Progress', bold: true, size: 20, font: 'Calibri', color: WHITE })] })],
              shading: { type: ShadingType.SOLID, color: CORAL, fill: CORAL },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Time Spent', bold: true, size: 20, font: 'Calibri', color: WHITE })] })],
              shading: { type: ShadingType.SOLID, color: CORAL, fill: CORAL },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: 'Date Range', bold: true, size: 20, font: 'Calibri', color: WHITE })] })],
              shading: { type: ShadingType.SOLID, color: CORAL, fill: CORAL },
            }),
          ],
        }),
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.progress ?? 0}%`, size: 20, font: 'Calibri' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.timeSpent ?? 0} hours`, size: 20, font: 'Calibri' })] })] }),
            new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: `${report.fromDate ? new Date(report.fromDate).toLocaleDateString() : 'N/A'} - ${report.toDate ? new Date(report.toDate).toLocaleDateString() : 'N/A'}`, size: 20, font: 'Calibri' })] })] }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
    children.push(metaTable);

    // Achievements
    if (report.achievements) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Achievements', bold: true, size: 28, font: 'Calibri', color: DARK })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: report.achievements, size: 22, font: 'Calibri' })],
          spacing: { after: 200 },
        }),
      );
    }

    // Blockers
    if (report.blockers) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Blockers', bold: true, size: 28, font: 'Calibri', color: 'DC2626' })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: report.blockers, size: 22, font: 'Calibri' })],
          spacing: { after: 200 },
        }),
      );
    }

    // Next Steps
    if (report.nextSteps) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Next Steps', bold: true, size: 28, font: 'Calibri', color: '2563EB' })],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 300, after: 200 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: report.nextSteps, size: 22, font: 'Calibri' })],
          spacing: { after: 200 },
        }),
      );
    }

    // Review Comments
    if (report.reviewerComment) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: '━'.repeat(60), color: GRAY, size: 16 })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 200 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: 'Reviewer Comments', bold: true, size: 24, font: 'Calibri', color: DARK })],
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 150 },
        }),
      );
      children.push(
        new Paragraph({
          children: [new TextRun({ text: report.reviewerComment, size: 22, font: 'Calibri', italics: true, color: GRAY })],
          spacing: { after: 200 },
        }),
      );
    }

    // Linked task
    if (report.task) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: 'Linked Task: ', bold: true, size: 20, font: 'Calibri', color: DARK }),
            new TextRun({ text: report.task.title || 'N/A', size: 20, font: 'Calibri', color: CORAL }),
          ],
          spacing: { before: 200, after: 100 },
        }),
      );
    }

    const doc = new Document({
      creator: 'Taxime Task Management',
      title: report.title || 'Report',
      description: 'Submitted report exported from Taxime System',
      sections: [
        {
          headers: {
            default: new Header({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Taxime', bold: true, size: 18, font: 'Calibri', color: CORAL }),
                    new TextRun({ text: '  |  Operations & Task Management', size: 16, font: 'Calibri', color: GRAY }),
                  ],
                  alignment: AlignmentType.RIGHT,
                }),
              ],
            }),
          },
          footers: {
            default: new Footer({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Page ', size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ children: [PageNumber.CURRENT], size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ text: ' of ', size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, font: 'Calibri', color: GRAY }),
                    new TextRun({ text: '  |  Generated by Taxime System', size: 16, font: 'Calibri', color: GRAY }),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          },
          children,
        },
      ],
    });

    return await Packer.toBuffer(doc) as Buffer;
  }
}
