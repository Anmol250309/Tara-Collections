import React, { useState, useEffect } from 'react';
import { collection, getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  X,
  Edit,
  CreditCard,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  Bank,
  Smartphone,
  Globe
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SETTINGS_COLLECTION = 'settings';
const PAYMENT_DOC_ID = 'paymentSettings';

export default function AdminPaymentSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    enabledPaymentMethods: ['upi', 'cashondelivery'],
    upi: {
      enabled: true,
      merchantId: 'amita.sinha2509@okhdfcbank',
      receiveEmail: '',
      notifyOnPayment: true,
      otpRequired: false
    },
    cashOnDelivery: {
      enabled: true,
      description: 'Pay cash when your order is delivered'
    },
    bankTransfer: {
      enabled: false,
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    payment: {
      requireOTP: true,
      maxOrderForCOD: 50000,
      autoConfirmOrders: false,
      confirmAfterDays: 3
    },
    security: {
      enablePaymentProtection: true,
      requireAddressVerification: true,
      enableFraudDetection: true,
      minimumOrderAmount: 500
    },
    payout: {
      autoPayout: true,
      payoutDay: 'Friday',
      payoutTime: '18:00',
      minPayoutAmount: 1000
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, PAYMENT_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings(data);
        setFormData({
          enabledPaymentMethods: data.enabledPaymentMethods || formData.enabledPaymentMethods,
          upi: data.upi || formData.upi,
          cashOnDelivery: data.cashOnDelivery || formData.cashOnDelivery,
          bankTransfer: data.bankTransfer || formData.bankTransfer,
          payment: data.payment || formData.payment,
          security: data.security || formData.security,
          payout: data.payout || formData.payout
        });
      }
    } catch (error) {
      console.error('Error fetching payment settings:', error);
      toast.error('Failed to load payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (settings) {
      setFormData({
        enabledPaymentMethods: settings.enabledPaymentMethods || formData.enabledPaymentMethods,
        upi: settings.upi || formData.upi,
        cashOnDelivery: settings.cashOnDelivery || formData.cashOnDelivery,
        bankTransfer: settings.bankTransfer || formData.bankTransfer,
        payment: settings.payment || formData.payment,
        security: settings.security || formData.security,
        payout: settings.payout || formData.payout
      });
    }
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, PAYMENT_DOC_ID);

      const dataToSave = {
        ...formData,
        updatedAt: new Date()
      };

      if (settings) {
        await setDoc(settingsRef, dataToSave, { merge: true });
      } else {
        await setDoc(settingsRef, {
          ...dataToSave,
          createdAt: new Date()
        });
      }

      setSettings(dataToSave);
      setIsEditing(false);
      toast.success('Payment settings saved successfully');
    } catch (error) {
      console.error('Error saving payment settings:', error);
      toast.error('Failed to save payment settings');
    }
  };

  const togglePaymentMethod = (method) => {
    setFormData(prev => ({
      ...prev,
      enabledPaymentMethods: prev.enabledPaymentMethods.includes(method)
        ? prev.enabledPaymentMethods.filter(m => m !== method)
        : [...prev.enabledPaymentMethods, method]
    }));
  };

  const PaymentToggle = ({ method, label, description, icon: Icon }) => (
    <div
      onClick={() => togglePaymentMethod(method)}
      className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${
        formData.enabledPaymentMethods.includes(method)
          ? 'border-tara-gold bg-tara-cream'
          : 'border-tara-beige hover:bg-tara-cream/50'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 text-tara-gray" />
        <div>
          <p className="font-medium text-tara-black">{label}</p>
          <p className="text-sm text-tara-gray">{description}</p>
        </div>
      </div>
      <div className={`relative inline-flex items-center ${
        formData.enabledPaymentMethods.includes(method) ? 'bg-tara-gold' : 'bg-tara-beige'
      }`}>
        <span className="relative inline-block w-10 h-5 rounded-full transition-colors">
          <span className={`absolute inset-0 ${
            formData.enabledPaymentMethods.includes(method) ? 'translate-x-5' : 'translate-x-1'
          } bg-white rounded-full transition-transform`}></span>
        </span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Payment Settings</h1>
          <p className="text-tara-gray mt-1">Configure payment methods and security</p>
        </div>
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
            >
              <Save className="h-5 w-5" />
              <span>Save Changes</span>
            </button>
          </div>
        ) : (
          <button
            onClick={handleEdit}
            className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
          >
            <Edit className="h-5 w-5" />
            <span>Edit Settings</span>
          </button>
        )}
      </div>

      {!isEditing && settings ? (
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-tara-black mb-4">Active Payment Methods</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {formData.enabledPaymentMethods.includes('upi') && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Smartphone className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-blue-900">UPI</p>
                      <p className="text-sm text-blue-700">Enabled</p>
                    </div>
                  </div>
                </div>
              )}
              {formData.enabledPaymentMethods.includes('cashondelivery') && (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <Bank className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-900">Cash on Delivery</p>
                      <p className="text-sm text-green-700">Enabled</p>
                    </div>
                  </div>
                </div>
              )}
              {formData.enabledPaymentMethods.includes('banktransfer') && (
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Globe className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-purple-900">Bank Transfer</p>
                      <p className="text-sm text-purple-700">Enabled</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Security Status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-tara-black mb-4">Security Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Payment Protection</p>
                    <p className="text-sm text-green-700">{formData.security.enablePaymentProtection ? 'Active' : 'Inactive'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Fraud Detection</p>
                    <p className="text-sm text-blue-700">{formData.security.enableFraudDetection ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Auto Confirmation</p>
                    <p className="text-sm text-yellow-700">{formData.payment.autoConfirmOrders ? 'Enabled' : 'Manual'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Payment Methods */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Available Payment Methods</h3>
            <p className="text-tara-gray mb-4">Select the methods you want to enable for customers</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <PaymentToggle
                method="upi"
                label="UPI"
                description="Direct bank transfer via UPI apps"
                icon={Smartphone}
              />
              <PaymentToggle
                method="cashondelivery"
                label="Cash on Delivery"
                description="Pay cash when order is delivered"
                icon={Bank}
              />
              <PaymentToggle
                method="banktransfer"
                label="Bank Transfer"
                description="Direct bank account transfer"
                icon={Globe}
              />
            </div>
          </motion.div>

          {/* UPI Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-tara-black flex items-center space-x-2">
                <Smartphone className="h-5 w-5 text-tara-gold" />
                <span>UPI Settings</span>
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.upi.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, upi: { ...prev.upi, enabled: e.target.checked } }))}
                  className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                />
                <span className="text-sm text-tara-gray">Enable UPI</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">UPI ID / Email</label>
                <input
                  type="text"
                  value={formData.upi.receiveEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, upi: { ...prev.upi, receiveEmail: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="upi@bankname.com or 1234567890@oksbi"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Notification</label>
                <select
                  value={formData.upi.notifyOnPayment ? 'yes' : 'no'}
                  onChange={(e) => setFormData(prev => ({ ...prev, upi: { ...prev.upi, notifyOnPayment: e.target.value === 'yes' } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                >
                  <option value="yes">Send notification on payment</option>
                  <option value="no">No notification</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Cash on Delivery Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-serif font-bold text-tara-black flex items-center space-x-2">
                <Bank className="h-5 w-5 text-tara-gold" />
                <span>Cash on Delivery Settings</span>
              </h3>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.cashOnDelivery.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, cashOnDelivery: { ...prev.cashOnDelivery, enabled: e.target.checked } }))}
                  className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                />
                <span className="text-sm text-tara-gray">Enable COD</span>
              </label>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <textarea
                  value={formData.cashOnDelivery.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, cashOnDelivery: { ...prev.cashOnDelivery, description: e.target.value } }))}
                  rows="2"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">
                  Maximum Order Amount (₹){formData.payment.maxOrderForCOD}
                </label>
                <input
                  type="number"
                  value={formData.payment.maxOrderForCOD}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    payment: { ...prev.payment, maxOrderForCOD: parseInt(e.target.value) || 0 }
                  }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                />
                <p className="text-xs text-tara-gray mt-1">Minimum order value for COD eligibility</p>
              </div>
            </div>
          </motion.div>

          {/* Payment Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Payment Configuration</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">OTP Requirement</label>
                  <select
                    value={formData.payment.requireOTP ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, requireOTP: e.target.value === 'yes' } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="yes">Require OTP for all payments</option>
                    <option value="no">No OTP required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">OTP for UPI</label>
                  <select
                    value={formData.upi.otpRequired ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, upi: { ...prev.upi, otpRequired: e.target.value === 'yes' } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="yes">Require OTP for UPI</option>
                    <option value="no">No OTP for UPI</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Auto Confirm Orders</label>
                  <select
                    value={formData.payment.autoConfirmOrders ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, autoConfirmOrders: e.target.value === 'yes' } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="no">Manual confirmation</option>
                    <option value="yes">Auto confirm after delivery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Grace Period (Days)</label>
                  <input
                    type="number"
                    value={formData.payment.confirmAfterDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, confirmAfterDays: parseInt(e.target.value) || 0 } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="3"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Security & Fraud Prevention</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">
                  Minimum Order Amount for Security (₹){formData.security.minimumOrderAmount}
                </label>
                <input
                  type="number"
                  value={formData.security.minimumOrderAmount}
                  onChange={(e) => setFormData(prev => ({ ...prev, security: { ...prev.security, minimumOrderAmount: parseInt(e.target.value) || 0 } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                />
                <p className="text-xs text-tara-gray mt-1">Minimum order value to trigger additional security checks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.security.enablePaymentProtection}
                    onChange={(e) => setFormData(prev => ({ ...prev, security: { ...prev.security, enablePaymentProtection: e.target.checked } }))}
                    className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium text-tara-black">Payment Protection</span>
                    <p className="text-xs text-tara-gray">Block suspicious transactions</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.security.requireAddressVerification}
                    onChange={(e) => setFormData(prev => ({ ...prev, security: { ...prev.security, requireAddressVerification: e.target.checked } }))}
                    className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium text-tara-black">Address Verification</span>
                    <p className="text-xs text-tara-gray">Verify shipping address</p>
                  </div>
                </label>

                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.security.enableFraudDetection}
                    onChange={(e) => setFormData(prev => ({ ...prev, security: { ...prev.security, enableFraudDetection: e.target.checked } }))}
                    className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium text-tara-black">Fraud Detection</span>
                    <p className="text-xs text-tara-gray">AI-powered fraud prevention</p>
                  </div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Payout Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-serif font-bold text-tara-black mb-4">Payout Settings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Auto Payout</label>
                  <select
                    value={formData.payout.autoPayout ? 'yes' : 'no'}
                    onChange={(e) => setFormData(prev => ({ ...prev, payout: { ...prev.payout, autoPayout: e.target.value === 'yes' } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="yes">Enable Auto Payout</option>
                    <option value="no">Disable Auto Payout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Payout Day</label>
                  <select
                    value={formData.payout.payoutDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, payout: { ...prev.payout, payoutDay: e.target.value } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Minimum Payout Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.payout.minPayoutAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, payout: { ...prev.payout, minPayoutAmount: parseInt(e.target.value) || 0 } }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="1000"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}