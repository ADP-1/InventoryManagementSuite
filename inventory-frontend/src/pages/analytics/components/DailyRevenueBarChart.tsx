import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { RevenueTrendPoint } from '../../../types/analytics.types';
import { formatCurrency } from '../../../lib/utils';

interface DailyRevenueBarChartProps {
  data?: RevenueTrendPoint[];
  isLoading: boolean;
}

const DailyRevenueBarChart: React.FC<DailyRevenueBarChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="h-[220px] bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // Ensure data is sorted by date
  const chartData = [...(data || [])].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-slate-900 font-bold text-lg">Daily Sales Performance</h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
          Revenue / Day
        </span>
      </div>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              }}
              minTickGap={20}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }}
              tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc' }}
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: 'none',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any) => [formatCurrency(value), 'Sales']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            />
            <Bar 
              dataKey="revenue" 
              fill="#f97316" 
              radius={[4, 4, 0, 0]} 
              barSize={Math.max(4, 40 / (chartData.length || 1))}
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.revenue > 0 ? '#f97316' : '#e2e8f0'} 
                  fillOpacity={0.8 + (index / chartData.length) * 0.2}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyRevenueBarChart;