import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, CreditCard, Truck, Shield, User, MapPin, Phone, Mail, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/orders'
import toast from 'react-hot-toast'

function Checkout() {
  const navigate = useNavigate()
  const { user, userData } = useAuth()
  const { items, subtotal, deliveryCharge, total, clearCart } = useCart()
  const [step, setStep] = useState(1) // 1: Shipping, 2: Payment, 3: Review
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  const [shippingForm, setShippingForm] = useState({
    fullName: userData?.displayName || '',
    email: user?.email || '',
    phone: userData?.phoneNumber || '',
    address: userData?.addresses?.[0]?.address || '',
    city: userData?.addresses?.[0]?.city || '',
    state: userData?.addresses?.[0]?.state || '',
    pincode: userData?.addresses?.[0]?.pincode || '',
    landmark: userData?.addresses?.[0]?.landmark || '',
    addressType: userData?.addresses?.[0]?.type || 'home',
    saveAddress: true
  })

  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [razorpayLoading, setRazorpayLoading] = useState(false)

  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/checkout' }, replace: true })
    }
    if (items.length === 0) {
      navigate('/cart', { replace: true })
    }
  }, [user, items, navigate])

  const validateShipping = () => {
    const newErrors = {}
    if (!shippingForm.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!shippingForm.email.trim()) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingForm.email)) newErrors.email = 'Invalid email'
    if (!shippingForm.phone.trim()) newErrors.phone = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(shippingForm.phone)) newErrors.phone = 'Invalid phone number'
    if (!shippingForm.address.trim()) newErrors.address = 'Address is required'
    if (!shippingForm.city.trim()) newErrors.city = 'City is required'
    if (!shippingForm.state.trim()) newErrors.state = 'State is required'
    if (!shippingForm.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(shippingForm.pincode)) newErrors.pincode = 'Invalid pincode'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleShippingSubmit = (e) => {
    e.preventDefault()
    if (validateShipping()) {
      setStep(2)
    }
  }

  const handlePaymentSubmit = async (e) => {
    e.preventDefault()
    setProcessing(true)

    try {
      const orderData = {
        userId: user.uid,
        items: items.map(item => ({
          productId: item.productId,
          name: item.name,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant
        })),
        shippingAddress: {
          fullName: shippingForm.fullName,
          email: shippingForm.email,
          phone: shippingForm.phone,
          address: shippingForm.address,
          city: shippingForm.city,
          state: shippingForm.state,
          pincode: shippingForm.pincode,
          landmark: shippingForm.landmark,
          type: shippingForm.addressType
        },
        subtotal,
        deliveryCharge,
        total,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending'
      }

      const orderId = await createOrder(orderData)

      if (paymentMethod === 'razorpay') {
        await processRazorpayPayment(orderId, total, shippingForm)
      } else {
        // COD order placed
        await clearCart()
        toast.success('Order placed successfully!')
        navigate(`/account/orders/${orderId}`)
      }
    } catch (error) {
      console.error('Order error:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  const processRazorpayPayment = (orderId, amount, shippingForm) => {
    return new Promise((resolve, reject) => {
      // In a real app, you would load Razorpay script and create order on your backend
      // This is a placeholder implementation
      setRazorpayLoading(true)

      // Simulate payment processing
      setTimeout(async () => {
        try {
          // In production: call your backend to verify payment
          await clearCart()
          toast.success('Payment successful! Order placed.')
          navigate(`/account/orders/${orderId}`)
          resolve()
        } catch (error) {
          reject(error)
        } finally {
          setRazorpayLoading(false)
        }
      }, 2000)
    })
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-primary-50 pt-28 pb-12">
      <div className="container-main">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Shipping', icon: MapPin },
              { num: 2, label: 'Payment', icon: CreditCard },
              { num: 3, label: 'Review', icon: Check }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  step >= s.num ? 'border-primary-500 bg-primary-500 text-primary-50' : 'border-dark-200 bg-white text-dark-400'
                }`}>
                  {step > s.num ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                <span className={`ml-2 hidden sm:block font-medium ${step >= s.num ? 'text-dark-950' : 'text-dark-400'}`}>
                  {s.label}
                </span>
                {i < 2 && (
                  <div className={`hidden lg:block w-24 h-0.5 ml-2 mr-2 ${step > s.num ? 'bg-primary-500' : 'bg-dark-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Shipping Address */}
            {step <= 1 && (
              <form onSubmit={handleShippingSubmit} className="bg-white rounded-xl shadow-card p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="heading-3">Shipping Address</h2>
                    <p className="text-dark-500 text-sm">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={shippingForm.fullName}
                      onChange={(e) => setShippingForm({...shippingForm, fullName: e.target.value})}
                      className={`input ${errors.fullName ? 'input-error' : ''}`}
                      placeholder="John Doe"
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({...shippingForm, email: e.target.value})}
                      className={`input ${errors.email ? 'input-error' : ''}`}
                      placeholder="john@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label">Phone Number</label>
                    <input
                      type="tel"
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({...shippingForm, phone: e.target.value})}
                      className={`input ${errors.phone ? 'input-error' : ''}`}
                      placeholder="9876543210"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label">Address Type</label>
                    <select
                      value={shippingForm.addressType}
                      onChange={(e) => setShippingForm({...shippingForm, addressType: e.target.value})}
                      className="input"
                    >
                      <option value="home">Home</option>
                      <option value="work">Work</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Address</label>
                  <textarea
                    value={shippingForm.address}
                    onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
                    className={`input ${errors.address ? 'input-error' : ''}`}
                    rows={2}
                    placeholder="House/Flat No., Building, Street, Area"
                  />
                  {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                </div>

                <div className="mt-4">
                  <label className="label">Landmark (Optional)</label>
                  <input
                    type="text"
                    value={shippingForm.landmark}
                    onChange={(e) => setShippingForm({...shippingForm, landmark: e.target.value})}
                    className="input"
                    placeholder="Near Metro Station, Opposite Mall"
                  />
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">City</label>
                    <input
                      type="text"
                      value={shippingForm.city}
                      onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                      className={`input ${errors.city ? 'input-error' : ''}`}
                      placeholder="Mumbai"
                    />
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="label">State</label>
                    <input
                      type="text"
                      value={shippingForm.state}
                      onChange={(e) => setShippingForm({...shippingForm, state: e.target.value})}
                      className={`input ${errors.state ? 'input-error' : ''}`}
                      placeholder="Maharashtra"
                    />
                    {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                  </div>
                  <div>
                    <label className="label">Pincode</label>
                    <input
                      type="text"
                      value={shippingForm.pincode}
                      onChange={(e) => setShippingForm({...shippingForm, pincode: e.target.value})}
                      className={`input ${errors.pincode ? 'input-error' : ''}`}
                      placeholder="400001"
                      maxLength={6}
                    />
                    {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    checked={shippingForm.saveAddress}
                    onChange={(e) => setShippingForm({...shippingForm, saveAddress: e.target.checked})}
                    className="w-4 h-4 text-primary-500 border-dark-300 rounded focus:ring-primary-500"
                  />
                  <label htmlFor="saveAddress" className="text-sm text-dark-700">
                    Save this address for future orders
                  </label>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    type="submit"
                    className="btn-primary px-8 py-3"
                  >
                    Continue to Payment
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </button>
                </div>
              </form>
            )}

            {/* Payment Method */}
            {step === 2 && (
              <form onSubmit={handlePaymentSubmit} className="bg-white rounded-xl shadow-card p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="heading-3">Payment Method</h2>
                    <p className="text-dark-500 text-sm">Choose how you'd like to pay</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {[
                    { id: 'razorpay', name: 'Online Payment', desc: 'Credit/Debit Card, UPI, Net Banking, Wallets', icon: CreditCard },
                    { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when you receive your order (₹99 extra)', icon: Truck }
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`relative flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-dark-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-primary-500 border-primary-500 focus:ring-primary-500"
                      />
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                        <method.icon className="w-5 h-5 text-dark-700" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-dark-950">{method.name}</p>
                        <p className="text-sm text-dark-500">{method.desc}</p>
                      </div>
                      {paymentMethod === method.id && (
                        <Check className="w-5 h-5 text-primary-500" />
                      )}
                    </label>
                  ))}
                </div>

                {paymentMethod === 'cod' && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-yellow-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium text-yellow-800">Cash on Delivery</p>
                        <p className="text-sm text-yellow-700">Additional ₹99 COD charges will be applied. Maximum order value for COD is ₹50,000.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-outline px-8 py-3"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={processing || razorpayLoading}
                    className="btn-primary px-8 py-3"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : paymentMethod === 'razorpay' ? (
                      'Pay Securely'
                    ) : (
                      'Place Order'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* Review Order */}
            {step === 3 && (
              <div className="bg-white rounded-xl shadow-card p-6 mb-6 animate-fade-in">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Check className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="heading-3">Review Order</h2>
                    <p className="text-dark-500 text-sm">Please review your order before placing</p>
                  </div>
                </div>

                {/* Shipping Address Review */}
                <div className="mb-6">
                  <h3 className="font-medium text-dark-950 mb-3">Shipping Address</h3>
                  <div className="bg-primary-50 rounded-lg p-4">
                    <p className="font-medium text-dark-950">{shippingForm.fullName}</p>
                    <p className="text-dark-600">{shippingForm.address}</p>
                    {shippingForm.landmark && <p className="text-dark-600 text-sm">{shippingForm.landmark}</p>}
                    <p className="text-dark-600">{shippingForm.city}, {shippingForm.state} - {shippingForm.pincode}</p>
                    <p className="text-dark-600">{shippingForm.phone}</p>
                    <p className="text-dark-600">{shippingForm.email}</p>
                  </div>
                </div>

                {/* Items Review */}
                <div className="mb-6">
                  <h3 className="font-medium text-dark-950 mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-primary-50 flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-300">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-dark-950 truncate">{item.name}</p>
                          <p className="text-sm text-dark-500">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-medium text-dark-950 whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Payment Method Review */}
                <div className="mb-6">
                  <h3 className="font-medium text-dark-950 mb-3">Payment Method</h3>
                  <p className="text-dark-600">
                    {paymentMethod === 'razorpay' ? 'Online Payment (Razorpay)' : 'Cash on Delivery'}
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="btn-outline px-8 py-3"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28">
              <h2 className="heading-3 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-primary-50 flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-dark-300">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-dark-950 truncate">{item.name}</p>
                      <p className="text-xs text-dark-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-dark-950">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-dark-100 pt-4 space-y-3">
                <div className="flex justify-between text-dark-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-dark-950">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-dark-600">
                  <span>Delivery</span>
                  <span className="font-medium text-dark-950">
                    {subtotal >= 999 ? 'FREE' : `₹${deliveryCharge.toLocaleString()}`}
                  </span>
                </div>
                {paymentMethod === 'cod' && subtotal < 50000 && (
                  <div className="flex justify-between text-dark-600">
                    <span>COD Charges</span>
                    <span className="font-medium text-dark-950">₹99</span>
                  </div>
                )}
                <div className="border-t border-dark-100 pt-3 flex justify-between">
                  <span className="font-semibold text-dark-950 text-lg">Total</span>
                  <span className="font-bold text-dark-950 text-lg">
                    ₹{(
                      total +
                      (paymentMethod === 'cod' && subtotal < 50000 ? 99 : 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-dark-100 space-y-3 text-sm text-dark-500">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary-500" />
                  <span>Secure payment</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-primary-500" />
                  <span>Free shipping over ₹999</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-primary-500" />
                  <span>30-day easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { ChevronRight } from 'lucide-react'

export default Checkout