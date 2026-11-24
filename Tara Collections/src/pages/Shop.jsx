import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Filter, X, ChevronDown, Grid, List, Loader2 } from 'lucide-react'
import { getProducts, getCategories } from '../services/products'

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    sortBy: searchParams.get('sort') || 'newest',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: true
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid')

  const fetchProducts = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setProducts([])
      setLastDoc(null)
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const queryFilters = {
        ...filters,
        limit: 12,
        lastDoc: reset ? null : lastDoc
      }

      // Remove empty filters
      Object.keys(queryFilters).forEach(key => {
        if (queryFilters[key] === '' || queryFilters[key] === null) {
          delete queryFilters[key]
        }
      })

      const result = await getProducts(queryFilters)
      setProducts(prev => reset ? result.products : [...prev, ...result.products])
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [filters, lastDoc])

  const fetchCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchProducts(true)
  }, [searchParams.get('category'), searchParams.get('sort')])

  useEffect(() => {
    const newFilters = { ...filters }
    let hasChanges = false

    if (searchParams.get('category') !== filters.category) {
      newFilters.category = searchParams.get('category') || ''
      hasChanges = true
    }
    if (searchParams.get('sort') !== filters.sortBy) {
      newFilters.sortBy = searchParams.get('sort') || 'newest'
      hasChanges = true
    }
    if (searchParams.get('minPrice') !== filters.minPrice) {
      newFilters.minPrice = searchParams.get('minPrice') || ''
      hasChanges = true
    }
    if (searchParams.get('maxPrice') !== filters.maxPrice) {
      newFilters.maxPrice = searchParams.get('maxPrice') || ''
      hasChanges = true
    }

    if (hasChanges) {
      setFilters(newFilters)
      fetchProducts(true)
    }
  }, [searchParams])

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)

    const newParams = new URLSearchParams(searchParams)
    if (value) {
      newParams.set(key === 'category' ? 'category' : key === 'sortBy' ? 'sort' : key, value)
    } else {
      newParams.delete(key === 'category' ? 'category' : key === 'sortBy' ? 'sort' : key)
    }
    newParams.delete('page')
    setSearchParams(newParams)
  }

  const clearFilters = () => {
    setFilters({
      category: '',
      sortBy: 'newest',
      minPrice: '',
      maxPrice: '',
      inStock: true
    })
    const newParams = new URLSearchParams()
    setSearchParams(newParams)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchProducts(false)
    }
  }

  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'newest' && v !== true).length

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Page Header */}
      <section className="bg-white border-b border-dark-100">
        <div className="container-main py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="heading-2">Shop</h1>
              <p className="text-body mt-1">
                {products.length} product{products.length !== 1 ? 's' : ''} found
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                className={`btn ${showFilters ? 'btn-primary' : 'btn-outline'} hidden sm:flex items-center gap-2`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
                Filters {activeFilterCount > 0 && (
                  <span className="bg-primary-500 text-primary-50 text-xs px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                className="btn btn-ghost p-2"
                onClick={() => clearFilters()}
                disabled={activeFilterCount === 0}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Filters Bar */}
      {showFilters && (
        <div className="fixed inset-0 z-50 md:hidden bg-white animate-slide-up">
          <div className="flex items-center justify-between p-4 border-b border-dark-100 sticky top-0 bg-white z-10">
            <h2 className="font-semibold text-dark-950">Filters</h2>
            <button onClick={() => setShowFilters(false)} className="p-2 text-dark-500 hover:text-dark-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
            <FiltersPanel
              filters={filters}
              categories={categories}
              onFilterChange={handleFilterChange}
              onClear={clearFilters}
            />
          </div>
        </div>
      )}

      <div className="container-main py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-28">
              <FiltersPanel
                filters={filters}
                categories={categories}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
              />
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            {products.length === 0 && !loading ? (
              <div className="text-center py-16">
                <svg className="w-16 h-16 mx-auto text-dark-200 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-dark-950 mb-2">No products found</h3>
                <p className="text-dark-500 mb-6">Try adjusting your filters or search terms</p>
                <button onClick={clearFilters} className="link">
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <label className="text-sm text-dark-600">Sort by:</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input w-auto py-2 px-3 text-sm"
                    >
                      <option value="newest">Newest</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="popularity">Most Popular</option>
                      <option value="rating">Top Rated</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-dark-950 text-primary-50' : 'bg-white text-dark-500 hover:bg-primary-50'}`}
                      aria-label="Grid view"
                    >
                      <Grid className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-dark-950 text-primary-50' : 'bg-white text-dark-500 hover:bg-primary-50'}`}
                      aria-label="List view"
                    >
                      <List className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={loadingMore}
                      className="btn-outline px-8 py-3"
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
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// Filters Panel Component
function FiltersPanel({ filters, categories, onFilterChange, onClear }) {
  const [expandedCategories, setExpandedCategories] = useState(true)

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-dark-950">Category</h3>
          <button
            onClick={() => setExpandedCategories(!expandedCategories)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            {expandedCategories ? 'Hide' : 'Show'} all
          </button>
        </div>
        <div className={`mt-3 space-y-2 ${!expandedCategories ? 'max-h-40 overflow-y-auto' : ''}`}>
          {categories.map((category) => (
            <label key={category.id} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="category"
                value={category.id}
                checked={filters.category === category.id}
                onChange={(e) => onFilterChange('category', e.target.value)}
                className="w-4 h-4 text-primary-500 border-dark-300 focus:ring-primary-500"
              />
              <span className="text-sm text-dark-700">{category.name}</span>
            </label>
          ))}
        </div>
        {filters.category && (
          <button
            onClick={() => onFilterChange('category', '')}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear category
          </button>
        )}
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-dark-950">Price Range</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice}
            onChange={(e) => onFilterChange('minPrice', e.target.value)}
            className="input w-full text-sm py-2"
            min="0"
          />
          <span className="text-dark-400">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice}
            onChange={(e) => onFilterChange('maxPrice', e.target.value)}
            className="input w-full text-sm py-2"
            min="0"
          />
        </div>
        {(filters.minPrice || filters.maxPrice) && (
          <button
            onClick={() => { onFilterChange('minPrice', ''); onFilterChange('maxPrice', ''); }}
            className="mt-2 text-sm text-primary-600 hover:text-primary-700"
          >
            Clear price range
          </button>
        )}
      </div>

      {/* In Stock */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => onFilterChange('inStock', e.target.checked)}
            className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-dark-700">In stock only</span>
        </label>
      </div>

      {Object.values(filters).some(v => v && v !== 'newest' && v !== true) && (
        <button
          onClick={onClear}
          className="w-full btn-outline text-sm"
        >
          Clear All Filters
        </button>
      )}
    </div>
  )
}

// Product Card Component
function ProductCard({ product, viewMode }) {
  const discount = product.originalPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : 0

  if (viewMode === 'list') {
    return (
      <Link to={`/product/${product.id}`} className="card flex flex-col sm:flex-row gap-4 p-4 group">
        <div className="relative w-full sm:w-48 h-48 sm:h-auto aspect-square flex-shrink-0 overflow-hidden bg-primary-50 rounded-lg">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-dark-300">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {discount > 0 && (
            <span className="absolute top-2 left-2 badge-danger">-{discount}%</span>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between p-2 sm:p-0">
          <div>
            <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-1">
              {product.category}
            </p>
            <h3 className="font-medium text-dark-950 mb-1 group-hover:text-primary-600 transition-colors">
              {product.name}
            </h3>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-dark-950">₹{product.sellingPrice.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.sellingPrice && (
                <span className="text-sm text-dark-400 line-through">
                  ₹{product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link to={`/product/${product.id}`} className="card group">
      <div className="relative aspect-square overflow-hidden bg-primary-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dark-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge-danger">-{discount}%</span>
        )}
        {product.newArrival && (
          <span className="absolute top-3 right-3 badge-primary">New</span>
        )}
        {product.bestSeller && (
          <span className="absolute top-3 right-3 badge-warning">Best Seller</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-medium text-dark-950 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-dark-950">₹{product.sellingPrice.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.sellingPrice && (
            <span className="text-sm text-dark-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Shop