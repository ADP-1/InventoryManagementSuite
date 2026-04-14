import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryApi } from '../api/categoryApi';
import { CategoryRequest } from '../types/category.types';
import { PageParams } from '../types/common.types';

export const useCategories = (params?: PageParams) => {
  const queryClient = useQueryClient();

  const categoriesQuery = useQuery({
    queryKey: ['categories', params],
    queryFn: () => categoryApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryRequest) => categoryApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryRequest }) => categoryApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    categories: categoriesQuery.data?.data,
    isLoading: categoriesQuery.isLoading,
    isError: categoriesQuery.isError,
    error: categoriesQuery.error,
    createCategory: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCategory: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCategory: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCategoryById = (id: string) => {
  return useQuery({
    queryKey: ['category', id],
    queryFn: () => categoryApi.getById(id),
    enabled: !!id,
  });
};
