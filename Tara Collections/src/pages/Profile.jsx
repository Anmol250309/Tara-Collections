import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Heart,
  Package,
  Clock,
  Shield,
  ShieldCheck,
  AlertCircle,
  Edit,
  Save,
  X,
  Star,
  ShoppingBag,
  History
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [activeTab, setActiveTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: ''
  });

  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchUserData();
    fetchOrders();
    fetchReviews();
  }, [user]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      if (user?.uid) {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileData({
            customerName: data.customerName || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zipCode: data.zipCode || '',
            notes: data.notes || ''
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      if (!user?.uid) return;

      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy('createdAt', 'desc'));
      const ordersSnap = await getDocs(q);
      const ordersData = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!user?.uid) return;

      const reviewsRef = collection(db, 'reviews');
      const q = query(reviewsRef, orderBy('createdAt', 'desc'));
      const reviewsSnap = await getDocs(reviewsRef);
      const reviewsData = reviewsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      if (!user?.uid) return;

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...profileData,
        updatedAt: serverTimestamp()
      });

      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
      toast.error('Failed to logout');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderRating = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'
          }`}
        />
      ));
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all ${
        activeTab === id
          ? 'bg-tara-gold text-white'
          : 'bg-white border border-tara-beige text-tara-gray hover:bg-tara-cream'
      }`}
    >
      <Icon className="h-5 w-5 mb-1" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-tara-bg flex items-center justify-center">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  const userOrders = orders.filter(o => o.userId === user?.uid);
  const userReviews = reviews.filter(r => r.userId === user?.uid);

  return (
    <div className="min-h-screen bg-tara-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          className="mb-6"
        >
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-serif font-bold text-tara-black">My Account</h1>
              <p className="text-tara-gray mt-1">Welcome back, {user?.displayName || user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-tara-cream rounded-full flex items-center justify-center">
                <User className="h-10 w-10 text-tara-gold" />
              </div>
              <div>
                <h2 className="text-xl font-serif font-bold text-tara-black">{profileData.customerName}</h2>
                <p className="text-tara-gray">{profileData.email}</p>
              </div>
            </div>
            {isEditing ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="p-2 bg-tara-gold text-white rounded-full hover:bg-tara-gold-light transition-colors"
                >
                  <Save className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
              >
                <Edit className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-tara-gray mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                />
              ) : (
                <p className="text-tara-black">{profileData.phone || 'Not set'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-tara-gray mb-1">Member Since</label>
              <p className="text-tara-black">
                {user?.metadata?.creationTime
                  ? new Date(user.metadata.creationTime).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })
                  : 'N/A'}
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-tara-gray mb-1">Delivery Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold resize-none"
                />
              ) : (
                <p className="text-tara-black">{profileData.address || 'Not set'}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg mb-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <TabButton id="orders" label="Orders" icon={Package} />
            <TabButton id="reviews" label="Reviews" icon={Star} />
            <TabButton id="addresses" label="Addresses" icon={MapPin} />
            <TabButton id="security" label="Security" icon={Shield} />
          </div>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {userOrders.length > 0 ? (
              <div className="space-y-4">
                {userOrders.map(order => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 1 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-tara-black">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <p className="text-sm text-tara-gray">
                          {new Date(order.createdAt?.seconds || Date.now()).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </div>

                    <div className="divide-y divide-tara-beige">
                      {order.items?.map((item, index) => (
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
                            <p className="text-sm text-tara-gray">
                              {item.quantity} × ₹{item.price?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <p className="text-sm text-tara-gray">Total</p>
                        <p className="font-bold text-tara-black">₹{order.total?.toLocaleString()}</p>
                      </div>
                      <button
                        onClick={() => toast('Order tracking coming soon!')}
                        className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                      >
                        Track Order
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <ShoppingBag className="h-12 w-12 text-tara-gray mx-auto mb-4" />
                <h3 className="text-lg font-medium text-tara-black mb-2">No orders yet</h3>
                <p className="text-tara-gray mb-4">You haven't placed any orders yet.</p>
                <button
                  onClick={() => navigate('/')}
                  className="px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  Browse Products
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {userReviews.length > 0 ? (
              <div className="space-y-4">
                {userReviews.map(review => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 1 }}
                    className="bg-white rounded-xl shadow-lg p-6"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium text-tara-black">{review.productName || 'Product'} </h4>
                          <div className="flex items-center space-x-1">
                            {renderRating(review.rating || 5)}
                          </div>
                        </div>
                        <p className="text-tara-gray text-sm">{review.review || 'No review text'}</p>
                        <p className="text-xs text-tara-gray mt-2">
                          {new Date(review.createdAt?.seconds || Date.now()).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Heart className="h-12 w-12 text-tara-gray mx-auto mb-4" />
                <h3 className="text-lg font-medium text-tara-black mb-2">No reviews yet</h3>
                <p className="text-tara-gray">Share your experience with products you've purchased!</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-serif font-bold text-tara-black">Delivery Addresses</h2>
              <button
                onClick={() => toast('Add address feature coming soon!')}
                className="px-3 py-2 bg-tara-gold text-white rounded-full text-sm font-medium hover:bg-tara-gold-light transition-colors"
              >
                <MapPin className="h-4 w-4 inline mr-1" />
                Add New
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-tara-cream rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-tara-gold mt-0.5" />
                  <div>
                    <p className="font-medium text-tara-black">{profileData.customerName}</p>
                    <p className="text-sm text-tara-gray">{profileData.address}</p>
                    <p className="text-sm text-tara-gray">
                      {profileData.city}, {profileData.state} {profileData.zipCode}
                    </p>
                  </div>
                </div>
              </div>

              {profileData.address && (
                <div className="bg-white rounded-lg p-4 border border-tara-beige">
                  <p className="text-tara-gray text-sm mb-2">Saved Address</p>
                  <p className="font-medium text-tara-black">{profileData.address}</p>
                  <p className="text-sm text-tara-gray mt-1">
                    {profileData.city}, {profileData.state} {profileData.zipCode}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-lg font-serif font-bold text-tara-black mb-4">Security Settings</h2>

            <div className="space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Account Security</p>
                    <p className="text-sm text-green-700">Your account is protected with Firebase Authentication</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-blue-900">Payment Security</p>
                    <p className="text-sm text-blue-700">UPI payments are secured with encrypted payment links</p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Important Notice</p>
                    <p className="text-sm text-yellow-700">
                      Always verify UPI payment links before completing transactions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}