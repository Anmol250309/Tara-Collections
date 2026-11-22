import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    discountPrice: '',
    category: '',
    subcategories: [],
    sizes: [],
    colors: [],
    stock: '',
    images: []
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsData = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      slug: product.slug || '',
      description: product.description || '',
      price: product.price || '',
      discountPrice: product.discountPrice || '',
      category: product.category || '',
      subcategories: product.subcategories || [],
      sizes: product.sizes || [],
      colors: product.colors || [],
      stock: product.stock || '',
      images: product.images || []
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteDoc(doc(db, 'products', productId));
        toast.success('Product deleted successfully');
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      }
    }
  };

  const handleSave = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        discountPrice: formData.discountPrice ? parseFloat(formData.discountPrice) : null,
        stock: parseInt(formData.stock) || 0,
        sizes: formData.sizes.split(',').map(s => s.trim()),
        colors: formData.colors.split(',').map(c => c.trim()),
        subcategories: formData.subcategories.split(',').map(s => s.trim()),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), productData);
        toast.success('Product updated successfully');
      } else {
        await addDoc(collection(db, 'products'), productData);
        toast.success('Product created successfully');
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        subcategories: [],
        sizes: [],
        colors: [],
        stock: '',
        images: []
      });
      fetchProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: '',
      discountPrice: '',
      category: '',
      subcategories: [],
      sizes: [],
      colors: [],
      stock: '',
      images: []
    });
  };

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Products</h1>
          <p className="text-tara-gray mt-1">Manage your product catalog</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-6 text-center">
            <Package className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tara-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Price</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Stock</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tara-beige">
                <AnimatePresence>
                  {filteredProducts.map((product) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-tara-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-10 w-10 object-cover rounded"
                            />
                          ) : (
                            <div className="h-10 w-10 bg-tara-beige rounded flex items-center justify-center">
                              <Package className="h-5 w-5 text-tara-gray" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-tara-black">{product.name}</p>
                            <p className="text-sm text-tara-gray">{product.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-tara-gray">
                        {product.id}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-medium text-tara-black">₹{product.price || 0}</span>
                        {product.discountPrice && (
                          <span className="text-sm text-tara-gray line-through ml-2">₹{product.discountPrice}</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.stock > 0 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {product.stock} in stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {product.isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-tara-gray mx-auto" />
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 text-tara-gray hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-tara-beige">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-tara-black">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1 text-tara-gray hover:text-tara-black transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Product Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="Enter product name"
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
                    placeholder="product-slug"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Product description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Discount Price (₹)</label>
                  <input
                    type="number"
                    name="discountPrice"
                    value={formData.discountPrice}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="Optional"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Stock</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Category</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="e.g., Necklaces"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Sizes</label>
                  <input
                    type="text"
                    name="sizes"
                    value={formData.sizes.join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, sizes: e.target.value }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="S, M, L, XL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Colors</label>
                <input
                  type="text"
                  name="colors"
                  value={formData.colors.join(', ')}
                  onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Gold, Silver, Rose Gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Image URLs (comma separated)</label>
                <input
                  type="text"
                  name="images"
                  value={formData.images.join(', ')}
                  onChange={(e) => setFormData(prev => ({ ...prev, images: e.target.value }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
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
                  <span>Save Product</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}