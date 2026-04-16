import React, { useState, useMemo } from 'react';
import { Package, Users, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useProducts } from '../../hooks/useProducts';
import { cn } from '../../lib/utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const MONTHLY_TARGET = 100000;

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  
  const [activeTab, setActiveTab] = useState<'low-stock' | 'recent'>('low-stock');
  
  // Section 5 - Products hooks for tabs
  const { products: lowStockData, isLoading: isLoadingLowStock } = useProducts({ 
    page: 0, 
    size: 8, 
    sort: 'quantity,asc' 
  });
  
  const { products: recentData, isLoading: isLoadingRecent } = useProducts({ 
    page: 0, 
    size: 8, 
    sort: 'createdAt,desc' 
  });

  const monthlyRevenue = stats?.monthlyRevenue || [];
  
  // Section 1 - Calculate month-over-month change
  const momChange = useMemo(() => {
    if (monthlyRevenue.length < 2) return null;
    const lastMonth = Number(monthlyRevenue[monthlyRevenue.length - 1].revenue);
    const prevMonth = Number(monthlyRevenue[monthlyRevenue.length - 2].revenue);
    if (prevMonth === 0) return null;
    return (((lastMonth - prevMonth) / prevMonth) * 100).toFixed(1);
  }, [monthlyRevenue]);

  // Section 1 & 3 - Chart data formatting (transforming BigDecimal string to Number)
  const chartData = useMemo(() => {
    return monthlyRevenue.map(item => ({
      name: item.month,
      value: Number(item.revenue)
    }));
  }, [monthlyRevenue]);

  // Section 4 - Target Calculations
  const currentMonthRevenue = monthlyRevenue.length > 0 
    ? Number(monthlyRevenue[monthlyRevenue.length - 1].revenue) 
    : 0;

  const progressPct = Math.min((currentMonthRevenue / MONTHLY_TARGET) * 100, 100).toFixed(0);

  const getTargetMessage = (pct: number) => {
    if (pct >= 100) return "Target achieved!";
    if (pct >= 75) return "Almost there, keep going";
    if (pct >= 50) return "Good progress this month";
    return "Early in the month, keep pushing";
  };

  // Section 5 - Avatar Helpers
  const getAvatarStyle = (name: string) => {
    const colors = [
      'bg-orange-100 text-orange-600', 
      'bg-blue-100 text-blue-600', 
      'bg-green-100 text-green-600', 
      'bg-purple-100 text-purple-600', 
      'bg-pink-100 text-pink-600'
    ];
    const index = name.charCodeAt(0) % 5;
    return colors[index];
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  if (isLoadingStats) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Section 1 - Profit Hero Card */}
      <div className="w-full bg-orange-500 rounded-2xl h-[180px] relative overflow-hidden shadow-lg shadow-orange-200 flex items-center">
        {/* Decorative SVG wave */}
        <svg className="absolute bottom-0 left-0 w-full opacity-20 pointer-events-none" viewBox="0 0 1440 320" preserveAspectRatio="none" height="100">
          <path fill="#ffffff" fillOpacity="1" d="M0,160L48,170.7C96,181,192,203,288,192C384,181,480,139,576,133.3C672,128,768,160,864,176C960,192,1056,192,1152,176C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>
        
        <div className="w-full px-8 flex items-center justify-between relative z-10">
          <div className="flex-1">
            <p className="text-white/70 text-[13px] font-medium tracking-wide uppercase mb-1">Total Revenue</p>
            <div className="flex items-center gap-4">
              <h2 className="text-white text-[32px] font-semibold tracking-tight">
                ₹{(stats?.totalRevenue || 0).toLocaleString('en-IN')}
              </h2>
              {momChange !== null ? (
                <span className={cn(
                  "px-2.5 py-1 rounded-full text-xs font-bold flex items-center",
                  Number(momChange) >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {Number(momChange) >= 0 ? '+' : ''}{momChange}%
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                  N/A
                </span>
              )}
            </div>
          </div>
          
          <div className="w-1/3 h-[80px]">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="white" 
                    strokeWidth={2}
                    fill="rgba(255,255,255,0.15)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : null}
          </div>
        </div>
      </div>

      {/* Section 2 - KPI Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 - Total Products */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-slate-100 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <Package size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{stats?.totalProducts || 0}</p>
            <p className="text-sm text-slate-500 font-medium">Total Products</p>
            <p className="text-[10px] text-slate-400 mt-1">Update: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* KPI 2 - Total Customers */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-slate-100 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{stats?.totalCustomers || 0}</p>
            <p className="text-sm text-slate-500 font-medium">Total Customers</p>
          </div>
        </div>

        {/* KPI 3 - Pending Invoices */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-slate-100 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none mb-1">{stats?.pendingInvoices || 0}</p>
            <p className="text-sm text-slate-500 font-medium">Pending Invoices</p>
          </div>
        </div>

        {/* KPI 4 - Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4 border border-slate-100 transition-all hover:shadow-md">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className={cn(
              "text-2xl font-bold leading-none mb-1",
              (stats?.lowStockProducts || 0) > 0 ? "text-red-600" : "text-slate-900"
            )}>
              {stats?.lowStockProducts || 0}
            </p>
            <p className="text-sm text-slate-500 font-medium">Low Stock Alerts</p>
          </div>
        </div>
      </div>

      {/* Layout grid for Section 3 & 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section 3 - Monthly Revenue Chart (col-span-2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Revenue Overview</h3>
            <div className="text-sm font-medium text-slate-500 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
              {new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </div>
          </div>
          
          <div className="h-[240px] w-full">
            {chartData.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center text-slate-400 font-medium">
                No revenue data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(v) => '₹' + (v/1000).toFixed(0) + 'k'}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(v: any) => ['₹' + Number(v).toLocaleString('en-IN'), 'Revenue']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#f97316" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Section 4 - Target Prediction Widget (col-span-1) */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm p-6 border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Monthly Target</h3>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-slate-900">
                  ₹{currentMonthRevenue.toLocaleString('en-IN')}
                </p>
                <p className="text-sm text-slate-500 font-medium mt-1">
                  of ₹{MONTHLY_TARGET.toLocaleString('en-IN')}
                </p>
              </div>
            </div>

            <div className="mt-6 mb-3">
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-orange-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <span className="text-sm font-bold text-orange-600">{progressPct}% achieved</span>
            </div>

            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm font-medium text-orange-800 text-center">
                {getTargetMessage(Number(progressPct))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section 5 - Product List (Bottom, full width) */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-6 px-6 border-b border-slate-100">
          <button
            onClick={() => setActiveTab('low-stock')}
            className={cn(
              "py-4 text-sm transition-colors relative",
              activeTab === 'low-stock' 
                ? "text-orange-600 font-medium" 
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            Low Stock
            {activeTab === 'low-stock' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('recent')}
            className={cn(
              "py-4 text-sm transition-colors relative",
              activeTab === 'recent' 
                ? "text-orange-600 font-medium" 
                : "text-slate-400 hover:text-slate-600 font-medium"
            )}
          >
            Recently Added
            {activeTab === 'recent' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 rounded-t-full" />
            )}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="px-6 py-4 rounded-tl-lg">Product</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4 text-right">{activeTab === 'low-stock' ? 'Stock Status' : 'Date Added'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeTab === 'low-stock' ? (
                isLoadingLowStock ? (
                  <tr><td colSpan={4} className="py-8"><LoadingSpinner /></td></tr>
                ) : !lowStockData?.content || lowStockData.content.filter(p => p.quantity <= 10).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <CheckCircle2 size={32} className="text-green-500 mb-3" />
                        <p className="font-medium text-slate-900">All products are well stocked</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  lowStockData.content.filter(p => p.quantity <= 10).map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", getAvatarStyle(product.name))}>
                            {getInitials(product.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {product.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={cn(
                          "inline-flex px-2.5 py-1 rounded-full text-xs font-bold",
                          product.quantity <= 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                        )}>
                          {product.quantity} left
                        </span>
                      </td>
                    </tr>
                  ))
                )
              ) : (
                isLoadingRecent ? (
                  <tr><td colSpan={4} className="py-8"><LoadingSpinner /></td></tr>
                ) : !recentData?.content || recentData.content.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <p className="font-medium text-slate-500">No recent products</p>
                    </td>
                  </tr>
                ) : (
                  recentData.content.map(product => (
                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0", getAvatarStyle(product.name))}>
                            {getInitials(product.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{product.name}</p>
                            <p className="text-xs text-slate-500">{product.sku}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium">
                          {product.categoryName}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        ₹{product.price.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500 font-medium">
                        {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;