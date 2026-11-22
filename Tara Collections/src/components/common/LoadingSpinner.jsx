import React from 'react';
import { motion } from 'framer-motion';

export default function LoadingSpinner({ size = 'large' }) {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-10 w-10',
    large: 'h-12 w-12'
  };

  return (
    <div className="flex justify-center items-center py-12">
      <motion.div
        className={`${sizeClasses[size] || sizeClasses.large} border-2 border-tara-gold border-t-transparent border-r-transparent border-b-white border-l-white rounded-full`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
    </div>
  );
}