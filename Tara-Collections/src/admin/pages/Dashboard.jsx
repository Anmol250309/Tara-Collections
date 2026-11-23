import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import {
  ShoppingCart,
  Package,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch orders
        const ordersRef = collection(db, 'orders');
        const ordersSnap = await getDocs(ordersRef);
        const orders = ordersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Fetch products
        const productsSnap = await getDocs(collection(db, 'products'));

        // Fetch customers count
        const usersRef = collection(db, 'users');
        const usersSnap = await getDocs(query(usersRef, where('role', '==', 'customer')));

        const totalRevenue = orders
          .filter(o => o.status === 'delivered' || o.status === 'completed')
          .reduce((sum, order) => sum + (order.total || 0), 0);

        const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'processing');

        setStats({
          totalOrders: orders.length,
          totalRevenue: totalRevenue.toFixed(2),
          totalProducts: productsSnap.size,
          totalCustomers: usersSnap.size,
          pendingOrders: pendingOrders.length
        });

        // Get recent 5 orders
        const recent = orders
          .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0))
          .slice(0, 5);
        setRecentOrders(recent);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statsCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'text-tara-gold',
      bgColor: 'bg-tara-gold/10'
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue}`,
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', icon: AlertCircle, color: 'bg-yellow-100 text-yellow-800' },
      processing: { text: 'Processing', icon: Award, color: 'bg-blue-100 text-blue-800' },
      delivered: { text: 'Delivered', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      completed: { text: 'Completed', icon: CheckCircle, color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'Cancelled', icon: AlertCircle, color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Dashboard</h1>
          <p className="text-tara-gray mt-1">Welcome to your admin panel</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-tara-gray font-medium">{card.title}</p>
                <p className="text-2xl font-bold text-tara-black">{card.value}</p>
              </div>
              <div className={`p-3 rounded-full ${card.bgColor}`}>
                {card.icon && <card.icon className={`h-6 w-6 ${card.color}`} />}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-serif font-bold text-tara-black mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/products"
            className="p-4 border border-tara-beige rounded-lg hover:border-tara-gold transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Package className="h-6 w-6 text-tara-gold" />
              <div>
                <h3 className="font-medium text-tara-black">Manage Products</h3>
                <p className="text-sm text-tara-gray">Add, edit, or remove products</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/orders"
            className="p-4 border border-tara-beige rounded-lg hover:border-tara-gold transition-colors"
          >
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-6 w-6 text-tara-gold" />
              <div>
                <h3 className="font-medium text-tara-black">View Orders</h3>
                <p className="text-sm text-tara-gray">Track and fulfill orders</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/customers"
            className="p-4 border border-tara-beige rounded-lg hover:border-tara-gold transition-colors"
          >
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-tara-gold" />
              <div>
                <h3 className="font-medium text-tara-black">Customer List</h3>
                <p className="text-sm text-tara-gray">View and manage customers</p>
              </div>
            </div>
          </a>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-serif font-bold text-tara-black">Recent Orders</h2>
          <a href="/admin/orders" className="text-sm text-tara-gold hover:underline">
            View All
          </a>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-tara-gold mx-auto"></div>
          </div>
        ) : recentOrders.length === 0 ? (
          <p className="text-tara-gray text-center py-8">No recent orders</p>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="border border-tara-beige rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-tara-black">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-sm text-tara-gray">
                      {order.customerName || order.email} • {new Date(order.createdAt?.toDate()).toLocaleDateString('en-IN')}
                    </p>
                    <p className="text-sm text-tara-gray">
                      {order.items?.length || 0} items
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-tara-black">₹{order.total || 0}</p>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}