import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, FileText, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import CustomerForm from '../../components/forms/CustomerForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useCustomers } from '../../hooks/useCustomers';
import { useCustomerInvoices } from '../../hooks/useInvoices';
import { customerApi } from '../../api/customerApi';
import { CustomerRequest, CustomerResponse } from '../../types/customer.types';
import { useAuthStore } from '../../store/authStore';
import { cn, formatDate, formatCurrency } from '../../lib/utils';

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
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);

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
        <div>
          <p className="font-semibold text-slate-900 dark:text-white">{item.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{item.email}</p>
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
            onClick={() => setViewingHistoryId(item.id)}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
            title="Invoice History"
          >
            <FileText size={16} />
          </button>
          {!isCashier && (
            <>
              <button 
                onClick={() => { setEditingCustomer(item); setIsModalOpen(true); }}
                className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                title="Edit Customer"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => setDeletingId(item.id)}
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
      />

      {isModalOpen && (
        <CustomerForm 
          initialData={editingCustomer}
          onSubmit={editingCustomer ? handleUpdate : handleCreate}
          onClose={() => { setIsModalOpen(false); setEditingCustomer(undefined); }}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      {viewingHistoryId && (
        <CustomerHistoryModal 
          customerId={viewingHistoryId} 
          onClose={() => setViewingHistoryId(null)} 
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

interface HistoryModalProps {
  customerId: string;
  onClose: () => void;
}

const CustomerHistoryModal: React.FC<HistoryModalProps> = ({ customerId, onClose }) => {
  const { data: response, isLoading } = useCustomerInvoices(customerId);
  const invoices = response?.data.content || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Invoice History</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-300">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-12 flex justify-center"><div className="w-8 h-8 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" /></div>
          ) : invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map(inv => (
                <div key={inv.id} className="p-4 border border-slate-100 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:bg-slate-900/50 transition-colors flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{inv.invoiceNumber}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(inv.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-500">{formatCurrency(inv.total)}</p>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
                      inv.status === 'PAID' ? "bg-green-100 text-green-700" :
                      inv.status === 'ISSUED' ? "bg-blue-100 text-blue-700" :
                      inv.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-200"
                    )}>
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">No invoices found for this customer.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomersPage;
