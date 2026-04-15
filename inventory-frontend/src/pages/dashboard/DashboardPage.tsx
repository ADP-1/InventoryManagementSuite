import React from 'react';
import { Box, Users, FileText, AlertTriangle, TrendingUp, Clock, Package } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import PageHeader from '../../components/shared/PageHeader';
import { useDashboardStats } from '../../hooks/useDashboard';
import { useProducts } from '../../hooks/useProducts';
import { cn, formatCurrency } from '../../lib/utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description?: string;
  className?: string;
  isLoading?: boolean;
  trend?: {
    value: string;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, description, className, isLoading, trend }) => (
  <div className={cn("bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow", className)}>
    <div className="flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        {isLoading ? (
          <div className="h-9 w-32 bg-slate-100 animate-pulse rounded mt-1" />
        ) : (
          <h3 className="text-3xl font-bold text-slate-900">{value}</h3>
        )}
        <div className="flex items-center gap-2 mt-2">
          {trend && (
            <span className={cn(
              "text-xs font-bold px-1.5 py-0.5 rounded flex items-center",
              trend.isPositive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
            )}>
              {trend.isPositive ? '+' : '-'}{trend.value}
            </span>
          )}
          {description && <p className="text-xs text-slate-400 font-medium">{description}</p>}
        </div>
      </div>
      <div className={cn(
        "p-4 rounded-2xl shadow-sm", 
        className?.includes('border-red') ? "bg-red-50 text-red-600" : 
        className?.includes('border-amber') ? "bg-amber-50 text-amber-600" :
        "bg-indigo-50 text-indigo-600"
      )}>
        <Icon size={24} strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const DashboardPage: React.FC = () => {
  const { data: stats, isLoading: isLoadingStats } = useDashboardStats();
  const { products: lowStockData, isLoading: isLoadingLowStock } = useProducts({ size: 5 }); // Reuse products hook for the table

  // Sort monthly revenue to ensure order if not handled by backend perfectly
  const chartData = stats?.monthlyRevenue || [];

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard Overview" 
        description="Real-time analytics and inventory performance metrics"
      />

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats?.totalRevenue || 0)} 
          icon={TrendingUp} 
          isLoading={isLoadingStats}
          description="From paid invoices"
          className="border-l-4 border-l-emerald-500"
        />
        <StatCard 
          title="Pending Invoices" 
          value={stats?.pendingInvoices || 0} 
          icon={Clock} 
          isLoading={isLoadingStats}
          description="Awaiting payment"
          className="border-l-4 border-l-blue-500"
        />
        <StatCard 
          title="Low Stock" 
          value={stats?.lowStockProducts || 0} 
          icon={AlertTriangle} 
          isLoading={isLoadingStats}
          className={cn(
            "border-l-4",
            (stats?.lowStockProducts || 0) > 0 ? "border-l-red-500 bg-red-50/10" : "border-l-slate-300"
          )}
          description="Requires restock"
        />
        <StatCard 
          title="Total Customers" 
          value={stats?.totalCustomers || 0} 
          icon={Users} 
          isLoading={isLoadingStats}
          description="Active client base"
          className="border-l-4 border-l-indigo-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Revenue Performance</h3>
              <p className="text-sm text-slate-500">Monthly sales trend for the last 6 months</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
              <div className="w-2 h-2 rounded-full bg-indigo-500" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Income</span>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            {isLoadingStats ? (
              <div className="h-full w-full flex items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '16px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                      padding: '12px'
                    }}
                    formatter={(value: any) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Inventory Summary */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-2">Inventory Mix</h3>
          <p className="text-sm text-slate-500 mb-8">Stock distribution overview</p>
          
          <div className="flex-1 flex flex-col justify-center">
            {isLoadingStats ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-xl shadow-sm text-indigo-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Total Products</p>
                      <p className="text-xs text-slate-500">{stats?.totalCategories} Categories</p>
                    </div>
                  </div>
                  <p className="text-xl font-black text-slate-900">{stats?.totalProducts}</p>
                </div>

                <div className="p-6 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Stock Health</p>
                  <div className="flex items-end gap-2">
                    <h4 className="text-3xl font-black">
                      {stats && stats.totalProducts > 0 
                        ? Math.round(((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100)
                        : 0}%
                    </h4>
                    <p className="text-sm font-medium mb-1.5 opacity-90">Optimal levels</p>
                  </div>
                  <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-white rounded-full transition-all duration-1000" 
                      style={{ width: `${stats && stats.totalProducts > 0 ? ((stats.totalProducts - stats.lowStockProducts) / stats.totalProducts) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="text-amber-500" size={20} />
              Stock Replenishment Required
            </h3>
            <p className="text-sm text-slate-500">Products currently below the minimum threshold</p>
          </div>
          <button className="text-indigo-600 text-sm font-bold hover:underline">View All Inventory</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-8 py-4">Product Details</th>
                <th className="px-8 py-4">Category</th>
                <th className="px-8 py-4">Price</th>
                <th className="px-8 py-4 text-center">Current Stock</th>
                <th className="px-8 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoadingLowStock ? (
                <tr><td colSpan={5} className="py-12"><LoadingSpinner /></td></tr>
              ) : lowStockData?.content.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">All stock levels are healthy</td></tr>
              ) : (
                lowStockData?.content.filter(p => p.quantity <= 10).map(product => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5">
                      <p className="font-bold text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">{product.sku}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                        {product.categoryName}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-semibold text-slate-700">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={cn(
                        "text-lg font-black",
                        product.quantity <= 5 ? "text-red-600" : "text-amber-600"
                      )}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        product.quantity <= 5 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {product.quantity <= 5 ? 'Critical' : 'Low Stock'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
