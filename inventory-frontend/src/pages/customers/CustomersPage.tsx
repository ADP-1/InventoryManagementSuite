import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, UserCircle, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import CustomerForm from '../../components/forms/CustomerForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useCustomers } from '../../hooks/useCustomers';
import { customerApi } from '../../api/customerApi';
import { CustomerRequest, CustomerResponse } from '../../types/customer.types';
import { useAuthStore } from '../../store/authStore';
import { cn, formatDate } from '../../lib/utils';

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
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
      toast.success('Customer registered successfully');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
    }
  };

  const handleUpdate = async (data: CustomerRequest) => {
    if (!editingCustomer) return;
    try {
      await updateCustomer({ id: editingCustomer.id, data });
      toast.success('Customer details updated');
      setIsModalOpen(false);
      setEditingCustomer(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Update failed');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCustomer(deletingId);
      toast.success('Customer marked as inactive');
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  const handleExportCsv = async () => {
    const loadingToast = toast.loading('Exporting customers...');
    try {
      await customerApi.exportCsv();
      toast.success('Customers exported successfully', { id: loadingToast });
    } catch (err: any) {
      toast.error('Export failed', { id: loadingToast });
    }
  };

  const columns = [
    { 
      header: 'Customer', 
      accessor: (item: CustomerResponse) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold text-xs">
            {item.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{item.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{item.email}</p>
          </div>
        </div>
      )
    },
    { header: 'Phone', accessor: 'phone' as keyof CustomerResponse },
    { 
      header: 'Status', 
      accessor: (item: CustomerResponse) => (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
          item.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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
          <button 
            onClick={(e) => { e.stopPropagation(); navigate(`/customers/${item.id}`); }}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
            title="View Details"
          >
            <UserCircle size={16} />
          </button>
          {!isCashier && (
            <>
              <button 
                onClick={(e) => { e.stopPropagation(); setEditingCustomer(item); setIsModalOpen(true); }}
                className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all"
                title="Edit Customer"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Delete Customer"
              >
                <Trash2 size={16} />
              </button>
            </>
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
        {!isCashier && (
          <div className="flex gap-3">
            <button 
              onClick={handleExportCsv}
              className="flex items-center px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:bg-slate-900/50 font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Download size={18} className="mr-2 text-orange-500" />
              Export CSV
            </button>
            <button 
              onClick={() => { setEditingCustomer(undefined); setIsModalOpen(true); }}
              className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold text-sm shadow-lg shadow-orange-200 transition-all active:scale-95"
            >
              <Plus size={18} className="mr-2" />
              Add Customer
            </button>
          </div>
        )}
      </PageHeader>

      <div className="mb-6">
        <div className="relative max-w-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="block w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
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
        onRowClick={(item: CustomerResponse) => navigate(`/customers/${item.id}`)}
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
