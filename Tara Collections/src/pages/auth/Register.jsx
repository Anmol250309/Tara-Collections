import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Register() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen py-12 px-4 bg-tara-cream flex items-center justify-center"
    >
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
        <h1 className="text-2xl font-serif font-bold text-tara-black mb-4">
          Welcome to TARA COLLECTIONS
        </h1>
        <p className="text-tara-gray mb-6">
          Please sign in to continue to your account.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white font-medium rounded-full hover:bg-tara-gold-light transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Sign In</span>
        </Link>
      </div>
    </motion.div>
  );
}