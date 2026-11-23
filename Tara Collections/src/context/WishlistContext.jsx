import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { collection, doc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';

const WishlistContext = createContext();

export function useWishlist() {
  return useContext(WishlistContext);
}

export function WishlistProvider({ children }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load wishlist from Firestore
  useEffect(() => {
    const loadWishlist = async () => {
      if (!user) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const wishlistRef = collection(db, 'users', user.uid, 'wishlist', 'items');
        const wishlistSnap = await getDocs(wishlistRef);
        const items = wishlistSnap.docs.map(doc => ({
          id: doc.id,
          productId: doc.id,
          ...doc.data()
        }));
        setWishlistItems(items);
      } catch (error) {
        console.error('Error loading wishlist:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  // Add to wishlist
  const addToWishlist = useCallback(async (productId) => {
    if (!user) {
      toast.error('Please login to add to wishlist');
      return { success: false };
    }

    try {
      const itemRef = doc(db, 'users', user.uid, 'wishlist', 'items', productId);
      await setDoc(itemRef, {
        productId,
        addedAt: new Date().toISOString()
      });

      setWishlistItems(prev => [...prev.filter(item => item.productId !== productId), {
        id: productId,
        productId,
        addedAt: new Date().toISOString()
      }]);

      toast.success('Added to wishlist');
      return { success: true };
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      toast.error('Failed to add to wishlist');
      return { success: false };
    }
  }, [user]);

  // Remove from wishlist
  const removeFromWishlist = useCallback(async (productId) => {
    if (!user) return false;

    try {
      const itemRef = doc(db, 'users', user.uid, 'wishlist', 'items', productId);
      await deleteDoc(itemRef);
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      toast.success('Removed from wishlist');
      return true;
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('Failed to remove from wishlist');
      return false;
    }
  }, [user]);

  // Check if product is in wishlist
  const isInWishlist = useCallback((productId) => {
    return wishlistItems.some(item => item.productId === productId);
  }, [wishlistItems]);

  const value = {
    wishlistItems,
    loading,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    wishlistCount: wishlistItems.length
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
}