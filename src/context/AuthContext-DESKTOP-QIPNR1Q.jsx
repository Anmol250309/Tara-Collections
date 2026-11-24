import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '../config/firebase'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const fetchUserData = useCallback(async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid))
      if (userDoc.exists()) {
        setUserData(userDoc.data())
      } else {
        setUserData(null)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      setUserData(null)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
        await fetchUserData(currentUser.uid)
      } else {
        setUser(null)
        setUserData(null)
      }
      setLoading(false)
      setInitialized(true)
    })

    return () => unsubscribe()
  }, [fetchUserData])

  const signup = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName })
      await sendEmailVerification(result.user)

      const userData = {
        uid: result.user.uid,
        email: result.user.email,
        displayName,
        photoURL: result.user.photoURL || null,
        phoneNumber: null,
        addresses: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        role: 'customer',
        emailVerified: false
      }

      await setDoc(doc(db, 'users', result.user.uid), userData)
      setUserData(userData)
      toast.success('Account created! Please verify your email.')
      return result.user
    } catch (error) {
      const message = error.code === 'auth/email-already-in-use'
        ? 'Email already registered'
        : error.message
      toast.error(message)
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      if (!result.user.emailVerified) {
        await sendEmailVerification(result.user)
        toast.error('Please verify your email. Verification email sent.')
        await signOut(auth)
        throw new Error('Email not verified')
      }
      return result.user
    } catch (error) {
      const message = error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password'
        ? 'Invalid email or password'
        : error.message
      toast.error(message)
      throw error
    }
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))

      if (!userDoc.exists()) {
        const userData = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          phoneNumber: null,
          addresses: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          role: 'customer',
          emailVerified: true
        }
        await setDoc(doc(db, 'users', result.user.uid), userData)
        setUserData(userData)
      }
      return result.user
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const updateUserProfile = async (data) => {
    if (!user) throw new Error('Not authenticated')
    try {
      await updateProfile(user, data)
      await updateDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: serverTimestamp()
      })
      setUserData(prev => ({ ...prev, ...data }))
      toast.success('Profile updated')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const addAddress = async (address) => {
    if (!user) throw new Error('Not authenticated')
    try {
      const newAddress = {
        ...address,
        id: Date.now().toString(),
        createdAt: serverTimestamp()
      }
      const updatedAddresses = [...(userData?.addresses || []), newAddress]
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp()
      })
      setUserData(prev => ({ ...prev, addresses: updatedAddresses }))
      toast.success('Address added')
      return newAddress
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const updateAddress = async (addressId, address) => {
    if (!user) throw new Error('Not authenticated')
    try {
      const updatedAddresses = userData.addresses.map(addr =>
        addr.id === addressId ? { ...addr, ...address } : addr
      )
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp()
      })
      setUserData(prev => ({ ...prev, addresses: updatedAddresses }))
      toast.success('Address updated')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const deleteAddress = async (addressId) => {
    if (!user) throw new Error('Not authenticated')
    try {
      const updatedAddresses = userData.addresses.filter(addr => addr.id !== addressId)
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses,
        updatedAt: serverTimestamp()
      })
      setUserData(prev => ({ ...prev, addresses: updatedAddresses }))
      toast.success('Address deleted')
    } catch (error) {
      toast.error(error.message)
      throw error
    }
  }

  const isAdmin = userData?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      userData,
      loading,
      initialized,
      signup,
      login,
      loginWithGoogle,
      logout,
      resetPassword,
      updateUserProfile,
      addAddress,
      updateAddress,
      deleteAddress,
      isAdmin,
      fetchUserData
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}