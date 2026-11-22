import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth
  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user document from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              ...userDoc.data()
            });
          } else {
            // Create default user document
            const defaultUser = {
              uid: user.uid,
              email: user.email,
              name: user.displayName || '',
              phone: '',
              photoURL: user.photoURL || '',
              role: 'customer',
              createdAt: serverTimestamp(),
              addresses: [],
              wishlist: []
            };

            await setDoc(doc(db, 'users', user.uid), defaultUser);

            setUser({
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              ...defaultUser
            });
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setUser(user);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register
  const register = useCallback(async (name, email, password) => {
    const auth = getAuth();

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Update profile
      await updateProfile(user, { displayName: name });

      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        phone: '',
        photoURL: '',
        role: 'customer',
        createdAt: serverTimestamp(),
        addresses: [],
        wishlist: []
      });

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Login
  const login = useCallback(async (email, password) => {
    const auth = getAuth();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Google Sign In
  const googleSignIn = useCallback(async () => {
    const auth = getAuth();

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth);
      const user = result.user;

      // Check if user document exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', user.uid));

      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          name: user.displayName || '',
          email: user.email,
          phone: user.phoneNumber || '',
          photoURL: user.photoURL || '',
          role: 'customer',
          createdAt: serverTimestamp(),
          addresses: [],
          wishlist: []
        });
      }

      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    const auth = getAuth();

    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Forgot Password
  const forgotPassword = useCallback(async (email) => {
    const auth = getAuth();

    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, []);

  // Update profile
  const updateUserProfile = useCallback(async (updates) => {
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, updates);

      setUser(prev => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  }, [user]);

  const value = {
    user,
    loading,
    error,
    register,
    login,
    googleSignIn,
    logout,
    forgotPassword,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}