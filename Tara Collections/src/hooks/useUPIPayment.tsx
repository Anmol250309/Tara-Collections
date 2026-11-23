import { useState, useCallback } from 'react';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { toast } from 'react-hot-toast';

interface UPIOrderData {
  amount: number;
  customerName: string;
  customerEmail: string;
  customerId?: string;
  orderId?: string;
  items?: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface UPITransactionResult {
  success: boolean;
  upiLink?: string;
  transactionId?: string;
  error?: string;
}

export const useUPIPayment = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate UPI payment link
  const generateUPILink = useCallback(async (orderData: UPIOrderData) => {
    setLoading(true);
    setError(null);

    try {
      const {
        amount,
        customerName,
        customerEmail,
        customerId,
        items
      } = orderData;

      // Generate unique transaction ID
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create order document
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: customerId || null,
        customerName,
        email: customerEmail,
        items: items || [],
        total: amount,
        status: 'pending',
        paymentMethod: 'upi',
        paymentStatus: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get settings for UPI ID
      const settingsSnap = await getDoc(doc(db, 'settings', 'paymentSettings'));
      const settings = settingsSnap.exists() ? settingsSnap.data() : {};

      // Use configured merchant UPI ID or default to production merchant
      const merchantVpa = (settings?.upi?.merchantId) || 'amita.sinha2509@okhdfcbank';

      // Build UPI parameters
      const transactionNote = `TARA ORDER ${orderRef.id.slice(0, 8).toUpperCase()}`;
      const upiParams = new URLSearchParams({
        pa: merchantVpa,
        pn: 'TARA COLLECTIONS',
        tn: transactionNote,
        am: amount.toFixed(2),
        cu: 'INR',
        tr: transactionId
      });

      const upiLink = `upi://pay?${upiParams.toString()}`;

      // Create payment record
      const paymentRef = await addDoc(collection(db, 'payments'), {
        orderId: orderRef.id,
        userId: customerId || null,
        amount,
        status: 'pending',
        createdAt: serverTimestamp(),
        upiLink,
        merchantName: 'TARA COLLECTIONS'
      });

      // Update order with payment ID
      await updateDoc(doc(db, 'orders', orderRef.id), {
        paymentId: paymentRef.id,
        transactionId
      });

      return {
        success: true,
        upiLink,
        transactionId,
        orderId: orderRef.id,
        paymentId: paymentRef.id
      };
    } catch (err: any) {
      console.error('Error generating UPI link:', err);
      const errorMessage = err.message || 'Failed to generate payment link';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verify payment status
  const verifyPayment = useCallback(async (paymentId: string, orderId?: string) => {
    setLoading(true);
    setError(null);

    try {
      // In production, this would verify with UPI gateway
      // For now, we'll check the payment document status
      const paymentRef = doc(db, 'payments', paymentId);
      const paymentSnap = await getDoc(paymentRef);

      if (paymentSnap.exists()) {
        const paymentData = paymentSnap.data();

        if (paymentData.status === 'completed' || paymentData.status === 'verified') {
          // Update order status
          if (orderId) {
            await updateDoc(doc(db, 'orders', orderId), {
              status: paymentData.status === 'verified' ? 'processing' : 'completed',
              paymentStatus: 'completed',
              paymentVerifiedAt: serverTimestamp()
            });
          }

          return {
            success: true,
            status: paymentData.status
          };
        }

        return {
          success: false,
          status: paymentData.status,
          error: 'Payment not yet verified'
        };
      }

      return {
        success: false,
        error: 'Payment not found'
      };
    } catch (err: any) {
      console.error('Error verifying payment:', err);
      const errorMessage = err.message || 'Failed to verify payment';
      setError(errorMessage);
      toast.error(errorMessage);
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Process UPI payment with fallback to COD
  const processPayment = useCallback(async (
    orderData: UPIOrderData,
    fallbackToCOD: boolean = false
  ) => {
    if (!fallbackToCOD) {
      return await generateUPILink(orderData);
    }

    return {
      success: true,
      method: 'cod',
      message: 'Order placed with Cash on Delivery'
    };
  }, [generateUPILink]);

  return {
    loading,
    error,
    generateUPILink,
    verifyPayment,
    processPayment,
    clearError: () => setError(null)
  };
};

export default useUPIPayment;