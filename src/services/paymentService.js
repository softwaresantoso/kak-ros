import {
  collection, doc, runTransaction, onSnapshot, query, orderBy, limit, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants';

const paymentsRef = () => collection(db, 'businesses', getBusinessId(), 'payments');
const orderDoc = (orderId) => doc(db, 'businesses', getBusinessId(), 'orders', orderId);

/**
 * Records a payment and updates the order's paymentStatus in one
 * transaction — payment and order status must never drift apart
 * (product-19: "Jangan mencampur orderStatus dengan paymentStatus", but
 * they still need to be written together atomically here).
 *
 * If the order has already been SERVED/PICKED_UP and this payment settles
 * it in full, the order is also advanced to COMPLETED — a fully paid,
 * fully served order has nothing left to track. An order still awaiting
 * pickup/serving keeps its current orderStatus; only paymentStatus changes.
 */
export async function recordPayment({ orderId, amount, method, reference, paidAmount, change, cashierId }) {
  return runTransaction(db, async (transaction) => {
    const snap = await transaction.get(orderDoc(orderId));
    if (!snap.exists()) throw new Error('Order tidak ditemukan.');
    const order = snap.data();

    const isFullPayment = amount >= order.total;
    const newPaymentStatus = isFullPayment ? PAYMENT_STATUS.PAID : PAYMENT_STATUS.PARTIAL;

    const orderUpdate = { paymentStatus: newPaymentStatus, updatedAt: serverTimestamp() };
    if (
      isFullPayment &&
      (order.orderStatus === ORDER_STATUS.SERVED || order.orderStatus === ORDER_STATUS.PICKED_UP)
    ) {
      orderUpdate.orderStatus = ORDER_STATUS.COMPLETED;
    }

    transaction.update(orderDoc(orderId), orderUpdate);

    const paymentDocRef = doc(paymentsRef());
    transaction.set(paymentDocRef, {
      orderId,
      amount,
      method,
      status: newPaymentStatus,
      reference: reference || null,
      paidAmount: paidAmount ?? amount,
      change: change || 0,
      paidAt: serverTimestamp(),
      cashierId,
      createdAt: serverTimestamp()
    });

    return { id: paymentDocRef.id };
  });
}

/** Realtime recent payments — for the Cashier "Riwayat" tab. */
export function subscribeRecentPayments(callback, { limitCount = 50 } = {}) {
  const q = query(paymentsRef(), orderBy('createdAt', 'desc'), limit(limitCount));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}
