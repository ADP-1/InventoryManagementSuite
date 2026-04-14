import axiosInstance from './axiosInstance';
import { CustomerRequest, CustomerResponse } from '../types/customer.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const customerApi = {
  getAll: async (params?: PageParams & { search?: string }) => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<CustomerResponse>>>('/customers', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<CustomerResponse>>(`/customers/${id}`);
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
};
