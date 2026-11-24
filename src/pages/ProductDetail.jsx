import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Heart, Share2, Truck, RotateCcw, Shield, Star, Minus, Plus, X } from 'lucide-react'
import { getProductById, getRelatedProducts } from '../services/products'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

function ProductDetail() {
  const { id } = useParams()
  const { addToCart } = useCart()
  const { addToWishlist, isInWishlist, toggleWishlist } = useWishlist()
  const { user } = useAuth()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productRes, relatedRes] = await Promise.all([
          getProductById(id),
          getRelatedProducts(id, null, 8)
        ])
        setProduct(productRes)
        setRelatedProducts(relatedRes)
        if (productRes.images?.length) {
          setSelectedImage(0)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        toast.error('Product not found')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleAddToCart = async () => {
    if (!product) return
    if (product.stock <= 0) {
      toast.error('Out of stock')
      return
    }
    try {
      await addToCart(product, quantity, selectedVariant)
    } catch (error) {
      // Error handled in context
    }
  }

  const handleWishlist = async () => {
    if (!user) {
      toast.error('Please login to add to wishlist')
      return
    }
    if (!product) return
    try {
      await toggleWishlist(product)
    } catch (error) {
      // Error handled in context
    }
  }

  const discount = product?.originalPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : 0

  const averageRating = product?.averageRating || 0
  const fullStars = Math.floor(averageRating)
  const hasHalfStar = averageRating % 1 >= 0.5

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-dark-950 mb-2">Product not found</h2>
          <Link to="/shop" className="link">Browse products</Link>
        </div>
      </div>
    )
  }

  const images = product.images?.length ? product.images : ['/placeholder-product.jpg']

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Breadcrumb */}
      <nav className="bg-white border-b border-dark-100 py-4" aria-label="Breadcrumb">
        <div className="container-main">
          <ol className="flex items-center gap-2 text-sm text-dark-500">
            <li><Link to="/" className="hover:text-primary-600">Home</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li><Link to="/shop" className="hover:text-primary-600">Shop</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li><Link to={`/shop?category=${product.category}`} className="hover:text-primary-600">{product.category}</Link></li>
            <li><ChevronRight className="w-4 h-4" /></li>
            <li className="text-dark-950 font-medium truncate max-w-xs" aria-current="page">{product.name}</li>
          </ol>
        </div>
      </nav>

      {/* Product Details */}
      <section className="py-8">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-primary-50 rounded-xl overflow-hidden">
                <button
                  onClick={() => setShowImageModal(true)}
                  className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  aria-label="View fullscreen"
                >
                  <svg className="w-5 h-5 text-dark-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discount > 0 && (
                  <span className="absolute top-3 left-3 badge-danger text-sm px-3 py-1">-{discount}%</span>
                )}
                {product.newArrival && (
                  <span className="absolute top-3 left-3 badge-primary text-sm px-3 py-1">New</span>
                )}
                {product.bestSeller && (
                  <span className="absolute top-3 left-3 badge-warning text-sm px-3 py-1">Best Seller</span>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary-500'
                          : 'border-transparent hover:border-dark-200'
                      }`}
                      aria-label={`View image ${index + 1}`}
                      aria-current={selectedImage === index}
                    >
                      <img
                        src={image}
                        alt={`${product.name} - view ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:sticky lg:top-28 lg:self-start">
              <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-2">
                {product.category}
              </p>
              <h1 className="heading-3 lg:heading-2 mb-4">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < fullStars
                          ? 'text-yellow-400 fill-current'
                          : i === fullStars && hasHalfStar
                          ? 'text-yellow-400 fill-current'
                          : 'text-dark-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-dark-600 text-sm">
                  {averageRating.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-3xl font-bold text-dark-950">
                  ₹{product.sellingPrice.toLocaleString()}
                </span>
                {product.originalPrice && product.originalPrice > product.sellingPrice && (
                  <span className="text-xl text-dark-400 line-through">
                    ₹{product.originalPrice.toLocaleString()}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge-success ml-2">Save {discount}%</span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-dark-950 mb-2">Description</h3>
                  <p className="text-body text-dark-600 whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* Variant Selection */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-dark-950 mb-3">Select Variant</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(selectedVariant?.id === variant.id ? null : variant)}
                        className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary-500 bg-primary-50 text-primary-600'
                            : 'border-dark-200 text-dark-700 hover:border-primary-500 hover:text-primary-600'
                        }`}
                      >
                        {variant.name}
                        {variant.price && ` (+₹${variant.price})`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="mb-6">
                <label className="label">Quantity</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-dark-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-dark-500 hover:text-dark-700 hover:bg-primary-50 transition-colors"
                      disabled={quantity <= 1}
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-16 text-center border-x border-dark-200 bg-white focus:outline-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-4 py-2 text-dark-500 hover:text-dark-700 hover:bg-primary-50 transition-colors"
                      disabled={quantity >= product.stock}
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  <span className="text-sm text-dark-500">
                    {product.stock > 0 ? `Only ${product.stock} left in stock` : 'Out of stock'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className="flex-1 btn-primary text-lg py-4"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                  onClick={handleWishlist}
                  className={`btn ${isInWishlist(product.id) ? 'btn-danger' : 'btn-outline'} p-4`}
                  aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Share Button */}
              <div className="flex items-center gap-4 mb-6 pt-4 border-t border-dark-100">
                <span className="text-sm text-dark-600">Share:</span>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: product.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                  className="btn btn-ghost p-2"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-dark-100">
                <div className="flex flex-col items-center gap-2 p-3">
                  <Truck className="w-6 h-6 text-primary-500" />
                  <span className="text-xs font-medium text-dark-700">Free Shipping</span>
                  <span className="text-xs text-dark-500">Over ₹999</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3">
                  <RotateCcw className="w-6 h-6 text-primary-500" />
                  <span className="text-xs font-medium text-dark-700">Easy Returns</span>
                  <span className="text-xs text-dark-500">30 Days</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3">
                  <Shield className="w-6 h-6 text-primary-500" />
                  <span className="text-xs font-medium text-dark-700">Secure Pay</span>
                  <span className="text-xs text-dark-500">100% Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-8 bg-white">
          <div className="container-main">
            <h2 className="heading-3 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`} className="card group">
                  <div className="relative aspect-square overflow-hidden bg-primary-50">
                    {relatedProduct.images?.[0] ? (
                      <img
                        src={relatedProduct.images[0]}
                        alt={relatedProduct.name}
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
                  <div className="p-4">
                    <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-1">
                      {relatedProduct.category}
                    </p>
                    <h3 className="font-medium text-dark-950 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {relatedProduct.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-dark-950">
                        ₹{relatedProduct.sellingPrice.toLocaleString()}
                      </span>
                      {relatedProduct.originalPrice && relatedProduct.originalPrice > relatedProduct.sellingPrice && (
                        <span className="text-sm text-dark-400 line-through">
                          ₹{relatedProduct.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-8 h-8" />
          </button>
          <button
            onClick={() => setSelectedImage((selectedImage - 1 + images.length) % images.length)}
            className="absolute left-6 p-3 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <img
            src={images[selectedImage]}
            alt={product.name}
            className="max-w-full max-h-[85vh] object-contain"
          />
          <button
            onClick={() => setSelectedImage((selectedImage + 1) % images.length)}
            className="absolute right-6 p-3 text-white/70 hover:text-white transition-colors bg-black/50 rounded-full"
            aria-label="Next image"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductDetail