import axiosInstance from './axiosInstance';
import { CategoryRequest, CategoryResponse } from '../types/category.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const categoryApi = {
  getAll: async (params?: PageParams) => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<CategoryResponse>>>('/inventory/categories', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<CategoryResponse>>(`/inventory/categories/${id}`);
    return response.data;
  },
  create: async (data: CategoryRequest) => {
    const response = await axiosInstance.post<ApiResponse<CategoryResponse>>('/inventory/categories', data);
    return response.data;
  },
  update: async (id: string, data: CategoryRequest) => {
    const response = await axiosInstance.put<ApiResponse<CategoryResponse>>(`/inventory/categories/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/inventory/categories/${id}`);
    return response.data;
  },
};
