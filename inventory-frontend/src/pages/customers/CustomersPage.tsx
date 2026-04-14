import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText } from 'lucide-react';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import CustomerForm from '../../components/forms/CustomerForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useCustomers } from '../../hooks/useCustomers';
import { CustomerRequest, CustomerResponse } from '../../types/customer.types';
import { useAuthStore } from '../../store/authStore';
import { cn, formatDate } from '../../lib/utils';

const CustomersPage: React.FC = () => {
  const [params, setParams] = useState({ page: 0, size: 10, search: '' });
  const { 
    customers, 
    isLoading, 
    createCustomer, 
    updateCustomer, 
    deleteCustomer,
    isCreating,
    isUpdating,
    isDeleting 
  } = useCustomers(params);
  
  const { role } = useAuthStore();
  const isCashier = role === 'CASHIER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerResponse | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (data: CustomerRequest) => {
    try {
      await createCustomer(data);
      setIsModalOpen(false);
    } catch (err) {}
  };

  const handleUpdate = async (data: CustomerRequest) => {
    if (!editingCustomer) return;
    try {
      await updateCustomer({ id: editingCustomer.id, data });
      setIsModalOpen(false);
      setEditingCustomer(undefined);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCustomer(deletingId);
      setDeletingId(null);
    } catch (err) {}
  };

  const columns = [
    { 
      header: 'Customer', 
      accessor: (item: CustomerResponse) => (
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500">{item.email}</p>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' as keyof CustomerResponse },
    { 
      header: 'Status', 
      accessor: (item: CustomerResponse) => (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-bold",
          item.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {item.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    { 
      header: 'Joined', 
      accessor: (item: CustomerResponse) => formatDate(item.createdAt)
    },
    {
      header: 'Actions',
      accessor: (item: CustomerResponse) => (
        <div className="flex items-center space-x-2">
          {!isCashier && (
            <button 
              onClick={() => { setEditingCustomer(item); setIsModalOpen(true); }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            >
              <Edit2 size={16} />
            </button>
          )}
          {!isCashier && (
            <button 
              onClick={() => setDeletingId(item.id)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Customer Directory" 
        description="Manage your customer base and view their history"
      >
        <button 
          onClick={() => { setEditingCustomer(undefined); setIsModalOpen(true); }}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} className="mr-2" />
          Add Customer
        </button>
      </PageHeader>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
            onChange={(e) => setParams(p => ({ ...p, search: e.target.value, page: 0 }))}
          />
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={customers?.content}
        isLoading={isLoading}
        pageNumber={customers?.pageNumber}
        totalPages={customers?.totalPages}
        onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
      />

      {isModalOpen && (
        <CustomerForm 
          initialData={editingCustomer}
          onSubmit={editingCustomer ? handleUpdate : handleCreate}
          onClose={() => { setIsModalOpen(false); setEditingCustomer(undefined); }}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      <ConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message="Are you sure you want to delete this customer? This action cannot be undone and will mark the customer as inactive."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CustomersPage;
