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

const ORDERS_COLLECTION = 'orders'

export async function createOrder(orderData) {
  try {
    const order = {
      ...orderData,
      status: 'pending',
      paymentStatus: orderData.paymentMethod === 'cod' ? 'pending' : 'pending',
      orderDate: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      timeline: [{
        status: 'pending',
        timestamp: serverTimestamp(),
        note: 'Order placed'
      }]
    }

    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), order)
    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function getOrders(userId, filters = {}) {
  try {
    let q = collection(db, ORDERS_COLLECTION)
    const constraints = [where('userId', '==', userId)]

    if (filters.status) {
      constraints.push(where('status', '==', filters.status))
    }

    constraints.push(orderBy('orderDate', 'desc'))

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc))
    }
    if (filters.limit) {
      constraints.push(limit(filters.limit))
    }

    q = query(q, ...constraints)
    const snapshot = await getDocs(q)

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate?.() || doc.data().orderDate,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }))

    return {
      orders,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === (filters.limit || 20)
    }
  } catch (error) {
    console.error('Error fetching orders:', error)
    throw error
  }
}

export async function getOrderById(orderId) {
  try {
    const docRef = doc(db, ORDERS_COLLECTION, orderId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Order not found')
    }

    return {
      id: docSnap.id,
      ...docSnap.data(),
      orderDate: docSnap.data().orderDate?.toDate?.() || docSnap.data().orderDate,
      createdAt: docSnap.data().createdAt?.toDate?.() || docSnap.data().createdAt,
      updatedAt: docSnap.data().updatedAt?.toDate?.() || docSnap.data().updatedAt
    }
  } catch (error) {
    console.error('Error fetching order:', error)
    throw error
  }
}

export async function getAllOrders(filters = {}) {
  try {
    let q = collection(db, ORDERS_COLLECTION)
    const constraints = []

    if (filters.status) {
      constraints.push(where('status', '==', filters.status))
    }
    if (filters.paymentStatus) {
      constraints.push(where('paymentStatus', '==', filters.paymentStatus))
    }
    if (filters.userId) {
      constraints.push(where('userId', '==', filters.userId))
    }
    if (filters.startDate) {
      constraints.push(where('orderDate', '>=', filters.startDate))
    }
    if (filters.endDate) {
      constraints.push(where('orderDate', '<=', filters.endDate))
    }

    constraints.push(orderBy('orderDate', 'desc'))

    if (filters.lastDoc) {
      constraints.push(startAfter(filters.lastDoc))
    }
    if (filters.limit) {
      constraints.push(limit(filters.limit))
    }

    q = query(q, ...constraints)
    const snapshot = await getDocs(q)

    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate?.() || doc.data().orderDate,
      createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
      updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt
    }))

    return {
      orders,
      lastDoc: snapshot.docs[snapshot.docs.length - 1],
      hasMore: snapshot.docs.length === (filters.limit || 20)
    }
  } catch (error) {
    console.error('Error fetching all orders:', error)
    throw error
  }
}

export async function updateOrderStatus(orderId, status, note = '') {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      throw new Error('Order not found')
    }

    const currentTimeline = orderSnap.data().timeline || []
    const newTimelineEntry = {
      status,
      timestamp: serverTimestamp(),
      note: note || `Status updated to ${status}`
    }

    await updateDoc(orderRef, {
      status,
      updatedAt: serverTimestamp(),
      timeline: [...currentTimeline, newTimelineEntry]
    })

    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

export async function updatePaymentStatus(orderId, paymentStatus, paymentDetails = {}) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    await updateDoc(orderRef, {
      paymentStatus,
      paymentDetails,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
}

export async function updateTrackingInfo(orderId, trackingInfo) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    await updateDoc(orderRef, {
      tracking: trackingInfo,
      updatedAt: serverTimestamp()
    })
    return true
  } catch (error) {
    console.error('Error updating tracking info:', error)
    throw error
  }
}

