import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { Menu, X, ShoppingBag, Heart, User, LogOut, ChevronDown, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

function Layout() {
  const { user, userData, logout, loading: authLoading } = useAuth()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/shop?q=${encodeURIComponent(searchQuery.trim())}`
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
      }`}>
        {/* Top Bar */}
        <div className="hidden md:flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2 bg-dark-950 text-primary-50 text-sm">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Free shipping on orders above ₹999
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Easy 30-day returns
            </span>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/account" className="hover:text-primary-400 transition-colors">
                My Account
              </Link>
            ) : (
              <Link to="/login" className="hover:text-primary-400 transition-colors">
                Login / Signup
              </Link>
            )}
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="relative px-4 sm:px-6 lg:px-8 py-4 bg-white border-b border-dark-100">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-dark-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex-shrink-0" aria-label="Tara Collections Home">
              <span className="font-serif text-2xl sm:text-3xl font-bold text-dark-950 tracking-tight">
                TARA
              </span>
              <span className="text-xs font-medium text-primary-500 tracking-widest ml-1">COLLECTIONS</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link
                to="/shop"
                className={`text-sm font-medium transition-colors ${
                  location.pathname.startsWith('/shop') || location.pathname.startsWith('/product')
                    ? 'text-primary-600'
                    : 'text-dark-700 hover:text-primary-600'
                }`}
              >
                Shop
              </Link>
              <Link
                to="/shop?category=new-arrivals"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/new-arrivals' ? 'text-primary-600' : 'text-dark-700 hover:text-primary-600'
                }`}
              >
                New Arrivals
              </Link>
              <Link
                to="/shop?category=best-sellers"
                className={`text-sm font-medium transition-colors ${
                  location.pathname === '/best-sellers' ? 'text-primary-600' : 'text-dark-700 hover:text-primary-600'
                }`}
              >
                Best Sellers
              </Link>
              <Link
                to="/wishlist"
                className={`relative text-sm font-medium transition-colors ${
                  location.pathname === '/wishlist' ? 'text-primary-600' : 'text-dark-700 hover:text-primary-600'
                }`}
              >
                <Heart className="w-5 h-5 inline-block" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-primary-500 text-primary-50 text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Search, Cart, User */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Search Button */}
              <button
                className="relative p-2 text-dark-700 hover:text-primary-600 transition-colors md:hidden"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative p-2 text-dark-700 hover:text-primary-600 transition-colors"
                aria-label={`Cart ${itemCount > 0 ? `with ${itemCount} items` : 'is empty'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-3 bg-primary-500 text-primary-50 text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 p-2 text-dark-700 hover:text-primary-600 transition-colors"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="User menu"
                  aria-expanded={isProfileOpen}
                >
                  <User className="w-5 h-5" />
                  <span className="hidden sm:block text-sm font-medium">Account</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-dark-100 py-2 animate-slide-up">
                    {user ? (
                      <>
                        <div className="px-4 py-2 border-b border-dark-100">
                          <p className="text-sm font-medium text-dark-950">{userData?.displayName || user.email}</p>
                          <p className="text-xs text-dark-500 truncate">{user.email}</p>
                        </div>
                        <Link
                          to="/account"
                          className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Account
                        </Link>
                        <Link
                          to="/account/orders"
                          className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          My Orders
                        </Link>
                        <Link
                          to="/wishlist"
                          className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-600"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          Wishlist
                        </Link>
                        {userData?.role === 'admin' && (
                          <Link
                            to="/admin"
                            className="block px-4 py-2 text-sm text-dark-700 hover:bg-primary-50 hover:text-primary-600"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}
                        <hr className="my-2 border-dark-100" />
                        <button
                          onClick={() => { logout(); setIsProfileOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="px-4 py-3 text-center text-sm text-dark-600">
                          Please login to access your account
                        </div>
                        <div className="px-2 py-2 space-y-2">
                          <Link
                            to="/login"
                            className="block w-full text-center px-4 py-2 text-sm font-medium text-primary-50 bg-dark-950 rounded-lg hover:bg-dark-800"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            to="/signup"
                            className="block w-full text-center px-4 py-2 text-sm font-medium text-dark-950 border border-dark-200 rounded-lg hover:bg-primary-50"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Click outside to close */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsProfileOpen(false)}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-dark-100 animate-slide-up">
              <div className="flex flex-col gap-2">
                <Link
                  to="/shop"
                  className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Shop
                </Link>
                <Link
                  to="/shop?category=new-arrivals"
                  className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  New Arrivals
                </Link>
                <Link
                  to="/shop?category=best-sellers"
                  className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Best Sellers
                </Link>
                <Link
                  to="/wishlist"
                  className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  Wishlist {wishlistCount > 0 && `(${wishlistCount})`}
                </Link>
                <Link
                  to="/cart"
                  className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg flex items-center gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Cart {itemCount > 0 && `(${itemCount})`}
                </Link>
                {user ? (
                  <>
                    <hr className="my-2 border-dark-100" />
                    <Link
                      to="/account"
                      className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Account
                    </Link>
                    <Link
                      to="/account/orders"
                      className="px-4 py-2 text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <button
                      onClick={() => { logout(); setIsMenuOpen(false); }}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <hr className="my-2 border-dark-100" />
                    <Link
                      to="/login"
                      className="px-4 py-2 text-center text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="px-4 py-2 text-center text-dark-700 hover:bg-primary-50 hover:text-primary-600 rounded-lg"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Search Overlay */}
          {isSearchOpen && (
            <div className="fixed inset-0 z-50 bg-white md:hidden animate-fade-in">
              <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 text-dark-500 hover:text-dark-700"
                    aria-label="Close search"
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <form onSubmit={handleSearch} className="flex-1">
                    <input
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="w-full px-4 py-3 text-lg border-b-2 border-dark-200 focus:border-primary-500 focus:outline-none bg-transparent placeholder-dark-400"
                      autoFocus
                    />
                  </form>
                </div>
                <p className="text-dark-500 text-center">Type to search products...</p>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-32 md:pt-28">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark-950 text-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link to="/" className="block mb-6">
                <span className="font-serif text-2xl font-bold tracking-tight">TARA</span>
                <span className="text-xs font-medium text-primary-400 tracking-widest ml-1">COLLECTIONS</span>
              </Link>
              <p className="text-dark-400 text-sm leading-relaxed mb-6">
                Curating premium fashion & lifestyle essentials for the modern individual. Quality, elegance, and timeless style.
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </a>
                <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
                </a>
                <a href="#" className="text-dark-400 hover:text-primary-400 transition-colors" aria-label="Pinterest">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.828-2.245 3.828-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/></svg>
                </a>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Shop</h4>
              <ul className="space-y-2 text-dark-400">
                <li><Link to="/shop" className="hover:text-primary-400 transition-colors text-sm">All Products</Link></li>
                <li><Link to="/shop?category=new-arrivals" className="hover:text-primary-400 transition-colors text-sm">New Arrivals</Link></li>
                <li><Link to="/shop?category=best-sellers" className="hover:text-primary-400 transition-colors text-sm">Best Sellers</Link></li>
                <li><Link to="/shop?category=sale" className="hover:text-primary-400 transition-colors text-sm">Sale</Link></li>
                <li><Link to="/wishlist" className="hover:text-primary-400 transition-colors text-sm">Wishlist</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Support</h4>
              <ul className="space-y-2 text-dark-400">
                <li><Link to="/contact" className="hover:text-primary-400 transition-colors text-sm">Contact Us</Link></li>
                <li><Link to="/faq" className="hover:text-primary-400 transition-colors text-sm">FAQs</Link></li>
                <li><Link to="/shipping" className="hover:text-primary-400 transition-colors text-sm">Shipping Info</Link></li>
                <li><Link to="/returns" className="hover:text-primary-400 transition-colors text-sm">Returns & Exchanges</Link></li>
                <li><Link to="/track-order" className="hover:text-primary-400 transition-colors text-sm">Track Order</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-lg mb-4">Company</h4>
              <ul className="space-y-2 text-dark-400">
                <li><Link to="/about" className="hover:text-primary-400 transition-colors text-sm">About Us</Link></li>
                <li><Link to="/careers" className="hover:text-primary-400 transition-colors text-sm">Careers</Link></li>
                <li><Link to="/press" className="hover:text-primary-400 transition-colors text-sm">Press</Link></li>
                <li><Link to="/privacy" className="hover:text-primary-400 transition-colors text-sm">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-primary-400 transition-colors text-sm">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-12 pt-8 border-t border-dark-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-dark-500 text-sm">
              © {new Date().getFullYear()} TARA COLLECTIONS. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-dark-500">
              <span>Secure Payment</span>
              <div className="flex items-center gap-2">
                <svg className="w-6 h-5 text-dark-400" viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 12H3V8h18v10z"/></svg>
                <svg className="w-6 h-5 text-dark-400" viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 12H3V8h18v10z"/></svg>
                <svg className="w-6 h-5 text-dark-400" viewBox="0 0 24 24"><path fill="currentColor" d="M21 6H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm0 12H3V8h18v10z"/></svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout