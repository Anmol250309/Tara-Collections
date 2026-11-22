import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  CheckCircle,
  Package,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Clock,
  Share2,
  Copy,
  QrCode
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function OrderConfirmation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUPIModal, setShowUPIModal] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        // Try to get orderId from location state or from URL params
        const id = orderId || location.state?.orderId;
        if (!id) {
          navigate('/');
          return;
        }

        const orderRef = doc(db, 'orders', id);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          const orderData = orderSnap.data();
          setOrder(orderData);

          // Update order status if payment was completed
          if (orderData.paymentStatus === 'pending' && orderData.status === 'pending') {
            await updateDoc(orderRef, {
              status: 'processing',
              paymentStatus: 'completed',
              updatedAt: serverTimestamp()
            });
            setOrder(prev => ({ ...prev, status: 'processing', paymentStatus: 'completed' }));
          }
        } else {
          toast.error('Order not found');
          navigate('/');
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, location.state, navigate]);

  const handleCopyUPILink = () => {
    if (order?.upiLink) {
      navigator.clipboard.writeText(order.upiLink);
      toast.success('UPI link copied to clipboard');
    }
  };

  const handleShareOrder = () => {
    if (navigator.share && order) {
      navigator.share({
        title: 'Order Confirmation - TARA COLLECTIONS',
        text: `Your order #${order.id?.slice(0, 8).toUpperCase()} has been placed successfully!`,
        url: window.location.href
      });
    } else {
      toast('Sharing not supported on this device');
    }
  };

  const getStatusBadge = () => {
    const status = order?.status || 'pending';
    const configs = {
      pending: { text: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Processing', color: 'bg-blue-100 text-blue-800' },
      shipped: { text: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
      delivered: { text: 'Delivered', color: 'bg-green-100 text-green-800' },
      completed: { text: 'Completed', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Cancelled', color: 'bg-red-100 text-red-800' }
    };
    const config = configs[status] || configs.pending;
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-tara-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto mb-4"></div>
          <p className="text-tara-gray">Loading order details...</p>
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-tara-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          className="text-center py-8 max-w-md"
        >
          <div className="p-4 bg-tara-cream rounded-full inline-block mb-4">
            <AlertCircle className="h-12 w-12 text-tara-gold" />
          </div>
          <h3 className="text-xl font-serif font-bold text-tara-black mb-2">Please Login</h3>
          <p className="text-tara-gray mb-4">You need to be logged in to view order details</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
          >
            Go to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tara-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-tara-black mb-2">
            Order Confirmed!
          </h1>
          <p className="text-tara-gray mb-4">Thank you for your order</p>
          <div className="inline-block bg-tara-gold text-white px-4 py-2 rounded-full font-medium">
            Order #{order?.id?.slice(0, 8).toUpperCase()}
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-serif font-bold text-tara-black mb-4">Order Summary</h2>

          <div className="divide-y divide-tara-beige mb-4">
            {order?.items?.map((item, index) => (
              <div key={index} className="py-3 flex items-center">
                <div className="w-12 h-12 bg-tara-cream rounded-full flex-shrink-0 mr-3 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <Package className="h-6 w-6 text-tara-gold" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-tara-black">{item.name}</p>
                  <p className="text-sm text-tara-gray">{item.quantity} × ₹{item.price?.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-tara-beige pt-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-tara-gray">Subtotal</span>
              <span className="font-medium text-tara-black">₹{order?.itemsTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tara-gray">Shipping</span>
              <span className="font-medium text-tara-black">
                {order?.shipping === 0 ? 'FREE' : `₹${order?.shipping?.toLocaleString()}`}
              </span>
            </div>
            <div className="border-t border-tara-beige pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-tara-gold">₹{order?.total?.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-serif font-bold text-tara-black mb-4">Delivery Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-tara-gray mb-1">Delivered To</p>
              <p className="font-medium text-tara-black">{order?.customerName}</p>
            </div>
            <div>
              <p className="text-sm text-tara-gray mb-1">Order Date</p>
              <p className="font-medium text-tara-black">
                {order?.createdAt?.toDate
                  ? order.createdAt.toDate().toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : new Date(order?.createdAt?.seconds * 1000 || Date.now()).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-tara-gray mb-1">Shipping Address</p>
              <p className="font-medium text-tara-black">
                {order?.address}
                {order?.city && `, ${order.city}`}
                {order?.state && `, ${order.state}`}
                {order?.zipCode && ` ${order.zipCode}`}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Payment Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-serif font-bold text-tara-black mb-4">Payment Information</h2>

          <div className="flex items-center justify-between p-4 bg-tara-cream rounded-lg mb-4">
            <div className="flex items-center space-x-3">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-tara-gold rounded-full">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-tara-black">{order?.paymentMethod?.toUpperCase() || 'UPI'}</p>
                <p className="text-sm text-tara-gray">{getStatusBadge()}</p>
              </div>
            </div>
            {order?.upiLink && (
              <button
                onClick={() => setShowUPIModal(true)}
                className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
              >
                <QrCode className="h-5 w-5" />
              </button>
            )}
          </div>

          {order?.status === 'pending' && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Payment pending:</strong> Please complete your UPI payment using the link below.
              </p>
            </div>
          )}
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
        >
          <button
            onClick={() => {
              const upiLink = order?.upiLink;
              if (upiLink) {
                navigator.clipboard.writeText(upiLink);
                toast.success('UPI link copied to clipboard');
              }
            }}
            className="flex items-center justify-center space-x-2 px-4 py-3 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
          >
            <Copy className="h-5 w-5" />
            <span>Copy UPI Link</span>
          </button>

          <button
            onClick={handleShareOrder}
            className="flex items-center justify-center space-x-2 px-4 py-3 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
          >
            <Share2 className="h-5 w-5" />
            <span>Share Order</span>
          </button>

          <button
            onClick={() => navigate('/profile')}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
          >
            <Package className="h-5 w-5" />
            <span>View Profile</span>
          </button>
        </motion.div>

        {/* Continue Shopping */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center"
        >
          <button
            onClick={() => navigate('/')}
            className="px-8 py-3 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>

      {/* UPI Modal */}
      <AnimatePresence>
        {showUPIModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-serif font-bold text-tara-black mb-4 flex items-center space-x-2">
                <QrCode className="h-6 w-6 text-tara-gold" />
                <span>UPI Payment</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-tara-gray mb-2">Payment Link:</p>
                  <div className="bg-tara-cream p-3 rounded-full font-mono text-xs break-all">
                    {order?.upiLink}
                  </div>
                </div>

                <button
                  onClick={handleCopyUPILink}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy to Clipboard</span>
                </button>

                <button
                  onClick={() => setShowUPIModal(false)}
                  className="w-full px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}