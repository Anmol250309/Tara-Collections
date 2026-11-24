import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  documentId,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '../config/firebase'

const PRODUCTS_COLLECTION = 'products'
const CATEGORIES_COLLECTION = 'categories'

export async function getProducts(filters = {}) {
  try {
    let q = collection(db, PRODUCTS_COLLECTION)
    const constraints = []

    if (filters.category) {
      constraints.push(where('category', '==', filters.category))
    }
    if (filters.brand) {
      constraints.push(where('brand', '==', filters.brand))
    }
    if (filters.featured) {
      constraints.push(where('featured', '==', true))
    }
    if (filters.trending) {
      constraints.push(where('trending', '==', true))
    }
    if (filters.bestSeller) {
      constraints.push(where('bestSeller', '==', true))
    }
    if (filters.newArrival) {
      constraints.push(where('newArrival', '==', true))
    }
    if (filters.inStock !== undefined) {
      constraints.push(where('stock', filters.inStock ? '>' : '==', 0))
    }
    if (filters.minPrice !== undefined) {
      constraints.push(where('sellingPrice', '>=', filters.minPrice))
    }
    if (filters.maxPrice !== undefined) {
      constraints.push(where('sellingPrice', '<=', filters.maxPrice))
    }
    if (filters.minRating !== undefined) {
      constraints.push(where('averageRating', '>=', filters.minRating))
    }

    // Sorting
    switch (filters.sortBy) {
      case 'price_asc':
        constraints.push(orderBy('sellingPrice', 'asc'))
        break
      case 'price_desc':
        constraints.push(orderBy('sellingPrice', 'desc'))
        break
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'))
        break
      case 'popularity':
        constraints.push(orderBy('orderCount', 'desc'))
        break
      case 'rating':
        constraints.push(orderBy('averageRating', 'desc'))
        break
      default:
        constraints.push(orderBy('createdAt', 'desc'))
    }

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc))
    }
    if (filters.limit) {
      constraints.push(limit(filters.limit))
    }

    q = query(q, ...constraints)
    const snapshot = await getDocs(q)

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }))

    return {
      products,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === (filters.limit || 20)
    }
  } catch (error) {
    console.error('Error fetching products:', error)
    throw error
  }
}

export async function getProductById(productId) {
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Product not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt
    }
  } catch (error) {
    console.error('Error fetching product:', error)
    throw error
  }
}

export async function getRelatedProducts(productId, category, limitCount = 8) {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION),
      where('category', '==', category),
      where(documentId(), '!=', productId),
      where('stock', '>', 0),
      orderBy('stock', 'desc'),
      limit(limitCount)
    )

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

export async function createProduct(productData, images = []) {
  try {
    // Upload images first
    const imageUrls = []
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      const fileName = `${Date.now()}_${i}_${image.name}`
      const storageRef = ref(storage, `products/${fileName}`)
      await uploadBytes(storageRef, image)
      const url = await getDownloadURL(storageRef)
      imageUrls.push(url)
    }

    const product = {
      ...productData,
      images: imageUrls,
      stock: productData.stock || 0,
      sellingPrice: Number(productData.sellingPrice),
      originalPrice: Number(productData.originalPrice || productData.sellingPrice),
      featured: productData.featured || false,
      trending: productData.trending || false,
      bestSeller: productData.bestSeller || false,
      newArrival: productData.newArrival || false,
      averageRating: 0,
      reviewCount: 0,
      orderCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), product)
    return docRef.id
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

export async function updateProduct(productId, productData, newImages = [], deletedImageUrls = []) {
  try {
    const batch = writeBatch(db)
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)

    // Delete removed images from storage
    for (const imageUrl of deletedImageUrls) {
      try {
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef)
      } catch (error) {
        console.warn('Error deleting image:', error)
      }
    }

    // Upload new images
    const newImageUrls = []
    for (let i = 0; i < newImages.length; i++) {
      const image = newImages[i]
      const fileName = `${Date.now()}_${i}_${image.name}`
      const storageRef = ref(storage, `products/${fileName}`)
      await uploadBytes(storageRef, image)
      const url = await getDownloadURL(storageRef)
      newImageUrls.push(url)
    }

    const updateData = {
      ...productData,
      sellingPrice: Number(productData.sellingPrice),
      originalPrice: Number(productData.originalPrice || productData.sellingPrice),
      updatedAt: serverTimestamp()
    }

    if (newImageUrls.length > 0) {
      // Get existing images and append new ones
      const existingDoc = await getDoc(productRef)
      const existingImages = existingDoc.exists() ? existingDoc.data().images || [] : []
      updateData.images = [...existingImages, ...newImageUrls]
    }

    batch.update(productRef, updateData)
    await batch.commit()
    return true
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

export async function deleteProduct(productId) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    const productSnap = await getDoc(productRef)

    if (productSnap.exists()) {
      // Delete images from storage
      const images = productSnap.data().images || []
      for (const imageUrl of images) {
        try {
          const imageRef = ref(storage, imageUrl)
          await deleteObject(imageRef)
        } catch (error) {
          console.warn('Error deleting image:', error)
        }
      }
    }

    await deleteDoc(productRef)
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

export async function getCategories() {
  try {
    const q = query(collection(db, CATEGORIES_COLLECTION), orderBy('name'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    throw error
  }
}

export async function createCategory(categoryData) {
  try {
    const docRef = await addDoc(collection(db, CATEGORIES_COLLECTION), {
      ...categoryData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

export async function updateCategory(categoryId, categoryData) {
  try {
    await updateDoc(doc(db, CATEGORIES_COLLECTION, categoryId), {
      ...categoryData,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

export async function deleteCategory(categoryId) {
  try {
    await deleteDoc(doc(db, CATEGORIES_COLLECTION, categoryId))
    return true
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

export async function searchProducts(searchTerm, filters = {}) {
  try {
    // For simple search, we'll filter by name (case-insensitive search would need Algolia or similar)
    // This is a basic implementation - for production, use Algolia or Typesense
    const allProducts = await getProducts({ ...filters, limit: 1000 })
    const term = searchTerm.toLowerCase()

    const filtered = allProducts.products.filter(product =>
      product.name.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term) ||
      product.category?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      product.tags?.some(tag => tag.toLowerCase().includes(term))
    )

    return {
      products: filtered,
      lastDoc: null,
      hasMore: false
    }
  } catch (error) {
    console.error('Error searching products:', error)
    throw error
  }
}

export async function getProductSuggestions(searchTerm, limitCount = 5) {
  try {
    if (!searchTerm || searchTerm.length < 2) return []

    const allProducts = await getProducts({ limit: 500 })
    const term = searchTerm.toLowerCase()

    return allProducts.products
      .filter(product =>
        product.name.toLowerCase().includes(term)
      )
      .slice(0, limitCount)
      .map(product => ({
        id: product.id,
        name: product.name,
        image: product.images?.[0],
        price: product.sellingPrice,
        category: product.category
      }))
  } catch (error) {
    console.error('Error getting suggestions:', error)
    return []
  }
}

export async function updateProductStock(productId, quantityChange) {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId)
    const productSnap = await getDoc(productRef)

    if (!productSnap.exists()) {
      throw new Error('Product not found')
    }

    const currentStock = productSnap.data().stock || 0
    const newStock = Math.max(0, currentStock + quantityChange)

    await updateDoc(productRef, {
      stock: newStock,
      updatedAt: serverTimestamp()
    })

    return newStock
  } catch (error) {
    console.error('Error updating stock:', error)
    throw error
  }
}