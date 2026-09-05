import { Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import PDFDocument from 'pdfkit';
import { Response } from 'express';

@Injectable()
export class ReportingService {
  generateExcel(
    data: Record<string, unknown>[],
    fileName: string,
    res: Response,
  ) {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

    const buffer = XLSX.write(workbook, {
      type: 'buffer',
      bookType: 'xlsx',
    }) as unknown as Buffer;

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}.xlsx"`,
    });

    res.send(buffer);
  }

  generatePdf(data: Record<string, unknown>[], title: string, res: Response) {
    const doc = new PDFDocument();

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${title}.pdf"`,
    });

    doc.pipe(res);

    doc.fontSize(20).text(title, { align: 'center' });
    doc.moveDown();

    data.forEach((item, index) => {
      doc.fontSize(12).text(`${index + 1}.`, { continued: true });
      Object.entries(item).forEach(([key, value]) => {
        doc.text(`   ${key}: ${String(value)}`);
      });
      doc.moveDown(0.5);
    });

    doc.end();
  }
}
