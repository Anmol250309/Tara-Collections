import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Search,
  Edit,
  ExternalLink,
  Truck,
  CheckCircle,
  AlertCircle,
  Package,
  MapPin,
  Phone,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const ORDER_STATUS = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'processing', label: 'Processing', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: 'Shipped', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const ordersSnap = await getDocs(query(ordersRef, orderBy('createdAt', 'desc')));
      const ordersData = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date()
      });

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusData = ORDER_STATUS.find(s => s.value === status) || ORDER_STATUS[0];

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusData.color}`}>
        {statusData.label}
      </span>
    );
  };

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

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6 border-b border-tara-beige">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-serif font-bold text-tara-black">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
              <button
                onClick={onClose}
                className="p-1 text-tara-gray hover:text-tara-black transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm text-tara-gray mb-1">Order Date</h3>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <h3 className="text-sm text-tara-gray mb-1">Status</h3>
                <div>{getStatusBadge(order.status)}</div>
              </div>
              <div>
                <h3 className="text-sm text-tara-gray mb-1">Payment Method</h3>
                <p className="font-medium">{order.paymentMethod || 'UPI'}</p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-tara-cream rounded-lg p-4">
              <h3 className="font-medium text-tara-black mb-3">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-tara-gray">{order.customerEmail}</p>
                </div>
                <div>
                  <p className="text-sm">{order.shippingAddress?.street}</p>
                  <p className="text-sm">{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium text-tara-black mb-3">Items</h3>
              <div className="space-y-3">
                {order.items?.map((item, index) => (
                  <div key={index} className="grid grid-cols-4 gap-4 p-3 bg-white rounded-lg border border-tara-beige">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-16 w-16 object-cover rounded" />
                    ) : (
                      <div className="h-16 w-16 bg-tara-beige rounded flex items-center justify-center">
                        <Package className="h-6 w-6 text-tara-gray" />
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="font-medium text-tara-black">{item.name}</p>
                      {item.selectedSize && <p className="text-sm text-tara-gray">Size: {item.selectedSize}</p>}
                      {item.selectedColor && <p className="text-sm text-tara-gray">Color: {item.selectedColor}</p>}
                      <p className="text-sm text-tara-gray">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="border-t border-tara-beige pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-tara-gray">Subtotal</span>
                <span className="font-medium">₹{order.subtotal || 0}</span>
              </div>
              {order.shipping > 0 && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-tara-gray">Shipping</span>
                  <span className="font-medium">₹{order.shipping || 0}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between items-center mb-2 text-green-600">
                  <span>Discount</span>
                  <span className="font-medium">- ₹{order.discount || 0}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-3 border-t border-tara-beige">
                <span className="text-lg font-bold">Total</span>
                <span className="text-2xl font-bold text-tara-gold">₹{order.total || 0}</span>
              </div>
            </div>

            {/* Update Status */}
            <div>
              <h3 className="font-medium text-tara-black mb-3">Update Status</h3>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="w-full p-3 border border-tara-beige rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-tara-gold"
              >
                {ORDER_STATUS.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-6 border-t border-tara-beige flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-tara-black">Orders</h1>
        <p className="text-tara-gray mt-1">Manage customer orders</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
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
          <option value="all">All Statuses</option>
          {ORDER_STATUS.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tara-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tara-beige">
                <AnimatePresence>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-tara-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <code className="bg-tara-beige px-2 py-1 rounded text-sm font-mono">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium text-tara-black">{order.customerName}</p>
                          <p className="text-sm text-tara-gray">{order.customerEmail}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-tara-black">
                        ₹{order.total || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-tara-gray">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                        >
                          <ExternalLink className="h-5 w-5" />
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}