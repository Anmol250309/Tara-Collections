/**
 * UPI Payment Utility for TARA COLLECTIONS
 * Generates UPI payment links for transactions
 */

/**
 * Generates a UPI payment link
 * @param {Object} options - Payment options
 * @param {string} options.vpa - UPI Virtual Payment Address (e.g., 1234567890@okicici)
 * @param {string} options.name - Merchant name
 * @param {string} options.transactionNote - Transaction note/description
 * @param {number} options.amount - Payment amount
 * @param {string} options.currency - Currency code (default: INR)
 * @param {string} options.referenceNumber - Unique reference number
 * @returns {string} UPI payment URL
 */
export const generateUPILink = (options) => {
  const {
    vpa,
    name,
    transactionNote = 'TARA COLLECTIONS Payment',
    amount,
    currency = 'INR',
    referenceNumber
  } = options;

  if (!vpa) {
    throw new Error('UPI VPA is required');
  }

  const params = new URLSearchParams({
    pa: vpa,
    pn: name || 'TARA COLLECTIONS',
    tn: transactionNote,
    am: amount.toFixed(2),
    cu: currency,
    tr: referenceNumber || `TXN${Date.now()}`
  });

  return `upi://pay?${params.toString()}`;
};

/**
 * Generates UPI payment URL for web redirect
 * @param {Object} options - Payment options
 * @returns {string} UPI payment URL suitable for window.location.href
 */
export const generateUPIPaymentUrl = (options) => {
  const upiLink = generateUPILink(options);

  // For some browsers, we need to use the pay link instead of upi://
  const webUrl = upiLink
    .replace('upi://pay', 'https://pay.android.com/pay')
    .replace('upi://pay', 'https://pay.google.com');

  return upiLink;
};

/**
 * Validates a UPI ID format
 * @param {string} vpa - UPI Virtual Payment Address
 * @returns {boolean} True if valid format
 */
export const validateUPIId = (vpa) => {
  if (!vpa) return false;

  const upiRegex = /^[0-9A-Za-z]{5,15}@[a-zA-Z]{3,10}$/;
  return upiRegex.test(vpa.trim());
};

/**
 * Creates a UPI payment request object
 * @param {Object} params - Payment parameters
 * @returns {Object} UPI payment object
 */
export const createUPIPaymentRequest = (params) => {
  const {
    recipientVpa,
    recipientName,
    amount,
    merchantName = 'TARA COLLECTIONS',
    transactionNote,
    referenceId,
    callbackUrl,
    redirectUrl
  } = params;

  return {
    type: 'upi',
    vpa: recipientVpa,
    payee: {
      name: recipientName || merchantName,
      vpa: recipientVpa
    },
    amount: parseFloat(amount) || 0,
    currency: 'INR',
    note: transactionNote || `TARA COLLECTIONS Payment`,
    referenceId: referenceId || `T${Date.now()}`,
    callbackUrl,
    redirectUrl
  };
};

/**
 * Generates UPI QR code data (for use with QR code libraries)
 * @param {Object} options - UPI payment options
 * @returns {string} UPI QR code string
 */
export const generateUPIQR = (options) => {
  const {
    vpa,
    name,
    transactionNote,
    amount,
    currency = 'INR'
  } = options;

  const qrString = `UPI;PAYOUT;;${vpa};${name};${transactionNote || ''};${amount.toFixed(2)};${currency};`;

  return qrString;
};

/**
 * Creates a formatted UPI payment string
 * @param {Object} paymentData - Payment data
 * @returns {string} Formatted string for display/copy
 */
export const formatUPIPaymentString = (paymentData) => {
  const {
    vpa,
    name,
    amount,
    transactionNote
  } = paymentData;

  return `
UPI ID: ${vpa}
Payee: ${name}
Amount: ₹${amount.toFixed(2)}
Note: ${transactionNote}

Scan QR code or copy UPI ID to pay
  `.trim();
};

/**
 * Simulates UPI payment verification
 * In production, this would integrate with UPI payment gateway
 * @param {string} transactionId - Transaction reference
 * @returns {Promise<Object>} Payment verification result
 */
export const verifyUPIPayment = async (transactionId) => {
  // This is a simulation - in production, use actual UPI gateway API
  const mockResponse = {
    success: true,
    transactionId,
    status: 'SUCCESS',
    amount: Math.floor(Math.random() * 5000) + 100,
    timestamp: new Date().toISOString(),
    verified: true
  };

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  return mockResponse;
};

/**
 * Creates a payment order in Firestore
 * @param {Object} orderData - Order details
 * @param {string} userId - User ID
 * @returns {Promise<string>} Order ID
 */
export const createPaymentOrder = async (orderData, userId) => {
  const {
    db,
    collection,
    addDoc,
    serverTimestamp,
    doc
  } = await import('firebase/firestore');

  const { db: firebaseDb } = await import('../firebase/firebase');

  const order = {
    userId,
    ...orderData,
    status: 'pending',
    paymentStatus: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const docRef = await addDoc(collection(firebaseDb, 'orders'), order);
  return docRef.id;
};

export default {
  generateUPILink,
  generateUPIPaymentUrl,
  validateUPIId,
  createUPIPaymentRequest,
  generateUPIQR,
  formatUPIPaymentString,
  verifyUPIPayment,
  createPaymentOrder
};