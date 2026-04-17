import axiosInstance from './axiosInstance';
import { CustomerRequest, CustomerResponse, CustomerDetailsResponse } from '../types/customer.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const customerApi = {
  getAll: async (params?: PageParams & { search?: string }) => {
    if (params?.search) {
      const { search, ...restParams } = params;
      const response = await axiosInstance.get<ApiResponse<PagedResponse<CustomerResponse>>>('/customers/search', { 
        params: { keyword: search, ...restParams } 
      });
      return response.data;
    }
    const response = await axiosInstance.get<ApiResponse<PagedResponse<CustomerResponse>>>('/customers', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<CustomerDetailsResponse>>(`/customers/${id}`);
    return response.data;
  },
  create: async (data: CustomerRequest) => {
    const response = await axiosInstance.post<ApiResponse<CustomerResponse>>('/customers', data);
    return response.data;
  },
  update: async (id: string, data: CustomerRequest) => {
    const response = await axiosInstance.put<ApiResponse<CustomerResponse>>(`/customers/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/customers/${id}`);
    return response.data;
  },
  exportCsv: async () => {
    const response = await axiosInstance.get('/export/customers.csv', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'customers.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
  exportHistory: async (id: string, customerName: string) => {
    const response = await axiosInstance.get(`/customers/${id}/export/csv`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `transactions-${customerName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
