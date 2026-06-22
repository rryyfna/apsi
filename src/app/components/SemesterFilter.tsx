'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function SemesterFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSemester = searchParams.get('semester') || '';

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      router.push(`?semester=${val}`);
    } else {
      router.push('?');
    }
  };

  return (
    <select 
      value={currentSemester}
      onChange={handleChange}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none bg-white text-sm"
    >
      <option value="">Semua Semester</option>
      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
        <option key={s} value={s}>Semester {s}</option>
      ))}
    </select>
  );
}
