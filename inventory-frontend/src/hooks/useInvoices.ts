import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '../api/invoiceApi';
import { InvoiceRequest, InvoiceStatus } from '../types/invoice.types';
import { PageParams } from '../types/common.types';

export const useInvoices = (params?: PageParams & { status?: InvoiceStatus; customerId?: string }) => {
  const queryClient = useQueryClient();

  const invoicesQuery = useQuery({
    queryKey: ['invoices', params],
    queryFn: () => invoiceApi.getAll(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: InvoiceRequest) => invoiceApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const confirmMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const payMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.markAsPaid(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => invoiceApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  return {
    invoices: invoicesQuery.data?.data,
    isLoading: invoicesQuery.isLoading,
    isError: invoicesQuery.isError,
    error: invoicesQuery.error,
    createInvoice: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    confirmInvoice: confirmMutation.mutateAsync,
    isConfirming: confirmMutation.isPending,
    payInvoice: payMutation.mutateAsync,
    isPaying: payMutation.isPending,
    cancelInvoice: cancelMutation.mutateAsync,
    isCancelling: cancelMutation.isPending,
  };
};

export const useInvoiceById = (id: string) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => invoiceApi.getById(id),
    enabled: !!id,
  });
};

export const useCustomerInvoices = (customerId: string, params?: PageParams) => {
  return useQuery({
    queryKey: ['customer-invoices', customerId, params],
    queryFn: () => invoiceApi.getCustomerHistory(customerId, params),
    enabled: !!customerId,
  });
};
