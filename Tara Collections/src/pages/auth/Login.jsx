import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowLeft, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register, googleSignIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const {
    register: registerInput,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      if (isLogin) {
        const result = await login(data.email, data.password);
        if (result.success) {
          toast.success('Logged in successfully!');
          navigate(from, { replace: true });
        } else {
          toast.error(result.error || 'Login failed');
        }
      } else {
        const result = await register(data.name, data.email, data.password);
        if (result.success) {
          toast.success('Account created successfully!');
          navigate(from, { replace: true });
        } else {
          toast.error(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
      reset();
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await googleSignIn();
      if (result.success) {
        toast.success('Signed in with Google!');
        navigate(from, { replace: true });
      } else {
        toast.error(result.error || 'Google sign-in failed');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
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
              TARA COLLECTIONS
            </Link>
            <h1 className="text-2xl font-serif font-bold text-tara-black">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-tara-gray mt-2">
              {isLogin
                ? 'Sign in to your account'
                : 'Create your account to get started'}
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-tara-beige rounded-full hover:bg-white transition-colors mb-6 disabled:opacity-50"
          >
            <div className="bg-tara-gold p-1 rounded-full">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <span className="font-medium">Sign in with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-tara-beige"></div>
            </div>
            <div className="relative flex justify-center text-sm text-tara-gray">
              <span className="bg-white px-3">Or continue with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">
                  Name
                </label>
                <input
                  type="text"
                  {...registerInput('name', {
                    required: !isLogin && 'Name is required'
                  })}
                  className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold ${
                    errors.name ? 'border-red-500' : 'border-tara-beige'
                  }`}
                  placeholder="Enter your name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-tara-black mb-1">
                Email
              </label>
              <input
                type="email"
                {...registerInput('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold ${
                  errors.email ? 'border-red-500' : 'border-tara-beige'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-tara-black mb-1">
                Password
              </label>
              <input
                type="password"
                {...registerInput('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold ${
                  errors.password ? 'border-red-500' : 'border-tara-beige'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {isLogin && (
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-tara-gold hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-tara-gold text-white font-medium rounded-full hover:bg-tara-gold-light transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-tara-gray">
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 text-tara-gold hover:underline font-medium"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>

          <Link
            to="/"
            className="flex items-center justify-center mt-6 text-tara-gray hover:text-tara-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Home</span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}