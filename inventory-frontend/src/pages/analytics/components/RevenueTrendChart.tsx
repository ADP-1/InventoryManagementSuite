import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { RevenueTrendPoint } from '../../../types/analytics.types';
import { formatCurrency } from '../../../lib/utils';

interface RevenueTrendChartProps {
  data?: RevenueTrendPoint[];
  isLoading: boolean;
  days: number;
}

const RevenueTrendChart: React.FC<RevenueTrendChartProps> = ({ data, isLoading, days }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="h-[220px] bg-slate-100 dark:bg-slate-800/50 rounded-xl" />
      </div>
    );
  }

  // Ensure data is sorted by date
  const sortedData = [...(data || [])].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">Revenue Trend</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Revenue over the last {days} days</p>
        </div>
      </div>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={sortedData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
              }}
              minTickGap={30}
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
              formatter={(value: any) => [formatCurrency(value), 'Revenue']}
              labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#f97316" 
              strokeWidth={2.5}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueTrendChart;
