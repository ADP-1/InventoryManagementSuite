import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Trash2, Search, Calculator } from 'lucide-react';
import { InvoiceRequest } from '../../types/invoice.types';
import { useCustomers } from '../../hooks/useCustomers';
import { useProducts } from '../../hooks/useProducts';
import { cn, formatCurrency } from '../../lib/utils';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Select product'),
    quantity: z.coerce.number().min(1, 'Min 1'),
    price: z.number(), // for display/calc
    name: z.string(), // for display
  })).min(1, 'Add at least one item'),
  taxPercent: z.coerce.number().min(0).max(100),
  discount: z.coerce.number().min(0),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  onSubmit: (data: InvoiceRequest) => Promise<void>;
  onClose: () => void;
  isSubmitting?: boolean;
}

const InvoiceForm: React.FC<InvoiceFormProps> = ({ onSubmit, onClose, isSubmitting }) => {
  const { customers } = useCustomers({ size: 1000 });
  const { products } = useProducts({ size: 1000 });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema) as any,
    defaultValues: {
      items: [],
      taxPercent: 18,
      discount: 0,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedTax = watch("taxPercent");
  const watchedDiscount = watch("discount");

  const totals = useMemo(() => {
    const subtotal = watchedItems.reduce((acc, item) => {
      const itemTotal = Number.parseFloat((item.price * item.quantity).toFixed(2));
      return acc + itemTotal;
    }, 0);
    
    const taxAmount = Number.parseFloat((subtotal * (watchedTax / 100)).toFixed(2));
    const rawTotal = subtotal + taxAmount - watchedDiscount;
    const total = Math.max(0, Number.parseFloat(rawTotal.toFixed(2)));
    
    return { 
      subtotal: Number.parseFloat(subtotal.toFixed(2)), 
      taxAmount, 
      total 
    };
  }, [watchedItems, watchedTax, watchedDiscount]);

  const handleProductSelect = (index: number, productId: string) => {
    const product = products?.content.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.price`, product.price);
      setValue(`items.${index}.name`, product.name);
    }
  };

  const onFormSubmit = (values: InvoiceFormValues) => {
    const request: InvoiceRequest = {
      customerId: values.customerId,
      items: values.items.map(item => ({ productId: item.productId, quantity: item.quantity })),
      taxPercent: values.taxPercent,
      discount: values.discount,
      notes: values.notes,
    };
    onSubmit(request);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Create New Invoice</h3>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Billing Module</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 shadow-sm">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Search size={14} className="mr-2" />
                Customer Details
              </h4>
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Select Customer</label>
                <select
                  {...register('customerId')}
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                >
                  <option value="">Choose a customer...</option>
                  {customers?.content.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                </select>
                {errors.customerId && <p className="mt-1.5 text-xs font-medium text-red-600 ml-1">{errors.customerId.message}</p>}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Calculator size={14} className="mr-2" />
                Invoice Options
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tax (%)</label>
                  <input
                    type="number"
                    {...register('taxPercent')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Discount (₹)</label>
                  <input
                    type="number"
                    {...register('discount')}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 outline-none transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Line Items</h4>
              <button
                type="button"
                onClick={() => append({ productId: '', quantity: 1, price: 0, name: '' })}
                className="flex items-center px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 text-xs font-bold transition-all active:scale-95"
              >
                <Plus size={14} className="mr-1.5" />
                Add Item
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-1/2">Product</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-24">Qty</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unit Price</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <select
                          {...register(`items.${index}.productId`)}
                          onChange={(e) => handleProductSelect(index, e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm transition-all"
                        >
                          <option value="">Select product...</option>
                          {products?.content.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="number"
                          {...register(`items.${index}.quantity`)}
                          className="w-20 px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 text-sm">
                        {formatCurrency(watchedItems[index]?.price || 0)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                        {formatCurrency((watchedItems[index]?.price || 0) * (watchedItems[index]?.quantity || 0))}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {fields.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-slate-400 text-sm italic">
                        No items added. Click "Add Item" to start billing.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Notes (Optional)</label>
            <textarea
              {...register('notes')}
              rows={2}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-600/20 outline-none text-sm resize-none transition-all"
              placeholder="Add terms, bank details, or internal notes..."
            />
          </div>
        </form>

        <div className="p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="grid grid-cols-3 gap-8 w-full md:w-auto text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Subtotal</p>
              <p className="text-lg font-medium">{formatCurrency(totals.subtotal)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tax ({watchedTax}%)</p>
              <p className="text-lg font-medium text-indigo-400">+{formatCurrency(totals.taxAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Discount</p>
              <p className="text-lg font-medium text-red-400">-{formatCurrency(watchedDiscount)}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Grand Total</p>
              <p className="text-3xl font-black text-white">{formatCurrency(totals.total)}</p>
            </div>
            <button
              onClick={handleSubmit(onFormSubmit)}
              disabled={isSubmitting || fields.length === 0}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-900/50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />}
              Generate Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceForm;
