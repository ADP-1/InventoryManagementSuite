import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analyticsApi';

const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useSummaryStats = () => {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: () => analyticsApi.getSummary(),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useRevenueTrend = (days: number = 30) => {
  return useQuery({
    queryKey: ['analytics', 'revenue-trend', days],
    queryFn: () => analyticsApi.getRevenueTrend(days),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useInvoiceStatusBreakdown = () => {
  return useQuery({
    queryKey: ['analytics', 'status-breakdown'],
    queryFn: () => analyticsApi.getInvoiceStatusBreakdown(),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useTopProducts = (limit: number = 5) => {
  return useQuery({
    queryKey: ['analytics', 'top-products', limit],
    queryFn: () => analyticsApi.getTopProducts(limit),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useMonthlyRevenue = (months: number = 6) => {
  return useQuery({
    queryKey: ['analytics', 'monthly-revenue', months],
    queryFn: () => analyticsApi.getMonthlyRevenue(months),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useLowStock = (threshold: number = 10) => {
  return useQuery({
    queryKey: ['analytics', 'low-stock', threshold],
    queryFn: () => analyticsApi.getLowStock(threshold),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};

export const useRecentInvoices = (limit: number = 5) => {
  return useQuery({
    queryKey: ['analytics', 'recent-invoices', limit],
    queryFn: () => analyticsApi.getRecentInvoices(limit),
    staleTime: DEFAULT_STALE_TIME,
    refetchOnWindowFocus: false,
  });
};
