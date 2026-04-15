import axiosInstance from './axiosInstance';
import { InvoiceRequest, InvoiceResponse, InvoiceStatus } from '../types/invoice.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const invoiceApi = {
  getAll: async (params?: PageParams & { status?: InvoiceStatus; customerId?: string }) => {
    const url = params?.status ? `/billing/invoices/status/${params.status}` : '/billing/invoices';
    const { status, ...restParams } = params || {};
    const response = await axiosInstance.get<ApiResponse<PagedResponse<InvoiceResponse>>>(url, { params: restParams });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<InvoiceResponse>>(`/billing/invoices/${id}`);
    return response.data;
  },
  create: async (data: InvoiceRequest) => {
    const response = await axiosInstance.post<ApiResponse<InvoiceResponse>>('/billing/invoices', data);
    return response.data;
  },
  confirm: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<InvoiceResponse>>(`/billing/invoices/${id}/confirm`);
    return response.data;
  },
  markAsPaid: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<InvoiceResponse>>(`/billing/invoices/${id}/pay`);
    return response.data;
  },
  cancel: async (id: string) => {
    const response = await axiosInstance.patch<ApiResponse<InvoiceResponse>>(`/billing/invoices/${id}/cancel`);
    return response.data;
  },
  getCustomerHistory: async (customerId: string, params?: PageParams) => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<InvoiceResponse>>>(`/billing/invoices/customer/${customerId}`, { params });
    return response.data;
  },
  downloadPdf: async (id: string, invoiceNumber: string) => {
    const response = await axiosInstance.get(`/billing/invoices/${id}/pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${invoiceNumber}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  exportCsv: async (params?: { status?: InvoiceStatus; from?: string; to?: string }) => {
    const response = await axiosInstance.get('/export/invoices.csv', {
      params,
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'invoices.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
