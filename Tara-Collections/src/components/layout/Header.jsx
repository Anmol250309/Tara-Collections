import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  Search,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { toast } from 'react-hot-toast';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Shop', href: '/products' },
    { name: 'Clothing', href: '/products?category=clothing' },
    { name: 'Jewellery', href: '/products?category=jewellery' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Collections', href: '/collections' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top Bar */}
      <div className="bg-tara-cream border-b border-tara-beige px-4 py-2 md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-tara-black hover:text-tara-gold transition-colors"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop Header */}
      <header className="hidden md:block bg-white border-b border-tara-beige">
        <div className="max-w-7xl mx-auto px-6">
          {/* Top Navigation */}
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-serif font-bold text-tara-gold hover:text-tara-black transition-colors">
              TARA COLLECTIONS
            </Link>

            {/* Main Navigation */}
            <nav className="hidden lg:flex space-x-8">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `font-medium text-sm hover:text-tara-gold transition-colors ${
                      isActive ? 'text-tara-gold border-b-2 border-tara-gold pb-1' : 'text-tara-black'
                    }`
                  }
                >
                  {item.name}
                </NavLink>
              ))}
            </nav>

            {/* Action Items */}
            <div className="flex items-center space-x-6">
              <Link
                to="/search"
                className="text-tara-black hover:text-tara-gold transition-colors"
                aria-label="Search"
              >
                <Search className="h-5 w-5" />
              </Link>

              <Link
                to="/wishlist"
                className="relative text-tara-black hover:text-tara-gold transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-tara-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <Link
                to="/cart"
                className="relative text-tara-black hover:text-tara-gold transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-tara-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-tara-black hover:text-tara-gold transition-colors"
                  >
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.name || user.email}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                    <span className="hidden md:block">{user.name || 'Account'}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-tara-beige rounded-lg shadow-lg z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-tara-black hover:bg-tara-cream transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-sm text-tara-black hover:bg-tara-cream transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-tara-black hover:bg-tara-cream transition-colors flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-tara-black hover:text-tara-gold transition-colors"
                >
                  <User className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`md:hidden bg-white border-b border-tara-beige transition-all duration-300 ${mobileMenuOpen ? 'max-h-screen' : 'max-h-0'}`}>
        <div className="px-4 py-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="block text-base font-medium text-tara-black hover:text-tara-gold transition-colors pb-2 border-b border-tara-beige last:border-0"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          <div className="grid grid-cols-3 gap-4 mt-4">
            <Link to="/search" className="text-center" aria-label="Search">
              <Search className="h-6 w-6 mx-auto text-tara-black" />
            </Link>
            <Link to="/wishlist" className="relative text-center" aria-label="Wishlist">
              <Heart className="h-6 w-6 mx-auto text-tara-black" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-tara-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative text-center" aria-label="Cart">
              <ShoppingCart className="h-6 w-6 mx-auto text-tara-black" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-tara-gold text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}