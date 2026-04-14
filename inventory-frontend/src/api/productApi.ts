import axiosInstance from './axiosInstance';
import { ProductRequest, ProductResponse, StockAdjustmentRequest } from '../types/product.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const productApi = {
  getAll: async (params?: PageParams & { search?: string }) => {
    const response = await axiosInstance.get<ApiResponse<PagedResponse<ProductResponse>>>('/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<ProductResponse>>(`/products/${id}`);
    return response.data;
  },
  create: async (data: ProductRequest) => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>('/products', data);
    return response.data;
  },
  update: async (id: string, data: ProductRequest) => {
    const response = await axiosInstance.put<ApiResponse<ProductResponse>>(`/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  },
  addStock: async (id: string, data: StockAdjustmentRequest) => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>(`/products/${id}/stock/add`, data);
    return response.data;
  },
  deductStock: async (id: string, data: StockAdjustmentRequest) => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>(`/products/${id}/stock/deduct`, data);
    return response.data;
  },
};
