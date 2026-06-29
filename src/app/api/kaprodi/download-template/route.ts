import { NextRequest, NextResponse } from 'next/server';
import ExcelJS from 'exceljs';

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const kodeMk = url.searchParams.get('kodeMk') || '08033122045';
  const type = url.searchParams.get('type') || 'single';
  
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SIAKAD';
  workbook.created = new Date();

  const headerStyle = {
    font: { bold: true, color: { argb: 'FFFFFFFF' } },
    fill: { type: 'pattern' as any, pattern: 'solid' as any, fgColor: { argb: 'FF004E98' } },
    alignment: { vertical: 'middle' as any, horizontal: 'center' as const },
    border: {
      top: { style: 'thin' as const }, left: { style: 'thin' as const },
      bottom: { style: 'thin' as const }, right: { style: 'thin' as const }
    }
  };

  const dataStyle = {
    alignment: { vertical: 'middle' as any, wrapText: true },
    border: {
      top: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } }, left: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } },
      bottom: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } }, right: { style: 'thin' as const, color: { argb: 'FFDDDDDD' } }
    }
  };

  const cpmkSheet = workbook.addWorksheet('CPMK', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  
  if (type === 'massal') {
    cpmkSheet.columns = [
      { header: 'Kode MK', key: 'kodeMk', width: 20 },
      { header: 'Kode CPMK', key: 'kodeCpmk', width: 15 },
      { header: 'Deskripsi (ID)', key: 'descId', width: 45 },
      { header: 'Deskripsi (EN)', key: 'descEn', width: 45 }
    ];
    const cpmkRows = [
      { kodeMk: kodeMk, kodeCpmk: 'CPMK-1', descId: 'Mampu memahami konsep dasar', descEn: 'Able to understand basic concepts' },
      { kodeMk: kodeMk, kodeCpmk: 'CPMK-2', descId: 'Mampu mengaplikasikan teori', descEn: 'Able to apply theory' }
    ];
    cpmkRows.forEach(data => {
      const row = cpmkSheet.addRow(data);
      row.eachCell(cell => { cell.alignment = dataStyle.alignment; cell.border = dataStyle.border; });
    });
  } else {
    cpmkSheet.columns = [
      { header: 'Kode CPMK', key: 'kodeCpmk', width: 15 },
      { header: 'Deskripsi (ID)', key: 'descId', width: 60 },
      { header: 'Deskripsi (EN)', key: 'descEn', width: 60 }
    ];
    const cpmkRows = [
      { kodeCpmk: 'CPMK-1', descId: 'Mampu memahami konsep dasar', descEn: 'Able to understand basic concepts' },
      { kodeCpmk: 'CPMK-2', descId: 'Mampu mengaplikasikan teori', descEn: 'Able to apply theory' },
      { kodeCpmk: 'CPMK-3', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-4', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-5', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-6', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-7', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-8', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-9', descId: '', descEn: '' },
      { kodeCpmk: 'CPMK-10', descId: '', descEn: '' }
    ];
    cpmkRows.forEach(data => {
      const row = cpmkSheet.addRow(data);
      row.eachCell(cell => { cell.alignment = dataStyle.alignment; cell.border = dataStyle.border; });
    });
  }

  cpmkSheet.getRow(1).height = 30;
  cpmkSheet.getRow(1).eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
    cell.border = headerStyle.border;
  });

  if (type === 'massal') {
  const cplSheet = workbook.addWorksheet('CPL', { views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }] });
  
  cplSheet.columns = [
    { header: 'Kode CPL', key: 'kodeCpl', width: 15 },
    { header: 'Deskripsi (ID)', key: 'descId', width: 45 },
    { header: 'Deskripsi (EN)', key: 'descEn', width: 45 }
  ];

  cplSheet.getRow(1).height = 30;
  cplSheet.getRow(1).eachCell((cell) => {
    cell.font = headerStyle.font;
    cell.fill = headerStyle.fill;
    cell.alignment = headerStyle.alignment;
    cell.border = headerStyle.border;
  });

  const cplRows = [
    { kodeCpl: 'CPL-1', descId: 'Menunjukkan sikap dan tata nilai', descEn: 'Demonstrate attitude' },
    { kodeCpl: 'CPL-2', descId: 'Menguasai konsep teoritis', descEn: 'Master concepts' }
  ];

  cplRows.forEach(data => {
    const row = cplSheet.addRow(data);
    row.eachCell((cell) => {
      cell.alignment = dataStyle.alignment;
      cell.border = dataStyle.border;
    });
  });
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Template_Import_CPMK_CPL.xlsx"'
    }
  });
}
