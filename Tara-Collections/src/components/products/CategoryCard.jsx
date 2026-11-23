import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function CategoryCard({ category }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      as={Link}
      to={`/products?category=${category.slug || category.id}`}
      className="group relative rounded-xl overflow-hidden shadow-lg"
    >
      <div className="aspect-[4/5] relative">
        <img
          src={category.image || category.bannerImage || '/placeholder-category.jpg'}
          alt={category.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = '/placeholder-category.jpg';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
      </div>

      <div className="absolute bottom-4 left-4 right-4 text-white">
        <h3 className="text-xl font-serif font-bold mb-1">{category.name}</h3>
        <p className="text-sm opacity-90">
          {category.productsCount || category.itemCount || 'Shop Now'}
        </p>
      </div>
    </motion.div>
  );
}