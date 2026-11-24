import { Link } from 'react-router-dom'
import { Heart, Trash2, ShoppingBag, X, Loader2 } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'

function Wishlist() {
  const { items, loading, removeFromWishlist, clearWishlist } = useWishlist()
  const { addToCart } = useCart()
  const [removing, setRemoving] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28 px-4">
        <div className="text-center max-w-md">
          <Heart className="w-24 h-24 mx-auto text-dark-200 mb-6" />
          <h2 className="heading-3 mb-3">Your wishlist is empty</h2>
          <p className="text-body text-dark-500 mb-8">Save items you love for later.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Start Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleRemove = async (productId) => {
    setRemoving(productId)
    try {
      await removeFromWishlist(productId)
    } finally {
      setRemoving(null)
    }
  }

  const handleAddToCart = async (item) => {
    try {
      await addToCart({
        id: item.productId,
        name: item.name,
        sellingPrice: item.price,
        originalPrice: item.originalPrice,
        images: [item.image],
        stock: 999
      }, 1, null)
      toast.success('Added to cart')
    } catch (error) {
      toast.error('Failed to add to cart')
    }
  }

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      await clearWishlist()
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 pt-28 pb-12">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-3">My Wishlist ({items.length})</h1>
            <p className="text-body text-dark-500 mt-1">Your saved items</p>
          </div>
          {items.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-4 h-4" />
              Clear All
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.productId} className="card group relative">
              <button
                onClick={() => handleRemove(item.productId)}
                disabled={removing === item.productId}
                className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full text-dark-400 hover:text-red-600 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 z-10"
                aria-label="Remove from wishlist"
              >
                <X className="w-4 h-4" />
              </button>

              <Link to={`/product/${item.productId}`} className="block">
                <div className="relative aspect-square overflow-hidden bg-primary-50">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
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
                </div>
              </Link>

              <div className="p-4">
                <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-1 line-clamp-1">
                  {item.category || 'Uncategorized'}
                </p>
                <Link to={`/product/${item.productId}`}>
                  <h3 className="font-medium text-dark-950 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                    {item.name}
                  </h3>
                </Link>
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold text-dark-950">₹{item.price.toLocaleString()}</span>
                  {item.originalPrice && item.originalPrice > item.price && (
                    <span className="text-sm text-dark-400 line-through">
                      ₹{item.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(item)}
                  className="btn-secondary w-full text-sm py-2"
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

export default Wishlist