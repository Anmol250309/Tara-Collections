import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function PageNotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.state?.back) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const handleSearch = () => {
    const event = new CustomEvent('open-search');
    window.dispatchEvent(event);
  };

  return (
    <div className="min-h-screen bg-tara-bg flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 px-4"
      >
        {/* 404 illustration */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <div className="inline-block w-32 h-32 bg-tara-cream rounded-full flex items-center justify-center overflow-hidden">
            <div className="text-center">
              <span className="text-8xl font-bold text-tara-gray/20">404</span>
              <div className="absolute inset-0 flex items-center justify-center">
                <HelpCircle className="h-12 w-12 text-tara-gold" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h1 className="text-4xl font-serif font-bold text-tara-black mb-4">
            Oops! Page Not Found
          </h1>
          <p className="text-tara-gray mb-8 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved. Let's get you back to shopping.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <button
              onClick={handleGoHome}
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Go Home</span>
            </button>

            <button
              onClick={handleGoBack}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>

            <button
              onClick={handleSearch}
              className="flex items-center justify-center space-x-2 px-6 py-3 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
            >
              <Search className="h-5 w-5" />
              <span>Search</span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="border-t border-tara-beige pt-6">
            <p className="text-sm text-tara-gray mb-4">Quick Links</p>
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate('/products')}
                className="px-4 py-2 border border-tara-beige rounded-full text-sm text-tara-gray hover:bg-tara-cream transition-colors"
              >
                Products
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="px-4 py-2 border border-tara-beige rounded-full text-sm text-tara-gray hover:bg-tara-cream transition-colors flex items-center space-x-1"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
              </button>
              <button
                onClick={() => navigate('/profile')}
                className="px-4 py-2 border border-tara-beige rounded-full text-sm text-tara-gray hover:bg-tara-cream transition-colors"
              >
                <Heart className="h-4 w-4 inline mr-1" />
                <span>Wishlist</span>
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}