import React, { useState } from 'react';
import { Outlet, Link, NavLink, useLocation } from 'react-router-dom';
import {
  Dashboard,
  Package,
  ShoppingCart,
  Users,
  LayoutDashboard,
  BarChart3,
  Settings,
  ShoppingBasket,
  Tag,
  Image,
  Star,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from 'react-hot-toast';

const sidebarItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: Dashboard },
  { name: 'Products', href: '/admin/products', icon: Package },
  { name: 'Categories', href: '/admin/categories', icon: LayoutDashboard },
  { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Customers', href: '/admin/customers', icon: Users },
  { name: 'Inventory', href: '/admin/inventory', icon: Shield },
  { name: 'Coupons', href: '/admin/coupons', icon: Tag },
  { name: 'Homepage', href: '/admin/homepage', icon: Home },
  { name: 'Banners', href: '/admin/banners', icon: Image },
  { name: 'Collections', href: '/admin/collections', icon: ShoppingBasket },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Close sidebar on mobile when navigating
  if (location.pathname !== '/admin/login') {
    document.body.classList.add('admin-layout');
  } else {
    document.body.classList.remove('admin-layout');
  }

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="admin-layout min-h-screen bg-tara-gray-light">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg hover:bg-tara-cream transition-colors"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 transform bg-tara-black text-white transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-tara-dark-gray">
            <Link to="/" className="text-2xl font-serif font-bold text-tara-gold">
              TARA COLLECTIONS
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {sidebarItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-tara-gold text-white'
                        : 'text-tara-gray hover:bg-tara-dark-gray hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User Menu */}
          <div className="border-t border-tara-dark-gray p-4">
            <div className="flex items-center space-x-3 mb-4">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-tara-gold flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium text-white">{user?.name || user?.email}</p>
                <p className="text-xs text-tara-gray">Admin</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Topbar */}
        <header className="bg-white border-b border-tara-beige h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-serif font-bold text-tara-black">
            {location.pathname === '/admin' && 'Dashboard'}
            {location.pathname !== '/admin' && location.pathname !== '/admin/login' &&
              sidebarItems.find(item => location.pathname.startsWith(item.href))?.name || 'Admin'}
          </h1>

          <div className="text-sm text-tara-gray">
            Last updated: <span id="lastUpdate"></span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}