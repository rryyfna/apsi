'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CourseData {
  course: string;
  students: number;
}

interface CourseEnrollmentChartProps {
  data: CourseData[];
}

export default function CourseEnrollmentChart({ data }: CourseEnrollmentChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">Data pendaftar mata kuliah belum tersedia</div>;
  }

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis 
            dataKey="course" 
            tick={{ fontSize: 12 }} 
            interval={0}
            tickFormatter={(value) => value.length > 10 ? value.substring(0, 10) + '...' : value}
          />
          <YAxis allowDecimals={false} />
          <Tooltip 
            cursor={{ fill: '#f3f4f6' }}
            formatter={(value: any) => [`${value} Mahasiswa`, 'Jumlah']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
          <Bar dataKey="students" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Pendaftar Terbanyak" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
