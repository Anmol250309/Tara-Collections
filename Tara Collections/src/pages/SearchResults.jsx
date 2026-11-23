import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  Heart,
  Star,
  Package,
  Filter,
  X,
  RefreshCw
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SearchResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredResults, setFilteredResults] = useState([]);

  // Get search query from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q') || '';
    setSearchQuery(query);
  }, [location.search]);

  // Search products
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setFilteredResults([]);
      return;
    }

    const searchProducts = async () => {
      setLoading(true);
      try {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const allProducts = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter by search query (case insensitive, matches name, category, or description)
        const lowerQuery = searchQuery.toLowerCase();
        const filtered = allProducts.filter(product =>
          (product.name && product.name.toLowerCase().includes(lowerQuery)) ||
          (product.category && product.category.toLowerCase().includes(lowerQuery)) ||
          (product.description && product.description.toLowerCase().includes(lowerQuery)) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(lowerQuery)))
        );

        setSearchResults(filtered);
        setFilteredResults(filtered);
      } catch (error) {
        console.error('Error searching products:', error);
        toast.error('Failed to search products');
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [searchQuery]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setFilteredResults([]);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
      toast.success('Item already in cart');
      return;
    }

    const newCartItem = { ...product, quantity: 1 };
    localStorage.setItem('cart', JSON.stringify([...cart, newCartItem]));
    toast.success(`${product.name} added to cart`);
  };

  const toggleWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const existingItem = wishlist.find(item => item.id === product.id);

    if (existingItem) {
      const updatedWishlist = wishlist.filter(item => item.id !== product.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      toast.success('Removed from wishlist');
    } else {
      const newWishlist = [...wishlist, { ...product, addedAt: new Date().toISOString() }];
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      toast.success(`${product.name} added to wishlist`);
    }
  };

  const wishlisted = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.some(item => item.id === productId);
  };

  return (
    <div className="min-h-screen bg-tara-bg py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Search Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-tara-gray" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, categories, brands..."
                className="w-full pl-12 pr-4 py-3 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold text-lg"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-tara-gray hover:text-tara-black"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            <p className="text-sm text-tara-gray mt-2">
              {loading ? 'Searching...' : `${searchResults.length} results found for "${searchQuery}"`}
            </p>
          </div>
        </motion.div>

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent mx-auto mb-4"></div>
              <p className="text-tara-gray">Searching products...</p>
            </div>
          ) : searchResults.length === 0 && searchQuery ? (
            <div className="text-center py-12">
              <div className="p-4 bg-tara-cream rounded-full inline-block mb-4">
                <Search className="h-12 w-12 text-tara-gray" />
              </div>
              <h3 className="text-xl font-serif font-bold text-tara-black mb-2">No results found</h3>
              <p className="text-tara-gray mb-4">
                We couldn't find any products matching "{searchQuery}"
              </p>
              <button
                onClick={handleClearSearch}
                className="px-6 py-3 bg-tara-gold text-white rounded-full font-medium hover:bg-tara-gold-light transition-colors"
              >
                Clear Search
              </button>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {searchResults.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div
                    onClick={() => handleProductClick(product.id)}
                    className="cursor-pointer"
                  >
                    <div className="relative">
                      <div className="w-full h-48 bg-tara-cream flex items-center justify-center">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-12 w-12 text-tara-gold" />
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleWishlist(product);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
                          wishlisted(product.id)
                            ? 'bg-red-500 text-white'
                            : 'bg-white/90 text-tara-gray hover:bg-white'
                        }`}
                      >
                        <Heart className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="p-4">
                      <h3
                        onClick={() => handleProductClick(product.id)}
                        className="font-medium text-tara-black hover:text-tara-gold transition-colors cursor-pointer"
                      >
                        {product.name || 'Product Name'}
                      </h3>

                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < (product.rating || 0)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="font-bold text-tara-black">
                          ₹{product.price?.toLocaleString()}
                        </span>
                      </div>

                      {product.category && (
                        <p className="text-xs text-tara-gray mt-1">{product.category}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => addToCart(product)}
                    className="w-full px-4 py-3 border border-tara-beige rounded-b-xl hover:bg-tara-cream transition-colors flex items-center justify-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-tara-gray">Type to start searching for products</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}