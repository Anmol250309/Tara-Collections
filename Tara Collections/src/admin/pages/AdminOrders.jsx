import { useState, useEffect } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight, Loader2, Eye, Truck, RotateCcw, CheckCircle, X, MessageSquare, Download, MoreVertical } from 'lucide-react'
import { getAllOrders, updateOrderStatus, updateTrackingInfo } from '../../services/orders'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [lastDoc, setLastDoc] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')
  const [viewingOrder, setViewingOrder] = useState(null)
  const [updatingStatus, setUpdatingStatus] = useState(null)
  const [trackingForm, setTrackingForm] = useState({ trackingNumber: '', carrier: '', trackingUrl: '' })
  const [showTrackingModal, setShowTrackingModal] = useState(false)

  const statuses = [
    'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'return_requested'
  ]

  const statusOrder = {
    pending: 1, confirmed: 2, processing: 3, shipped: 4,
    out_for_delivery: 5, delivered: 6, cancelled: 7, returned: 8, return_requested: 9
  }

  useEffect(() => {
    fetchOrders(true)
  }, [statusFilter, paymentStatusFilter])

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
      const result = await getAllOrders({
        limit: 20,
        lastDoc: reset ? null : lastDoc,
        status: statusFilter || undefined,
        paymentStatus: paymentStatusFilter || undefined
      })
      let filteredOrders = result.orders
      if (search) {
        const term = search.toLowerCase()
        filteredOrders = filteredOrders.filter(o =>
          o.id.toLowerCase().includes(term) ||
          o.shippingAddress?.fullName?.toLowerCase().includes(term) ||
          o.shippingAddress?.phone?.includes(term) ||
          o.shippingAddress?.email?.toLowerCase().includes(term)
        )
      }
      setOrders(prev => reset ? filteredOrders : [...prev, ...filteredOrders])
      setLastDoc(result.lastDoc)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    fetchOrders(true)
  }

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingStatus(orderId)
    try {
      await updateOrderStatus(orderId, newStatus)
      toast.success(`Order status updated to ${formatStatus(newStatus)}`)
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
      if (viewingOrder?.id === orderId) {
        setViewingOrder(prev => ({ ...prev, status: newStatus }))
      }
    } catch (error) {
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleTrackingSubmit = async (e) => {
    e.preventDefault()
    if (!viewingOrder) return

    try {
      await updateTrackingInfo(viewingOrder.id, trackingForm)
      toast.success('Tracking info updated')
      setShowTrackingModal(false)
      setTrackingForm({ trackingNumber: '', carrier: '', trackingUrl: '' })
      // Refresh order
      const { getOrderById } = await import('../../services/orders')
      const updated = await getOrderById(viewingOrder.id)
      setViewingOrder(updated)
      setOrders(prev => prev.map(o => o.id === viewingOrder.id ? updated : o))
    } catch (error) {
      toast.error('Failed to update tracking')
    }
  }

  const openTrackingModal = (order) => {
    setViewingOrder(order)
    setTrackingForm({
      trackingNumber: order.tracking?.trackingNumber || '',
      carrier: order.tracking?.carrier || '',
      trackingUrl: order.tracking?.trackingUrl || ''
    })
    setShowTrackingModal(true)
  }

  const getNextStatuses = (currentStatus) => {
    const currentIndex = statusOrder[currentStatus]
    if (!currentIndex) return []
    return statuses.filter(s => statusOrder[s] > currentIndex && statusOrder[s] <= 6)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="heading-2">Orders</h1>
            <p className="text-body text-dark-500 mt-1">Manage and track customer orders</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100 bg-primary-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100">
                {[1, 2, 3, 4, 5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/3" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-5 bg-dark-100 rounded w-1/2" /></td>
                    <td className="px-6 py-4"><div className="h-4 bg-dark-100 rounded w-1/3" /></td>
                    <td className="px-6 py-4"><div className="h-8 bg-dark-100 rounded w-24" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="heading-2">Orders</h1>
          <p className="text-body text-dark-500 mt-1">Manage and track customer orders ({orders.length} orders)</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search orders by ID, customer, phone, email..."
            className="input pl-12"
          />
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchOrders(true); }}
            className="input w-auto py-2"
          >
            <option value="">All Statuses</option>
            {statuses.map(s => (
              <option key={s} value={s}>{formatStatus(s)}</option>
            ))}
          </select>
          <select
            value={paymentStatusFilter}
            onChange={(e) => { setPaymentStatusFilter(e.target.value); fetchOrders(true); }}
            className="input w-auto py-2"
          >
            <option value="">All Payment Status</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-100 bg-primary-50">
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Order</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-dark-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-dark-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-dark-500">No orders found</td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-primary-50/50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-dark-950">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-dark-950">{order.shippingAddress?.fullName || 'Guest'}</p>
                        <p className="text-sm text-dark-500">{order.shippingAddress?.phone || 'N/A'}</p>
                        <p className="text-sm text-dark-500">{order.shippingAddress?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-dark-600">
                      {order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy h:mm a') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <OrderStatusSelect
                        order={order}
                        currentStatus={order.status}
                        onStatusChange={handleStatusUpdate}
                        updating={updatingStatus === order.id}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${getPaymentStatusBadge(order.paymentStatus)}`}>
                        {formatStatus(order.paymentStatus)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-dark-950">
                      ₹{order.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="btn-ghost p-2"
                          aria-label="View order"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {['shipped', 'out_for_delivery', 'delivered'].includes(order.status) && (
                          <button
                            onClick={() => openTrackingModal(order)}
                            className="btn-ghost p-2"
                            aria-label="Tracking info"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="px-6 py-4 border-t border-dark-100">
            <button
              onClick={() => fetchOrders(false)}
              disabled={loadingMore}
              className="btn-outline w-full"
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
      </div>

      {/* Order Detail Modal */}
      {viewingOrder && (
        <OrderDetailModal
          order={viewingOrder}
          onClose={() => setViewingOrder(null)}
          onStatusChange={handleStatusUpdate}
          updating={updatingStatus}
        />
      )}

      {/* Tracking Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-100 flex items-center justify-between">
              <h2 className="heading-3">Update Tracking</h2>
              <button
                onClick={() => { setShowTrackingModal(false); setTrackingForm({ trackingNumber: '', carrier: '', trackingUrl: '' }) }}
                className="text-dark-400 hover:text-dark-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleTrackingSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Tracking Number</label>
                <input
                  type="text"
                  value={trackingForm.trackingNumber}
                  onChange={(e) => setTrackingForm({...trackingForm, trackingNumber: e.target.value})}
                  className="input"
                  placeholder="1Z999AA10123456784"
                />
              </div>
              <div>
                <label className="label">Carrier</label>
                <select
                  value={trackingForm.carrier}
                  onChange={(e) => setTrackingForm({...trackingForm, carrier: e.target.value})}
                  className="input"
                >
                  <option value="">Select carrier</option>
                  <option value="delhivery">Delhivery</option>
                  <option value="bluedart">Blue Dart</option>
                  <option value="fedex">FedEx</option>
                  <option value="dtdc">DTDC</option>
                  <option value="ekart">Ekart</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Tracking URL</label>
                <input
                  type="url"
                  value={trackingForm.trackingUrl}
                  onChange={(e) => setTrackingForm({...trackingForm, trackingUrl: e.target.value})}
                  className="input"
                  placeholder="https://track.example.com/..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowTrackingModal(false); setTrackingForm({ trackingNumber: '', carrier: '', trackingUrl: '' }) }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                >
                  Save Tracking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// Order Status Select Component
function OrderStatusSelect({ order, currentStatus, onStatusChange, updating }) {
  const nextStatuses = getNextStatuses(currentStatus)
  const [showDropdown, setShowDropdown] = useState(false)

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

  const config = statusConfig[currentStatus] || { label: currentStatus, color: 'badge' }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <span className={`badge ${config.color}`}>{config.label}</span>
        {nextStatuses.length > 0 && !updating && (
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="btn-ghost p-1.5"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-dark-100 min-w-[160px] py-1">
            {nextStatuses.map(status => {
              const sConfig = statusConfig[status]
              return (
                <button
                  key={status}
                  onClick={() => { onStatusChange(order.id, status); setShowDropdown(false); }}
                  className="w-full px-4 py-2 text-left text-sm text-dark-700 hover:bg-primary-50 flex items-center gap-2"
                >
                  <span className={`badge ${sConfig.color}`}>{sConfig.label}</span>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function getNextStatuses(currentStatus) {
  const statusOrder = {
    pending: 1, confirmed: 2, processing: 3, shipped: 4,
    out_for_delivery: 5, delivered: 6, cancelled: 7, returned: 8, return_requested: 9
  }
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'return_requested']
  const currentIndex = statusOrder[currentStatus]
  if (!currentIndex) return []
  return statuses.filter(s => statusOrder[s] > currentIndex && statusOrder[s] <= 6)
}

// Order Detail Modal
function OrderDetailModal({ order, onClose, onStatusChange, updating }) {
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

  const config = statusConfig[order.status] || { label: order.status, color: 'badge' }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        <div className="p-6 border-b border-dark-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="text-dark-400 hover:text-dark-600">
              <X className="w-6 h-6" />
            </button>
            <div>
              <h2 className="heading-3">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
              <span className={`badge ${config.color}`}>{config.label}</span>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Customer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-dark-950 mb-3">Customer Details</h3>
              <div className="bg-primary-50 rounded-lg p-4">
                <p className="font-medium text-dark-950">{order.shippingAddress?.fullName || 'Guest'}</p>
                <p className="text-dark-600 mt-1">{order.shippingAddress?.phone}</p>
                <p className="text-dark-600">{order.shippingAddress?.email}</p>
                <p className="text-dark-600 mt-2">{order.shippingAddress?.address}</p>
                <p className="text-dark-600">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-dark-950 mb-3">Order Summary</h3>
              <div className="bg-primary-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-600">Order Date</span>
                  <span className="font-medium text-dark-950">{order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Payment Method</span>
                  <span className="font-medium text-dark-950 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Payment Status</span>
                  <span className={`font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>{formatStatus(order.paymentStatus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-600">Items</span>
                  <span className="font-medium text-dark-950">{order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0}</span>
                </div>
                <div className="flex justify-between border-t border-dark-200 pt-2">
                  <span className="font-semibold text-dark-950">Total</span>
                  <span className="font-bold text-dark-950">₹{order.total?.toLocaleString() || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-dark-950 mb-3">Order Items</h3>
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.productId} className="flex gap-4 p-4 border border-dark-100 rounded-xl">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-50 flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-dark-300">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-dark-950">{item.name}</p>
                    {item.variant && (
                      <p className="text-sm text-dark-500">
                        {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </p>
                    )}
                    <p className="text-sm text-dark-500">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</p>
                  </div>
                  <p className="font-semibold text-dark-950">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {order.timeline && order.timeline.length > 0 && (
            <div>
              <h3 className="font-semibold text-dark-950 mb-3">Order Timeline</h3>
              <div className="space-y-4">
                {order.timeline.slice().reverse().map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex-shrink-0 w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                      <CheckCircle className="w-5 h-5" />
                    </div>
                    <div className="pt-1 flex-1">
                      <p className="font-medium text-dark-950">{event.note}</p>
                      <p className="text-sm text-dark-500">
                        {event.timestamp ? format(new Date(event.timestamp), 'MMM d, yyyy h:mm a') : ''}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="pt-4 border-t border-dark-100">
            <h3 className="font-semibold text-dark-950 mb-3">Update Status</h3>
            <OrderStatusSelect
              order={order}
              currentStatus={order.status}
              onStatusChange={onStatusChange}
              updating={updating === order.id}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function getPaymentStatusBadge(status) {
  switch (status) {
    case 'paid': return 'badge-success'
    case 'pending': return 'badge-warning'
    case 'failed': return 'badge-danger'
    case 'refunded': return 'badge'
    default: return 'badge'
  }
}

function getPaymentStatusColor(status) {
  switch (status) {
    case 'paid': return 'text-green-600'
    case 'pending': return 'text-yellow-600'
    case 'failed': return 'text-red-600'
    case 'refunded': return 'text-blue-600'
    default: return 'text-dark-950'
  }
}

function formatStatus(status) {
  return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
}

import { useState } from 'react'
import { Package, CheckCircle, ChevronDown, X } from 'lucide-react'
import { format } from 'date-fns'

export default AdminOrders