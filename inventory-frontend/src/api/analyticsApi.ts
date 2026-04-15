import axiosInstance from './axiosInstance';
import { 
  SummaryStats, 
  RevenueTrendPoint, 
  InvoiceStatusBreakdown, 
  TopProduct, 
  MonthlyRevenue, 
  LowStockItem,
  InvoiceResponse 
} from '../types/analytics.types';
import { ApiResponse } from '../types/common.types';

export const analyticsApi = {
  getSummary: async () => {
    const response = await axiosInstance.get<ApiResponse<SummaryStats>>('/analytics/summary');
    return response.data;
  },
  getRevenueTrend: async (days: number = 30) => {
    const response = await axiosInstance.get<ApiResponse<RevenueTrendPoint[]>>('/analytics/revenue-trend', {
      params: { days }
    });
    return response.data;
  },
  getInvoiceStatusBreakdown: async () => {
    const response = await axiosInstance.get<ApiResponse<InvoiceStatusBreakdown[]>>('/analytics/invoice-status-breakdown');
    return response.data;
  },
  getTopProducts: async (limit: number = 5) => {
    const response = await axiosInstance.get<ApiResponse<TopProduct[]>>('/analytics/top-products', {
      params: { limit }
    });
    return response.data;
  },
  getMonthlyRevenue: async (months: number = 6) => {
    const response = await axiosInstance.get<ApiResponse<MonthlyRevenue[]>>('/analytics/monthly-revenue', {
      params: { months }
    });
    return response.data;
  },
  getLowStock: async (threshold: number = 10) => {
    const response = await axiosInstance.get<ApiResponse<LowStockItem[]>>('/analytics/low-stock', {
      params: { threshold }
    });
    return response.data;
  },
  getRecentInvoices: async (limit: number = 5) => {
    const response = await axiosInstance.get<ApiResponse<InvoiceResponse[]>>('/analytics/recent-invoices', {
      params: { limit }
    });
    return response.data;
  }
};
