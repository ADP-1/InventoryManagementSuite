import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerApi } from '../api/customerApi';
import { CustomerRequest } from '../types/customer.types';
import { PageParams } from '../types/common.types';

export const useCustomers = (params?: PageParams & { search?: string }) => {
  const queryClient = useQueryClient();

  const customersQuery = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomerRequest) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CustomerRequest }) => customerApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customerApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    customers: customersQuery.data?.data,
    isLoading: customersQuery.isLoading,
    isError: customersQuery.isError,
    error: customersQuery.error,
    createCustomer: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCustomer: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCustomer: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
};

export const useCustomerById = (id: string) => {
  return useQuery({
    queryKey: ['customer', id],
    queryFn: () => customerApi.getById(id),
    enabled: !!id,
  });
};
