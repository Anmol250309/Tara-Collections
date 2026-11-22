import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  ChevronDown,
  Heart
} from 'lucide-react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/products/ProductCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState({
    category: '',
    subcategory: '',
    priceRange: [0, 5000],
    sizes: [],
    colors: [],
    search: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [lastDoc, setLastDoc] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Get filter values from URL params
  useEffect(() => {
    const params = {};
    for (const [key, value] of searchParams.entries()) {
      if (Array.isArray(params[key])) {
        params[key].push(value);
      } else {
        params[key] = value;
      }
    }
    setFilters(prev => ({ ...prev, ...params }));
  }, [searchParams]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, 'categories');
        const categoriesSnap = await getDocs(categoriesRef);
        setCategories(categoriesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let productsQuery = query(
          collection(db, 'products'),
          where('status', '==', 'active')
        );

        // Apply filters
        const filtersArray = [];
        if (filters.category) {
          filtersArray.push(where('category', '==', filters.category));
        }
        if (filters.search) {
          filtersArray.push(where('searchKeywords', 'array-contains', filters.search.toLowerCase()));
        }

        // Create new query with filters
        let finalQuery = query(collection(db, 'products'), where('status', '==', 'active'));

        if (filters.category) {
          finalQuery = query(
            collection(db, 'products'),
            where('status', '==', 'active'),
            where('category', '==', filters.category)
          );
        }

        // Apply sorting
        switch (sortBy) {
          case 'newest':
            finalQuery = query(finalQuery, orderBy('createdAt', 'desc'), limit(20));
            break;
          case 'price-low':
            finalQuery = query(finalQuery, orderBy('discountPrice || price', 'asc'), limit(20));
            break;
          case 'price-high':
            finalQuery = query(finalQuery, orderBy('discountPrice || price', 'desc'), limit(20));
            break;
          case 'popularity':
            finalQuery = query(finalQuery, orderBy('rating', 'desc'), limit(20));
            break;
          default:
            finalQuery = query(finalQuery, orderBy('createdAt', 'desc'), limit(20));
        }

        const productsSnap = await getDocs(finalQuery);
        const productsList = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProducts(productsList);
        setLastDoc(productsSnap.docs[productsSnap.docs.length - 1]);
        setHasMore(productsSnap.docs.length === 20);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [filters.category, sortBy]);

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setSearchParams({ ...filters, [key]: value });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      subcategory: '',
      priceRange: [0, 5000],
      sizes: [],
      colors: [],
      search: ''
    });
    setSearchParams({});
  };

  // Load more products
  const loadMore = async () => {
    if (!lastDoc || !hasMore) return;

    try {
      let queryRef = query(
        collection(db, 'products'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(12)
      );

      if (filters.category) {
        queryRef = query(
          collection(db, 'products'),
          where('status', '==', 'active'),
          where('category', '==', filters.category),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(12)
        );
      }

      const snapshot = await getDocs(queryRef);
      const newProducts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProducts(prev => [...prev, ...newProducts]);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 12);
    } catch (error) {
      console.error('Error loading more products:', error);
    }
  };

  // Handle add to cart
  const handleAddToCart = async (product) => {
    await addToCart(product.id, 1, product.availableSizes?.[0], product.availableColors?.[0]);
  };

  // Handle toggle wishlist
  const handleToggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner size="large" />;
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-tara-black mb-4">
            {filters.category ? `${categories.find(c => c.id === filters.category)?.name || 'Products'} `}
            Products
          </h1>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-tara-gray" />
              <input
                type="text"
                placeholder="Search products..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
              />
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-tara-beige rounded-full focus:outline-none focus:ring-2 focus:ring-tara-gold"
              >
                <option value="newest">Newest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="popularity">Most Popular</option>
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-tara-beige rounded-full hover:bg-tara-cream transition-colors flex items-center"
              >
                <SlidersHorizontal className="h-5 w-5 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {showFilters && (
          <motion.div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute left-0 top-0 h-full w-80 bg-white shadow-lg p-6 overflow-y-auto"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-serif font-bold">Filters</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-tara-cream rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Filter content would go here */}
              <button
                onClick={() => {
                  clearFilters();
                  setShowFilters(false);
                }}
                className="w-full py-2 border border-tara-beige rounded-full mb-4"
              >
                Clear All
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-tara-gray mb-4">No products found</p>
            <Link to="/" className="text-tara-gold hover:underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={handleAddToCart}
                    onToggleWishlist={handleToggleWishlist}
                    isInWishlist={isInWishlist(product.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Load More Button */}
        {hasMore && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className="px-8 py-3 border-2 border-tara-gold text-tara-gold rounded-full hover:bg-tara-gold hover:text-white transition-all disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}