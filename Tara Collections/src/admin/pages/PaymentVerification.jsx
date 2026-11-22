import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  Filter,
  X,
  RefreshCw,
  FileText,
  User,
  Calendar,
  Ruler
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending Verification', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'verified', label: 'Verified', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' }
];

export default function AdminPaymentVerification() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [statusFilter]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const paymentsRef = collection(db, 'payments');
      let paymentsQuery = query(paymentsRef, orderBy('createdAt', 'desc'));

      if (statusFilter !== 'all') {
        paymentsQuery = query(paymentsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
      }

      const paymentsSnap = await getDocs(paymentsQuery);
      const paymentsData = paymentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId, status) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: status,
        verifiedAt: new Date(),
        verifiedBy: 'admin'
      });

      setPayments(prev => prev.map(p =>
        p.id === paymentId ? { ...p, status, verifiedAt: new Date() } : p
      ));

      setShowModal(false);
      setSelectedPayment(null);

      if (status === 'verified' || status === 'completed') {
        toast.success('Payment verified successfully');
      } else {
        toast.success('Payment marked as rejected');
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      const paymentRef = doc(db, 'payments', paymentId);
      await updateDoc(paymentRef, {
        status: newStatus,
        verifiedAt: new Date()
      });

      setPayments(prev => prev.map(p =>
        p.id === paymentId ? { ...p, status: newStatus, verifiedAt: new Date() } : p
      ));

      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        (payment.id && payment.id.toLowerCase().includes(searchLower)) ||
        (payment.customerName && payment.customerName.toLowerCase().includes(searchLower)) ||
        (payment.upiId && payment.upiId.toLowerCase().includes(searchLower)) ||
        (payment.orderId && payment.orderId.toLowerCase().includes(searchLower))
      );
    }
    return true;
  });

  const calculateStats = () => {
    const total = payments.length;
    const verified = payments.filter(p => p.status === 'verified' || p.status === 'completed').length;
    const pending = payments.filter(p => p.status === 'pending').length;
    const rejected = payments.filter(p => p.status === 'rejected').length;

    const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const verifiedAmount = payments
      .filter(p => p.status === 'verified' || p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      total,
      verified,
      pending,
      rejected,
      totalAmount,
      verifiedAmount,
      verificationRate: total > 0 ? ((verified / total) * 100).toFixed(1) : 0
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Payment Verification</h1>
          <p className="text-tara-gray mt-1">Review and verify customer payments</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Payments</p>
              <p className="text-2xl font-bold text-tara-black">{stats.total}</p>
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
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Verified</p>
              <p className="text-2xl font-bold text-tara-black">{stats.verified}</p>
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
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Pending</p>
              <p className="text-2xl font-bold text-tara-black">{stats.pending}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Rejected</p>
              <p className="text-2xl font-bold text-tara-black">{stats.rejected}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <Ruler className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Revenue</p>
              <p className="text-2xl font-bold text-tara-black">₹{stats.totalAmount.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-full">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Verification Rate</p>
              <p className="text-2xl font-bold text-tara-black">{stats.verificationRate}%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-tara-beige rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-tara-gold bg-white"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3 h-5 w-5 text-tara-gray" />
          <input
            type="text"
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
          />
        </div>
      </div>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
            <p className="text-tara-gray mt-4">Loading payments...</p>
          </div>
        ) : filteredPayments.length > 0 ? (
          <div className="divide-y divide-tara-beige">
            {filteredPayments.map((payment, index) => (
              <motion.div
                key={payment.id || index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="p-6 hover:bg-tara-cream/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="p-2 bg-tara-gold rounded-full">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-tara-black">{payment.customerName || 'Anonymous'}</h4>
                        <p className="text-sm text-tara-gray">
                          {payment.method?.toUpperCase() || 'UPI'} • {payment.id?.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-tara-gray">Amount</p>
                        <p className="font-medium text-tara-black">₹{payment.amount?.toLocaleString() || '0'}</p>
                      </div>
                      <div>
                        <p className="text-tara-gray">Order ID</p>
                        <p className="font-medium text-tara-black">
                          {payment.orderId ? `#${payment.orderId.slice(0, 8).toUpperCase()}` : 'N/A'}
                        </p>
                      </div>
                      {payment.upiId && (
                        <div>
                          <p className="text-tara-gray">UPI ID</p>
                          <p className="font-medium text-tara-black font-mono text-xs">{payment.upiId}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-tara-gray">Date</p>
                        <p className="font-medium text-tara-black">
                          {payment.createdAt
                            ? new Date(payment.createdAt.seconds || payment.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                      STATUS_OPTIONS.find(s => s.value === (payment.status || 'pending'))?.color || STATUS_OPTIONS[0].color
                    }`}>
                      {(payment.status || 'pending').charAt(0).toUpperCase() + (payment.status || 'pending').slice(1)}
                    </span>

                    {payment.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowModal(true);
                          }}
                          className="px-3 py-1 text-xs border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                        >
                          Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No payments found</p>
          </div>
        )}
      </motion.div>

      {/* Modal for Payment Review */}
      <AnimatePresence>
        {showModal && selectedPayment && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4"
            >
              <div className="p-6 border-b border-tara-beige">
                <h3 className="text-lg font-serif font-bold text-tara-black">Verify Payment</h3>
                <p className="text-tara-gray text-sm mt-1">Review the payment details before verification</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-tara-cream rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-tara-gray">Customer</p>
                      <p className="font-medium text-tara-black">{selectedPayment.customerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-tara-gray">Method</p>
                      <p className="font-medium text-tara-black">{selectedPayment.method?.toUpperCase()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-tara-gray">Amount</p>
                      <p className="font-medium text-tara-black">₹{selectedPayment.amount?.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-tara-gray">Order ID</p>
                      <p className="font-medium text-tara-black">
                        {selectedPayment.orderId ? `#${selectedPayment.orderId.slice(0, 8).toUpperCase()}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedPayment.notes && (
                  <div>
                    <p className="text-sm font-medium text-tara-black mb-1">Notes</p>
                    <p className="text-sm text-tara-gray bg-tara-cream p-3 rounded-full">{selectedPayment.notes}</p>
                  </div>
                )}

                {selectedPayment.uploadedPaymentProof && (
                  <div>
                    <p className="text-sm font-medium text-tara-black mb-2">Payment Proof</p>
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-tara-gold" />
                      <span className="text-sm text-tara-gray">Payment screenshot uploaded</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-b border-tara-beige flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerifyPayment(selectedPayment.id, 'rejected')}
                  className="px-4 py-2 border border-red-200 rounded-full text-red-600 hover:bg-red-50 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleVerifyPayment(selectedPayment.id, 'verified')}
                  className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Verify Payment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}