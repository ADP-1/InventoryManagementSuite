import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { InvoiceStatusBreakdown } from '../../../types/analytics.types';

interface InvoiceStatusChartProps {
  data?: InvoiceStatusBreakdown[];
  isLoading: boolean;
}

const COLORS = {
  PAID: '#f97316',      // orange-500
  ISSUED: '#3b82f6',    // blue-500
  CANCELLED: '#ef4444', // red-500
  DRAFT: '#94a3b8',     // slate-400
};

const InvoiceStatusChart: React.FC<InvoiceStatusChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3 mb-6" />
        <div className="h-[240px] bg-slate-100 dark:bg-slate-800/50 rounded-full w-[240px] mx-auto" />
      </div>
    );
  }

  const total = data?.reduce((acc, item) => acc + item.count, 0) || 0;

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
      <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-6">Invoice Status</h3>
      
      <div className="h-[240px] w-full relative">
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-slate-900 dark:text-white">{total}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Total</span>
        </div>
        
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={5}
              dataKey="count"
              nameKey="status"
              stroke="none"
            >
              {data?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[entry.status as keyof typeof COLORS] || '#cbd5e1'} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any, name: any) => {
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return [`${value} (${percentage}%)`, name];
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 ml-1 capitalize">
                  {value.toLowerCase()}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default InvoiceStatusChart;
