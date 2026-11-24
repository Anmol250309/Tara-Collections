import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from './AuthContext'
import toast from 'react-hot-toast'

const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    if (authLoading) return

    if (user) {
      // Load cart from Firestore for authenticated users
      const cartRef = doc(db, 'carts', user.uid)
      const unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
          setItems(docSnap.data().items || [])
        } else {
          setItems([])
        }
        setLoading(false)
      })
      return () => unsubscribe()
    } else {
      // Load cart from localStorage for guest users
      try {
        const savedCart = localStorage.getItem('guest_cart')
        if (savedCart) {
          setItems(JSON.parse(savedCart))
        }
      } catch (error) {
        console.error('Error loading guest cart:', error)
      }
      setLoading(false)
    }
  }, [user, authLoading])

  const saveToFirestore = useCallback(async (cartItems) => {
    if (!user) return
    try {
      await setDoc(doc(db, 'carts', user.uid), {
        items: cartItems,
        updatedAt: serverTimestamp()
      })
    } catch (error) {
      console.error('Error saving cart to Firestore:', error)
    }
  }, [user])

  const saveToLocalStorage = useCallback((cartItems) => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cartItems))
    }
  }, [user])

  const addToCart = useCallback(async (product, quantity = 1, variant = null) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(item =>
        item.productId === product.id &&
        JSON.stringify(item.variant) === JSON.stringify(variant)
      )

      let updatedItems
      if (existingIndex >= 0) {
        updatedItems = prev.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        const newItem = {
          id: Date.now().toString(),
          productId: product.id,
          name: product.name,
          price: product.sellingPrice || product.price,
          originalPrice: product.originalPrice || product.price,
          image: product.images?.[0] || product.image,
          quantity,
          variant,
          stock: product.stock || 0
        }
        updatedItems = [...prev, newItem]
      }

      saveToFirestore(updatedItems)
      saveToLocalStorage(updatedItems)
      toast.success('Added to cart')
      return updatedItems
    })
  }, [saveToFirestore, saveToLocalStorage])

  const removeFromCart = useCallback(async (itemId) => {
    setItems(prev => {
      const updatedItems = prev.filter(item => item.id !== itemId)
      saveToFirestore(updatedItems)
      saveToLocalStorage(updatedItems)
      toast.success('Removed from cart')
      return updatedItems
    })
  }, [saveToFirestore, saveToLocalStorage])

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) return
    setItems(prev => {
      const updatedItems = prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
      saveToFirestore(updatedItems)
      saveToLocalStorage(updatedItems)
      return updatedItems
    })
  }, [saveToFirestore, saveToLocalStorage])

  const clearCart = useCallback(async () => {
    setItems([])
    saveToFirestore([])
    saveToLocalStorage([])
  }, [saveToFirestore, saveToLocalStorage])

  const mergeGuestCart = useCallback(async () => {
    if (!user) return
    try {
      const guestCart = localStorage.getItem('guest_cart')
      if (guestCart) {
        const guestItems = JSON.parse(guestCart)
        if (guestItems.length > 0) {
          const cartRef = doc(db, 'carts', user.uid)
          const cartDoc = await getDoc(cartRef)
          const existingItems = cartDoc.exists() ? cartDoc.data().items || [] : []

          // Merge items, combining duplicates
          const mergedItems = [...existingItems]
          guestItems.forEach(guestItem => {
            const existingIndex = mergedItems.findIndex(item =>
              item.productId === guestItem.productId &&
              JSON.stringify(item.variant) === JSON.stringify(guestItem.variant)
            )
            if (existingIndex >= 0) {
              mergedItems[existingIndex].quantity += guestItem.quantity
            } else {
              mergedItems.push(guestItem)
            }
          })

          await setDoc(cartRef, { items: mergedItems, updatedAt: serverTimestamp() })
          setItems(mergedItems)
          localStorage.removeItem('guest_cart')
        }
      }
    } catch (error) {
      console.error('Error merging guest cart:', error)
    }
  }, [user])

  useEffect(() => {
    if (user) {
      mergeGuestCart()
    }
  }, [user, mergeGuestCart])

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const originalSubtotal = items.reduce((sum, item) => sum + item.originalPrice * item.quantity, 0)
  const discount = originalSubtotal - subtotal
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  const deliveryCharge = subtotal >= 999 ? 0 : 99
  const total = subtotal + deliveryCharge

  return (
    <CartContext.Provider value={{
      items,
      loading,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      subtotal,
      originalSubtotal,
      discount,
      itemCount,
      deliveryCharge,
      total,
      mergeGuestCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}