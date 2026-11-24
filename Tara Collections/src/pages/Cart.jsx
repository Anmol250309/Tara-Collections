import { Link, useNavigate } from 'react-router-dom'
import { Plus, Minus, Trash2, Heart, ArrowLeft, Loader2 } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import toast from 'react-hot-toast'

function Cart() {
  const navigate = useNavigate()
  const { items, loading, updateQuantity, removeFromCart, clearCart, subtotal, deliveryCharge, total, itemCount } = useCart()
  const { addToWishlist } = useWishlist()
  const [updating, setUpdating] = useState(null)

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
          <svg className="w-24 h-24 mx-auto text-dark-200 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="heading-3 mb-3">Your cart is empty</h2>
          <p className="text-body text-dark-500 mb-8">Looks like you haven't added anything yet.</p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    )
  }

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    setUpdating(itemId)
    try {
      await updateQuantity(itemId, newQuantity)
    } finally {
      setUpdating(null)
    }
  }

  const handleRemove = async (itemId) => {
    setUpdating(itemId)
    try {
      await removeFromCart(itemId)
    } finally {
      setUpdating(null)
    }
  }

  const handleMoveToWishlist = async (item) => {
    try {
      await addToWishlist({
        id: item.productId,
        name: item.name,
        sellingPrice: item.price,
        originalPrice: item.originalPrice,
        images: [item.image],
        category: item.category
      })
      await removeFromCart(item.id)
      toast.success('Moved to wishlist')
    } catch (error) {
      toast.error('Failed to move to wishlist')
    }
  }

  return (
    <div className="min-h-screen bg-primary-50 pt-28 pb-12">
      <div className="container-main">
        <h1 className="heading-3 mb-8">Shopping Cart ({itemCount})</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-card overflow-hidden">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 border-b border-dark-100 text-sm font-medium text-dark-500 uppercase tracking-wide">
                <div className="col-span-5">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Items */}
              <div className="divide-y divide-dark-100">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="md:grid grid-cols-12 gap-4 px-6 py-6 items-center"
                  >
                    {/* Product */}
                    <div className="col-span-12 md:col-span-5 flex items-center gap-4">
                      <Link to={`/product/${item.productId}`} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-primary-50">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </Link>
                      <div className="min-w-0">
                        <Link to={`/product/${item.productId}`} className="font-medium text-dark-950 hover:text-primary-600 transition-colors line-clamp-1 block mb-1">
                          {item.name}
                        </Link>
                        {item.variant && (
                          <p className="text-sm text-dark-500">
                            {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </p>
                        )}
                        <button
                          onClick={() => handleMoveToWishlist(item)}
                          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1 mt-2"
                        >
                          <Heart className="w-4 h-4" />
                          Move to Wishlist
                        </button>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-12 md:col-span-2 text-center md:text-left py-4 md:py-0 border-t md:border-t-0 border-dark-100">
                      <span className="font-medium text-dark-950">₹{item.price.toLocaleString()}</span>
                      {item.originalPrice > item.price && (
                        <p className="text-sm text-dark-400 line-through">₹{item.originalPrice.toLocaleString()}</p>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="col-span-12 md:col-span-2 text-center md:text-left py-4 md:py-0 border-t md:border-t-0 border-dark-100">
                      <div className="flex items-center justify-center md:justify-start gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1 || updating === item.id}
                          className="w-10 h-10 rounded-lg border border-dark-200 text-dark-500 hover:text-dark-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium text-dark-950">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock || updating === item.id}
                          className="w-10 h-10 rounded-lg border border-dark-200 text-dark-500 hover:text-dark-700 hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-dark-500 mt-1">Max: {item.stock}</p>
                    </div>

                    {/* Total */}
                    <div className="col-span-12 md:col-span-2 text-right md:text-left py-4 md:py-0 border-t md:border-t-0 border-dark-100">
                      <span className="font-semibold text-dark-950 text-lg">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </div>

                    {/* Remove */}
                    <div className="col-span-12 md:col-span-1 text-right md:text-left py-4 md:py-0">
                      <button
                        onClick={() => handleRemove(item.id)}
                        disabled={updating === item.id}
                        className="text-dark-400 hover:text-red-600 transition-colors p-2"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Actions */}
              <div className="px-6 py-4 border-t border-dark-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Link to="/shop" className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
                  <ArrowLeft className="w-4 h-4" />
                  Continue Shopping
                </Link>
                {items.length > 1 && (
                  <button
                    onClick={clearCart}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear Cart
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28">
              <h2 className="heading-3 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-dark-600">
                  <span>Subtotal ({itemCount} items)</span>
                  <span className="font-medium text-dark-950">₹{subtotal.toLocaleString()}</span>
                </div>
                {subtotal > 0 && subtotal < 999 && (
                  <div className="flex justify-between text-dark-600">
                    <span>Delivery</span>
                    <span className="font-medium text-dark-950">₹{deliveryCharge.toLocaleString()}</span>
                  </div>
                )}
                {subtotal >= 999 && (
                  <div className="flex justify-between text-green-600 text-sm">
                    <span>Free Delivery Applied!</span>
                    <span className="font-medium">-₹{deliveryCharge.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-dark-100 pt-3 flex justify-between">
                  <span className="font-semibold text-dark-950 text-lg">Total</span>
                  <span className="font-bold text-dark-950 text-lg">₹{total.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-sm text-dark-500 mb-6 p-4 bg-primary-50 rounded-lg">
                <p className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Shipping calculated at checkout. Free shipping on orders above ₹999.
                </p>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full text-center py-4 text-lg"
              >
                Proceed to Checkout
              </Link>

              <p className="text-center text-xs text-dark-500 mt-4">
                Secure checkout powered by Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState } from 'react'

export default Cart