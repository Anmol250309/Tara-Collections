import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success('Logged in successfully!');
        // Check if user is admin (you'll need to add this check)
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Login failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
      reset();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-tara-cream">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          <div className="text-center mb-8">
            <Link to="/" className="text-2xl font-serif font-bold text-tara-gold mb-4 inline-block">
              TARA COLLECTIONS ADMIN
            </Link>
            <h1 className="text-2xl font-serif font-bold text-tara-black">
              Admin Login
            </h1>
            <p className="text-tara-gray mt-2">
              Enter your credentials to access the admin panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-tara-black mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold ${
                    errors.email ? 'border-red-500' : 'border-tara-beige'
                  }`}
                  placeholder="admin@tara.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-tara-black mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
                <input
                  type="password"
                  {...register('password', {
                    required: 'Password is required'
                  })}
                  className={`w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold ${
                    errors.password ? 'border-red-500' : 'border-tara-beige'
                  }`}
                  placeholder="Enter password"
                />
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-tara-gold text-white font-medium rounded-full hover:bg-tara-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
          </form>

          <Link
            to="/"
            className="flex items-center justify-center mt-6 text-tara-gray hover:text-tara-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Website</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}