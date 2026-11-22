import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './context/AuthContext';

// Layout
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './admin/components/layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Profile from './pages/Profile';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import SearchResults from './pages/SearchResults';
import PageNotFound from './pages/PageNotFound';

// Admin Pages
import AdminDashboard from './admin/pages/Dashboard';
import AdminProducts from './admin/pages/Products';
import AdminCategories from './admin/pages/Categories';
import AdminOrders from './admin/pages/Orders';
import AdminCustomers from './admin/pages/Customers';
import AdminInventory from './admin/pages/Inventory';
import AdminCoupons from './admin/pages/Coupons';
import AdminHomepage from './admin/pages/HomepageSettings';
import AdminBanners from './admin/pages/Banners';
import AdminCollections from './admin/pages/Collections';
import AdminReviews from './admin/pages/Reviews';
import AdminAnalytics from './admin/pages/Analytics';
import AdminWebsiteSettings from './admin/pages/WebsiteSettings';
import AdminPaymentSettings from './admin/pages/PaymentSettings';
import AdminPaymentVerification from './admin/pages/PaymentVerification';
import AdminLogin from './admin/pages/Login';

// Protected Route Component
function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-tara-gold border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-tara-cream">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<ProductList />} />
          <Route path="product/:slug" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="order/:orderId" element={
            <ProtectedRoute>
              <OrderConfirmation />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="search" element={<SearchResults />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<PageNotFound />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="login" element={<AdminLogin />} />
          <Route path="dashboard" element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path="products" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
          <Route path="add-product" element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          } />
          <Route path="categories" element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          } />
          <Route path="orders" element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          } />
          <Route path="customers" element={
            <AdminRoute>
              <AdminCustomers />
            </AdminRoute>
          } />
          <Route path="inventory" element={
            <AdminRoute>
              <AdminInventory />
            </AdminRoute>
          } />
          <Route path="coupons" element={
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          } />
          <Route path="homepage" element={
            <AdminRoute>
              <AdminHomepage />
            </AdminRoute>
          } />
          <Route path="banners" element={
            <AdminRoute>
              <AdminBanners />
            </AdminRoute>
          } />
          <Route path="collections" element={
            <AdminRoute>
              <AdminCollections />
            </AdminRoute>
          } />
          <Route path="reviews" element={
            <AdminRoute>
              <AdminReviews />
            </AdminRoute>
          } />
          <Route path="analytics" element={
            <AdminRoute>
              <AdminAnalytics />
            </AdminRoute>
          } />
          <Route path="settings" element={
            <AdminRoute>
              <AdminWebsiteSettings />
            </AdminRoute>
          } />
          <Route path="payment-settings" element={
            <AdminRoute>
              <AdminPaymentSettings />
            </AdminRoute>
          } />
          <Route path="payment-verification" element={
            <AdminRoute>
              <AdminPaymentVerification />
            </AdminRoute>
          } />
        </Route>
      </Routes>
    </div>
  );
}

export default App;