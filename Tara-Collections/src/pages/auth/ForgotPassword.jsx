import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        setSubmitted(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(result.error || 'Failed to send reset email');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
      reset();
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 bg-tara-cream flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8">
        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-tara-black mb-4">
              Check Your Email
            </h1>
            <p className="text-tara-gray mb-6">
              We've sent a password reset link to your email address.
              Please check your inbox and click the link to reset your password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-tara-gold text-white font-medium rounded-full hover:bg-tara-gold-light transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Login</span>
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="text-center mb-8">
              <Link to="/" className="text-2xl font-serif font-bold text-tara-gold mb-4 inline-block">
                TARA COLLECTIONS
              </Link>
              <h1 className="text-2xl font-serif font-bold text-tara-black">Reset Password</h1>
              <p className="text-tara-gray mt-2">
                Enter your email address and we'll send you a link to reset your password
              </p>
            </div>

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
                    placeholder="Enter your email"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-tara-gold text-white font-medium rounded-full hover:bg-tara-gold-light transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? 'Sending...' : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="flex items-center justify-center text-tara-gold hover:underline font-medium"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to Login</span>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}