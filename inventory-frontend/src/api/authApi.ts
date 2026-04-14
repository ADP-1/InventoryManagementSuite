import axiosInstance from './axiosInstance';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { ApiResponse } from '../types/common.types';

export const authApi = {
  login: async (data: LoginRequest) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data;
  },
  register: async (data: RegisterRequest) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data;
  },
  refresh: async (refreshToken: string) => {
    const response = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/refresh', { refreshToken });
    return response.data;
  },
};
