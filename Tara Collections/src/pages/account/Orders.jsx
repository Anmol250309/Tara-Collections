import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Loader2, ChevronRight, X, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getOrders } from '../../services/orders'
import { format } from 'date-fns'

function Orders() {
  const { user, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const fetchOrders = async (reset = false) => {
    if (reset) {
      setLoading(true)
      setOrders([])
      setLastDoc(null)
      setHasMore(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const result = await getOrders(user.uid, {
        status: filter === 'all' ? undefined : filter,
        limit: 10,
        lastDoc: reset ? null : lastDoc
      })
      setOrders(prev => reset ? result.orders : [...prev, ...result.orders])
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchOrders(true)
    }
  }, [user, filter])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchOrders(true)
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrders(false)
    }
  }

  const statusConfig = {
    pending: { label: 'Pending', color: 'badge-warning' },
    confirmed: { label: 'Confirmed', color: 'badge-primary' },
    processing: { label: 'Processing', color: 'badge-primary' },
    shipped: { label: 'Shipped', color: 'badge-primary' },
    out_for_delivery: { label: 'Out for Delivery', color: 'badge-primary' },
    delivered: { label: 'Delivered', color: 'badge-success' },
    cancelled: { label: 'Cancelled', color: 'badge-danger' },
    returned: { label: 'Returned', color: 'badge-danger' },
    return_requested: { label: 'Return Requested', color: 'badge-warning' }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary-50 pt-28 pb-12">
      <div className="container-main">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="heading-3">My Orders</h1>
            <p className="text-body text-dark-500 mt-1">Track and manage your orders</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="btn-outline flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending' },
            { id: 'confirmed', label: 'Confirmed' },
            { id: 'shipped', label: 'Shipped' },
            { id: 'delivered', label: 'Delivered' },
            { id: 'cancelled', label: 'Cancelled' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => { setFilter(f.id); fetchOrders(true); }}
              className={`whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id
                  ? 'bg-dark-950 text-primary-50'
                  : 'bg-white text-dark-700 hover:bg-primary-50 border border-dark-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-card p-6 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-dark-100 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-dark-100 rounded w-3/4" />
                    <div className="h-4 bg-dark-100 rounded w-1/2" />
                    <div className="h-4 bg-dark-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-dark-200 mb-4" />
            <h3 className="text-lg font-medium text-dark-950 mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-dark-500 mb-6">
              {filter === 'all'
                ? 'Start shopping to see your orders here'
                : `You don't have any ${filter} orders`}
            </p>
            {filter !== 'all' && (
              <button
                onClick={() => setFilter('all')}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                View all orders
              </button>
            )}
            {filter === 'all' && (
              <Link to="/shop" className="btn-primary inline-flex items-center gap-2 mt-4">
                <Package className="w-4 h-4" />
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {orders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  statusConfig={statusConfig}
                />
              ))}
            </div>

            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-outline px-8 py-3"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Loading...
                    </>
                  ) : (
                    'Load More Orders'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// Order Card Component
function OrderCard({ order, statusConfig }) {
  const status = statusConfig[order.status] || { label: order.status, color: 'badge' }
  const itemCount = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <Link to={`/account/orders/${order.id}`} className="bg-white rounded-xl shadow-card p-6 hover:shadow-card-hover transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Order Info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
            <Package className="w-8 h-8 text-primary-500" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-dark-950">Order #{order.id.slice(0, 8).toUpperCase()}</span>
              <span className={`badge ${status.color}`}>{status.label}</span>
            </div>
            <p className="text-sm text-dark-500 mt-1">
              Placed on {order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy') : 'Unknown date'}
            </p>
            <p className="text-sm text-dark-500">
              {itemCount} item{itemCount !== 1 ? 's' : ''} • ₹{order.total?.toLocaleString() || '0'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 sm:ml-4">
          {order.status === 'delivered' && (
            <button className="btn-outline text-sm">
              Buy Again
            </button>
          )}
          {['pending', 'confirmed'].includes(order.status) && (
            <button className="btn-outline text-sm text-red-600 border-red-200 hover:bg-red-50">
              Cancel Order
            </button>
          )}
          <div className="flex items-center text-dark-400">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Timeline Preview */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="mt-4 pt-4 border-t border-dark-100">
          <div className="flex items-center gap-2 text-sm text-dark-500">
            <span className="font-medium text-dark-950">Latest Update:</span>
            <span>
              {order.timeline[order.timeline.length - 1]?.note || 'Order placed'}
            </span>
            <span className="text-dark-300">•</span>
            <span>
              {order.timeline[order.timeline.length - 1]?.timestamp
                ? format(new Date(order.timeline[order.timeline.length - 1].timestamp), 'MMM d, h:mm a')
                : ''}
            </span>
          </div>
        </div>
      )}
    </Link>
  )
}

export default Orders