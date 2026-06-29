'use client';

import { useState, useEffect } from 'react';
import GradeDistributionChart from '@/app/components/mahasiswa/GradeDistributionChart';
import { PieChart as PieChartIcon } from 'lucide-react';

interface GradeDistributionItem {
  grade: string;
  count: number;
}

interface MkDistribution {
  kodeMk: string;
  namaMk: string;
  distribution: GradeDistributionItem[];
}

interface SebaranNilaiDosenProps {
  gradeDistributionByMk: MkDistribution[];
  defaultDistribution: GradeDistributionItem[];
}

export default function SebaranNilaiDosen({ gradeDistributionByMk, defaultDistribution }: SebaranNilaiDosenProps) {
  // Select the first MK by default, or empty if none available
  const [selectedMk, setSelectedMk] = useState<string>(
    gradeDistributionByMk.length > 0 ? gradeDistributionByMk[0].kodeMk : ''
  );

  // When the default Mk changes (e.g., initial load or data changes), update the selection if needed
  useEffect(() => {
    if (gradeDistributionByMk.length > 0 && !gradeDistributionByMk.find(mk => mk.kodeMk === selectedMk)) {
      setSelectedMk(gradeDistributionByMk[0].kodeMk);
    }
  }, [gradeDistributionByMk, selectedMk]);

  const currentDistribution =
    gradeDistributionByMk.find(mk => mk.kodeMk === selectedMk)?.distribution || defaultDistribution;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-1 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <PieChartIcon className="w-5 h-5 text-gray-500 mr-2" />
          <h3 className="text-lg font-bold text-gray-800">Sebaran Nilai</h3>
        </div>
      </div>
      
      {gradeDistributionByMk.length > 0 ? (
        <div className="mb-4">
          <label htmlFor="mk-select" className="sr-only">Pilih Mata Kuliah</label>
          <select
            id="mk-select"
            value={selectedMk}
            onChange={(e) => setSelectedMk(e.target.value)}
            className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
          >
            {gradeDistributionByMk.map((mk) => (
              <option key={mk.kodeMk} value={mk.kodeMk}>
                {mk.kodeMk} - {mk.namaMk}
              </option>
            ))}
          </select>
        </div>
      ) : null}

      <div className="flex-grow flex items-center justify-center">
        <GradeDistributionChart data={currentDistribution} />
      </div>
    </div>
  );
}
