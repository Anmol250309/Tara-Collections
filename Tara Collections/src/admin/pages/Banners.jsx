import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon,
  Shuffle,
  Tag,
  ExternalLink
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BANNER_TYPES = [
  { value: 'hero', label: 'Hero Banner', description: 'Full-width banner on homepage' },
  { value: 'category', label: 'Category Banner', description: 'Banner for specific categories' },
  { value: 'announcement', label: 'Announcement Banner', description: 'Top announcement banner' },
  { value: 'promotional', label: 'Promotional Banner', description: 'Special promotion banner' }
];

const TARGET_TYPES = [
  { value: 'products', label: 'Products', icon: Layout },
  { value: 'collection', label: 'Collection', icon: Shuffle },
  { value: 'category', label: 'Category', icon: Tag },
  { value: 'page', label: 'Page', icon: Layout },
  { value: 'external', label: 'External Link', icon: ExternalLink }
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBanner, setEditingBanner] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    image: '',
    link: '',
    target: 'products',
    productIds: [],
    targetIds: '',
    type: 'hero',
    priority: 0,
    startDate: '',
    endDate: '',
    isActive: true,
    backgroundColor: '#F8F5EF',
    textAlignment: 'center'
  });

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const bannersSnap = await getDocs(collection(db, 'banners'));
      const bannersData = bannersSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      bannersData.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setBanners(bannersData);
    } catch (error) {
      console.error('Error fetching banners:', error);
      toast.error('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredBanners = banners.filter(banner =>
    (banner.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     banner.id?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (activeTab === 'all' || banner.type === activeTab)
  );

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title || '',
      image: banner.image || '',
      link: banner.link || '',
      target: banner.target || 'products',
      productIds: banner.productIds || [],
      targetIds: banner.targetIds || '',
      type: banner.type || 'hero',
      priority: banner.priority || 0,
      startDate: banner.startDate ? banner.startDate.toDate().toISOString().split('T')[0] : '',
      endDate: banner.endDate ? banner.endDate.toDate().toISOString().split('T')[0] : '',
      isActive: banner.isActive !== false,
      backgroundColor: banner.backgroundColor || '#F8F5EF',
      textAlignment: banner.textAlignment || 'center'
    });
    setShowForm(true);
  };

  const handleDelete = async (bannerId) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await deleteDoc(doc(db, 'banners', bannerId));
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (error) {
        console.error('Error deleting banner:', error);
        toast.error('Failed to delete banner');
      }
    }
  };

  const handleSave = async () => {
    try {
      const bannerData = {
        ...formData,
        link: formData.target === 'external' ? formData.link : null,
        targetIds: formData.target === 'external' ? null : formData.targetIds,
        productIds: formData.target === 'products' ? formData.productIds.split(',').map(id => id.trim()) : [],
        startDate: formData.startDate ? new Date(formData.startDate) : null,
        endDate: formData.endDate ? new Date(formData.endDate) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingBanner) {
        await updateDoc(doc(db, 'banners', editingBanner.id), bannerData);
        toast.success('Banner updated successfully');
      } else {
        await addDoc(collection(db, 'banners'), bannerData);
        toast.success('Banner created successfully');
      }

      setShowForm(false);
      setEditingBanner(null);
      setFormData({
        title: '',
        image: '',
        link: '',
        target: 'products',
        productIds: [],
        targetIds: '',
        type: 'hero',
        priority: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        backgroundColor: '#F8F5EF',
        textAlignment: 'center'
      });
      fetchBanners();
    } catch (error) {
      console.error('Error saving banner:', error);
      toast.error('Failed to save banner');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBanner(null);
    setFormData({
      title: '',
      image: '',
      link: '',
      target: 'products',
      productIds: [],
      targetIds: '',
      type: 'hero',
      priority: 0,
      startDate: '',
      endDate: '',
      isActive: true,
      backgroundColor: '#F8F5EF',
      textAlignment: 'center'
    });
  };

  const getStatusBadge = (banner) => {
    if (!banner.isActive) {
      return <span className="badge badge-inactive">Inactive</span>;
    }

    if (banner.startDate || banner.endDate) {
      const now = new Date();
      const start = banner.startDate?.toDate ? banner.startDate.toDate() : new Date(banner.startDate);
      const end = banner.endDate?.toDate ? banner.endDate.toDate() : new Date(banner.endDate);

      if (start && now < start) {
        return <span className="badge badge-pending">Scheduled</span>;
      }
      if (end && now > end) {
        return <span className="badge badge-expired">Expired</span>;
      }
    }

    return <span className="badge badge-active">Active</span>;
  };

  if (loading && banners.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading banners...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Banners</h1>
          <p className="text-tara-gray mt-1">Manage homepage and category banners</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { id: 'all', label: 'All Banners' },
            { id: 'hero', label: 'Hero Banners' },
            { id: 'announcement', label: 'Announcements' },
            { id: 'promotional', label: 'Promotions' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-tara-gold text-white'
                  : 'bg-tara-cream text-tara-gray hover:bg-tara-beige'
              }`}
            >
              {tab.label}
            </button>
          ))}
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
              <ImageIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Banners</p>
              <p className="text-2xl font-bold text-tara-black">{banners.length}</p>
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
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Active</p>
              <p className="text-2xl font-bold text-tara-black">
                {banners.filter(b => b.isActive).length}
              </p>
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
            <div className="p-3 bg-yellow-100 rounded-full">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Scheduled</p>
              <p className="text-2xl font-bold text-tara-black">
                {banners.filter(b => {
                  const now = new Date();
                  const start = b.startDate?.toDate ? b.startDate.toDate() : b.startDate;
                  const end = b.endDate?.toDate ? b.endDate.toDate() : b.endDate;
                  return b.isActive && start && now < start;
                }).length}
              </p>
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
            <div className="p-3 bg-purple-100 rounded-full">
              <Layout className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Hero</p>
              <p className="text-2xl font-bold text-tara-black">
                {banners.filter(b => b.type === 'hero').length}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
          <input
            type="text"
            placeholder="Search banners..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
          />
        </div>
      </div>

      {/* Banners List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredBanners.length === 0 ? (
          <div className="p-6 text-center">
            <ImageIcon className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No banners found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tara-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Banner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tara-beige">
                <AnimatePresence>
                  {filteredBanners.map((banner) => (
                    <motion.tr
                      key={banner.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-tara-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {banner.image ? (
                            <img src={banner.image} alt={banner.title} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-tara-beige rounded flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-tara-gray" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-tara-black">{banner.title}</p>
                            <p className="text-sm text-tara-gray">ID: {banner.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-tara-gray">
                        {BANNER_TYPES.find(t => t.value === banner.type)?.label || banner.type}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {getStatusBadge(banner)}
                      </td>
                      <td className="px-4 py-3 text-right text-tara-gray">
                        {banner.priority || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(banner)}
                            className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(banner.id)}
                            className="p-1 text-tara-gray hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Banner Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-tara-beige">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-serif font-bold text-tara-black">
                  {editingBanner ? 'Edit Banner' : 'Add New Banner'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1 text-tara-gray hover:text-tara-black transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Banner Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="Enter banner title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Banner Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  >
                    {BANNER_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://example.com/banner.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Target Type</label>
                <select
                  name="target"
                  value={formData.target}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                >
                  {TARGET_TYPES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {formData.target === 'products' && (
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Product IDs (comma separated)</label>
                  <input
                    type="text"
                    name="productIds"
                    value={formData.productIds.join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, productIds: e.target.value }))}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="prod-id-1, prod-id-2"
                  />
                </div>
              )}

              {formData.target === 'external' && (
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">External URL</label>
                  <input
                    type="text"
                    name="link"
                    value={formData.link}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="https://example.com"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Priority (lower = earlier)</label>
                  <input
                    type="number"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Background Color</label>
                <input
                  type="color"
                  name="backgroundColor"
                  value={formData.backgroundColor}
                  onChange={handleInputChange}
                  className="w-full h-10 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                />
              </div>

              <div className="flex items-center space-x-4 pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                  />
                  <span className="text-sm text-tara-gray">Active</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 border border-tara-beige rounded-full text-tara-gray hover:bg-tara-cream transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
                >
                  <Save className="h-5 w-5" />
                  <span>Save Banner</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}