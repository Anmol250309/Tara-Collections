import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Cart() {
  const { cartItems, loading, removeFromCart, updateQuantity, calculateSubtotal, calculateDiscount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner size="large" />;
  }

  const subtotal = calculateSubtotal();
  const discount = calculateDiscount();
  const finalTotal = subtotal;

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    updateQuantity(itemId, newQuantity);
  };

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ShoppingCart className="h-16 w-16 text-tara-gray mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-tara-black mb-4">
              Your Cart is Empty
            </h2>
            <p className="text-tara-gray mb-6">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link
              to="/products"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Continue Shopping</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-serif font-bold text-tara-black mb-6">
              Shopping Cart ({cartItems.length} items)
            </h1>

            <div className="space-y-4">
              <AnimatePresence>
                {cartItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-tara-black">{item.name || 'Product Name'}</h3>
                      {item.selectedSize && (
                        <p className="text-sm text-tara-gray">Size: {item.selectedSize}</p>
                      )}
                      {item.selectedColor && (
                        <p className="text-sm text-tara-gray">Color: {item.selectedColor}</p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        className="p-1 border border-tara-beige rounded-md hover:bg-tara-cream transition-colors"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 py-1 text-lg font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="p-1 border border-tara-beige rounded-md hover:bg-tara-cream transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="font-medium text-tara-black text-lg">
                      ₹{((item.price || item.finalPrice || 0) * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-tara-gray hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>

                    {/* Checkout Button */}
                    <button
                      onClick={handleCheckout}
                      className="col-span-5 md:col-span-1 flex items-center justify-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Checkout</span>
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-xl font-serif font-bold text-tara-black mb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-tara-gray">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">- ₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="border-t border-tara-beige pt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-tara-gray">Shipping</span>
                    <span className="font-medium">Calculated at checkout</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-serif font-bold">Total</span>
                <span className="text-2xl font-bold text-tara-gold">₹{finalTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Proceed to Checkout</span>
              </button>

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