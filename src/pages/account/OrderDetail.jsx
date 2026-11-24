import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ChevronLeft, Package, Truck, MapPin, CreditCard, Calendar, Clock, CheckCircle, Loader2, X, RotateCcw, Shield, MessageSquare, Download } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getOrderById, cancelOrder, requestReturn } from '../../services/orders'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

function OrderDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cancelling, setCancelling] = useState(false)
  const [returning, setReturning] = useState(false)
  const [showReturnModal, setShowReturnModal] = useState(false)
  const [returnForm, setReturnForm] = useState({
    items: [],
    reason: ''
  })

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const orderData = await getOrderById(id)
        if (orderData.userId !== user?.uid) {
          window.location.href = '/account/orders'
          return
        }
        setOrder(orderData)
      } catch (error) {
        console.error('Error fetching order:', error)
        toast.error('Order not found')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, user])

  const handleCancel = async () => {
    const reason = window.prompt('Please provide a reason for cancellation:')
    if (!reason) return

    setCancelling(true)
    try {
      await cancelOrder(id, reason)
      toast.success('Order cancelled successfully')
      const updatedOrder = await getOrderById(id)
      setOrder(updatedOrder)
    } catch (error) {
      toast.error('Failed to cancel order')
    } finally {
      setCancelling(false)
    }
  }

  const handleReturnSubmit = async (e) => {
    e.preventDefault()
    if (!returnForm.reason.trim()) {
      toast.error('Please provide a reason')
      return
    }

    const selectedItems = order.items.filter(item => returnForm.items.includes(item.productId))
    if (selectedItems.length === 0) {
      toast.error('Please select at least one item')
      return
    }

    setReturning(true)
    try {
      await requestReturn(id, selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      })), returnForm.reason)
      toast.success('Return request submitted')
      setShowReturnModal(false)
      const updatedOrder = await getOrderById(id)
      setOrder(updatedOrder)
    } catch (error) {
      toast.error('Failed to submit return request')
    } finally {
      setReturning(false)
    }
  }

  const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package },
    { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
    { key: 'processing', label: 'Processing', icon: RotateCcw },
    { key: 'shipped', label: 'Shipped', icon: Truck },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: Truck },
    { key: 'delivered', label: 'Delivered', icon: CheckCircle }
  ]

  const currentStatusIndex = statusSteps.findIndex(s => s.key === order?.status)
  const isCancelled = order?.status === 'cancelled'
  const isReturned = order?.status === 'returned'
  const isReturnRequested = order?.status === 'return_requested'

  if (loading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28">
        <div className="text-center">
          <h2 className="text-xl font-medium text-dark-950 mb-2">Order not found</h2>
          <Link to="/account/orders" className="text-primary-600 hover:text-primary-700">Back to orders</Link>
        </div>
      </div>
    )
  }

  const canCancel = ['pending', 'confirmed'].includes(order.status)
  const canReturn = order.status === 'delivered' && !order.returnRequest

  return (
    <div className="min-h-screen bg-primary-50 pt-28 pb-12">
      <div className="container-main">
        {/* Back Button & Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/account/orders" className="btn-ghost p-2">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="heading-3">Order Details</h1>
            <p className="text-body text-dark-500">Order #{id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="heading-3 mb-6">Order Status</h2>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-dark-100" />
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-500" style={{ height: `${Math.min((currentStatusIndex + 1) / statusSteps.length * 100, 100)}%` }} />

                <div className="space-y-6 pl-14 relative">
                  {statusSteps.map((step, index) => {
                    const isActive = index <= currentStatusIndex
                    const isCurrent = index === currentStatusIndex && !isCancelled && !isReturned
                    const isCompleted = index < currentStatusIndex

                    const stepData = order.timeline?.find(t => t.status === step.key)
                    const stepDate = stepData?.timestamp ? new Date(stepData.timestamp) : null

                    return (
                      <div key={step.key} className="relative flex items-start gap-4">
                        <div className={`relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-primary-500 text-primary-50' : 'bg-white text-dark-300 border-2 border-dark-200'
                        } ${isCurrent ? 'ring-4 ring-primary-500/20' : ''}`}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <step.icon className={`w-6 h-6 ${isActive ? '' : 'text-dark-300'}`} />
                          )}
                        </div>
                        <div className="pt-1">
                          <h3 className={`font-medium ${isActive ? 'text-dark-950' : 'text-dark-500'}`}>
                            {step.label}
                          </h3>
                          {stepDate && (
                            <p className="text-sm text-dark-500 mt-1">
                              {format(stepDate, 'MMM d, yyyy h:mm a')}
                            </p>
                          )}
                          {stepData?.note && stepData.note !== step.label && (
                            <p className="text-sm text-dark-400 mt-1">{stepData.note}</p>
                          )}
                        </div>
                      </div>
                    )
                  })}

                  {/* Cancelled/Returned Status */}
                  {(isCancelled || isReturned || isReturnRequested) && (
                    <div className="relative flex items-start gap-4">
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 bg-${isCancelled ? 'red' : 'orange'}-500 text-white`}>
                        {isCancelled ? (
                          <X className="w-6 h-6" />
                        ) : isReturned ? (
                          <RotateCcw className="w-6 h-6" />
                        ) : (
                          <RotateCcw className="w-6 h-6" />
                        )}
                      </div>
                      <div className="pt-1">
                        <h3 className="font-medium text-dark-950">
                          {isCancelled ? 'Cancelled' : isReturned ? 'Returned' : 'Return Requested'}
                        </h3>
                        {order.cancellationReason && (
                          <p className="text-sm text-dark-500 mt-1">Reason: {order.cancellationReason}</p>
                        )}
                        {order.returnRequest && (
                          <p className="text-sm text-dark-500 mt-1">
                            Status: {order.returnRequest.status}
                            {order.returnRequest.adminNote && ` - ${order.returnRequest.adminNote}`}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="heading-3 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.productId} className="flex gap-4 p-4 border border-dark-100 rounded-xl hover:bg-primary-50/50 transition-colors">
                    <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-primary-50">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-dark-300">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.productId}`}>
                        <h3 className="font-medium text-dark-950 truncate hover:text-primary-600 transition-colors">
                          {item.name}
                        </h3>
                      </Link>
                      {item.variant && (
                        <p className="text-sm text-dark-500 mt-1">
                          {Object.entries(item.variant).map(([k, v]) => `${k}: ${v}`).join(', ')}
                        </p>
                      )}
                      <p className="text-sm text-dark-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-dark-950">₹{(item.price * item.quantity).toLocaleString()}</p>
                      {item.originalPrice > item.price && (
                        <p className="text-sm text-dark-400 line-through">
                          ₹{(item.originalPrice * item.quantity).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-xl shadow-card p-6">
              <h2 className="heading-3 mb-6 flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary-500" />
                Shipping Address
              </h2>
              {order.shippingAddress && (
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="font-medium text-dark-950">{order.shippingAddress.fullName}</p>
                  <p className="text-dark-600 mt-1">{order.shippingAddress.address}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-dark-500">{order.shippingAddress.landmark}</p>
                  )}
                  <p className="text-dark-600">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                  <p className="text-dark-600">{order.shippingAddress.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary & Actions */}
          <div className="lg:col-span-1">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28 mb-6">
              <h2 className="heading-3 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-dark-600">
                  <span>Subtotal ({order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} items)</span>
                  <span className="font-medium text-dark-950">₹{order.subtotal?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between text-dark-600">
                  <span>Delivery</span>
                  <span className="font-medium text-dark-950">
                    {order.deliveryCharge > 0 ? `₹${order.deliveryCharge.toLocaleString()}` : 'FREE'}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{order.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-dark-100 pt-3 flex justify-between">
                  <span className="font-semibold text-dark-950 text-lg">Total</span>
                  <span className="font-bold text-dark-950 text-lg">₹{order.total?.toLocaleString() || '0'}</span>
                </div>
              </div>

              <div className="border-t border-dark-100 pt-4 space-y-3 text-sm">
                <div className="flex justify-between text-dark-600">
                  <span>Payment Method</span>
                  <span className="font-medium text-dark-950 capitalize">
                    {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </span>
                </div>
                <div className="flex justify-between text-dark-600">
                  <span>Payment Status</span>
                  <span className={`font-medium ${order.paymentStatus === 'paid' ? 'text-green-600' : order.paymentStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus === 'pending' ? 'Pending' : 'Failed'}
                  </span>
                </div>
                <div className="flex justify-between text-dark-600">
                  <span>Order Date</span>
                  <span className="font-medium text-dark-950">
                    {order.orderDate ? format(new Date(order.orderDate), 'MMM d, yyyy h:mm a') : 'N/A'}
                  </span>
                </div>
                {order.paymentMethod === 'cod' && order.paymentStatus === 'pending' && (
                  <div className="p-3 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                    Cash on Delivery - Pay ₹{order.total?.toLocaleString()} on delivery
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28 space-y-3">
              {canCancel && (
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className="btn-danger w-full"
                >
                  {cancelling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    'Cancel Order'
                  )}
                </button>
              )}

              {canReturn && !showReturnModal && (
                <button
                  onClick={() => setShowReturnModal(true)}
                  className="btn-outline w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Request Return
                </button>
              )}

              {order.tracking?.trackingNumber && (
                <button className="btn-primary w-full flex items-center justify-center gap-2">
                  <Truck className="w-4 h-4" />
                  Track Shipment
                </button>
              )}

              <button className="btn-ghost w-full flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Contact Support
              </button>

              <button className="btn-ghost w-full flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-dark-100 flex items-center justify-between">
              <h2 className="heading-3">Request Return</h2>
              <button
                onClick={() => { setShowReturnModal(false); setReturnForm({ items: [], reason: '' }) }}
                className="text-dark-400 hover:text-dark-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4">
              <div>
                <h3 className="font-medium text-dark-950 mb-3">Select Items to Return</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {order.items?.map((item) => (
                    <label key={item.productId} className="flex items-center gap-3 p-3 border border-dark-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                      <input
                        type="checkbox"
                        checked={returnForm.items.includes(item.productId)}
                        onChange={(e) => setReturnForm({
                          ...returnForm,
                          items: e.target.checked
                            ? [...returnForm.items, item.productId]
                            : returnForm.items.filter(id => id !== item.productId)
                        })}
                        className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-dark-950 truncate">{item.name}</p>
                        <p className="text-sm text-dark-500">Qty: {item.quantity} • ₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Reason for Return</label>
                <select
                  value={returnForm.reason}
                  onChange={(e) => setReturnForm({...returnForm, reason: e.target.value})}
                  className="input"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="wrong_item">Received wrong item</option>
                  <option value="damaged">Item damaged/defective</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="size_issue">Size doesn't fit</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowReturnModal(false); setReturnForm({ items: [], reason: '' }) }}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returning}
                  className="btn-primary flex-1"
                >
                  {returning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail