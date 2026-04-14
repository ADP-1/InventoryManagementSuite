import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { ProductRequest, StockAdjustmentRequest } from '../types/product.types';
import { PageParams } from '../types/common.types';

export const useProducts = (params?: PageParams & { search?: string }) => {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', params],
    queryFn: () => productApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: ProductRequest) => productApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductRequest }) => productApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const addStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockAdjustmentRequest }) => productApi.addStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deductStockMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: StockAdjustmentRequest }) => productApi.deductStock(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    products: productsQuery.data?.data,
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    error: productsQuery.error,
    createProduct: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateProduct: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteProduct: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    addStock: addStockMutation.mutateAsync,
    isAddingStock: addStockMutation.isPending,
    deductStock: deductStockMutation.mutateAsync,
    isDeductingStock: deductStockMutation.isPending,
  };
};

export const useProductById = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: !!id,
  });
};
