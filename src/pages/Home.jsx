import { Link } from 'react-router-dom'
import { ArrowRight, ShoppingBag, Truck, RotateCcw, Shield } from 'lucide-react'
import { getProducts } from '../services/products'
import { useEffect, useState } from 'react'

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newArrivals, setNewArrivals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featuredRes, newRes] = await Promise.all([
          getProducts({ featured: true, limit: 8 }),
          getProducts({ newArrival: true, limit: 8 })
        ])
        setFeaturedProducts(featuredRes.products)
        setNewArrivals(newRes.products)
      } catch (error) {
        console.error('Error fetching home data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders above ₹999' },
    { icon: RotateCcw, title: 'Easy Returns', desc: '30-day hassle-free returns' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: ShoppingBag, title: 'Premium Quality', desc: 'Curated selection' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-400 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="pt-4">
      {/* Hero Section */}
      <section className="relative bg-dark-950 text-primary-50 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-800 to-primary-900/50" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-400 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-500 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-3xl animate-slide-up">
            <span className="inline-block px-4 py-1.5 bg-primary-500/20 text-primary-300 text-sm font-medium rounded-full mb-6 tracking-wide">
              NEW COLLECTION 2024
            </span>
            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight">
              Discover Timeless{' '}
              <span className="text-primary-400">Elegance</span>
            </h1>
            <p className="text-lg sm:text-xl text-dark-300 mb-8 max-w-2xl leading-relaxed">
              Curated premium fashion & lifestyle essentials for the modern individual.
              Quality craftsmanship meets contemporary design.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/shop?category=new-arrivals"
                className="btn-primary text-lg px-8 py-4"
              >
                Shop New Arrivals
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/shop"
                className="btn-outline text-lg px-8 py-4 border-primary-300 text-primary-50 hover:bg-primary-400 hover:text-dark-950"
              >
                Explore All
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-primary-50 to-transparent" />
      </section>

      {/* Features */}
      <section className="section bg-white">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 hover:shadow-card-hover transition-shadow rounded-xl">
                <div className="w-14 h-14 mx-auto mb-4 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="font-semibold text-dark-950 mb-1">{feature.title}</h3>
                <p className="text-dark-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section bg-primary-50">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading-2">Featured Collection</h2>
                <p className="text-body mt-1">Handpicked favorites from our latest collection</p>
              </div>
              <Link
                to="/shop?featured=true"
                className="link hidden sm:inline-flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop?featured=true" className="link inline-flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="section bg-white">
          <div className="container-main">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="heading-2">New Arrivals</h2>
                <p className="text-body mt-1">Fresh styles just landed</p>
              </div>
              <Link
                to="/shop?category=new-arrivals"
                className="link hidden sm:inline-flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop?category=new-arrivals" className="link inline-flex items-center gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-dark-950">
        <div className="container-main">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-2 text-primary-50">Join Our Community</h2>
            <p className="text-dark-300 mt-4 mb-8 text-lg">
              Subscribe to our newsletter for exclusive access to new collections, sales, and style inspiration.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Enter your email"
                className="input flex-1"
                required
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            </form>
            <p className="text-dark-500 text-sm mt-4">No spam, unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

// Product Card Component
function ProductCard({ product }) {
  const discount = product.originalPrice && product.originalPrice > product.sellingPrice
    ? Math.round(((product.originalPrice - product.sellingPrice) / product.originalPrice) * 100)
    : 0

  return (
    <Link to={`/product/${product.id}`} className="card group">
      <div className="relative aspect-square overflow-hidden bg-primary-50">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-dark-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {discount > 0 && (
          <span className="absolute top-3 left-3 badge-danger">-{discount}%</span>
        )}
        {product.newArrival && (
          <span className="absolute top-3 right-3 badge-primary">New</span>
        )}
        {product.bestSeller && (
          <span className="absolute top-3 right-3 badge-warning">Best Seller</span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-medium text-primary-500 uppercase tracking-wide mb-1">
          {product.category}
        </p>
        <h3 className="font-medium text-dark-950 mb-1 group-hover:text-primary-600 transition-colors line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-dark-950">₹{product.sellingPrice.toLocaleString()}</span>
          {product.originalPrice && product.originalPrice > product.sellingPrice && (
            <span className="text-sm text-dark-400 line-through">
              ₹{product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default Home