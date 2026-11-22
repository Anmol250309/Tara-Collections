/**
 * Firebase Cloud Functions for TARA COLLECTIONS
 * Handles payment verification, order processing, and other backend operations
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

const db = admin.firestore();

// Payment Verification Function
export const verifyUPIPayment = functions.https.onCall(async (data, context) => {
  const { transactionId, orderId, expectedAmount } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const orderIdDoc = db.collection('orders').doc(orderId);
    const orderSnap = await orderIdDoc.get();

    if (!orderSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const orderData = orderSnap.data();

    if (orderData.userId !== context.auth.uid) {
      throw new functions.https.HttpsError('permission-denied', 'User does not own this order');
    }

    // Verify payment amount matches
    if (orderData.total !== expectedAmount) {
      throw new functions.https.HttpsError('invalid-argument', 'Payment amount mismatch');
    }

    // Update order status
    await orderIdDoc.update({
      status: 'verified',
      paymentStatus: 'completed',
      paymentVerifiedAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedBy: context.auth.uid
    });

    return {
      success: true,
      message: 'Payment verified successfully'
    };
  } catch (error) {
    console.error('Error verifying UPI payment:', error);
    throw error;
  }
});

// Send Order Confirmation Email
export const sendOrderConfirmation = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    // This would integrate with email service (e.g., SendGrid, Mailgun)
    // For production, add email sending logic here
    console.log(`New order created: ${orderId}`);

    return null;
  });

// Auto-confirm COD orders after delivery time
export const autoConfirmCOD = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const now = admin.firestore.Timestamp.now();

    // Get settings for COD confirmation period
    const settingsSnap = await db.collection('settings').doc('paymentSettings').get();
    const confirmAfterDays = settingsSnap.data()?.payment?.confirmAfterDays || 3;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - confirmAfterDays);

    // Find COD orders that need confirmation
    const codOrders = await db.collection('orders')
      .where('paymentMethod', '==', 'cashondelivery')
      .where('status', '==', 'verified')
      .where('createdAt', '<', cutoffDate)
      .get();

    const batch = db.batch();
    codOrders.forEach(order => {
      batch.update(order.ref, { status: 'completed', completedAt: admin.firestore.FieldValue.serverTimestamp() });
    });

    await batch.commit();
    console.log(`Auto-confirmed ${codOrders.size} COD orders`);

    return null;
  });

// Update inventory after order completion
export const updateInventory = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only process when order reaches delivered status
    if (before.status !== 'delivered' && after.status === 'delivered') {
      for (const item of after.items) {
        const productRef = db.collection('products').doc(item.productId);
        await productRef.update({
          stock: admin.firestore.FieldValue.increment(-item.quantity),
          lastSoldAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return null;
  });

// Process refund on order cancellation
export const processRefund = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    if (before.status !== 'cancelled' && after.status === 'cancelled') {
      // Process refund logic would go here
      // Update payment status
      if (after.paymentMethod === 'upi' && after.paymentStatus === 'completed') {
        const paymentRef = db.collection('payments').doc(after.paymentId);
        await paymentRef.update({
          status: 'refunded',
          refundedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return null;
  });

// Generate UPI payment link
export const generatePaymentLink = functions.https.onCall(async (data, context) => {
  const { orderId, amount, customerName } = data;

  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  try {
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Order not found');
    }

    const orderData = orderDoc.data();

    if (orderData.userId !== context.auth.uid && !isAdmin(context.auth.uid)) {
      throw new functions.https.HttpsError('permission-denied', 'User does not own this order');
    }

    // Generate UPI link
    const merchantVpa = 'payments@okicici'; // Should come from settings
    const transactionNote = `Order ${orderId}`;
    const referenceId = `TXN${orderId}`;

    const upiParams = new URLSearchParams({
      pa: merchantVpa,
      pn: 'TARA COLLECTIONS',
      tn: transactionNote,
      am: amount.toFixed(2),
      cu: 'INR',
      tr: referenceId
    });

    const upiLink = `upi://pay?${upiParams.toString()}`;

    // Store payment info
    const paymentRef = db.collection('payments').doc();
    await paymentRef.set({
      orderId,
      userId: context.auth.uid,
      amount,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      upiLink
    });

    return {
      success: true,
      upiLink,
      paymentId: paymentRef.id,
      status: 'pending'
    };
  } catch (error) {
    console.error('Error generating payment link:', error);
    throw error;
  }
});

// Helper function to check admin status
async function isAdmin(uid: string): Promise<boolean> {
  const adminDoc = await db.collection('admins').doc(uid).get();
  return adminDoc.exists && adminDoc.data()?.isAdmin === true;
}

// Export functions for other modules
export { verifyUPIPayment, sendOrderConfirmation, autoConfirmCOD, updateInventory, processRefund, generatePaymentLink };