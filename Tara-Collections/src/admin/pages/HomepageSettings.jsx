import React, { useState, useEffect } from 'react';
import { collection, getDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Save,
  X,
  Edit,
  ShoppingBag,
  Award,
  Instagram,
  Youtube,
  Facebook,
  Twitter,
  Send,
  Star
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const SETTINGS_COLLECTION = 'settings';
const HOMEPAGE_DOC_ID = 'homepage';

export default function AdminHomepageSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    hero: {
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: 'Shop Now',
      ctaLink: '/shop'
    },
    featuredProducts: {
      enabled: true,
      title: '',
      subtitle: ''
    },
    collections: {
      enabled: true,
      title: '',
      subtitle: ''
    },
    about: {
      title: '',
      description: '',
      image: ''
    },
    testimonials: {
      enabled: true,
      title: '',
      subtitle: ''
    },
    socialMedia: {
      instagram: '',
      facebook: '',
      twitter: '',
      youtube: ''
    },
    newsletter: {
      enabled: true,
      title: '',
      description: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, HOMEPAGE_DOC_ID);
      const settingsSnap = await getDoc(settingsRef);

      if (settingsSnap.exists()) {
        const data = settingsSnap.data();
        setSettings(data);
        setFormData({
          hero: data.hero || formData.hero,
          featuredProducts: data.featuredProducts || formData.featuredProducts,
          collections: data.collections || formData.collections,
          about: data.about || formData.about,
          testimonials: data.testimonials || formData.testimonials,
          socialMedia: data.socialMedia || formData.socialMedia,
          newsletter: data.newsletter || formData.newsletter
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
        hero: settings.hero || formData.hero,
        featuredProducts: settings.featuredProducts || formData.featuredProducts,
        collections: settings.collections || formData.collections,
        about: settings.about || formData.about,
        testimonials: settings.testimonials || formData.testimonials,
        socialMedia: settings.socialMedia || formData.socialMedia,
        newsletter: settings.newsletter || formData.newsletter
      });
    }
  };

  const handleSave = async () => {
    try {
      const settingsRef = doc(db, SETTINGS_COLLECTION, HOMEPAGE_DOC_ID);

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
        {isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="p-1 text-tara-gray hover:text-tara-gold transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
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
          <h1 className="text-2xl font-serif font-bold text-tara-black">Homepage Settings</h1>
          <p className="text-tara-gray mt-1">Customize your homepage layout and content</p>
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
          {/* Hero Section Preview */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-4 border-b border-tara-beige flex justify-between items-center">
              <h3 className="text-lg font-medium text-tara-black">Hero Section</h3>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-tara-black mb-2">{settings.hero?.title || 'No title set'}</h2>
              <p className="text-tara-gray mb-4">{settings.hero?.subtitle || 'No subtitle set'}</p>
              <p className="text-sm text-tara-gray">CTA: {settings.hero?.ctaText} → {settings.hero?.ctaLink}</p>
            </div>
          </div>

          {/* Featured Products */}
          {settings.featuredProducts?.enabled && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-serif font-bold text-tara-black mb-2">Featured Products</h3>
              <h4 className="text-tara-gray">{settings.featuredProducts?.title}</h4>
              <p className="text-sm text-tara-gray mt-1">{settings.featuredProducts?.subtitle}</p>
            </div>
          )}

          {/* Collections */}
          {settings.collections?.enabled && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-serif font-bold text-tara-black mb-2">Collections</h3>
              <h4 className="text-tara-gray">{settings.collections?.title}</h4>
              <p className="text-sm text-tara-gray mt-1">{settings.collections?.subtitle}</p>
            </div>
          )}

          {/* About Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-serif font-bold text-tara-black mb-2">About Section</h3>
            <h4 className="text-tara-gray">{settings.about?.title}</h4>
            <p className="text-sm text-tara-gray mt-1 max-w-2xl">{settings.about?.description}</p>
          </div>

          {/* Testimonial */}
          {settings.testimonials?.enabled && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-serif font-bold text-tara-black mb-2">Testimonials</h3>
              <h4 className="text-tara-gray">{settings.testimonials?.title}</h4>
              <p className="text-sm text-tara-gray mt-1">{settings.testimonials?.subtitle}</p>
            </div>
          )}

          {/* Newsletter */}
          {settings.newsletter?.enabled && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-serif font-bold text-tara-black mb-2">Newsletter</h3>
              <h4 className="text-tara-gray">{settings.newsletter?.title}</h4>
              <p className="text-sm text-tara-gray mt-1">{settings.newsletter?.description}</p>
            </div>
          )}

          {/* Social Media */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-serif font-bold text-tara-black mb-3">Social Media Links</h3>
            <div className="flex space-x-4">
              {settings.socialMedia?.instagram && (
                <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-tara-gray hover:text-tara-gold">
                  <Instagram className="h-6 w-6" />
                </a>
              )}
              {settings.socialMedia?.facebook && (
                <a href={settings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-tara-gray hover:text-tara-gold">
                  <Facebook className="h-6 w-6" />
                </a>
              )}
              {settings.socialMedia?.twitter && (
                <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-tara-gray hover:text-tara-gold">
                  <Twitter className="h-6 w-6" />
                </a>
              )}
              {settings.socialMedia?.youtube && (
                <a href={settings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="text-tara-gray hover:text-tara-gold">
                  <Youtube className="h-6 w-6" />
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hero Section */}
          <SectionCard title="Hero Section" icon={ShoppingBag} section="hero">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Hero Title</label>
                <input
                  type="text"
                  value={formData.hero.title}
                  onChange={(e) => handleInputChange('hero', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Main heading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Hero Subtitle</label>
                <textarea
                  value={formData.hero.subtitle}
                  onChange={(e) => handleInputChange('hero', 'subtitle', e.target.value)}
                  rows="2"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Supporting text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Background Image URL</label>
                <input
                  type="text"
                  value={formData.hero.backgroundImage}
                  onChange={(e) => handleInputChange('hero', 'backgroundImage', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">CTA Text</label>
                  <input
                    type="text"
                    value={formData.hero.ctaText}
                    onChange={(e) => handleInputChange('hero', 'ctaText', e.target.value)}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="Shop Now"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-tara-black mb-1">CTA Link</label>
                  <input
                    type="text"
                    value={formData.hero.ctaLink}
                    onChange={(e) => handleInputChange('hero', 'ctaLink', e.target.value)}
                    className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                    placeholder="/shop"
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Featured Products */}
          <SectionCard title="Featured Products" icon={ShoppingBag} section="featuredProducts">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Section Title</label>
                <input
                  type="text"
                  value={formData.featuredProducts.title}
                  onChange={(e) => handleInputChange('featuredProducts', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Featured Products"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={formData.featuredProducts.subtitle}
                  onChange={(e) => handleInputChange('featuredProducts', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Handpicked favorites"
                />
              </div>
            </div>
          </SectionCard>

          {/* Collections */}
          <SectionCard title="Collections" icon={Award} section="collections">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Section Title</label>
                <input
                  type="text"
                  value={formData.collections.title}
                  onChange={(e) => handleInputChange('collections', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Collections"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={formData.collections.subtitle}
                  onChange={(e) => handleInputChange('collections', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Curated collections"
                />
              </div>
            </div>
          </SectionCard>

          {/* About Section */}
          <SectionCard title="About Section" icon={Settings} section="about">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Title</label>
                <input
                  type="text"
                  value={formData.about.title}
                  onChange={(e) => handleInputChange('about', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="About Tara Collections"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <textarea
                  value={formData.about.description}
                  onChange={(e) => handleInputChange('about', 'description', e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Tell your brand story..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Image URL</label>
                <input
                  type="text"
                  value={formData.about.image}
                  onChange={(e) => handleInputChange('about', 'image', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://example.com/about-image.jpg"
                />
              </div>
            </div>
          </SectionCard>

          {/* Testimonials */}
          <SectionCard title="Testimonials" icon={Star} section="testimonials">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={formData.testimonials.enabled}
                  onChange={(e) => handleInputChange('testimonials', 'enabled', e.target.checked)}
                  className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                />
                <label className="text-sm text-tara-gray">Enable Testimonials Section</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Section Title</label>
                <input
                  type="text"
                  value={formData.testimonials.title}
                  onChange={(e) => handleInputChange('testimonials', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="What Our Customers Say"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Section Subtitle</label>
                <input
                  type="text"
                  value={formData.testimonials.subtitle}
                  onChange={(e) => handleInputChange('testimonials', 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Real stories from real customers"
                />
              </div>
            </div>
          </SectionCard>

          {/* Social Media */}
          <SectionCard title="Social Media Links" icon={Instagram} section="socialMedia">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Instagram</label>
                <input
                  type="text"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Facebook</label>
                <input
                  type="text"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Twitter</label>
                <input
                  type="text"
                  value={formData.socialMedia.twitter}
                  onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">YouTube</label>
                <input
                  type="text"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="https://youtube.com/..."
                />
              </div>
            </div>
          </SectionCard>

          {/* Newsletter */}
          <SectionCard title="Newsletter" icon={Send} section="newsletter">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="checkbox"
                  checked={formData.newsletter.enabled}
                  onChange={(e) => handleInputChange('newsletter', 'enabled', e.target.checked)}
                  className="rounded border-tara-beige text-tara-gold focus:ring-tara-gold"
                />
                <label className="text-sm text-tara-gray">Enable Newsletter Section</label>
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Title</label>
                <input
                  type="text"
                  value={formData.newsletter.title}
                  onChange={(e) => handleInputChange('newsletter', 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Join our Newsletter"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-tara-black mb-1">Description</label>
                <input
                  type="text"
                  value={formData.newsletter.description}
                  onChange={(e) => handleInputChange('newsletter', 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
                  placeholder="Get updates on new arrivals and exclusive offers"
                />
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}