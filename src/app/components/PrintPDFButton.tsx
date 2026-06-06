'use client';

import { Printer } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function PrintPDFButton({ targetId, fileName }: { targetId: string, fileName: string }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = async () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    setIsPrinting(true);
    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (error) {
      console.error('Error generating PDF', error);
      alert('Gagal membuat PDF');
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <button 
      onClick={handlePrint}
      disabled={isPrinting}
      className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold flex items-center shadow-sm transition-colors disabled:opacity-50"
    >
      <Printer className="w-4 h-4 mr-2" />
      {isPrinting ? 'Mencetak...' : 'Cetak PDF'}
    </button>
  );
}
