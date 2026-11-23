import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  Wallet,
  Smartphone,
  Calendar,
  Ruler,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
  RefreshCw,
  Package
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [orderLoading, setLoadingOrder] = useState(false);
  const [settings, setSettings] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const [selectedPayment, setSelectedPayment] = useState('upi');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    fetchSettings();
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const settingsSnap = await getDoc(doc(db, 'settings', 'website'));
      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings(data);
        setFormData(prev => ({
          ...prev,
          customerName: user?.displayName || '',
          email: user?.email || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }

    try {
      const paymentSnap = await getDoc(doc(db, 'settings', 'paymentSettings'));
      if (paymentSnap.exists()) {
        setPaymentSettings(paymentSnap.data());
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
    }
  };

  const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateShipping = () => {
    if (!settings?.shipping) return 50;
    if (cartTotal >= (settings.shipping.freeShippingThreshold || 500)) return 0;
    return settings.shipping.shippingCost || 50;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      toast.error('Please enter your name');
      return false;
    }
    if (!formData.phone.trim()) {
      toast.error('Please enter your phone number');
      return false;
    }
    if (!formData.address.trim()) {
      toast.error('Please enter your delivery address');
      return false;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter your city');
      return false;
    }
    return true;
  };

  const generateUPILink = () => {
    const paymentData = new URLSearchParams({
      pa: upiId,
      pn: formData.customerName || 'TARA COLLECTIONS',
      tn: `Order #${Date.now().toString().slice(-6)}`,
      am: (cartTotal + calculateShipping()).toFixed(2),
      cu: 'INR'
    });
    return `upi://pay?${paymentData.toString()}`;
  };

  const createOrder = async () => {
    if (!validateForm()) return false;

    setLoadingOrder(true);

    try {
      const orderData = {
        userId: user?.uid || null,
        customerName: formData.customerName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        notes: formData.notes,
        items: cartItems,
        itemsTotal: cartTotal,
        shipping: calculateShipping(),
        total: cartTotal + calculateShipping(),
        status: 'pending',
        paymentMethod: selectedPayment,
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const orderRef = await addDoc(collection(db, 'orders'), orderData);

      // Clear cart
      localStorage.removeItem('cart');

      toast.success('Order placed successfully!');
      return true;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to place order');
      return false;
    } finally {
      setLoadingOrder(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (selectedPayment === 'upi' && !upiId) {
      toast.error('Please enter your UPI ID');
      return;
    }

    const orderCreated = await createOrder();
    if (orderCreated) {
      if (selectedPayment === 'upi') {
        const upiLink = generateUPILink();

        window.location.href = upiLink;

        setTimeout(() => {
          navigate('/order-confirmation');
        }, 1000);
      } else {
        navigate('/order-confirmation');
      }
    }
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI', icon: Smartphone },
    { id: 'cod', name: 'Cash on Delivery', icon: CreditCard }
  ];

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-tara-bg flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          className="text-center py-12"
        >
          <div className="p-4 bg-tara-cream rounded-full inline-block mb-4">
            <ShoppingCart className="h-12 w-12 text-tara-gold" />
          </div>
          <h3 className="text-xl font-serif font-bold text-tara-black mb-2">Your cart is empty</h3>
          <p className="text-tara-gray mb-6">Add items to your cart before checking out</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-tara-bg py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-serif font-bold text-tara-black">Checkout</h1>
          <p className="text-tara-gray mt-1">Complete your order</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-serif font-bold text-tara-black mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-tara-gold" />
                <span>Delivery Information</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Full Name</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-tara-black mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tara-black mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Delivery Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="House/Flat number, Street name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-tara-black mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tara-black mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-tara-black mb-1">PIN Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                      placeholder="6 digits"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Order Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold resize-none"
                    placeholder="Special instructions for delivery..."
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-serif font-bold text-tara-black mb-4 flex items-center space-x-2">
                <CreditCard className="h-5 w-5 text-tara-gold" />
                <span>Payment Method</span>
              </h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.id}
                      className={`flex items-center p-4 border rounded-xl cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-tara-gold bg-tara-cream'
                          : 'border-tara-beige hover:bg-tara-cream/50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={selectedPayment === method.id}
                        onChange={() => setSelectedPayment(method.id)}
                        className="mr-3"
                      />
                      <Icon className="h-5 w-5 text-tara-gray mr-2" />
                      <span className="font-medium text-tara-black">{method.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* UPI Details */}
            {selectedPayment === 'upi' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-md font-medium text-tara-black mb-3">UPI Payment</h3>
                <p className="text-sm text-tara-gray mb-4">
                  Enter your UPI ID to receive the payment link. You will be redirected to your UPI app to complete the payment.
                </p>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="eg: 1234567890@okicici"
                />
              </motion.div>
            )}
          </div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 1 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-serif font-bold text-tara-black mb-4">Order Summary</h2>

              <div className="divide-y divide-tara-beige">
                {cartItems.map((item, index) => (
                  <div key={item.id || index} className="py-3 flex items-center">
                    <div className="w-12 h-12 bg-tara-cream rounded-full flex-shrink-0 mr-3 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-full" />
                      ) : (
                        <Package className="h-6 w-6 text-tara-gold" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-tara-black">{item.name}</p>
                      <p className="text-sm text-tara-gray">{item.quantity} × ₹{item.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-tara-gray">Subtotal</span>
                  <span className="font-medium text-tara-black">₹{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-tara-gray">Shipping</span>
                  <span className="font-medium text-tara-black">
                    {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping().toLocaleString()}`}
                  </span>
                </div>
                {settings?.shipping?.freeShippingThreshold && cartTotal < settings.shipping.freeShippingThreshold && (
                  <p className="text-xs text-tara-gray">
                    Free shipping on orders above ₹{settings.shipping.freeShippingThreshold.toLocaleString()}
                  </p>
                )}
                <div className="border-t border-tara-beige pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{(cartTotal + calculateShipping()).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={loadingOrder}
              className="w-full flex items-center justify-center space-x-2 py-4 bg-tara-gold text-white rounded-xl font-bold text-lg hover:bg-tara-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingOrder ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="h-5 w-5" />
                  <span>Place Order - ₹{cartTotal.toLocaleString()}</span>
                </>
              )}
            </button>

            <div className="flex items-center justify-center space-x-4 text-xs text-tara-gray">
              <Shield className="h-4 w-4" />
              <span>Secure payment guaranteed</span>
              <CheckCircle className="h-4 w-4" />
              <span>100% Money-back guarantee</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}