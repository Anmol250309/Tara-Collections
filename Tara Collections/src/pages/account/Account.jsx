import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { User, Package, Heart, Settings, LogOut, Edit2, MapPin, Mail, Phone, Loader2, Save, X } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'

function Account() {
  const { user, userData, updateUserProfile, addAddress, updateAddress, deleteAddress, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    email: ''
  })
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    type: 'home'
  })
  const [editingAddressId, setEditingAddressId] = useState(null)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (userData) {
      setFormData({
        displayName: userData.displayName || '',
        phoneNumber: userData.phoneNumber || '',
        email: user?.email || ''
      })
    }
  }, [userData, user])

  const validateProfile = () => {
    const newErrors = {}
    if (!formData.displayName.trim()) newErrors.displayName = 'Name is required'
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    else if (!/^[6-9]\d{9}$/.test(formData.phoneNumber)) newErrors.phoneNumber = 'Invalid phone number'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    if (!validateProfile()) return

    setSaving(true)
    try {
      await updateUserProfile({
        displayName: formData.displayName.trim(),
        phoneNumber: formData.phoneNumber.trim()
      })
      setEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const validateAddress = () => {
    const newErrors = {}
    if (!addressForm.fullName.trim()) newErrors.fullName = 'Full name is required'
    if (!addressForm.phone.trim()) newErrors.phone = 'Phone is required'
    else if (!/^[6-9]\d{9}$/.test(addressForm.phone)) newErrors.phone = 'Invalid phone'
    if (!addressForm.address.trim()) newErrors.address = 'Address is required'
    if (!addressForm.city.trim()) newErrors.city = 'City is required'
    if (!addressForm.state.trim()) newErrors.state = 'State is required'
    if (!addressForm.pincode.trim()) newErrors.pincode = 'Pincode is required'
    else if (!/^\d{6}$/.test(addressForm.pincode)) newErrors.pincode = 'Invalid pincode'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAddressSubmit = async (e) => {
    e.preventDefault()
    if (!validateAddress()) return

    setSaving(true)
    try {
      const addressData = {
        fullName: addressForm.fullName.trim(),
        phone: addressForm.phone.trim(),
        address: addressForm.address.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        pincode: addressForm.pincode.trim(),
        landmark: addressForm.landmark.trim(),
        type: addressForm.type
      }

      if (editingAddressId) {
        await updateAddress(editingAddressId, addressData)
        toast.success('Address updated')
      } else {
        await addAddress(addressData)
        toast.success('Address added')
      }
      resetAddressForm()
    } catch (error) {
      toast.error('Failed to save address')
    } finally {
      setSaving(false)
    }
  }

  const resetAddressForm = () => {
    setAddressForm({
      fullName: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      type: 'home'
    })
    setEditingAddressId(null)
  }

  const handleEditAddress = (address) => {
    setAddressForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      type: address.type || 'home'
    })
    setEditingAddressId(address.id)
  }

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteAddress(addressId)
        toast.success('Address deleted')
      } catch (error) {
        toast.error('Failed to delete address')
      }
    }
  }

  const handleLogout = async () => {
    const { logout } = await import('../../context/AuthContext')
    // We need to call logout from context
    // For now, navigate to login
    navigate('/login', { replace: true })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center pt-28">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'addresses', label: 'Addresses', icon: MapPin },
    { id: 'wishlist', label: 'Wishlist', icon: Heart },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  return (
    <div className="min-h-screen bg-primary-50 pt-28 pb-12">
      <div className="container-main">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-card p-6 sticky top-28">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dark-100">
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                  {userData?.photoURL ? (
                    <img src={userData.photoURL} alt={userData.displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-primary-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-dark-950 truncate">{userData?.displayName || 'User'}</h3>
                  <p className="text-sm text-dark-500 truncate">{user?.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-50 text-primary-600'
                        : 'text-dark-700 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-3">Profile Information</h2>
                  {editing ? (
                    <button
                      onClick={() => { setFormData({ displayName: userData?.displayName || '', phoneNumber: userData?.phoneNumber || '', email: user?.email || '' }); setEditing(false); setErrors({}) }}
                      className="btn-ghost text-sm"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </button>
                  ) : (
                    <button
                      onClick={() => setEditing(true)}
                      className="btn-outline text-sm"
                    >
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit Profile
                    </button>
                  )}
                </div>

                <form onSubmit={handleProfileSubmit} className="max-w-md space-y-5">
                  <div>
                    <label className="label">Full Name</label>
                    {editing ? (
                      <input
                        type="text"
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        className={`input ${errors.displayName ? 'input-error' : ''}`}
                        disabled={saving}
                      />
                    ) : (
                      <div className="input bg-primary-50 font-medium text-dark-950">{userData?.displayName || 'Not set'}</div>
                    )}
                    {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
                  </div>

                  <div>
                    <label className="label">Email Address</label>
                    <div className="input bg-primary-50 font-medium text-dark-950">{user?.email}</div>
                    <p className="text-xs text-dark-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="label">Phone Number</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        className={`input ${errors.phoneNumber ? 'input-error' : ''}`}
                        disabled={saving}
                        maxLength={10}
                      />
                    ) : (
                      <div className="input bg-primary-50 font-medium text-dark-950">{userData?.phoneNumber || 'Not set'}</div>
                    )}
                    {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {editing && (
                    <div className="flex justify-end pt-4 border-t border-dark-100">
                      <button
                        type="submit"
                        disabled={saving}
                        className="btn-primary px-6 py-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <Link to="/account/orders" className="block">
                <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in text-center">
                  <Package className="w-16 h-16 mx-auto text-primary-500 mb-4" />
                  <h3 className="heading-3 mb-2">Your Orders</h3>
                  <p className="text-body text-dark-500 mb-6">View your order history and track deliveries</p>
                  <span className="btn-primary inline-flex items-center gap-2">
                    View Orders
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="heading-3">Saved Addresses</h2>
                  <button
                    onClick={() => { resetAddressForm(); setErrors({}) }}
                    className="btn-primary"
                  >
                    <MapPin className="w-4 h-4 mr-1" />
                    Add New Address
                  </button>
                </div>

                {/* Address Form Modal */}
                {(editingAddressId || addressForm.fullName) && (
                  <form onSubmit={handleAddressSubmit} className="max-w-md mb-8 p-6 bg-primary-50 rounded-xl border border-primary-100 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-dark-950">
                        {editingAddressId ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      <button
                        type="button"
                        onClick={resetAddressForm}
                        className="text-dark-400 hover:text-dark-600"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label">Full Name</label>
                          <input
                            type="text"
                            value={addressForm.fullName}
                            onChange={(e) => setAddressForm({...addressForm, fullName: e.target.value})}
                            className={`input ${errors.fullName ? 'input-error' : ''}`}
                            placeholder="John Doe"
                          />
                          {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                        </div>
                        <div>
                          <label className="label">Phone</label>
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={(e) => setAddressForm({...addressForm, phone: e.target.value})}
                            className={`input ${errors.phone ? 'input-error' : ''}`}
                            placeholder="9876543210"
                            maxLength={10}
                          />
                          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="label">Address</label>
                        <textarea
                          value={addressForm.address}
                          onChange={(e) => setAddressForm({...addressForm, address: e.target.value})}
                          className={`input ${errors.address ? 'input-error' : ''}`}
                          rows={2}
                          placeholder="House/Flat No., Building, Street, Area"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                      </div>

                      <div>
                        <label className="label">Landmark (Optional)</label>
                        <input
                          type="text"
                          value={addressForm.landmark}
                          onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                          className="input"
                          placeholder="Near Metro Station"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="label">City</label>
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                            className={`input ${errors.city ? 'input-error' : ''}`}
                            placeholder="Mumbai"
                          />
                          {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                        </div>
                        <div>
                          <label className="label">State</label>
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                            className={`input ${errors.state ? 'input-error' : ''}`}
                            placeholder="Maharashtra"
                          />
                          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                        </div>
                        <div>
                          <label className="label">Pincode</label>
                          <input
                            type="text"
                            value={addressForm.pincode}
                            onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                            className={`input ${errors.pincode ? 'input-error' : ''}`}
                            placeholder="400001"
                            maxLength={6}
                          />
                          {errors.pincode && <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="label">Address Type</label>
                        <select
                          value={addressForm.type}
                          onChange={(e) => setAddressForm({...addressForm, type: e.target.value})}
                          className="input"
                        >
                          <option value="home">Home</option>
                          <option value="work">Work</option>
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="flex justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={resetAddressForm}
                          className="btn-outline"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={saving}
                          className="btn-primary"
                        >
                          {saving ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Saving...
                            </>
                          ) : (
                            editingAddressId ? 'Update Address' : 'Save Address'
                          )}
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Address List */}
                <div className="space-y-4">
                  {userData?.addresses?.length > 0 ? (
                    userData.addresses.map((address) => (
                      <div
                        key={address.id}
                        className="border border-dark-100 rounded-xl p-5 hover:border-primary-200 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-medium text-dark-950">{address.fullName}</span>
                              <span className={`badge ${
                                address.type === 'home' ? 'badge-primary' :
                                address.type === 'work' ? 'badge-success' : 'badge-warning'
                              }`}>
                                {address.type}
                              </span>
                            </div>
                            <p className="text-dark-600 mb-1">{address.address}</p>
                            {address.landmark && <p className="text-sm text-dark-500 mb-1">{address.landmark}</p>}
                            <p className="text-dark-600 mb-1">{address.city}, {address.state} - {address.pincode}</p>
                            <p className="text-dark-600">{address.phone}</p>
                          </div>
                          <div className="flex items-center gap-2 sm:ml-4">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="btn-ghost p-2"
                              aria-label="Edit address"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="btn-ghost p-2 text-red-600 hover:bg-red-50"
                              aria-label="Delete address"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 mx-auto text-dark-200 mb-4" />
                      <h3 className="text-lg font-medium text-dark-950 mb-2">No addresses saved</h3>
                      <p className="text-dark-500 mb-6">Add an address to speed up checkout</p>
                      <button
                        onClick={() => { resetAddressForm(); setErrors({}) }}
                        className="btn-primary"
                      >
                        <MapPin className="w-4 h-4 mr-1" />
                        Add Address
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <Link to="/wishlist" className="block">
                <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in text-center">
                  <Heart className="w-16 h-16 mx-auto text-primary-500 mb-4" />
                  <h3 className="heading-3 mb-2">Your Wishlist</h3>
                  <p className="text-body text-dark-500 mb-6">View and manage your saved items</p>
                  <span className="btn-primary inline-flex items-center gap-2">
                    View Wishlist
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl shadow-card p-6 animate-fade-in max-w-2xl">
                <h2 className="heading-3 mb-6">Account Settings</h2>

                <div className="space-y-6">
                  <div className="p-4 border border-dark-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-dark-950">Email Notifications</h3>
                          <p className="text-sm text-dark-500">Receive order updates and promotions</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-dark-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-dark-950">SMS Notifications</h3>
                          <p className="text-sm text-dark-500">Receive order updates via SMS</p>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>

                  <div className="p-4 border border-dark-100 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                          <Settings className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <h3 className="font-medium text-dark-950">Two-Factor Authentication</h3>
                          <p className="text-sm text-dark-500">Add an extra layer of security</p>
                        </div>
                      </div>
                      <button className="btn-outline text-sm">Enable</button>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-dark-100">
                    <h3 className="font-medium text-dark-950 mb-4">Danger Zone</h3>
                    <button className="btn-danger">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default Account