export async function cancelOrder(orderId, reason = '') {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      throw new Error('Order not found')
    }

    const order = orderSnap.data()
    const cancellableStatuses = ['pending', 'confirmed']

    if (!cancellableStatuses.includes(order.status)) {
      throw new Error('Order cannot be cancelled at this stage')
    }

    const currentTimeline = order.timeline || []
    await updateDoc(orderRef, {
      status: 'cancelled',
      cancellationReason: reason,
      updatedAt: serverTimestamp(),
      timeline: [...currentTimeline, {
        status: 'cancelled',
        timestamp: serverTimestamp(),
        note: reason || 'Order cancelled by customer'
      }]
    })

    // Restore stock for cancelled order
    if (order.items) {
      const { updateProductStock } = await import('./products.js')
      for (const item of order.items) {
        await updateProductStock(item.productId, item.quantity)
      }
    }

    return true
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
}

export async function requestReturn(orderId, items, reason) {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      throw new Error('Order not found')
    }

    const order = orderSnap.data()

    if (order.status !== 'delivered') {
      throw new Error('Only delivered orders can be returned')
    }

    const returnRequest = {
      items,
      reason,
      status: 'requested',
      requestedAt: serverTimestamp()
    }

    await updateDoc(orderRef, {
      returnRequest,
      status: 'return_requested',
      updatedAt: serverTimestamp()
    })

    return true
  } catch (error) {
    console.error('Error requesting return:', error)
    throw error
  }
}

export async function processReturn(orderId, action, adminNote = '') {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId)
    const orderSnap = await getDoc(orderRef)

    if (!orderSnap.exists()) {
      throw new Error('Order not found')
    }

    const order = orderSnap.data()
    const returnRequest = order.returnRequest

    if (!returnRequest) {
      throw new Error('No return request found')
    }

    let newStatus, newOrderStatus
    if (action === 'approve') {
      newStatus = 'approved'
      newOrderStatus = 'returned'
    } else if (action === 'reject') {
      newStatus = 'rejected'
      newOrderStatus = order.status
    } else {
      throw new Error('Invalid action')
    }

    const currentTimeline = order.timeline || []
    await updateDoc(orderRef, {
      returnRequest: { ...returnRequest, status: newStatus, processedAt: serverTimestamp(), adminNote },
      status: newOrderStatus,
      updatedAt: serverTimestamp(),
      timeline: [...currentTimeline, {
        status: newOrderStatus,
        timestamp: serverTimestamp(),
        note: adminNote || `Return ${action}d`
      }]
    })

    if (action === 'approve' && order.items) {
      const { updateProductStock } = await import('./products.js')
      for (const item of order.items) {
        await updateProductStock(item.productId, item.quantity)
      }
    }

    return true
  } catch (error) {
    console.error('Error processing return:', error)
    throw error
  }
}

export async function getOrderStats() {
  try {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned']
    const stats = {}

    for (const status of statuses) {
      const q = query(
        collection(db, ORDERS_COLLECTION),
        where('status', '==', status)
      )
      const snapshot = await getDocs(q)
      stats[status] = snapshot.size
    }

    // Get total revenue
    const allOrdersQ = query(
      collection(db, ORDERS_COLLECTION),
      where('paymentStatus', '==', 'paid')
    )
    const allOrdersSnapshot = await getDocs(allOrdersQ)
    let totalRevenue = 0
    allOrdersSnapshot.docs.forEach(doc => {
      totalRevenue += doc.data().total || 0
    })

    return {
      ...stats,
      totalOrders: Object.values(stats).reduce((a, b) => a + b, 0),
      totalRevenue
    }
  } catch (error) {
    console.error('Error fetching order stats:', error)
    throw error
  }
}

export async function getRevenueAnalytics(period = 'month') {
  try {
    const now = new Date()
    let startDate

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('orderDate', '>=', Timestamp.fromDate(startDate)),
      where('paymentStatus', '==', 'paid')
    )

    const snapshot = await getDocs(q)
    const orders = snapshot.docs.map(doc => ({
      ...doc.data(),
      orderDate: doc.data().orderDate?.toDate?.() || doc.data().orderDate
    }))

    // Group by date
    const dailyRevenue = {}
    orders.forEach(order => {
      const dateKey = order.orderDate.toISOString().split('T')[0]
      dailyRevenue[dateKey] = (dailyRevenue[dateKey] || 0) + (order.total || 0)
    })

    return Object.entries(dailyRevenue)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date))
  } catch (error) {
    console.error('Error fetching revenue analytics:', error)
    throw error
  }
}