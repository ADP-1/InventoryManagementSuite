import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, ArrowUpCircle, ArrowDownCircle, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import ProductForm from '../../components/forms/ProductForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useProducts } from '../../hooks/useProducts';
import { productApi } from '../../api/productApi';
import { ProductRequest, ProductResponse, StockAdjustmentRequest } from '../../types/product.types';
import { useAuthStore } from '../../store/authStore';
import { cn, formatCurrency } from '../../lib/utils';

const ProductsPage: React.FC = () => {
  const [params, setParams] = useState({ page: 0, size: 10, search: '' });
  const { 
    products, 
    isLoading, 
    createProduct, 
    updateProduct, 
    deleteProduct,
    addStock,
    deductStock,
    isCreating,
    isUpdating,
    isDeleting,
    isAddingStock,
    isDeductingStock
  } = useProducts(params);
  
  const { role } = useAuthStore();
  const isCashier = role === 'CASHIER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [stockModal, setStockModal] = useState<{ id: string, type: 'ADD' | 'DEDUCT' } | null>(null);
  const [stockAmount, setStockAmount] = useState<number>(0);
  const [stockReason, setStockReason] = useState<string>('');

  const handleCreate = async (data: ProductRequest) => {
    try {
      await createProduct(data);
      toast.success('Product created successfully');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create product');
    }
  };

  const handleUpdate = async (data: ProductRequest) => {
    if (!editingProduct) return;
    try {
      await updateProduct({ id: editingProduct.id, data });
      toast.success('Product updated successfully');
      setIsModalOpen(false);
      setEditingProduct(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteProduct(deletingId);
      toast.success('Product deleted successfully');
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete product');
    }
  };

  const handleStockAdjustment = async () => {
    if (!stockModal) return;
    const data: StockAdjustmentRequest = { quantity: stockAmount, reason: stockReason };
    try {
      if (stockModal.type === 'ADD') {
        await addStock({ id: stockModal.id, data });
        toast.success('Stock added successfully');
      } else {
        await deductStock({ id: stockModal.id, data });
        toast.success('Stock deducted successfully');
      }
      setStockModal(null);
      setStockAmount(0);
      setStockReason('');
    } catch (err: any) {
      toast.error(err.message || 'Stock adjustment failed');
    }
  };

  const handleExportCsv = async () => {
    const loadingToast = toast.loading('Exporting products...');
    try {
      await productApi.exportCsv();
      toast.success('Products exported successfully', { id: loadingToast });
    } catch (err: any) {
      toast.error('Export failed', { id: loadingToast });
    }
  };

  const columns = [
    { 
      header: 'Product', 
      accessor: (item: ProductResponse) => (
        <div>
          <p className="font-semibold text-slate-900">{item.name}</p>
          <p className="text-xs text-slate-500">{item.sku}</p>
        </div>
      )
    },
    { header: 'Category', accessor: 'categoryName' as keyof ProductResponse },
    { 
      header: 'Price', 
      accessor: (item: ProductResponse) => formatCurrency(item.price)
    },
    { 
      header: 'Stock', 
      accessor: (item: ProductResponse) => (
        <div className="flex items-center space-x-2">
          <span className={cn(
            "font-bold",
            item.quantity < 10 ? "text-red-600" : "text-slate-700"
          )}>
            {item.quantity}
          </span>
          {item.quantity < 10 && (
            <span className="px-1.5 py-0.5 bg-red-50 text-red-600 text-[10px] font-bold rounded uppercase">Low</span>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (item: ProductResponse) => (
        <div className="flex items-center space-x-2">
          {!isCashier && (
            <>
              <button 
                onClick={() => setStockModal({ id: item.id, type: 'ADD' })}
                title="Add Stock"
                className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
              >
                <ArrowUpCircle size={16} />
              </button>
              <button 
                onClick={() => setStockModal({ id: item.id, type: 'DEDUCT' })}
                title="Deduct Stock"
                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
              >
                <ArrowDownCircle size={16} />
              </button>
              <button 
                onClick={() => { setEditingProduct(item); setIsModalOpen(true); }}
                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => setDeletingId(item.id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
        title="Inventory Products" 
        description="Manage your product catalog and stock levels"
      >
        {!isCashier && (
          <div className="flex gap-3">
            <button 
              onClick={handleExportCsv}
              className="flex items-center px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 font-bold text-sm shadow-sm transition-all active:scale-95"
            >
              <Download size={18} className="mr-2 text-indigo-600" />
              Export CSV
            </button>
            <button 
              onClick={() => { setEditingProduct(undefined); setIsModalOpen(true); }}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold text-sm shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              <Plus size={18} className="mr-2" />
              Add Product
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
            placeholder="Search by name, SKU or price..."
            className="block w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
            onChange={(e) => setParams(p => ({ ...p, search: e.target.value, page: 0 }))}
          />
        </div>
      </div>

      <DataTable 
        columns={columns}
        data={products?.content}
        isLoading={isLoading}
        pageNumber={products?.pageNumber}
        totalPages={products?.totalPages}
        onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
      />

      {isModalOpen && (
        <ProductForm 
          initialData={editingProduct}
          onSubmit={editingProduct ? handleUpdate : handleCreate}
          onClose={() => { setIsModalOpen(false); setEditingProduct(undefined); }}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      {stockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">
                {stockModal.type === 'ADD' ? 'Add Stock' : 'Deduct Stock'}
              </h3>
              <button onClick={() => setStockModal(null)} className="p-2 text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                  value={stockAmount}
                  onChange={(e) => setStockAmount(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Reason</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-indigo-600"
                  placeholder="e.g. New shipment, Manual adjustment"
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={() => setStockModal(null)} className="px-4 py-2 text-slate-700 font-semibold border rounded-lg">Cancel</button>
                <button 
                  onClick={handleStockAdjustment}
                  disabled={isAddingStock || isDeductingStock}
                  className={cn(
                    "px-4 py-2 text-white font-semibold rounded-lg flex items-center",
                    stockModal.type === 'ADD' ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"
                  )}
                >
                  {(isAddingStock || isDeductingStock) && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />}
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message="Are you sure you want to delete this product? It will be marked as inactive and won't appear in new invoices."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ProductsPage;
