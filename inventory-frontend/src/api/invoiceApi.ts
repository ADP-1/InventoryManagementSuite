import axiosInstance from './axiosInstance';
import { InvoiceRequest, InvoiceResponse, InvoiceStatus } from '../types/invoice.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const invoiceApi = {
  getAll: async (params?: PageParams & { status?: InvoiceStatus; customerId?: string }) => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<InvoiceResponse>>>('/invoices', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<InvoiceResponse>>(`/invoices/${id}`);
    return response.data;
  },
  create: async (data: InvoiceRequest) => {
    const response = await axiosInstance.post<ApiResponse<InvoiceResponse>>('/invoices', data);
    return response.data;
  },
  confirm: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<InvoiceResponse>>(`/invoices/${id}/confirm`);
    return response.data;
  },
  markAsPaid: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<InvoiceResponse>>(`/invoices/${id}/pay`);
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<InvoiceResponse>>(`/invoices/${id}/cancel`);
    return response.data;
  },
  getCustomerHistory: async (customerId: string, params?: PageParams) => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<InvoiceResponse>>>(`/invoices/customer/${customerId}`, { params });
    return response.data;
  },
};
