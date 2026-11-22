import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Folder,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    productCount: 0
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const categoriesSnap = await getDocs(collection(db, 'categories'));
      const categoriesData = categoriesSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter(category =>
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (category) => {
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
      productCount: category.productCount || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteDoc(doc(db, 'categories', categoryId));
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        toast.error('Failed to delete category');
      }
    }
  };

  const handleSave = async () => {
    try {
      const categoryData = {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await addDoc(collection(db, 'categories'), categoryData);
      toast.success('Category created successfully');

      setShowForm(false);
      setFormData({
        name: '',
        slug: '',
        description: '',
        imageUrl: '',
        productCount: 0
      });
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save category');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      productCount: 0
    });
  };

  if (loading && categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading categories...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Categories</h1>
          <p className="text-tara-gray mt-1">Organize your products by category</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8">
            <Folder className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="border border-tara-beige rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start mb-3">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-16 w-16 object-cover rounded"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-tara-beige rounded flex items-center justify-center">
                        <Package className="h-8 w-8 text-tara-gray" />
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-1 text-tara-gray hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-medium text-tara-black mb-1">{category.name}</h3>
                  <p className="text-sm text-tara-gray mb-2">{category.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-tara-gray">{category.productCount} products</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-tara-beige">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-tara-black">Category</h2>
                <button
                  onClick={closeForm}
                  className="p-1 text-tara-gray hover:text-tara-black transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Category Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="e.g., Necklaces"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Slug</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="necklaces"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}