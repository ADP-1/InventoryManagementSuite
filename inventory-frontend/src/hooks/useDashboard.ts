import { useQuery } from '@tanstack/react-query';
import axiosInstance from '../api/axiosInstance';
import { ApiResponse } from '../types/common.types';

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  totalInvoices: number;
  totalRevenue: number;
  pendingInvoices: number;
  lowStockProducts: number;
  monthlyRevenue: MonthlyRevenue[];
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/dashboard/stats');
      return response.data.data;
    },
  });
};
