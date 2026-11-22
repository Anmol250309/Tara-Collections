import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Zap,
  Shield,
  Truck,
  PhoneCall
} from 'lucide-react';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/products/ProductCard';
import CategoryCard from '../components/products/CategoryCard';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Home() {
  const [heroSlide, setHeroSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();

  // Hero slides (managed via Firestore)
  const heroSlides = [
    {
      id: 1,
      title: "Premium Fashion Elegance",
      subtitle: "Discover our curated collection of luxury-inspired fashion and jewellery",
      image: "/images/hero1.jpg",
      cta1: "Shop Now",
      cta2: "Explore Collection"
    },
    {
      id: 2,
      title: "Timeless Jewellery",
      subtitle: "Crafted with precision for the modern woman",
      image: "/images/hero2.jpg",
      cta1: "Shop Jewellery",
      cta2: "View Collection"
    },
    {
      id: 3,
      title: "Ethnic Wear Collection",
      subtitle: "Traditional elegance meets contemporary style",
      image: "/images/hero3.jpg",
      cta1: "Shop Ethnic",
      cta2: "Discover More"
    }
  ];

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Featured products
        const productsRef = collection(db, 'products');
        const featuredQuery = query(productsRef, where('featured', '==', true), limit(8));
        const featuredSnap = await getDocs(featuredQuery);
        setFeaturedProducts(featuredSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // New arrivals
        const newQuery = query(productsRef, where('newArrival', '==', true), limit(8));
        const newSnap = await getDocs(newQuery);
        setNewArrivals(newSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        // Categories
        const categoriesRef = collection(db, 'categories');
        const categoriesSnap = await getDocs(categoriesRef);
        setCategories(categoriesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Auto slide hero
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAddToCart = async (product) => {
    await addToCart(product.id, 1, product.availableSizes?.[0], product.availableColors?.[0]);
  };

  const handleToggleWishlist = async (productId) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen">
        <motion.div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: heroSlides[heroSlide] ? `url(${heroSlides[heroSlide].image})` : 'url(/images/hero1.jpg)'
          }}
          key={heroSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </motion.div>

        <div className="relative z-10 flex h-full items-center justify-center text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white max-w-3xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6">
              {heroSlides[heroSlide]?.title || 'Premium Fashion Elegance'}
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              {heroSlides[heroSlide]?.subtitle || 'Discover our curated collection of luxury fashion and jewellery'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-8 py-4 bg-tara-gold text-white font-medium rounded-full hover:bg-white transition-colors"
              >
                Shop Now
              </Link>
              <Link
                to="/collections"
                className="px-8 py-4 border-2 border-white text-white font-medium rounded-full hover:bg-white hover:text-tara-black transition-colors"
              >
                Explore Collection
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center space-x-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroSlide(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === heroSlide ? 'bg-tara-gold' : 'bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <button
          onClick={() => setHeroSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setHeroSlide(prev => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-3 rounded-full transition-all"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </section>

      {/* Shop By Category */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center text-tara-black mb-12">
            Shop By Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 px-4 bg-tara-cream">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-serif font-bold text-tara-black">Featured Products</h2>
            <Link
              to="/products?featured=true"
              className="text-tara-gold hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={isInWishlist(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-4xl font-serif font-bold text-tara-black">New Arrivals</h2>
            <Link
              to="/products?sort=newest"
              className="text-tara-gold hover:underline font-medium"
            >
              View All
            </Link>
          </div>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  isInWishlist={isInWishlist(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 px-4 bg-tara-cream">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center text-tara-black mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                icon: <Shield className="h-12 w-12 text-tara-gold" />,
                title: "Quality Products",
                description: "Premium materials and craftsmanship in every piece"
              },
              {
                icon: <Truck className="h-12 w-12 text-tara-gold" />,
                title: "Secure Shopping",
                description: "Your data is protected with industry-standard security"
              },
              {
                icon: <Zap className="h-12 w-12 text-tara-gold" />,
                title: "Easy Ordering",
                description: "Simple and fast checkout process"
              },
              {
                icon: <PhoneCall className="h-12 w-12 text-tara-gold" />,
                title: "Customer Support",
                description: "24/7 assistance from our dedicated team"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="bg-white p-6 rounded-xl shadow-lg mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-serif font-medium text-tara-black mb-2">
                  {item.title}
                </h3>
                <p className="text-tara-gray">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-serif font-bold text-center text-tara-black mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg"
              >
                <div className="flex items-center mb-4">
                  <div className="flex text-tara-gold">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-tara-gray mb-4">"Absolutely love my purchase! The quality is exceptional and the service was outstanding."</p>
                <div className="border-t border-tara-beige pt-4">
                  <p className="font-serif font-medium text-tara-black">Amita S.</p>
                  <p className="text-sm text-tara-gray">Verified Purchase</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 px-4 bg-tara-gold text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-serif font-bold mb-4">Stay Updated</h2>
          <p className="text-lg mb-8 opacity-90">
            Subscribe to our newsletter for the latest arrivals and exclusive offers
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="px-6 py-3 rounded-full flex-grow text-tara-black focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-white text-tara-gold font-medium rounded-full hover:bg-tara-cream transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}