import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { MonthlyRevenue } from '../../../types/analytics.types';
import { formatCurrency } from '../../../lib/utils';

interface MonthlyRevenueChartProps {
  data?: MonthlyRevenue[];
  isLoading: boolean;
}

const MonthlyRevenueChart: React.FC<MonthlyRevenueChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="h-[220px] bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // Ensure data is sorted by year and month
  const chartData = [...(data || [])].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.monthNumber - b.monthNumber;
  });

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-slate-900 font-bold text-lg mb-6">Monthly Comparison</h3>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000) + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Legend 
              verticalAlign="top" 
              align="right"
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-600 ml-1">
                  {value === 'revenue' ? 'This Year' : 'Prev Year'}
                </span>
              )}
            />
            <Bar 
              dataKey="revenue" 
              fill="#14b8a6" 
              radius={[4, 4, 0, 0]} 
              barSize={12}
            />
            <Bar 
              dataKey="prevYearRevenue" 
              fill="#6366f1" 
              fillOpacity={0.4} 
              radius={[4, 4, 0, 0]} 
              barSize={12}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MonthlyRevenueChart;
