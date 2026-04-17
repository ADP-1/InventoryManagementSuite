import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  CreditCard, 
  FileText, 
  Download,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Receipt,
  History
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerApi } from '../../api/customerApi';
import { invoiceApi } from '../../api/invoiceApi';
import { CustomerDetailsResponse } from '../../types/customer.types';
import { InvoiceResponse } from '../../types/invoice.types';
import { PagedResponse } from '../../types/common.types';
import { cn, formatDate, formatCurrency } from '../../lib/utils';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

const CustomerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [customerData, setCustomerData] = useState<CustomerDetailsResponse | null>(null);
  const [invoices, setInvoices] = useState<PagedResponse<InvoiceResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  useEffect(() => {
    if (id) {
      fetchCustomerDetails();
      fetchInvoiceHistory(0);
    }
  }, [id]);

  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await customerApi.getById(id!);
      if (res.success && res.data) {
        setCustomerData(res.data);
      } else {
        setError(res.message || 'Customer not found');
      }
    } catch (err: any) {
      console.error('Failed to fetch customer details', err);
      setError('An error occurred while fetching customer details.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInvoiceHistory = async (pageNumber: number) => {
    try {
      setIsInvoicesLoading(true);
      const res = await invoiceApi.getCustomerHistory(id!, { page: pageNumber, size: 8 });
      if (res.success && res.data) {
        setInvoices(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch invoice history', err);
      toast.error('Failed to load transaction history');
    } finally {
      setIsInvoicesLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchInvoiceHistory(newPage);
  };

  const handleDownloadPdf = async (invoiceId: string, invoiceNumber: string) => {
    const loadingToast = toast.loading(`Downloading ${invoiceNumber}...`);
    try {
      await invoiceApi.downloadPdf(invoiceId, invoiceNumber);
      toast.success('Invoice downloaded', { id: loadingToast });
    } catch (err) {
      toast.error('Download failed', { id: loadingToast });
    }
  };

  const handleExportHistory = async () => {
    if (!customerData) return;
    try {
      setIsExporting(true);
      const loadingToast = toast.loading('Generating transaction record...');
      await customerApi.exportHistory(id!, customerData.profile.name);
      toast.success('Transaction history exported', { id: loadingToast });
    } catch (err) {
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center py-20">
        <LoadingSpinner size={40} />
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Loading customer profile...</p>
      </div>
    );
  }

  if (error || !customerData) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
        <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <History size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{error || 'Customer Not Found'}</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8">The customer record you're looking for might have been removed or is unavailable.</p>
        <button 
          onClick={() => navigate('/customers')}
          className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-all shadow-lg shadow-orange-200"
        >
          Back to Customers
        </button>
      </div>
    );
  }

  const { profile, stats } = customerData;
  const initials = profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8 pb-12">
      {/* Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/customers')}
            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-orange-500 transition-all hover:shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 font-black text-lg">
              {initials}
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{profile.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn(
                  "px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider",
                  profile.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                )}>
                  {profile.active ? 'Active' : 'Inactive'}
                </span>
                <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">• Customer Profile</span>
              </div>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleExportHistory}
          disabled={isExporting || (invoices?.totalElements === 0)}
          className="flex items-center px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg disabled:opacity-50"
        >
          <Download size={18} className="mr-2" />
          Export All Transactions
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 dark:bg-orange-500/5 rounded-full group-hover:scale-110 transition-transform" />
          <TrendingUp className="text-orange-500 mb-4" size={24} />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Spent</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(stats?.totalSpent ?? 0)}
          </h4>
          <p className="text-xs text-slate-400 mt-2 font-medium">Lifetime purchase value</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 dark:bg-blue-500/5 rounded-full group-hover:scale-110 transition-transform" />
          <Receipt className="text-blue-500 mb-4" size={24} />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Total Invoices</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats?.totalInvoices ?? 0}
          </h4>
          <p className="text-xs text-slate-400 mt-2 font-medium">Successful transactions</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 dark:bg-green-500/5 rounded-full group-hover:scale-110 transition-transform" />
          <Calendar className="text-green-500 mb-4" size={24} />
          <p className="text-sm font-bold text-slate-500 dark:text-slate-400">First Transaction</p>
          <h4 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {stats?.firstTransactionDate ? formatDate(stats.firstTransactionDate) : 'N/A'}
          </h4>
          <p className="text-xs text-slate-400 mt-2 font-medium">Customer since day one</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Contact Info Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Contact Info</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 break-all">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.phone || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Address</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{profile.address || 'No address saved'}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-50 dark:border-slate-700 flex items-start gap-4">
                <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-400">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatDate(profile.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transaction History Table */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Transaction History</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">Detailed list of all invoices issued to this customer</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              {isInvoicesLoading ? (
                <div className="py-20 flex justify-center"><LoadingSpinner size={32} /></div>
              ) : invoices && invoices.content.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-900/30">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                    {invoices.content.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors">{inv.invoiceNumber}</p>
                          <p className="text-[10px] text-slate-400 font-medium">Order #{inv.id.slice(0, 8)}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatDate(inv.createdAt)}</p>
                        </td>
                        <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-white">
                          {formatCurrency(inv.total)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider inline-block",
                            inv.status === 'PAID' ? "bg-green-100 text-green-700" :
                            inv.status === 'ISSUED' ? "bg-blue-100 text-blue-700" :
                            inv.status === 'CANCELLED' ? "bg-red-100 text-red-700" : "bg-slate-100 dark:bg-slate-900/50 text-slate-500"
                          )}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button 
                            onClick={() => handleDownloadPdf(inv.id, inv.invoiceNumber)}
                            className="p-2 text-slate-400 hover:text-orange-500 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all hover:shadow-sm"
                            title="Download PDF"
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="py-20 text-center">
                  <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-slate-300 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Receipt size={32} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 dark:text-white">No transactions found</h4>
                  <p className="text-sm text-slate-400 font-medium">This customer hasn't placed any orders yet.</p>
                </div>
              )}
            </div>

            {/* Pagination Footer */}
            {invoices && invoices.totalPages > 1 && (
              <div className="px-6 py-4 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-50 dark:border-slate-700 flex items-center justify-between">
                <p className="text-xs text-slate-400 font-bold">
                  Page <span className="text-slate-900 dark:text-white">{page + 1}</span> of {invoices.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={page === 0}
                    onClick={() => handlePageChange(page - 1)}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-orange-500 disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <button 
                    disabled={page === invoices.totalPages - 1}
                    onClick={() => handlePageChange(page + 1)}
                    className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 hover:text-orange-500 disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailsPage;
