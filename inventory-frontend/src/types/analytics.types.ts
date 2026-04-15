import { InvoiceResponse } from './invoice.types';

export interface SummaryStats {
  totalRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthPercent: number;
  totalInvoices: number;
  invoicesThisWeek: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
}

export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export interface InvoiceStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  productSku: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  month: string;
  year: number;
  monthNumber: number;
  revenue: number;
  prevYearRevenue: number;
}

export interface LowStockItem {
  productId: string;
  productName: string;
  sku: string;
  currentQuantity: number;
  categoryName: string;
}

export { type InvoiceResponse };
