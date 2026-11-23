import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, where, startAfter, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  Award,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  X,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'all', label: 'All Time' }
];

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [lastVisible, setLastVisible] = useState(null);

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersRef = collection(db, 'orders');
      let ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'));

      const today = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'quarter':
          startDate.setMonth(startDate.getMonth() - 3);
          break;
        default:
          startDate = new Date(2020, 0, 1);
          break;
      }

      if (dateRange !== 'all') {
        ordersQuery = query(ordersRef, where('createdAt', '>=', startDate), orderBy('createdAt', 'desc'));
      }

      const ordersSnap = await getDocs(ordersQuery);
      const ordersData = ordersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);

      // Fetch products
      const productsSnap = await getDocs(collection(db, 'products'));
      const productsData = productsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed' || o.status === 'delivered').length;

    const totalProducts = products.length;
    const inStockProducts = products.filter(p => p.stock > 0).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    const totalSaved = orders.reduce((sum, order) => sum + (order.discount || 0), 0);

    return {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      pendingOrders,
      completedOrders,
      totalProducts,
      inStockProducts,
      outOfStockProducts,
      totalSaved
    };
  };

  const getRevenueByDay = () => {
    const dailyData = {};

    orders.forEach(order => {
      if (order.createdAt) {
        const date = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
        const dateStr = date.toISOString().split('T')[0];

        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { date: dateStr, revenue: 0, orders: 0 };
        }

        dailyData[dateStr].revenue += order.total || 0;
        dailyData[dateStr].orders += 1;
      }
    });

    return Object.values(dailyData).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getStatusDistribution = () => {
    const statusData = {};

    orders.forEach(order => {
      const status = order.status || 'pending';
      statusData[status] = (statusData[status] || 0) + 1;
    });

    return statusData;
  };

  const getTopProducts = () => {
    const productSales = {};

    orders.forEach(order => {
      if (order.items) {
        order.items.forEach(item => {
          const productId = item.productId || item.name;
          if (!productSales[productId]) {
            productSales[productId] = {
              id: productId,
              name: item.name,
              totalSold: 0,
              revenue: 0
            };
          }
          productSales[productId].totalSold += item.quantity || 0;
          productSales[productId].revenue += (item.price || 0) * (item.quantity || 0);
        });
      }
    });

    return Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
  };

  const stats = calculateStats();
  const revenueByDay = getRevenueByDay();
  const statusDistribution = getStatusDistribution();
  const topProducts = getTopProducts();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Analytics</h1>
          <p className="text-tara-gray mt-1">Insights into your store performance</p>
        </div>
        <div className="flex space-x-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-tara-beige rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-tara-gold bg-white"
          >
            {DATE_RANGES.map(range => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <button
            onClick={fetchData}
            className="p-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          <button className="p-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors">
            <Download className="h-5 w-5" />
          </button>
        </div>
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
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Orders</p>
              <p className="text-2xl font-bold text-tara-black">{stats.totalOrders}</p>
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
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Revenue</p>
              <p className="text-2xl font-bold text-tara-black">₹{stats.totalRevenue > 0 ? stats.totalRevenue.toLocaleString() : '0'}</p>
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
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Avg Order Value</p>
              <p className="text-2xl font-bold text-tara-black">₹{stats.avgOrderValue > 0 ? stats.avgOrderValue.toLocaleString() : '0'}</p>
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
            <div className="p-3 bg-yellow-100 rounded-full">
              <Award className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Discount</p>
              <p className="text-2xl font-bold text-tara-black">₹{stats.totalSaved > 0 ? stats.totalSaved.toLocaleString() : '0'}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-tara-black">Revenue Trend</h3>
            <span className="text-2xl font-bold text-tara-gold">₹{stats.totalRevenue.toLocaleString()}</span>
          </div>

          {revenueByDay.length > 0 ? (
            <div className="h-64">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <polyline
                  points={revenueByDay.map((d, i) => `${(i + 1) * 40}, ${180 - (d.revenue / Math.max(...revenueByDay.map(x => x.revenue)) * 150)}`).join(' ')}
                  fill="none"
                  stroke="#C6A66B"
                  strokeWidth="2"
                />
              </svg>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center">
              <p className="text-tara-gray">No data available</p>
            </div>
          )}
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Order Status Distribution</h3>
          <div className="space-y-3">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;

              return (
                <div key={status}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-tara-gray capitalize">{status}</span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                  <div className="w-full bg-tara-beige rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: status === 'completed' || status === 'delivered' ? '#22C55E' :
                                         status === 'shipped' ? '#3B82F6' :
                                         status === 'processing' ? '#8B5CF6' :
                                         '#F59E0B'
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Top Selling Products</h3>
        {topProducts.length > 0 ? (
          <div className="space-y-3">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-tara-gold text-white text-sm font-bold rounded-full">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-tara-black">{product.name}</p>
                  <p className="text-sm text-tara-gray">{product.totalSold} sold</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-tara-black">₹{product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-tara-gray">No sales data available</p>
        )}
      </motion.div>

      {/* Inventory Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Inventory Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-tara-gray">In Stock</p>
                <p className="text-xl font-bold text-green-600">{stats.inStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-full">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-tara-gray">Out of Stock</p>
                <p className="text-xl font-bold text-yellow-600">{stats.outOfStockProducts}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-tara-gray">Total Products</p>
                <p className="text-xl font-bold text-blue-600">{stats.totalProducts}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Recent Orders</h3>
        {orders.slice(0, 5).length > 0 ? (
          <div className="divide-y divide-tara-beige">
            {orders.slice(0, 5).map(order => (
              <div
                key={order.id}
                className="flex justify-between items-center py-3"
              >
                <div>
                  <p className="font-medium text-tara-black">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-sm text-tara-gray">
                    {order.customerName}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full text-xs font-medium ${
                    order.status === 'completed' || order.status === 'delivered'
                      ? 'bg-green-100 text-green-800'
                      : order.status === 'shipped'
                      ? 'bg-indigo-100 text-indigo-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                  <p className="text-sm font-medium text-tara-black mt-1">
                    ₹{order.total?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-tara-gray">No orders in this period</p>
        )}
      </motion.div>
    </div>
  );
}