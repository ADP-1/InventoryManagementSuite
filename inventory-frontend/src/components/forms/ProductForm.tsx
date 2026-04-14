import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { ProductRequest, ProductResponse } from '../../types/product.types';
import { useCategories } from '../../hooks/useCategories';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  sku: z.string().min(3, 'SKU must be at least 3 characters'),
  description: z.string().optional(),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  categoryId: z.string().min(1, 'Category is required'),
});

interface ProductFormProps {
  initialData?: ProductResponse;
  onSubmit: (data: ProductRequest) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialData, onSubmit, onClose, isSubmitting }) => {
  const { categories } = useCategories({ size: 1000 });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductRequest>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData ? {
      name: initialData.name,
      sku: initialData.sku,
      description: initialData.description || '',
      price: initialData.price,
      quantity: initialData.quantity,
      categoryId: initialData.categoryId,
    } : {
      quantity: 0,
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            {initialData ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Product Name
              </label>
              <input
                {...register('name')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                placeholder="e.g. Wireless Mouse"
              />
              {errors.name && <p className="mt-1 text-xs font-medium text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                SKU / Part Number
              </label>
              <input
                {...register('sku')}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                placeholder="e.g. WRL-MSE-001"
              />
              {errors.sku && <p className="mt-1 text-xs font-medium text-red-600">{errors.sku.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Category
            </label>
            <select
              {...register('categoryId')}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all bg-white"
            >
              <option value="">Select a category</option>
              {categories?.content.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="mt-1 text-xs font-medium text-red-600">{errors.categoryId.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Unit Price (₹)
              </label>
              <input
                {...register('price')}
                type="number"
                step="0.01"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                placeholder="0.00"
              />
              {errors.price && <p className="mt-1 text-xs font-medium text-red-600">{errors.price.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Initial Stock
              </label>
              <input
                {...register('quantity')}
                type="number"
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                placeholder="0"
                disabled={!!initialData}
              />
              {errors.quantity && <p className="mt-1 text-xs font-medium text-red-600">{errors.quantity.message}</p>}
              {initialData && <p className="mt-1 text-xs text-slate-400">Stock can be adjusted via 'Add/Deduct' actions</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all resize-none"
              placeholder="Provide a detailed product description"
            />
            {errors.description && <p className="mt-1 text-xs font-medium text-red-600">{errors.description.message}</p>}
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 flex items-center"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
              )}
              {initialData ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
