import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star as StarIcon,
  MessageSquare,
  Search,
  Edit,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Star,
  Smile,
  Frown,
  User,
  Eye,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const REVIEW_STATUS_FILTERS = [
  { value: 'all', label: 'All Reviews' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' }
];

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReview, setSelectedReview] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const reviewsRef = collection(db, 'reviews');
      let queryRef = query(reviewsRef, orderBy('createdAt', 'desc'));

      if (statusFilter !== 'all') {
        queryRef = query(reviewsRef, where('status', '==', statusFilter), orderBy('createdAt', 'desc'));
      }

      const reviewsSnap = await getDocs(queryRef);
      const reviewsData = reviewsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      setReviews(reviews.map(review =>
        review.id === reviewId ? { ...review, status: newStatus } : review
      ));
      toast.success(`Review ${newStatus}`);
    } catch (error) {
      console.error('Error updating review status:', error);
      toast.error('Failed to update review');
    }
  };

  const filteredReviews = reviews.filter(review =>
    review.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    review.reviewText?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <StarIcon
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400' : 'text-tara-beige'}`}
        fill={i < rating ? 'currentColor' : 'none'}
      />
    ));
  };

  const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / (reviews.length || 1);

  const stats = {
    total: reviews.length,
    approved: reviews.filter(r => r.status === 'approved').length,
    pending: reviews.filter(r => r.status === 'pending').length,
    rejected: reviews.filter(r => r.status === 'rejected').length
  };

  const ReviewModal = ({ review, onClose }) => {
    if (!review) return null;

    const handleApprove = () => {
      handleStatusChange(review.id, 'approved');
      setShowModal(false);
    };

    const handleReject = () => {
      if (window.confirm('Are you sure you want to reject this review?')) {
        handleStatusChange(review.id, 'rejected');
        setShowModal(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-tara-beige">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-tara-black">Review Details</h2>
              <button
                onClick={onClose}
                className="p-1 text-tara-gray hover:text-tara-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Review Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                {review.customerAvatar ? (
                  <img src={review.customerAvatar} alt={review.customerName} className="h-12 w-12 object-cover rounded-full" />
                ) : (
                  <div className="h-12 w-12 bg-tara-beige rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-tara-gray" />
                  </div>
                )}
                <div>
                  <h3 className="font-medium text-tara-black">{review.customerName}</h3>
                  <p className="text-sm text-tara-gray">{review.customerEmail}</p>
                  <div className="flex items-center mt-1">
                    {renderStars(review.rating || 5)}
                    <span className="ml-2 text-sm text-tara-gray">({review.rating || 5}/5)</span>
                  </div>
                </div>
              </div>

              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                review.status === 'approved' ? 'bg-green-100 text-green-800' :
                review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {review.status}
              </span>
            </div>

            {/* Product Info */}
            {review.productName && (
              <div className="bg-tara-cream rounded-lg p-4">
                <h4 className="font-medium text-tara-black mb-2">Reviewed Product</h4>
                <div className="flex items-center space-x-3">
                  {review.productImage && (
                    <img src={review.productImage} alt={review.productName} className="h-16 w-16 object-cover rounded" />
                  )}
                  <div>
                    <p className="font-medium">{review.productName}</p>
                    <p className="text-sm text-tara-gray">SKU: {review.productId?.slice(0, 8)}...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Review Text */}
            <div>
              <h4 className="font-medium text-tara-black mb-2">Review</h4>
              <p className="text-tara-gray bg-tara-cream p-3 rounded-relaxed">
                {review.reviewText || 'No review text provided'}
              </p>
            </div>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <div>
                <h4 className="font-medium text-tara-black mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {review.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs rounded-full bg-tara-gold/10 text-tara-gold"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Helpfulness */}
            <div className="border-t border-tara-beige pt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-tara-gray">Helpful? </span>
                  <button className="flex items-center space-x-1 hover:bg-tara-cream px-2 py-1 rounded">
                    <ThumbsUp className="h-4 w-4 text-tara-gray" />
                    <span className="text-sm text-tara-gray">Yes ({review.helpfulCount || 0})</span>
                  </button>
                </div>
                <span className="text-sm text-tara-gray">
                  Submitted: {formatDate(review.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            {review.status === 'pending' && (
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleApprove}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={handleReject}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 transition-colors"
                >
                  <Frown className="h-4 w-4" />
                  <span>Reject</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-tara-black">Reviews</h1>
        <p className="text-tara-gray mt-1">Manage customer reviews and ratings</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Reviews</p>
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
              <p className="text-sm text-tara-gray">Approved</p>
              <p className="text-2xl font-bold text-tara-black">{stats.approved}</p>
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
              <AlertCircle className="h-6 w-6 text-yellow-600" />
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
              <Frown className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Rejected</p>
              <p className="text-2xl font-bold text-tara-black">{stats.rejected}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Average Rating & Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Average Rating</h3>
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-tara-black">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center">
              {renderStars(Math.round(averageRating))}
            </div>
          </div>
          <p className="text-sm text-tara-gray mt-2">Based on {stats.total} reviews</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Rating Distribution</h3>
          {[5, 4, 3, 2, 1].map(rating => {
            const count = reviews.filter(r => r.rating === rating).length;
            const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;

            return (
              <div key={rating} className="flex items-center mb-2">
                <div className="flex items-center w-12">
                  {renderStars(rating)}
                </div>
                <div className="flex-1 bg-tara-beige rounded-full h-2 mx-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-sm text-tara-gray w-8">{count}</span>
              </div>
            );
          })}
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold bg-white"
          >
            {REVIEW_STATUS_FILTERS.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              fetchReviews();
            }}
            className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredReviews.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No reviews found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tara-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Reviewer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Product</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Rating</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tara-beige">
                <AnimatePresence>
                  {filteredReviews.map((review) => (
                    <motion.tr
                      key={review.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-tara-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {review.customerAvatar ? (
                            <img src={review.customerAvatar} alt={review.customerName} className="h-8 w-8 object-cover rounded-full" />
                          ) : (
                            <div className="h-8 w-8 bg-tara-beige rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-tara-gray" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-tara-black">{review.customerName}</p>
                            <p className="text-xs text-tara-gray">{review.customerEmail}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <Smile className="h-4 w-4 text-tara-gray" />
                          <span className="text-sm text-tara-gray">
                            {review.productName || 'Product'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center">
                          {renderStars(review.rating || 5)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          review.status === 'approved' ? 'bg-green-100 text-green-800' :
                          review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {review.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-tara-gray">
                        {formatDate(review.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowModal(true);
                          }}
                          className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedReview && (
        <ReviewModal
          review={selectedReview}
          onClose={() => {
            setShowModal(false);
            setSelectedReview(null);
          }}
        />
      )}
    </div>
  );
}