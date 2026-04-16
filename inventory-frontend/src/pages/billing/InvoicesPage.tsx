import React, { useState } from 'react';
import { Plus, CheckCircle, CreditCard, XCircle, Search, Eye, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import InvoiceForm from '../../components/forms/InvoiceForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useInvoices } from '../../hooks/useInvoices';
import { invoiceApi } from '../../api/invoiceApi';
import { InvoiceRequest, InvoiceResponse, InvoiceStatus } from '../../types/invoice.types';
import { useAuthStore } from '../../store/authStore';
import { cn, formatDate, formatCurrency } from '../../lib/utils';

const InvoicesPage: React.FC = () => {
  const [params, setParams] = useState<{ page: number, size: number, status?: InvoiceStatus }>({ page: 0, size: 10 });
  const { 
    invoices, 
    isLoading, 
    createInvoice, 
    confirmInvoice, 
    payInvoice, 
    cancelInvoice,
    isCreating,
    isConfirming,
    isPaying,
    isCancelling 
  } = useInvoices(params);
  
  const { role } = useAuthStore();
  const isCashier = role === 'CASHIER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceResponse | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ id: string, type: 'CONFIRM' | 'PAY' | 'CANCEL' } | null>(null);

  const handleCreate = async (data: InvoiceRequest) => {
    try {
      await createInvoice(data);
      toast.success('Invoice created successfully');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create invoice');
    }
  };

  const handleDownloadPdf = async (id: string, invoiceNumber: string) => {
    const loadingToast = toast.loading('Generating PDF...');
    try {
      await invoiceApi.downloadPdf(id, invoiceNumber);
      toast.success('Invoice downloaded', { id: loadingToast });
    } catch (err: any) {
      toast.error('Failed to download invoice', { id: loadingToast });
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.type === 'CONFIRM') {
        await confirmInvoice(confirmAction.id);
        toast.success('Invoice confirmed and issued');
      }
      if (confirmAction.type === 'PAY') {
        await payInvoice(confirmAction.id);
        toast.success('Invoice marked as paid');
      }
      if (confirmAction.type === 'CANCEL') {
        await cancelInvoice(confirmAction.id);
        toast.success('Invoice cancelled');
      }
      setConfirmAction(null);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${confirmAction.type.toLowerCase()} invoice`);
    }
  };

  const columns = [
    { 
      header: 'Invoice #', 
      accessor: (item: InvoiceResponse) => (
        <span className="font-bold text-slate-900">{item.invoiceNumber}</span>
      )
    },
    { header: 'Customer', accessor: 'customerName' as keyof InvoiceResponse },
    { 
      header: 'Date', 
      accessor: (item: InvoiceResponse) => formatDate(item.createdAt)
    },
    { 
      header: 'Total', 
      accessor: (item: InvoiceResponse) => (
        <span className="font-bold text-slate-900">{formatCurrency(item.total)}</span>
      )
    },
    { 
      header: 'Status', 
      accessor: (item: InvoiceResponse) => (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider",
          item.status === 'PAID' ? "bg-green-100 text-green-700" :
          item.status === 'ISSUED' ? "bg-blue-100 text-blue-700" :
          item.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
        )}>
          {item.status}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (item: InvoiceResponse) => (
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setSelectedInvoice(item)}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <button 
            onClick={() => handleDownloadPdf(item.id, item.invoiceNumber)}
            className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
            title="Download PDF"
          >
            <Download size={16} />
          </button>
          
          {item.status === 'DRAFT' && (
            <button 
              onClick={() => setConfirmAction({ id: item.id, type: 'CONFIRM' })}
              className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              title="Confirm Invoice"
            >
              <CheckCircle size={16} />
            </button>
          )}
          
          {item.status === 'ISSUED' && (
            <button 
              onClick={() => setConfirmAction({ id: item.id, type: 'PAY' })}
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              title="Mark as Paid"
            >
              <CreditCard size={16} />
            </button>
          )}
          
          {(item.status === 'DRAFT' || item.status === 'ISSUED') && (
            <button 
              onClick={() => setConfirmAction({ id: item.id, type: 'CANCEL' })}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Cancel Invoice"
            >
              <XCircle size={16} />
            </button>
          )}
        </div>
      )
    }
  ];

  const statusTabs: { label: string, value?: InvoiceStatus }[] = [
    { label: 'All' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Issued', value: 'ISSUED' },
    { label: 'Paid', value: 'PAID' },
    { label: 'Cancelled', value: 'CANCELLED' },
  ];

  return (
    <div>
      <PageHeader 
        title="Billing & Invoices" 
        description="Generate and manage customer invoices"
      >
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              const loadingToast = toast.loading('Exporting invoices...');
              try {
                await invoiceApi.exportCsv({ status: params.status });
                toast.success('Invoices exported successfully', { id: loadingToast });
              } catch (err: any) {
                toast.error('Export failed', { id: loadingToast });
              }
            }}
            className="flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm transition-all active:scale-95"
          >
            <Download size={18} className="mr-2 text-orange-500" />
            Export CSV
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-bold text-sm shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            Create Invoice
          </button>
        </div>
      </PageHeader>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
          {statusTabs.map(tab => (
            <button
              key={tab.label}
              onClick={() => setParams(p => ({ ...p, status: tab.value, page: 0 }))}
              className={cn(
                "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                params.status === tab.value ? "bg-white text-orange-500 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={invoices?.content}
        isLoading={isLoading}
        pageNumber={invoices?.pageNumber}
        totalPages={invoices?.totalPages}
        onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
      />

      {isModalOpen && (
        <InvoiceForm 
          onSubmit={handleCreate}
          onClose={() => setIsModalOpen(false)}
          isSubmitting={isCreating}
        />
      )}

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-slate-900">Invoice {selectedInvoice.invoiceNumber}</h3>
              <button onClick={() => setSelectedInvoice(null)} className="p-2 text-slate-400 hover:text-slate-600"><XCircle size={20} /></button>
            </div>
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Customer</p>
                  <p className="font-bold text-slate-900">{selectedInvoice.customerName}</p>
                  <p className="text-sm text-slate-500">{selectedInvoice.customerEmail}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Status</p>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-black uppercase",
                    selectedInvoice.status === 'PAID' ? "bg-green-100 text-green-700" :
                    selectedInvoice.status === 'ISSUED' ? "bg-blue-100 text-blue-700" :
                    selectedInvoice.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-700"
                  )}>
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>
              
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2 text-left">Item</th>
                      <th className="px-4 py-2 text-center">Qty</th>
                      <th className="px-4 py-2 text-right">Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 font-medium">{item.productName}</td>
                        <td className="px-4 py-3 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>{formatCurrency(selectedInvoice.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Tax ({selectedInvoice.taxPercent}%)</span>
                    <span className="text-orange-500">+{formatCurrency(selectedInvoice.tax)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Discount</span>
                    <span className="text-red-600">-{formatCurrency(selectedInvoice.discount)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-lg text-slate-900">
                    <span>Total</span>
                    <span>{formatCurrency(selectedInvoice.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleConfirmAction}
        title={`${confirmAction?.type} Invoice`}
        message={`Are you sure you want to ${confirmAction?.type.toLowerCase()} this invoice? This action will update the invoice status and cannot be reversed.`}
        isLoading={isConfirming || isPaying || isCancelling}
        type={confirmAction?.type === 'CANCEL' ? 'danger' : 'info'}
      />
    </div>
  );
};

export default InvoicesPage;
