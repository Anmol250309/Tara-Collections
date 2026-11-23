import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight,
  ShoppingCart
} from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Wishlist() {
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  const handleAddToCart = (item) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      finalPrice: item.price,
      imageUrl: item.imageUrl,
      quantity: 1,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor
    });
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (wishlistItems.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <Heart className="h-16 w-16 text-tara-gray mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-tara-black mb-4">
              Your Wishlist is Empty
            </h2>
            <p className="text-tara-gray mb-6">
              Save items to your wishlist by clicking the heart icon on products.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Discover Products</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = wishlistItems.reduce((sum, item) => sum + (item.price || 0), 0);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/products" className="flex items-center text-tara-gray hover:text-tara-black transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wishlist Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-serif font-bold text-tara-black mb-6">
              Wishlist ({wishlistItems.length} items)
            </h1>

            <div className="space-y-4">
              <AnimatePresence>
                {wishlistItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Product Image */}
                    <div className="md:col-span-1">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-tara-beige rounded-lg flex items-center justify-center">
                          <ShoppingBasket className="h-6 w-6 text-tara-gray" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-tara-black">{item.name || 'Product Name'}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-tara-gray">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-tara-gray">Color: {item.selectedColor}</p>
                      )}
                      <div className="mt-2 font-bold text-tara-black">
                        ₹{item.price || 0}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        <span>Add to Cart</span>
                      </button>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="p-2 text-tara-gray hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Wishlist Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-tara-black mb-4">
                Wishlist Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-tara-gray">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-tara-beige pt-4 mb-6">
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  <ArrowRight className="h-5 w-5" />
                  <span>Buy Now</span>
                </button>
              </div>

              <Link
                to="/cart"
                className="flex items-center justify-center space-x-2 mt-4 text-tara-gold hover:underline font-medium"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>View Cart</span>
              </Link>

              <Link
                to="/products"
                className="block text-center mt-4 text-tara-gray hover:text-tara-black transition-colors text-sm"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}