import { useState, useEffect } from 'react'
import { Package, ShoppingBag, Users, DollarSign, TrendingUp, TrendingDown, Loader2, ArrowUpRight, ArrowDownRight, Minus, Clock, CheckCircle, X } from 'lucide-react'
import { getOrderStats, getRevenueAnalytics } from '../../services/orders'
import { getProducts } from '../../services/products'
import { format } from 'date-fns'

function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [revenueData, setRevenueData] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [statsRes, revenueRes] = await Promise.all([
          getOrderStats(),
          getRevenueAnalytics(period)
        ])
        setStats(statsRes)
        setRevenueData(revenueRes)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period])

  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const { getAllOrders } = await import('../../services/orders')
        const result = await getAllOrders({ limit: 5 })
        setRecentOrders(result.orders)
      } catch (error) {
        console.error('Error fetching recent orders:', error)
      }
    }
    fetchRecentOrders()
  }, [])

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: Package,
      color: 'bg-primary-500',
      trend: '+12%',
      trendUp: true
    },
    {
      label: 'Total Revenue',
      value: stats?.totalRevenue ? `₹${stats.totalRevenue.toLocaleString()}` : '₹0',
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+8%',
      trendUp: true
    },
    {
      label: 'Pending Orders',
      value: stats?.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: 'Requires attention',
      trendUp: false
    },
    {
      label: 'Total Customers',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
      trend: '+5%',
      trendUp: true
    }
  ]

  const statusCards = [
    { label: 'Pending', value: stats?.pending || 0, color: 'bg-yellow-100 text-yellow-700', icon: Clock },
    { label: 'Processing', value: (stats?.processing || 0) + (stats?.shipped || 0) + (stats?.out_for_delivery || 0), color: 'bg-blue-100 text-blue-700', icon: Package },
    { label: 'Delivered', value: stats?.delivered || 0, color: 'bg-green-100 text-green-700', icon: CheckCircle },
    { label: 'Cancelled', value: stats?.cancelled || 0, color: 'bg-red-100 text-red-700', icon: X }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl shadow-card p-6 animate-pulse">
              <div className="h-5 bg-dark-100 rounded w-1/2 mb-4" />
              <div className="h-8 bg-dark-100 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2">Dashboard</h1>
          <p className="text-body text-dark-500 mt-1">Overview of your store performance</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="input w-auto py-2 px-3"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-dark-500 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-dark-950">{stat.value}</p>
                <div className="flex items-center gap-1 mt-2">
                  {stat.trendUp ? (
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-xl`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts & Status */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card p-6">
          <h2 className="heading-3 mb-6">Revenue Overview</h2>
          <div className="h-64">
            <RevenueChart data={revenueData} />
          </div>
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-card p-6">
          <h2 className="heading-3 mb-6">Order Status</h2>
          <div className="space-y-4">
            {statusCards.map((status, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.color}`}>
                  <status.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-dark-950">{status.label}</p>
                  <p className="text-sm text-dark-500">{status.value} orders</p>
                </div>
                <div className="w-16 text-right font-bold text-dark-950">{status.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-100 flex items-center justify-between">
          <h2 className="heading-3">Recent Orders</h2>
          <Link to="/admin/orders" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-primary-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-dark-500">No orders yet</td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-dark-950">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark-950">{order.shippingAddress?.fullName || 'Guest'}</p>
                        <p className="text-sm text-dark-500">{order.userId?.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600">
                      {order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-dark-950">
                      ₹{order.total?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function RevenueChart({ data }) {
  if (data.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-dark-500">
        No revenue data for this period
      </div>
    )
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue))
  const minRevenue = Math.min(...data.map(d => d.revenue))

  return (
    <svg className="w-full h-full" viewBox="0 0 800 256" preserveAspectRatio="none">
      <defs>
        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C6A66B" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#C6A66B" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area */}
      <path
        d={getAreaPath(data, maxRevenue, minRevenue)}
        fill="url(#revenueGradient)"
      />

      {/* Line */}
      <path
        d={getLinePath(data, maxRevenue, minRevenue)}
        stroke="#C6A66B"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Points */}
      {data.map((point, index) => (
        <circle
          key={index}
          cx={getX(index, data.length)}
          cy={getY(point.revenue, maxRevenue, minRevenue)}
          r="4"
          fill="#C6A66B"
        />
      ))}
    </svg>
  )
}

function getX(index, length) {
  if (length <= 1) return 400
  return 50 + (index / (length - 1)) * 700
}

function getY(value, max, min) {
  if (max === min) return 128
  const normalized = (value - min) / (max - min)
  return 206 - normalized * 186
}

function getLinePath(data, max, min) {
  return data.map((point, index) => {
    const x = getX(index, data.length)
    const y = getY(point.revenue, max, min)
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
}

function getAreaPath(data, max, min) {
  const linePath = getLinePath(data, max, min)
  const firstX = getX(0, data.length)
  const lastX = getX(data.length - 1, data.length)
  return `${linePath} L ${lastX} 256 L ${firstX} 256 Z`
}

function getStatusBadgeClass(status) {
  switch (status) {
    case 'pending': return 'badge-warning'
    case 'confirmed':
    case 'processing':
    case 'shipped':
    case 'out_for_delivery': return 'badge-primary'
    case 'delivered': return 'badge-success'
    case 'cancelled':
    case 'returned': return 'badge-danger'
    case 'return_requested': return 'badge-warning'
    default: return 'badge'
  }
}

function formatStatus(status) {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

import { Link } from 'react-router-dom'

export default AdminDashboard