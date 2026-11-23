import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart, onToggleWishlist, isInWishlist }) {
  const price = product.discountPrice || product.price || 0;
  const discount = product.price && product.discountPrice && product.price > product.discountPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
    >
      <div className="relative">
        <Link to={`/product/${product.slug || product.id}`}>
          <img
            src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
            alt={product.name}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.src = '/placeholder-product.jpg';
            }}
          />
        </Link>

        {/* Wishlist Button */}
        <button
          onClick={() => onToggleWishlist && onToggleWishlist(product.id)}
          className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-tara-cream transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${isInWishlist ? 'fill-red-500 text-red-500' : 'text-tara-gray'}`}
          />
        </button>

        {/* Discount Badge */}
        {discount && (
          <span className="absolute top-4 left-4 bg-tara-gold text-white text-xs font-bold px-2 py-1 rounded">
            {Math.round(((product.price - product.discountPrice) / product.price) * 100)}% OFF
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < (product.rating || 0)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Product Name */}
        <Link to={`/product/${product.slug || product.id}`}>
          <h3 className="font-serif font-medium text-tara-black hover:text-tara-gold transition-colors mb-2">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          {discount ? (
            <>
              <span className="text-lg font-bold text-tara-gold">₹{price}</span>
              <span className="text-sm text-tara-gray line-through">₹{product.price}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-tara-black">₹{price}</span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={() => onAddToCart && onAddToCart(product)}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-tara-black text-white rounded-lg hover:bg-tara-gray transition-colors"
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="font-medium">Add to Cart</span>
        </button>
      </div>
    </motion.div>
  );
}