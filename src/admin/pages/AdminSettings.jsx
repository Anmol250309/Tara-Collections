import { useState, useEffect } from 'react'
import { Save, Loader2, Shield, Globe, Mail, Bell, Database, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: 'TARA COLLECTIONS',
    siteUrl: 'https://taracollections.com',
    email: 'support@taracollections.com',
    currency: 'INR',
    taxRate: 18,
    freeShippingThreshold: 999,
    maintenanceMode: false,
    notifications: {
      newOrders: true,
      lowStock: true,
      orderUpdates: true
    }
  })
  const [saving, setSaving] = useState(false)

  const handleInputChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleNotificationChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real app, this would save to Firestore or your backend
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="heading-2">Settings</h1>
          <p className="text-body text-dark-500 mt-1">Configure your store settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="space-y-6">
          {/* Store Information */}
          <div>
            <h2 className="heading-3 mb-4 flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary-500" />
              Store Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleInputChange('siteName', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Site URL</label>
                <input
                  type="url"
                  value={settings.siteUrl}
                  onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                  className="input"
                />
              </div>
              <div className="md:col-span-2">
                <label className="label">Contact Email</label>
                <input
                  type="email"
                  value={settings.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="input"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                  <option value="GBP">British Pound (£)</option>
                </select>
              </div>
              <div>
                <label className="label">Tax Rate (%)</label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleInputChange('taxRate', parseFloat(e.target.value))}
                  className="input"
                  min="0"
                  max="100"
                />
              </div>
            </div>
          </div>

          {/* Shipping Settings */}
          <div>
            <h2 className="heading-3 mb-4 flex items-center gap-3">
              <Mail className="w-6 h-6 text-primary-500" />
              Shipping
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={settings.freeShippingThreshold}
                  onChange={(e) => handleInputChange('freeShippingThreshold', parseInt(e.target.value))}
                  className="input"
                />
                <p className="text-xs text-dark-500 mt-1">Orders above this amount qualify for free shipping</p>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div>
            <h2 className="heading-3 mb-4 flex items-center gap-3">
              <Database className="w-6 h-6 text-primary-500" />
              System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center justify-between p-4 border border-dark-200 rounded-lg cursor-pointer">
                  <div>
                    <span className="font-medium text-dark-950">Maintenance Mode</span>
                    <p className="text-sm text-dark-500">Temporarily disable the store for visitors</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.maintenanceMode}
                      onChange={(e) => handleInputChange('maintenanceMode', e.target.checked)}
                      className="sr-only"
                    />
                    <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                  </label>
                </label>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h2 className="heading-3 mb-4 flex items-center gap-3">
              <Bell className="w-6 h-6 text-primary-500" />
              Notifications
            </h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 border border-dark-200 rounded-lg cursor-pointer">
                <div>
                  <span className="font-medium text-dark-950">New Orders</span>
                  <p className="text-sm text-dark-500">Receive notifications for new orders</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.newOrders}
                    onChange={(e) => handleNotificationChange('newOrders', e.target.checked)}
                    className="sr-only"
                  />
                  <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </label>

              <label className="flex items-center justify-between p-4 border border-dark-200 rounded-lg cursor-pointer">
                <div>
                  <span className="font-medium text-dark-950">Low Stock Alerts</span>
                  <p className="text-sm text-dark-500">Get notified when products run low on stock</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.lowStock}
                    onChange={(e) => handleNotificationChange('lowStock', e.target.checked)}
                    className="sr-only"
                  />
                  <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </label>

              <label className="flex items-center justify-between p-4 border border-dark-200 rounded-lg cursor-pointer">
                <div>
                  <span className="font-medium text-dark-950">Order Updates</span>
                  <p className="text-sm text-dark-500">Receive order status change notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.notifications.orderUpdates}
                    onChange={(e) => handleNotificationChange('orderUpdates', e.target.checked)}
                    className="sr-only"
                  />
                  <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </label>
            </div>
          </div>

          {/*Danger Zone */}
          <div className="pt-6 border-t border-dark-100">
            <h2 className="heading-3 text-red-600 mb-4">Danger Zone</h2>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-red-700 text-sm mb-3">These actions are irreversible. Use with caution.</p>
              <button className="btn-outline border-red-300 text-red-600 hover:bg-red-100">
                Export Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings