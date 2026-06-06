'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface GradeData {
  grade: string;
  count: number;
}

interface GradeDistributionChartProps {
  data: GradeData[];
}

const COLORS = ['#4ade80', '#60a5fa', '#facc15', '#f87171', '#9ca3af'];

export default function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">Data nilai belum tersedia</div>;
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="count"
            nameKey="grade"
            label={({ grade, percent }) => `${grade} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} Mata Kuliah`, 'Jumlah']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
