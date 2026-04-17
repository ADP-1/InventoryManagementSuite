import React, { useState } from 'react';
import PageHeader from '../../components/shared/PageHeader';
import SummaryCards from './components/SummaryCards';
import RevenueTrendChart from './components/RevenueTrendChart';
import InvoiceStatusChart from './components/InvoiceStatusChart';
import DailyRevenueBarChart from './components/DailyRevenueBarChart';
import TopProductsChart from './components/TopProductsChart';
import RecentInvoicesTable from './components/RecentInvoicesTable';
import { 
  useSummaryStats, 
  useRevenueTrend, 
  useInvoiceStatusBreakdown, 
  useTopProducts, 
  useRecentInvoices 
} from '../../hooks/useAnalytics';
import { Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../store/authStore';

const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const { role } = useAuthStore();

  // Role Guard: CASHIER cannot access analytics
  if (role === 'CASHIER') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-rose-100">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
          You don't have the required permissions to view the analytics dashboard. Please contact your administrator for access.
        </p>
        <button 
          onClick={() => window.history.back()}
          className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Queries
  const summaryQuery = useSummaryStats();
  const trendQuery = useRevenueTrend(days);
  const statusQuery = useInvoiceStatusBreakdown();
  const topProductsQuery = useTopProducts(5);
  const recentInvoicesQuery = useRecentInvoices(5);

  const ErrorState = ({ onRetry }: { onRetry: () => void }) => (
    <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
      <AlertCircle className="text-slate-400 mb-3" size={24} />
      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">Failed to load data</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 dark:bg-slate-900/50 transition-all inline-flex items-center gap-2"
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <PageHeader 
          title="Analytics" 
          description="Real-time business insights and performance metrics" 
        />
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm self-start sm:self-auto">
          <div className="px-3 py-1.5 text-slate-400">
            <Calendar size={18} />
          </div>
          {[7, 30, 90].map((option) => (
            <button
              key={option}
              onClick={() => setDays(option)}
              className={cn(
                "px-4 py-1.5 text-sm font-bold rounded-lg transition-all",
                days === option 
                  ? "bg-orange-500 text-white shadow-md shadow-orange-100" 
                  : "text-slate-500 dark:text-slate-400 hover:text-orange-600 hover:bg-orange-50"
              )}
            >
              {option} Days
            </button>
          ))}
        </div>
      </div>

      {summaryQuery.isError ? (
        <ErrorState onRetry={() => summaryQuery.refetch()} />
      ) : (
        <SummaryCards 
          data={summaryQuery.data?.data} 
          isLoading={summaryQuery.isLoading} 
        />
      )}

      {trendQuery.isError ? (
        <ErrorState onRetry={() => trendQuery.refetch()} />
      ) : (
        <RevenueTrendChart 
          data={trendQuery.data?.data} 
          isLoading={trendQuery.isLoading} 
          days={days} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          {statusQuery.isError ? (
            <ErrorState onRetry={() => statusQuery.refetch()} />
          ) : (
            <InvoiceStatusChart 
              data={statusQuery.data?.data} 
              isLoading={statusQuery.isLoading} 
            />
          )}
        </div>
        <div className="lg:col-span-2">
          {trendQuery.isError ? (
            <ErrorState onRetry={() => trendQuery.refetch()} />
          ) : (
            <DailyRevenueBarChart 
              data={trendQuery.data?.data} 
              isLoading={trendQuery.isLoading} 
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {topProductsQuery.isError ? (
          <ErrorState onRetry={() => topProductsQuery.refetch()} />
        ) : (
          <TopProductsChart 
            data={topProductsQuery.data?.data} 
            isLoading={topProductsQuery.isLoading} 
          />
        )}
        
        {recentInvoicesQuery.isError ? (
          <ErrorState onRetry={() => recentInvoicesQuery.refetch()} />
        ) : (
          <RecentInvoicesTable 
            data={recentInvoicesQuery.data?.data} 
            isLoading={recentInvoicesQuery.isLoading} 
          />
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;