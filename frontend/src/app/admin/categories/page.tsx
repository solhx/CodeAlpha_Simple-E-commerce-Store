'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Tags,
  Search,
  Package,
  AlertCircle
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  productCount: number;
  isActive: boolean;
}

// Default categories based on your Product model enum
const defaultCategories: Category[] = [
  { _id: '1', name: 'Electronics', slug: 'electronics', description: 'Gadgets, devices, and tech products', productCount: 0, isActive: true },
  { _id: '2', name: 'Clothing', slug: 'clothing', description: 'Fashion and apparel', productCount: 0, isActive: true },
  { _id: '3', name: 'Home', slug: 'home', description: 'Home and garden products', productCount: 0, isActive: true },
  { _id: '4', name: 'Books', slug: 'books', description: 'Books and publications', productCount: 0, isActive: true },
  { _id: '5', name: 'Sports', slug: 'sports', description: 'Sports and fitness equipment', productCount: 0, isActive: true },
  { _id: '6', name: 'Beauty', slug: 'beauty', description: 'Beauty and personal care', productCount: 0, isActive: true },
  { _id: '7', name: 'Toys', slug: 'toys', description: 'Toys and games', productCount: 0, isActive: true },
  { _id: '8', name: 'Other', slug: 'other', description: 'Other products', productCount: 0, isActive: true },
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      // Try to get categories from API
      const response = await productsApi.getCategories();
      const categoryData = response.data?.categories || response.data || [];
      
      if (Array.isArray(categoryData) && categoryData.length > 0) {
        // Get product counts for each category
        const productsResponse = await productsApi.getAll({ limit: 1000 });
        const products = productsResponse.data?.products || [];
        
        // Count products per category
        const categoryCounts: Record<string, number> = {};
        products.forEach((product: any) => {
          const cat = product.category?.toLowerCase() || 'other';
          categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
        });

        // Transform categories
        const transformedCategories = categoryData.map((cat: any, index: number) => {
          const categoryName = typeof cat === 'string' ? cat : cat.name || 'Unknown';
          const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');
          
          return {
            _id: typeof cat === 'object' && cat._id ? cat._id : `cat-${index}`,
            name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
            slug: categorySlug,
            description: typeof cat === 'object' ? cat.description || '' : '',
            productCount: categoryCounts[categorySlug] || categoryCounts[categoryName.toLowerCase()] || 0,
            isActive: typeof cat === 'object' ? cat.isActive !== false : true
          };
        });
        
        setCategories(transformedCategories);
      } else {
        // Use default categories and get product counts
        await loadDefaultCategoriesWithCounts();
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use default categories on error
      await loadDefaultCategoriesWithCounts();
    } finally {
      setIsLoading(false);
    }
  };

  const loadDefaultCategoriesWithCounts = async () => {
    try {
      // Get all products to count per category
      const productsResponse = await productsApi.getAll({ limit: 1000 });
      const products = productsResponse.data?.products || [];
      
      // Count products per category
      const categoryCounts: Record<string, number> = {};
      products.forEach((product: any) => {
        const cat = product.category?.toLowerCase() || 'other';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      // Update default categories with real counts
      const categoriesWithCounts = defaultCategories.map(cat => ({
        ...cat,
        productCount: categoryCounts[cat.slug] || 0
      }));

      setCategories(categoriesWithCounts);
    } catch (error) {
      console.error('Failed to load product counts:', error);
      setCategories(defaultCategories);
    }
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name || '',
        description: category.description || ''
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', description: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setIsSaving(true);
    
    try {
      if (editingCategory) {
        // Update category locally (or call API if you have endpoint)
        setCategories(prev => 
          prev.map(c => 
            c._id === editingCategory._id 
              ? { 
                  ...c, 
                  name: formData.name,
                  slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
                  description: formData.description 
                }
              : c
          )
        );
        toast.success('Category updated successfully');
      } else {
        // Create new category locally
        const newCategory: Category = {
          _id: `cat-${Date.now()}`,
          name: formData.name,
          slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
          description: formData.description,
          productCount: 0,
          isActive: true
        };
        setCategories(prev => [...prev, newCategory]);
        toast.success('Category created successfully');
      }
      handleCloseModal();
    } catch (error) {
      toast.error('Failed to save category');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (categoryId: string, categoryName: string) => {
    // Check if category has products
    const category = categories.find(c => c._id === categoryId);
    if (category && category.productCount > 0) {
      toast.error(`Cannot delete "${categoryName}" - it has ${category.productCount} products`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${categoryName}"?`)) return;
    
    try {
      setCategories(prev => prev.filter(c => c._id !== categoryId));
      toast.success('Category deleted successfully');
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  // Safe filter with null checks
  const filteredCategories = categories.filter(cat => {
    if (!cat || !cat.name) return false;
    return cat.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Calculate total products
  const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage product categories • {categories.length} categories • {totalProducts} products
          </p>
        </div>
        
        <Button onClick={() => handleOpenModal()}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </Card>

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Categories are defined in your product schema. To add new categories permanently, 
            update the category enum in your Product model.
          </p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <Card key={category._id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                    <Tags className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      /{category.slug}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenModal(category)}
                    title="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(category._id, category.name)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete category"
                    disabled={category.productCount > 0}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {category.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                  {category.description}
                </p>
              )}
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Package className="w-4 h-4" />
                  <span>{category.productCount} products</span>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  category.isActive 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </Card>
          ))
        ) : (
          // Empty state
          <div className="col-span-full text-center py-12">
            <Tags className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {searchQuery ? 'No categories found' : 'No categories yet'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? 'Try a different search term' 
                : 'Get started by creating your first category'}
            </p>
            {!searchQuery && (
              <Button onClick={() => handleOpenModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingCategory ? 'Edit Category' : 'Add New Category'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
                required
                autoFocus
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Slug will be auto-generated: /{formData.name.toLowerCase().replace(/\s+/g, '-') || 'category-name'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter category description (optional)"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isSaving}>
                {editingCategory ? 'Update' : 'Create'} Category
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}