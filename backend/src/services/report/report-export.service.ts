import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

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
}
