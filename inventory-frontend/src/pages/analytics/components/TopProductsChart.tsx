import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TopProduct } from '../../../types/analytics.types';
import { formatCurrency } from '../../../lib/utils';

interface TopProductsChartProps {
  data?: TopProduct[];
  isLoading: boolean;
}

const TopProductsChart: React.FC<TopProductsChartProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/4 mb-6" />
        <div className="h-[220px] bg-slate-100 rounded-xl" />
      </div>
    );
  }

  // Pre-process names to truncate
  const chartData = data?.map(item => ({
    ...item,
    displayName: item.productName.length > 15 ? `${item.productName.substring(0, 15)}...` : item.productName
  })) || [];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-slate-900 font-bold text-lg mb-6">Top 5 Products by Revenue</h3>
      
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <XAxis type="number" hide />
            <YAxis 
              dataKey="displayName" 
              type="category" 
              axisLine={false}
              tickLine={false}
              width={100}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#fff', 
                borderRadius: '12px', 
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: any, name: any) => [
                name === 'totalRevenue' ? formatCurrency(value) : value, 
                name === 'totalRevenue' ? 'Revenue' : 'Quantity Sold'
              ]}
              labelClassName="font-bold text-slate-900"
            />
            <Bar 
              dataKey="totalRevenue" 
              radius={[0, 4, 4, 0]}
              barSize={24}
            >
              {chartData.map((_entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="#6366f1" 
                  fillOpacity={1 - index * 0.15} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopProductsChart;
