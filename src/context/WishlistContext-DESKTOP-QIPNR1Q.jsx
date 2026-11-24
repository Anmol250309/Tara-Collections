import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const WishlistContext = createContext(null)

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    if (user) {
      const wishlistRef = doc(db, 'wishlists', user.uid)
      const unsubscribe = onSnapshot(wishlistRef, (docSnap) => {
        if (docSnap.exists()) {
          setItems(docSnap.data().items || [])
        } else {
          setItems([])
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      try {
        const savedWishlist = localStorage.getItem('guest_wishlist')
        if (savedWishlist) {
          setItems(JSON.parse(savedWishlist))
        }
      } catch (error) {
        console.error('Error loading guest wishlist:', error)
      }
      setLoading(false)
    }
  }, [user, authLoading])

  const saveToFirestore = useCallback(async (wishlistItems) => {
    if (!user) return
    try {
      await setDoc(doc(db, 'wishlists', user.uid), {
        items: wishlistItems,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error saving wishlist to Firestore:', error)
    }
  }, [user])

  const saveToLocalStorage = useCallback((wishlistItems) => {
    if (!user) {
      localStorage.setItem('guest_wishlist', JSON.stringify(wishlistItems))
    }
  }, [user])

  const addToWishlist = useCallback(async (product) => {
    setItems(prev => {
      if (prev.some(item => item.productId === product.id)) {
        toast('Already in wishlist')
        return prev
      }
      const newItem = {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice || product.price,
        originalPrice: product.originalPrice || product.price,
        image: product.images?.[0] || product.image,
        addedAt: Date.now()
      }
      const updatedItems = [...prev, newItem]
      saveToFirestore(updatedItems)
      saveToLocalStorage(updatedItems)
      toast.success('Added to wishlist')
      return updatedItems
    })
  }, [saveToFirestore, saveToLocalStorage])

  const removeFromWishlist = useCallback(async (productId) => {
    setItems(prev => {
      const updatedItems = prev.filter(item => item.productId !== productId)
      saveToFirestore(updatedItems)
      saveToLocalStorage(updatedItems)
      toast.success('Removed from wishlist')
      return updatedItems
    })
  }, [saveToFirestore, saveToLocalStorage])

  const toggleWishlist = useCallback(async (product) => {
    const isInWishlist = items.some(item => item.productId === product.id)
    if (isInWishlist) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product)
    }
  }, [items, addToWishlist, removeFromWishlist])

  const isInWishlist = useCallback((productId) => {
    return items.some(item => item.productId === productId)
  }, [items])

  const clearWishlist = useCallback(async () => {
    setItems([])
    saveToFirestore([])
    saveToLocalStorage([])
  }, [saveToFirestore, saveToLocalStorage])

  const mergeGuestWishlist = useCallback(async () => {
    if (!user) return
    try {
      const guestWishlist = localStorage.getItem('guest_wishlist')
      if (guestWishlist) {
        const guestItems = JSON.parse(guestWishlist)
        if (guestItems.length > 0) {
          const wishlistRef = doc(db, 'wishlists', user.uid)
          const wishlistDoc = await getDoc(wishlistRef)
          const existingItems = wishlistDoc.exists() ? wishlistDoc.data().items || [] : []

          const existingIds = new Set(existingItems.map(item => item.productId))
          const newItems = guestItems.filter(item => !existingIds.has(item.productId))

          if (newItems.length > 0) {
            const mergedItems = [...existingItems, ...newItems]
            await setDoc(wishlistRef, { items: mergedItems, updatedAt: serverTimestamp() })
            setItems(mergedItems)
          }
          localStorage.removeItem('guest_wishlist')
        }
      }
    } catch (error) {
      console.error('Error merging guest wishlist:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      mergeGuestWishlist()
    }
  }, [user, mergeGuestWishlist])

  return (
    <WishlistContext.Provider value={{
      items,
      loading,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      count: items.length
    }}>
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider')
  }
  return context
}