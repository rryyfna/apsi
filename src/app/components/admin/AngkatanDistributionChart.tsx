'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AngkatanData {
  angkatan: string;
  count: number;
}

interface AngkatanDistributionChartProps {
  data: AngkatanData[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#ef4444', '#f59e0b', '#6366f1'];

export default function AngkatanDistributionChart({ data }: AngkatanDistributionChartProps) {
  if (!data || data.length === 0) {
    return <div className="text-gray-500 text-center py-8">Data mahasiswa belum tersedia</div>;
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
            nameKey="angkatan"
            label={({ angkatan, percent }) => `${angkatan} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => [`${value} Mahasiswa`, 'Jumlah']}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
