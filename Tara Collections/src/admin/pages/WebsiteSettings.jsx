import React, { useState, useEffect } from 'react';
import { collection, getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  X,
  Edit,
  Globe,
  MapPin,
  Phone,
  Mail,
  Clock,
  Shield,
  CreditCard,
  Tag,
  FileText,
  Ruler
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SETTINGS_COLLECTION = 'settings';
const WEBSITE_DOC_ID = 'website';

export default function AdminWebsiteSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    logo: '',
    favicon: '',
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    language: 'en',
    contact: {
      phone: '',
      email: '',
      address: ''
    },
    businessHours: [
      { day: 'Monday', open: '09:00', close: '18:00', closed: false },
      { day: 'Tuesday', open: '09:00', close: '18:00', closed: false },
      { day: 'Wednesday', open: '09:00', close: '18:00', closed: false },
      { day: 'Thursday', open: '09:00', close: '18:00', closed: false },
      { day: 'Friday', open: '09:00', close: '18:00', closed: false },
      { day: 'Saturday', open: '09:00', close: '14:00', closed: false },
      { day: 'Sunday', open: '', close: '', closed: true }
    ],
    shipping: {
      freeShippingThreshold: 500,
      shippingCost: 50,
      deliveryTime: '3-7 business days'
    },
    returns: {
      returnPeriod: 7,
      returnPolicy: 'Returns accepted within 7 days of delivery'
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      googleAnalytics: '',
      googleSearchConsole: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, WEBSITE_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings(data);
        setFormData({
          siteName: data.siteName || '',
          siteDescription: data.siteDescription || '',
          logo: data.logo || '',
          favicon: data.favicon || '',
          currency: data.currency || 'INR',
          currencySymbol: data.currencySymbol || '₹',
          timezone: data.timezone || 'Asia/Kolkata',
          language: data.language || 'en',
          contact: data.contact || formData.contact,
          businessHours: data.businessHours || formData.businessHours,
          shipping: data.shipping || formData.shipping,
          returns: data.returns || formData.returns,
          seo: data.seo || formData.seo
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
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
        siteName: settings.siteName || '',
        siteDescription: settings.siteDescription || '',
        logo: settings.logo || '',
        favicon: settings.favicon || '',
        currency: settings.currency || 'INR',
        currencySymbol: settings.currencySymbol || '₹',
        timezone: settings.timezone || 'Asia/Kolkata',
        language: settings.language || 'en',
        contact: settings.contact || formData.contact,
        businessHours: settings.businessHours || formData.businessHours,
        shipping: settings.shipping || formData.shipping,
        returns: settings.returns || formData.returns,
        seo: settings.seo || formData.seo
      });
    }
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, WEBSITE_DOC_ID);

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
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleBusinessHoursChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: prev.businessHours.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const SectionCard = ({ title, icon: Icon, children, section }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-lg p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-serif font-bold text-tara-black flex items-center space-x-2">
          <Icon className="h-5 w-5 text-tara-gold" />
          <span>{title}</span>
        </h3>
      </div>
      {children}
    </motion.div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Website Settings</h1>
          <p className="text-tara-gray mt-1">Configure global website settings</p>
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
        <div className="space-y-4">
          {/* Site Info Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-tara-black mb-4">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-tara-gray">Site Name</p>
                <p className="font-medium text-tara-black">{settings.siteName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-tara-gray">Currency</p>
                <p className="font-medium text-tara-black">
                  {settings.currencySymbol} {settings.currency}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Info Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-tara-black mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-tara-gray">Phone</p>
                <p className="font-medium">{settings.contact?.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-tara-gray">Email</p>
                <p className="font-medium">{settings.contact?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-tara-gray">Address</p>
                <p className="font-medium">{settings.contact?.address || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Business Hours Preview */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-medium text-tara-black mb-4">Business Hours</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {settings.businessHours?.slice(0, 7).map(day => (
                <div key={day.day} className="text-center">
                  <p className="text-xs text-tara-gray">{day.day.slice(0, 3)}</p>
                  <p className="font-medium text-sm">
                    {day.closed ? 'Closed' : `${day.open}-${day.close}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* General Settings */}
          <SectionCard title="General Settings" icon={Globe} section="general">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Site Name</label>
                <input
                  type="text"
                  value={formData.siteName}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="TARA COLLECTIONS"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Site Description</label>
                <textarea
                  value={formData.siteDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, siteDescription: e.target.value }))}
                  rows="2"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Premium fashion and jewellery"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.currencySymbol}
                    onChange={(e) => setFormData(prev => ({ ...prev, currencySymbol: e.target.value }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="₹"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                    <option value="Europe/London">Europe/London (GMT)</option>
                    <option value="America/New_York">America/New York (EST)</option>
                  </select>
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Contact Information */}
          <SectionCard title="Contact Information" icon={Mail} section="contact">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.contact.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Email Address</label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="info@taracollections.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Address</label>
                <textarea
                  value={formData.contact.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact: { ...prev.contact, address: e.target.value } }))}
                  rows="2"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="123, Fashion Street, Mumbai, Maharashtra 400001"
                />
              </div>
            </div>
          </SectionCard>

          {/* Business Hours */}
          <SectionCard title="Business Hours" icon={Clock} section="businessHours">
            <div className="space-y-3">
              {formData.businessHours.map((day, index) => (
                <div
                  key={day.day}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-tara-cream rounded-lg"
                >
                  <div className="font-medium text-tara-gray">{day.day}</div>
                  <label className="flex items-center space-x-2 md:col-span-2">
                    <input
                      type="checkbox"
                      checked={day.closed}
                      onChange={(e) => handleBusinessHoursChange(index, 'closed', e.target.checked)}
                      className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                    />
                    <span className={day.closed ? "text-tara-gray" : "text-tara-black"}>Closed</span>
                  </label>
                  {!day.closed && (
                    <>
                      <input
                        type="text"
                        value={day.open}
                        onChange={(e) => handleBusinessHoursChange(index, 'open', e.target.value)}
                        className="px-2 py-1 border border-tara-beige rounded text-sm focus:outline-none focus:ring-2 focus:ring-tara-gold"
                        placeholder="Open"
                      />
                      <input
                        type="text"
                        value={day.close}
                        onChange={(e) => handleBusinessHoursChange(index, 'close', e.target.value)}
                        className="px-2 py-1 border border-tara-beige rounded text-sm focus:outline-none focus:ring-2 focus:ring-tara-gold"
                        placeholder="Close"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Shipping Settings */}
          <SectionCard title="Shipping Policy" icon={Ruler} section="shipping">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Free Shipping Threshold (₹)</label>
                <input
                  type="number"
                  value={formData.shipping.freeShippingThreshold}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, freeShippingThreshold: parseInt(e.target.value) || 0 } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Standard Shipping Cost (₹)</label>
                <input
                  type="number"
                  value={formData.shipping.shippingCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, shippingCost: parseInt(e.target.value) || 0 } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Estimated Delivery Time</label>
                <input
                  type="text"
                  value={formData.shipping.deliveryTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, shipping: { ...prev.shipping, deliveryTime: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="3-7 business days"
                />
              </div>
            </div>
          </SectionCard>

          {/* Returns Policy */}
          <SectionCard title="Returns Policy" icon={Shield} section="returns">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Return Period (Days)</label>
                <input
                  type="number"
                  value={formData.returns.returnPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, returns: { ...prev.returns, returnPeriod: parseInt(e.target.value) || 0 } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="7"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Return Policy Description</label>
                <textarea
                  value={formData.returns.returnPolicy}
                  onChange={(e) => setFormData(prev => ({ ...prev, returns: { ...prev.returns, returnPolicy: e.target.value } }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Returns accepted within 7 days of delivery"
                />
              </div>
            </div>
          </SectionCard>

          {/* SEO Settings */}
          <SectionCard title="SEO Settings" icon={FileText} section="seo">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Meta Title</label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaTitle: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="TARA COLLECTIONS - Premium Jewellery & Fashion"
                />
                <p className="text-xs text-tara-gray mt-1">Recommended: 50-60 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Meta Description</label>
                <textarea
                  value={formData.seo.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, metaDescription: e.target.value } }))}
                  rows="3"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Discover premium jewellery and fashion at TARA COLLECTIONS..."
                />
                <p className="text-xs text-tara-gray mt-1">Recommended: 150-160 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Google Analytics ID (optional)</label>
                <input
                  type="text"
                  value={formData.seo.googleAnalytics}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, googleAnalytics: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="G-XXXXXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Google Search Console ID (optional)</label>
                <input
                  type="text"
                  value={formData.seo.googleSearchConsole}
                  onChange={(e) => setFormData(prev => ({ ...prev, seo: { ...prev.seo, googleSearchConsole: e.target.value } }))}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="google-site-verification=xxx"
                />
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}