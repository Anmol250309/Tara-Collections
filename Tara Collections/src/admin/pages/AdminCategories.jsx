import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Loader2, Check, X, Package2 } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory, getProducts } from '../../services/products'
import toast from 'react-hot-toast'

function AdminCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({ name: '', slug: '' })
  const [productCounts, setProductCounts] = useState({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const cats = await getCategories()
      setCategories(cats)

      // Get product counts for each category
      const counts = {}
      for (const cat of cats) {
        try {
          const products = await getProducts({ category: cat.id, limit: 1 })
          counts[cat.id] = products.hasMore ? 999 : products.products.length
        } catch (error) {
          counts[cat.id] = 0
        }
      }
      setProductCounts(counts)
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setSubmitting(true)
    try {
      const categoryData = {
        name: formData.name.trim(),
        slug: formData.slug.trim() || formData.name.toLowerCase().replace(/\s+/g, '-')
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        toast.success('Category updated successfully')
      } else {
        await createCategory(categoryData)
        toast.success('Category created successfully')
      }

      setShowModal(false)
      setEditingCategory(null)
      setFormData({ name: '', slug: '' })
      fetchCategories()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Failed to save category')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? All products in this category will need to be reassigned.')) {
      return
    }

    try {
      await deleteCategory(categoryId)
      toast.success('Category deleted successfully')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category')
    }
  }

  const openCreateModal = () => {
    setEditingCategory(null)
    setFormData({ name: '', slug: '' })
    setShowModal(true)
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({ name: category.name, slug: category.slug || '' })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({ name: '', slug: '' })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="heading-2">Categories</h1>
          <button className="btn-primary" disabled>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading...
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-card p-6 animate-pulse">
              <div className="w-12 h-12 bg-dark-100 rounded-xl mb-4" />
              <div className="h-6 bg-dark-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-dark-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2">Categories</h1>
          <p className="text-body text-dark-500 mt-1">Organize your products</p>
        </div>
        <button onClick={openCreateModal} className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Add Category
        </button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-card p-12 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Package2 className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="text-lg font-medium text-dark-950 mb-2">No categories yet</h3>
          <p className="text-dark-500 mb-4">Create your first category to organize products</p>
          <button onClick={openCreateModal} className="btn-primary">
            <Plus className="w-4 h-4 mr-1" />
            Create Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Package2 className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark-950">{category.name}</h3>
                    <p className="text-sm text-dark-500">
                      {productCounts[category.id] !== undefined
                        ? `${productCounts[category.id]} product${productCounts[category.id] !== 1 ? 's' : ''}`
                        : 'Loading...'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="btn-ghost p-2"
                    aria-label="Edit category"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                    aria-label="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Product List Preview */}
              <div className="mt-4 pt-4 border-t border-dark-100">
                <p className="text-xs font-medium text-dark-500 uppercase tracking-wide mb-2">Product Slug</p>
                <p className="text-sm text-dark-600 font-mono bg-dark-50 px-2 py-1 rounded">{category.slug || 'not-set'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-100 flex items-center justify-between">
              <h2 className="heading-3">{editingCategory ? 'Edit Category' : 'Add New Category'}</h2>
              <button
                onClick={closeModal}
                className="text-dark-400 hover:text-dark-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input"
                  placeholder="e.g., Summer Collection"
                  required
                />
              </div>

              <div>
                <label className="label">Slug</label>
                <p className="text-xs text-dark-500 mb-2">URL-friendly identifier (auto-generated if empty)</p>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="input"
                  placeholder="summer-collection"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
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
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingCategory ? 'Update' : 'Create'
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

export default AdminCategories