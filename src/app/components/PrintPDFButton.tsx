'use client';

import { Printer } from 'lucide-react';
import { useState } from 'react';

export default function PrintPDFButton({ targetId, fileName }: { targetId: string, fileName: string }) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    const element = document.getElementById(targetId);
    if (!element) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Tolong izinkan pop-ups untuk mencetak dokumen.');
      return;
    }

    // Get all stylesheets to preserve styling
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(node => node.outerHTML)
      .join('\n');

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${fileName}</title>
          ${styles}
          <style>
            @media print {
              body {
                padding: 20px;
                background-color: white;
              }
              /* Hide elements that shouldn't be printed */
              button, .no-print {
                display: none !important;
              }
            }
          </style>
        </head>
        <body class="bg-white">
          ${element.outerHTML}
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();

    // Wait for styles to load before printing
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
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
