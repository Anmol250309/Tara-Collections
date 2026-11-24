import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Edit2, Trash2, Eye, Loader2, ChevronLeft, ChevronRight, Image, Tag, ToggleLeft, ToggleRight, X, Check, Upload, Download } from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory } from '../../services/products'
import toast from 'react-hot-toast'

function AdminProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState(initialFormState)
  const [images, setImages] = useState([])
  const [imagePreviews, setImagePreviews] = useState([])
  const [deletedImageUrls, setDeletedImageUrls] = useState([])

  const initialFormState = {
    name: '',
    description: '',
    category: '',
    brand: '',
    sellingPrice: '',
    originalPrice: '',
    stock: '',
    sku: '',
    featured: false,
    trending: false,
    bestSeller: false,
    newArrival: false,
    tags: ''
  }

  useEffect(() => {
    fetchCategories()
    fetchProducts(true)
  }, [])

  const fetchCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setProducts([])
      setLastDoc(null)
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const result = await getProducts({
        limit: 20,
        lastDoc: reset ? null : lastDoc,
        category: categoryFilter || undefined
      })
      let filteredProducts = result.products
      if (search) {
        const term = search.toLowerCase()
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(term) ||
          p.category?.toLowerCase().includes(term) ||
          p.brand?.toLowerCase().includes(term)
        )
      }
      setProducts(prev => reset ? filteredProducts : [...prev, ...filteredProducts])
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchProducts(true)
  }

  const handleCategoryFilter = (category) => {
    setCategoryFilter(category)
    fetchProducts(true)
  }

  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData(initialFormState)
    setImages([])
    setImagePreviews([])
    setDeletedImageUrls([])
    setShowModal(true)
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category || '',
      brand: product.brand || '',
      sellingPrice: product.sellingPrice?.toString() || '',
      originalPrice: product.originalPrice?.toString() || '',
      stock: product.stock?.toString() || '',
      sku: product.sku || '',
      featured: product.featured || false,
      trending: product.trending || false,
      bestSeller: product.bestSeller || false,
      newArrival: product.newArrival || false,
      tags: product.tags?.join(', ') || ''
    })
    setImages([])
    setImagePreviews(product.images?.map(url => ({ url, existing: true })) || [])
    setDeletedImageUrls([])
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData(initialFormState)
    setImages([])
    setImagePreviews([])
    setDeletedImageUrls([])
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const newImages = [...images, ...files]
    if (newImages.length > 10) {
      toast.error('Maximum 10 images allowed')
      return
    }
    setImages(newImages)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, { url: e.target.result, existing: false }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    const preview = imagePreviews[index]
    if (preview.existing) {
      setDeletedImageUrls(prev => [...prev, preview.url])
    }
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const productData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        brand: formData.brand.trim(),
        sellingPrice: parseFloat(formData.sellingPrice),
        originalPrice: parseFloat(formData.originalPrice) || parseFloat(formData.sellingPrice),
        stock: parseInt(formData.stock) || 0,
        sku: formData.sku.trim(),
        featured: formData.featured,
        trending: formData.trending,
        bestSeller: formData.bestSeller,
        newArrival: formData.newArrival,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData, images, deletedImageUrls)
        toast.success('Product updated successfully')
      } else {
        await createProduct(productData, images)
        toast.success('Product created successfully')
      }

      closeModal()
      fetchProducts(true)
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Failed to save product')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    try {
      await deleteProduct(productId)
      toast.success('Product deleted')
      fetchProducts(true)
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Failed to delete product')
    }
  }

  const handleToggleStatus = async (product, field) => {
    try {
      await updateProduct(product.id, { [field]: !product[field] }, [], [])
      toast.success(`${field} status updated`)
      fetchProducts(true)
    } catch (error) {
      console.error('Error updating product:', error)
      toast.error('Failed to update status')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2">Products</h1>
            <p className="text-body text-dark-500 mt-1">Manage your product catalog</p>
          </div>
          <button className="btn-primary" disabled>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-primary-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-3/4" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/3" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/4" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-dark-100 rounded w-24" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2">Products</h1>
          <p className="text-body text-dark-500 mt-1">Manage your product catalog ({products.length} products)</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Product
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search products..."
            className="input pl-12"
          />
        </div>
        <div className="flex items-center gap-4">
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="input w-auto py-2"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-primary-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-dark-500">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg overflow-hidden bg-primary-50 flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-300">
                              <Image className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-dark-950 truncate max-w-xs">{product.name}</p>
                          <p className="text-xs text-dark-500">ID: {product.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="badge-primary">{product.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark-950">₹{product.sellingPrice?.toLocaleString()}</p>
                        {product.originalPrice > product.sellingPrice && (
                          <p className="text-sm text-dark-400 line-through">₹{product.originalPrice?.toLocaleString()}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-yellow-600' : 'text-red-600'} font-medium`}>
                        {product.stock || 0}
                      </span>
                      {product.stock <= 10 && product.stock > 0 && (
                        <span className="ml-2 badge-warning text-xs">Low Stock</span>
                      )}
                      {product.stock <= 0 && (
                        <span className="ml-2 badge-danger text-xs">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {product.featured && <span className="badge badge-warning">Featured</span>}
                        {product.trending && <span className="badge badge-primary">Trending</span>}
                        {product.bestSeller && <span className="badge badge-success">Best Seller</span>}
                        {product.newArrival && <span className="badge badge-primary">New</span>}
                        {!product.featured && !product.trending && !product.bestSeller && !product.newArrival && (
                          <span className="badge badge">Regular</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="btn-ghost p-2"
                          aria-label="Edit product"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                          aria-label="Delete product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="px-6 py-4 border-t border-dark-100">
            <button
              onClick={() => fetchProducts(false)}
              disabled={loadingMore}
              className="btn-outline w-full"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                'Load More Products'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
            <div className="p-6 border-b border-dark-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="heading-3">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button
                onClick={closeModal}
                className="text-dark-400 hover:text-dark-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="font-semibold text-dark-950 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Product Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="input"
                      required
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="label">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="input"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Brand</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="input"
                      placeholder="Brand name"
                    />
                  </div>
                  <div>
                    <label className="label">SKU</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                      className="input"
                      placeholder="Stock Keeping Unit"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="input"
                      rows={4}
                      placeholder="Product description..."
                    />
                  </div>
                </div>
              </div>

              {/* Pricing & Inventory */}
              <div>
                <h3 className="font-semibold text-dark-950 mb-4">Pricing & Inventory</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Selling Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                      className="input"
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Original Price (₹)</label>
                    <input
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                      className="input"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="label">Stock Quantity *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="input"
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Product Tags */}
              <div>
                <h3 className="font-semibold text-dark-950 mb-4">Product Tags</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.trending}
                      onChange={(e) => setFormData({...formData, trending: e.target.checked})}
                      className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">Trending</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.bestSeller}
                      onChange={(e) => setFormData({...formData, bestSeller: e.target.checked})}
                      className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">Best Seller</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.newArrival}
                      onChange={(e) => setFormData({...formData, newArrival: e.target.checked})}
                      className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-dark-700">New Arrival</span>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="label">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    className="input"
                    placeholder="summer, cotton, casual, sale"
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <h3 className="font-semibold text-dark-950 mb-4">Product Images</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden border border-dark-200">
                      <img src={preview.url} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imagePreviews.length < 10 && (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-dark-200 flex items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="sr-only"
                        multiple
                      />
                      <Upload className="w-8 h-8 text-dark-400" />
                    </label>
                  )}
                </div>
                <p className="text-sm text-dark-500">Maximum 10 images. Drag to reorder (first image is thumbnail).</p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-dark-100 sticky bottom-0 bg-white">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingProduct ? 'Update Product' : 'Create Product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminProducts