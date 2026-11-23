import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  Star,
  Minus,
  Plus,
  Share2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { collection, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        // Try by slug first, then by id
        let productDoc = null;

        if (slug) {
          const productsRef = collection(db, 'products');
          // Try to find by slug or id
          const snapshot = await getDoc(doc(db, 'products', slug));
          if (snapshot.exists()) {
            productDoc = snapshot;
          } else {
            // Try to find product
            const q = query(productsRef, where('slug', '==', slug));
            // Simplified - in production would use proper query
          }
        }

        // If not found, try by id
        if (!productDoc || !productDoc.exists()) {
          const snapshot = await getDoc(doc(db, 'products', slug));
          if (snapshot.exists()) {
            productDoc = snapshot;
          }
        }

        if (productDoc && productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
          // Set default size and color
          const data = productDoc.data();
          if (data.availableSizes && data.availableSizes.length > 0) {
            setSelectedSize(data.availableSizes[0]);
          }
          if (data.availableColors && data.availableColors.length > 0) {
            setSelectedColor(data.availableColors[0]);
          }
        } else {
          toast.error('Product not found');
          navigate('/products');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, navigate]);

  // Calculate price
  const price = useMemo(() => {
    if (!product) return 0;
    const finalPrice = product.discountPrice || product.price || 0;
    return typeof finalPrice === 'object' ? (finalPrice.india || finalPrice) : finalPrice;
  }, [product]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    return typeof product.price === 'object' ? (product.price.india || product.price) : product.price;
  }, [product]);

  const discountPercent = useMemo(() => {
    if (!product || !product.price || !product.discountPrice) return 0;
    const orig = typeof product.price === 'object' ? (product.price.india || product.price) : product.price;
    const disc = typeof product.discountPrice === 'object' ? (product.discountPrice.india || product.discountPrice) : product.discountPrice;
    if (orig && orig > 0) {
      return Math.round(((orig - disc) / orig) * 100);
    }
    return 0;
  }, [product]);

  // Check stock
  const availableStock = useMemo(() => {
    if (!product) return 0;

    if (product.availableStock && Array.isArray(product.availableStock) && selectedSize && selectedColor) {
      const stockInfo = product.availableStock.find(
        s => s.size === selectedSize && s.color === selectedColor
      );
      return stockInfo ? stockInfo.stock : 0;
    }

    return product.stock || 0;
  }, [product, selectedSize, selectedColor]);

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;

    // Validate size and color selection
    if (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    if (product.availableColors && product.availableColors.length > 0 && !selectedColor) {
      toast.error('Please select a color');
      return;
    }

    if (availableStock < quantity) {
      toast.error('Not enough stock available');
      return;
    }

    const result = await addToCart(product.id, quantity, selectedSize, selectedColor);
    if (result.success) {
      toast.success('Added to cart');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  };

  // Handle buy now
  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  // Toggle wishlist
  const handleToggleWishlist = async () => {
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-tara-gray">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          to="/products"
          className="flex items-center text-tara-gray hover:text-tara-black transition-colors mb-6"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Products</span>
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="aspect-square rounded-xl overflow-hidden">
              <img
                src={product.images?.[selectedImage] || product.image || product.images?.[0] || '/placeholder-product.jpg'}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = '/placeholder-product.jpg';
                }}
              />
            </div>

            {/* Thumbnail Navigation */}
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-tara-gold' : 'border-tara-beige'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Image Navigation */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-tara-cream transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setSelectedImage(prev => (prev + 1) % product.images.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white rounded-full shadow-md hover:bg-tara-cream transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Product Title */}
            <h1 className="text-3xl font-serif font-bold text-tara-black">{product.name}</h1>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < (product.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-tara-gray">
                ({product.reviews?.length || 0} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-3xl font-bold text-tara-gold">₹{price}</div>
              {discountPercent > 0 && (
                <>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg text-tara-gray line-through">₹{originalPrice}</span>
                    <span className="bg-tara-gold text-white text-sm font-bold px-2 py-1 rounded">
                      {discountPercent}% OFF
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="py-3 border-y border-tara-beige">
              {availableStock > 0 ? (
                <span className="text-green-600 font-medium">✓ In Stock ({availableStock} available)</span>
              ) : (
                <span className="text-red-600 font-medium">✗ Out of Stock</span>
              )}
            </div>

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div>
                <h3 className="font-medium text-tara-black mb-3">Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-full border transition-all ${
                        selectedSize === size
                          ? 'bg-tara-gold text-white border-tara-gold'
                          : 'border-tara-beige text-tara-gray hover:bg-tara-cream'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div>
                <h3 className="font-medium text-tara-black mb-3">Color</h3>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-tara-gold'
                          : 'border-tara-beige'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            {availableStock > 0 && (
              <div>
                <h3 className="font-medium text-tara-black mb-3">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                      className="p-2 border border-tara-beige rounded-full hover:bg-tara-cream transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 text-xl font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(prev => Math.min(availableStock, prev + 1))}
                      className="p-2 border border-tara-beige rounded-full hover:bg-tara-cream transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <span className="text-sm text-tara-gray">
                    {availableStock} left in stock
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={availableStock === 0}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-tara-black text-white rounded-full font-medium hover:bg-tara-gray transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Add to Cart</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={availableStock === 0}
                  className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Buy Now</span>
                </button>

                <button
                  onClick={handleToggleWishlist}
                  className="p-3 border-2 border-tara-beige rounded-full hover:bg-tara-cream transition-all"
                >
                  <Heart
                    className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-tara-gray'}`}
                  />
                </button>

                <button className="p-3 border-2 border-tara-beige rounded-full hover:bg-tara-cream transition-colors">
                  <Share2 className="h-5 w-5 text-tara-gray" />
                </button>
              </>
            </div>

            {/* Product Details */}
            <div className="mt-8 pt-6 border-t border-tara-beige">
              <h3 className="font-serif font-medium text-tara-black mb-3">Product Details</h3>
              <p className="text-tara-gray text-sm leading-relaxed">
                {product.description || product.longDescription || 'Premium quality product with timeless design.'}
              </p>

              {product.material && (
                <p className="text-tara-gray text-sm mt-2">
                  <strong>Material:</strong> {product.material}
                </p>
              )}

              {product.brand && (
                <p className="text-tara-gray text-sm mt-2">
                  <strong>Brand:</strong> {product.brand}
                </p>
              )}
            </div>

            {/* Shipping Information */}
            <div className="pt-6 border-t border-tara-beige">
              <h3 className="font-serif font-medium text-tara-black mb-3">Shipping & Returns</h3>
              <p className="text-tara-gray text-sm">
                Free shipping on orders above ₹2000. Easy returns within 7 days.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}