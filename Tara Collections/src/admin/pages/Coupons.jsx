import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Coupon,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  Percent,
  Gift,
  Calendar,
  Tag,
  Truck
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const COUPON_TYPES = [
  { value: 'percentage', label: 'Percentage', icon: Percent },
  { value: 'fixed', label: 'Fixed Amount', icon: Tag },
  { value: 'free_shipping', label: 'Free Shipping', icon: Truck }
];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    minOrderValue: '',
    usageLimit: '',
    usedCount: 0,
    expiresAt: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const couponsSnap = await getDocs(collection(db, 'coupons'));
      const couponsData = couponsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCoupons(couponsData);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCoupons = coupons.filter(coupon =>
    coupon.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setIsEditing(true);
    setFormData({
      code: coupon.code || '',
      type: coupon.type || 'percentage',
      value: coupon.value || '',
      minOrderValue: coupon.minOrderValue || '',
      usageLimit: coupon.usageLimit || '',
      usedCount: coupon.usedCount || 0,
      expiresAt: coupon.expiresAt || '',
      description: coupon.description || '',
      isActive: coupon.isActive !== false
    });
    setShowForm(true);
  };

  const handleDelete = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteDoc(doc(db, 'coupons', couponId));
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      } catch (error) {
        console.error('Error deleting coupon:', error);
        toast.error('Failed to delete coupon');
      }
    }
  };

  const handleSave = async () => {
    try {
      const couponData = {
        ...formData,
        value: parseFloat(formData.value) || 0,
        minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : 0,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (isEditing && editingCoupon) {
        await updateDoc(doc(db, 'coupons', editingCoupon.id), couponData);
        toast.success('Coupon updated successfully');
      } else {
        await addDoc(collection(db, 'coupons'), couponData);
        toast.success('Coupon created successfully');
      }

      closeForm();
      fetchCoupons();
    } catch (error) {
      console.error('Error saving coupon:', error);
      toast.error('Failed to save coupon');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const closeForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingCoupon(null);
    setFormData({
      code: '',
      type: 'percentage',
      value: '',
      minOrderValue: '',
      usageLimit: '',
      usedCount: 0,
      expiresAt: '',
      description: '',
      isActive: true
    });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatExpiresAt = (dateString) => {
    if (!dateString) return 'No expiry';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading && coupons.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Coupons</h1>
          <p className="text-tara-gray mt-1">Create and manage discount coupons</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Create Coupon</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <Coupon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Coupons</p>
              <p className="text-2xl font-bold text-tara-black">{coupons.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <Gift className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Active Coupons</p>
              <p className="text-2xl font-bold text-tara-black">
                {coupons.filter(c => c.isActive).length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Expired</p>
              <p className="text-2xl font-bold text-tara-black">
                {coupons.filter(c => !c.isActive || (c.expiresAt && new Date(c.expiresAt) < new Date())).length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
          <input
            type="text"
            placeholder="Search coupons by code or description..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
          />
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-6 text-center">
            <Coupon className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No coupons found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tara-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Value</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Expires</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tara-beige">
                <AnimatePresence>
                  {filteredCoupons.map((coupon) => {
                    const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
                    const isActive = coupon.isActive && !isExpired;
                    const TypeIcon = COUPON_TYPES.find(t => t.value === coupon.type)?.icon || Tag;

                    return (
                      <motion.tr
                        key={coupon.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-tara-cream/50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <code className="bg-tara-beige px-2 py-1 rounded text-sm font-mono font-bold text-tara-gold">
                            {coupon.code}
                          </code>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            <TypeIcon className="h-4 w-4 text-tara-gray" />
                            <span className="text-sm text-tara-black">{COUPON_TYPES.find(t => t.value === coupon.type)?.label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-tara-black">
                          {coupon.type === 'percentage' ? `${coupon.value}%` : `₹${coupon.value}`}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {isActive ? 'Active' : 'Expired'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-tara-gray">
                          {formatExpiresAt(coupon.expiresAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => handleEdit(coupon)}
                              className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(coupon.id)}
                              className="p-1 text-tara-gray hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
          })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Coupon Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-tara-beige">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-tara-black">
                  {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1 text-tara-gray hover:text-tara-black transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Coupon Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="e.g., TARA10"
                  uppercase
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Coupon Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold bg-white"
                  >
                    {COUPON_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">
                    {formData.type === 'fixed' ? 'Discount Amount (₹)' : formData.type === 'percentage' ? 'Discount (%)' : 'Value'}
                  </label>
                  <input
                    type="number"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Coupon description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Minimum Order Value (₹)</label>
                  <input
                    type="number"
                    name="minOrderValue"
                    value={formData.minOrderValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Usage Limit</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="e.g., 100 or leave blank for unlimited"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Expiry Date</label>
                <input
                  type="date"
                  name="expiresAt"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Status</label>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                    />
                    <span className="text-sm text-tara-gray">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>{isEditing ? 'Update Coupon' : 'Create Coupon'}</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}