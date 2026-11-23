import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, deleteDoc, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Folder,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Save,
  AlertCircle,
  CheckCircle,
  Package,
  Shuffle,
  Grid3x3,
  Layers
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const COLLECTION_TAGS = [
  'New Arrival', 'Best Seller', 'Seasonal', 'Limited Edition',
  'Handcrafted', 'Premium', 'Everyday', 'Signature', 'Signature Collection',
  'Heritage', 'Contemporary', 'Statement', 'Classic', 'Modern'
];

export default function AdminCollections() {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCollection, setEditingCollection] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    image: '',
    bannerImage: '',
    tags: [],
    featured: false,
    priority: 0,
    hideFromMenu: false
  });

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    setLoading(true);
    try {
      const collectionsSnap = await getDocs(collection(db, 'collections'));
      const collectionsData = collectionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      collectionsData.sort((a, b) => (a.priority || 0) - (b.priority || 0));
      setCollections(collectionsData);
    } catch (error) {
      console.error('Error fetching collections:', error);
      toast.error('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCollections = collections.filter(collection =>
    collection.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.slug?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (collection) => {
    setEditingCollection(collection);
    setFormData({
      title: collection.title || '',
      slug: collection.slug || '',
      description: collection.description || '',
      image: collection.image || '',
      bannerImage: collection.bannerImage || '',
      tags: collection.tags || [],
      featured: collection.featured || false,
      priority: collection.priority || 0,
      hideFromMenu: collection.hideFromMenu || false
    });
    setShowForm(true);
  };

  const handleDelete = async (collectionId) => {
    if (window.confirm('Are you sure you want to delete this collection? This will also remove products from the collection.')) {
      try {
        await deleteDoc(doc(db, 'collections', collectionId));
        toast.success('Collection deleted successfully');
        fetchCollections();
      } catch (error) {
        console.error('Error deleting collection:', error);
        toast.error('Failed to delete collection');
      }
    }
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleSave = async () => {
    try {
      const collectionData = {
        ...formData,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '-'),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingCollection) {
        await updateDoc(doc(db, 'collections', editingCollection.id), collectionData);
        toast.success('Collection updated successfully');
      } else {
        await addDoc(collection(db, 'collections'), collectionData);
        toast.success('Collection created successfully');
      }

      setShowForm(false);
      setEditingCollection(null);
      setFormData({
        title: '',
        slug: '',
        description: '',
        image: '',
        bannerImage: '',
        tags: [],
        featured: false,
        priority: 0,
        hideFromMenu: false
      });
      fetchCollections();
    } catch (error) {
      console.error('Error saving collection:', error);
      toast.error('Failed to save collection');
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
    setEditingCollection(null);
    setFormData({
      title: '',
      slug: '',
      description: '',
      image: '',
      bannerImage: '',
      tags: [],
      featured: false,
      priority: 0,
      hideFromMenu: false
    });
  };

  const getFeaturedCount = () => {
    return collections.filter(c => c.featured).length;
  };

  if (loading && collections.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto"></div>
          <p className="text-tara-gray mt-4">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-tara-black">Collections</h1>
          <p className="text-tara-gray mt-1">Manage product collections and categories</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Add Collection</span>
        </button>
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
            <div className="p-3 bg-purple-100 rounded-full">
              <Layers className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Total Collections</p>
              <p className="text-2xl font-bold text-tara-black">{collections.length}</p>
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
            <div className="p-3 bg-gold-100 rounded-full">
              <Shuffle className="h-6 w-6 text-tara-gold" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Featured</p>
              <p className="text-2xl font-bold text-tara-black">{getFeaturedCount()}</p>
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
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Published</p>
              <p className="text-2xl font-bold text-tara-black">
                {collections.filter(c => !c.hideFromMenu).length}
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
            <div className="p-3 bg-orange-100 rounded-full">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-tara-gray">Hidden</p>
              <p className="text-2xl font-bold text-tara-black">
                {collections.filter(c => c.hideFromMenu).length}
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
            placeholder="Search collections..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
          />
        </div>
      </div>

      {/* Collections List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {filteredCollections.length === 0 ? (
          <div className="p-6 text-center">
            <Folder className="h-12 w-12 text-tara-gray mx-auto mb-4" />
            <p className="text-tara-gray">No collections found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-tara-cream">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Collection</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-tara-gray uppercase tracking-wider">Tags</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-tara-gray uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Priority</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-tara-gray uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tara-beige">
                <AnimatePresence>
                  {filteredCollections.map((collection) => (
                    <motion.tr
                      key={collection.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-tara-cream/50 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          {collection.image ? (
                            <img src={collection.image} alt={collection.title} className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-tara-beige rounded flex items-center justify-center">
                              <Folder className="h-5 w-5 text-tara-gray" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-tara-black">{collection.title}</p>
                            <p className="text-sm text-tara-gray">{collection.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {(collection.tags || []).slice(0, 3).map(tag => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-tara-gold/10 text-tara-gold"
                            >
                              {tag}
                            </span>
                          ))}
                          {(collection.tags || []).length > 3 && (
                            <span className="text-xs text-tara-gray">
                              +{collection.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          {collection.featured && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Featured
                            </span>
                          )}
                          {collection.hideFromMenu ? (
                            <AlertCircle className="h-4 w-4 text-red-600" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-tara-gray">
                        {collection.priority || 0}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(collection)}
                            className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(collection.id)}
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

      {/* Collection Form Modal */}
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
                  {editingCollection ? 'Edit Collection' : 'Add New Collection'}
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
                  <label className="block text-sm font-medium text-tara-black mb-1">Collection Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="Enter collection title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">URL Slug</label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="collection-slug"
                  />
                  <p className="text-xs text-tara-gray mt-1">Auto-generates if left blank</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Collection description"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Image URL</label>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="https://example.com/collection-image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">Banner Image URL</label>
                  <input
                    type="text"
                    name="bannerImage"
                    value={formData.bannerImage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="https://example.com/banner.jpg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Tags</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {COLLECTION_TAGS.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 text-xs rounded-full transition-colors ${
                        formData.tags.includes(tag)
                          ? 'bg-tara-gold text-white'
                          : 'bg-tara-cream text-tara-gray hover:bg-tara-beige'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-tara-gray">Selected: {formData.tags.length} tags</p>
              </div>

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
                  <label className="block text-sm font-medium text-tara-black mb-1">URL Path</label>
                  <input
                    type="text"
                    readonly
                    value={`/collections/${formData.title.toLowerCase().replace(/\s+/g, '-') || 'collection'}`}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full bg-tara-cream"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 pt-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleCheckboxChange}
                    className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                  />
                  <span className="text-sm text-tara-gray">Featured Collection</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="hideFromMenu"
                    checked={formData.hideFromMenu}
                    onChange={handleCheckboxChange}
                    className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                  />
                  <span className="text-sm text-tara-gray">Hide from Menu</span>
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
                  <span>Save Collection</span>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}