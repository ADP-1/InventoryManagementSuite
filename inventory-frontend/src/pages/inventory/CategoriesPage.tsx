import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../../components/shared/PageHeader';
import DataTable from '../../components/shared/DataTable';
import CategoryForm from '../../components/forms/CategoryForm';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useCategories } from '../../hooks/useCategories';
import { CategoryRequest, CategoryResponse } from '../../types/category.types';
import { useAuthStore } from '../../store/authStore';
import { cn, formatDate } from '../../lib/utils';

const CategoriesPage: React.FC = () => {
  const [params, setParams] = useState({ page: 0, size: 10 });
  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting 
  } = useCategories(params);
  
  const { role } = useAuthStore();
  const isCashier = role === 'CASHIER';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryResponse | undefined>();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleCreate = async (data: CategoryRequest) => {
    try {
      await createCategory(data);
      toast.success('Category created successfully');
      setIsModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (data: CategoryRequest) => {
    if (!editingCategory) return;
    try {
      await updateCategory({ id: editingCategory.id, data });
      toast.success('Category updated successfully');
      setIsModalOpen(false);
      setEditingCategory(undefined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCategory(deletingId);
      toast.success('Category deleted successfully');
      setDeletingId(null);
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof CategoryResponse, className: "font-semibold text-slate-900" },
    { header: 'Description', accessor: 'description' as keyof CategoryResponse },
    { 
      header: 'Status', 
      accessor: (item: CategoryResponse) => (
        <span className={cn(
          "px-2.5 py-0.5 rounded-full text-xs font-bold",
          item.active ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        )}>
          {item.active ? 'ACTIVE' : 'INACTIVE'}
        </span>
      )
    },
    { 
      header: 'Created At', 
      accessor: (item: CategoryResponse) => formatDate(item.createdAt)
    },
    {
      header: 'Actions',
      accessor: (item: CategoryResponse) => (
        <div className="flex items-center space-x-2">
          {!isCashier && (
            <button 
              onClick={() => { setEditingCategory(item); setIsModalOpen(true); }}
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
      ),
      className: "w-20"
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Product Categories" 
        description="Organize your inventory with hierarchical categories"
      >
        {!isCashier && (
          <button 
            onClick={() => { setEditingCategory(undefined); setIsModalOpen(true); }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold shadow-sm transition-all active:scale-95"
          >
            <Plus size={18} className="mr-2" />
            Add Category
          </button>
        )}
      </PageHeader>

      <DataTable 
        columns={columns}
        data={categories?.content}
        isLoading={isLoading}
        pageNumber={categories?.pageNumber}
        totalPages={categories?.totalPages}
        onPageChange={(page) => setParams(prev => ({ ...prev, page }))}
      />

      {isModalOpen && (
        <CategoryForm 
          initialData={editingCategory}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onClose={() => { setIsModalOpen(false); setEditingCategory(undefined); }}
          isSubmitting={isCreating || isUpdating}
        />
      )}

      <ConfirmDialog 
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        message="Are you sure you want to delete this category? This will not remove products under it, but the category will be marked as inactive."
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CategoriesPage;
