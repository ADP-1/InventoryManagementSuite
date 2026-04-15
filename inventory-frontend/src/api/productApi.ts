import axiosInstance from './axiosInstance';
import { ProductRequest, ProductResponse, StockAdjustmentRequest } from '../types/product.types';
import { ApiResponse, PagedResponse, PageParams } from '../types/common.types';

export const productApi = {
  getAll: async (params?: PageParams & { search?: string }) => {
    if (params?.search) {
      const { search, ...restParams } = params;
      const response = await axiosInstance.get<ApiResponse<PagedResponse<ProductResponse>>>('/inventory/products/search', { 
        params: { keyword: search, ...restParams } 
      });
      return response.data;
    }
    const response = await axiosInstance.get<ApiResponse<PagedResponse<ProductResponse>>>('/inventory/products', { params });
    return response.data;
  },
  getById: async (id: string) => {
    const response = await axiosInstance.get<ApiResponse<ProductResponse>>(`/inventory/products/${id}`);
    return response.data;
  },
  create: async (data: ProductRequest) => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>('/inventory/products', data);
    return response.data;
  },
  update: async (id: string, data: ProductRequest) => {
    const response = await axiosInstance.put<ApiResponse<ProductResponse>>(`/inventory/products/${id}`, data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/inventory/products/${id}`);
    return response.data;
  },
  addStock: async (id: string, data: StockAdjustmentRequest) => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>(`/inventory/products/${id}/stock/add`, data);
    return response.data;
  },
  deductStock: async (id: string, data: StockAdjustmentRequest) => {
    const response = await axiosInstance.post<ApiResponse<ProductResponse>>(`/inventory/products/${id}/stock/deduct`, data);
    return response.data;
  },
  exportCsv: async () => {
    const response = await axiosInstance.get('/export/products.csv', {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
