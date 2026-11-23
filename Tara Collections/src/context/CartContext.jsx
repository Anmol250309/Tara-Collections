import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { collection, query, where, getDocs, doc, getDoc, updateDoc, runTransaction, deleteDoc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const { user } = useAuth();

  // Load products for price calculation
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsRef = collection(db, 'products');
        const productsSnap = await getDocs(productsRef);
        const productData = productsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productData);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };
    loadProducts();
  }, []);

  // Load cart from Firestore
  useEffect(() => {
    const loadCart = async () => {
      if (!user) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const cartRef = collection(db, 'users', user.uid, 'cart', 'items', 'items');
        const cartSnap = await getDocs(cartRef);
        const items = cartSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCartItems(items);
      } catch (error) {
        console.error('Error loading cart:', error);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  // Add to cart
  const addToCart = useCallback(async (productId, quantity = 1, selectedSize = null, selectedColor = null) => {
    if (!user) {
      toast.error('Please login to add items to cart');
      return { success: false };
    }

    try {
      // Get product details from Firestore
      const productRef = doc(db, 'products', productId);
      const productSnap = await getDoc(productRef);

      if (!productSnap.exists()) {
        toast.error('Product not found');
        return { success: false };
      }

      const productData = productSnap.data();

      // Validate selected size and color
      if (productData.availableSizes && productData.availableSizes.length > 0 && !selectedSize) {
        toast.error('Please select a size');
        return { success: false };
      }

      if (productData.availableColors && productData.availableColors.length > 0 && !selectedColor) {
        toast.error('Please select a color');
        return { success: false };
      }

      // Check stock
      let availableStock = 0;
      if (productData.availableStock && Array.isArray(productData.availableStock)) {
        if (selectedSize && selectedColor) {
          const stockInfo = productData.availableStock.find(
            s => s.size === selectedSize && s.color === selectedColor
          );
          availableStock = stockInfo ? stockInfo.stock : 0;
        } else {
          availableStock = productData.availableStock.reduce((sum, s) => sum + (s.stock || 0), 0);
        }
      } else {
        availableStock = productData.stock || 0;
      }

      if (availableStock < quantity) {
        toast.error('Not enough stock available');
        return { success: false };
      }

      // Check if item already in cart
      const existingItem = cartItems.find(
        item => item.productId === productId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        const itemRef = doc(db, 'users', user.uid, 'cart', 'items', 'items', existingItem.id);
        await updateDoc(itemRef, { quantity: newQuantity });

        setCartItems(prev => prev.map(item =>
          item.id === existingItem.id
            ? { ...item, quantity: newQuantity }
            : item
        ));
      } else {
        const newItem = {
          id: `${productId}-${Date.now()}`,
          productId,
          quantity,
          selectedSize,
          selectedColor,
          addedAt: new Date().toISOString()
        };

        const itemRef = doc(db, 'users', user.uid, 'cart', 'items', 'items', newItem.id);
        await setDoc(itemRef, newItem);

        setCartItems(prev => [...prev, newItem]);
      }

      toast.success('Added to cart');
      return { success: true };
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add to cart');
      return { success: false };
    }
  }, [user, cartItems]);

  // Remove from cart
  const removeFromCart = useCallback(async (itemId) => {
    if (!user) return false;

    try {
      const itemRef = doc(db, 'users', user.uid, 'cart', 'items', 'items', itemId);
      await deleteDoc(itemRef);
      setCartItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Removed from cart');
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
      return false;
    }
  }, [user]);

  // Update quantity
  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (!user || quantity < 1) return false;

    try {
      const itemRef = doc(db, 'users', user.uid, 'cart', 'items', 'items', itemId);
      await updateDoc(itemRef, { quantity });
      setCartItems(prev => prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      ));
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
      return false;
    }
  }, [user]);

  // Clear cart
  const clearCart = useCallback(async () => {
    if (!user) return false;

    try {
      const cartRef = collection(db, 'users', user.uid, 'cart', 'items', 'items');
      const cartSnap = await getDocs(cartRef);

      const batch = writeBatch(db);
      cartSnap.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
      setCartItems([]);
      toast.success('Cart cleared');
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
      return false;
    }
  }, [user]);

  // Calculate subtotal
  const calculateSubtotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return total;

      const price = product.discountPrice || product.price || 0;
      const itemPrice = typeof price === 'object' ? (price.india || price) : price;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems, products]);

  // Calculate discount
  const calculateDiscount = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      if (!product || !product.discountPrice) return total;

      const regularPrice = typeof (product.price) === 'object' ? (product.price.india || product.price) : product.price;
      const discountPrice = typeof product.discountPrice === 'object' ? (product.discountPrice.india || product.discountPrice) : product.discountPrice;
      const discountAmount = (regularPrice - discountPrice) * item.quantity;
      return total + Math.max(0, discountAmount);
    }, 0);
  }, [cartItems, products]);

  // Calculate shipping
  const calculateShipping = useCallback((subtotal, shippingSettings) => {
    if (!shippingSettings) return 0;

    const threshold = shippingSettings.freeShippingThreshold || 0;
    const rate = shippingSettings.shippingCharges || 0;

    if (subtotal >= threshold) {
      return 0;
    }

    return rate;
  }, []);

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    calculateSubtotal,
    calculateDiscount,
    calculateShipping,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0)
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}