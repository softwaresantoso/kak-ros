import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';
import { ORDER_STATUS, RESERVATION_STATUS } from '../constants';

const ordersRef = () => collection(db, 'businesses', getBusinessId(), 'orders');
const paymentsRef = () => collection(db, 'businesses', getBusinessId(), 'payments');
const reservationsRef = () => collection(db, 'businesses', getBusinessId(), 'reservations');
const productsRef = () => collection(db, 'businesses', getBusinessId(), 'products');
const categoriesRef = () => collection(db, 'businesses', getBusinessId(), 'categories');

/**
 * One-time (not realtime) range queries — reports look at arbitrary
 * historical windows, which the capped realtime subscriptions used
 * elsewhere (last 200-500 docs) aren't guaranteed to cover once the
 * business has been running a while.
 */
export async function getOrdersInRange(startDate, endDate) {
  const q = query(
    ordersRef(),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getPaymentsInRange(startDate, endDate) {
  const q = query(
    paymentsRef(),
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** `date` fields are stored as "YYYY-MM-DD" strings — lexical range
 *  comparison works correctly for that format. */
export async function getReservationsInRange(startDateStr, endDateStr) {
  const q = query(
    reservationsRef(),
    where('date', '>=', startDateStr),
    where('date', '<=', endDateStr)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Small catalog — fetched in full once per report view for the
 *  productName -> categoryName lookup used in the per-category breakdown. */
export async function getProductCategoryMap() {
  const [productsSnap, categoriesSnap] = await Promise.all([getDocs(productsRef()), getDocs(categoriesRef())]);
  const categoryNameById = {};
  categoriesSnap.docs.forEach((d) => { categoryNameById[d.id] = d.data().name; });
  const categoryByProductName = {};
  productsSnap.docs.forEach((d) => {
    const p = d.data();
    categoryByProductName[p.name] = categoryNameById[p.categoryId] || 'Lainnya';
  });
  return categoryByProductName;
}

/**
 * Shared aggregation used by both the Owner Dashboard (today only) and
 * the Reports page (arbitrary range) — same numbers, different window.
 */
export function aggregateReportData(orders, payments, reservations, categoryByProductName = {}) {
  const nonCancelledOrders = orders.filter((o) => o.orderStatus !== ORDER_STATUS.CANCELLED);

  const omzet = payments.reduce((sum, p) => sum + p.amount, 0);
  const transaksi = payments.length;
  const rataRataTransaksi = transaksi > 0 ? omzet / transaksi : 0;

  const itemCounts = {};
  const categoryTotals = {};
  let itemTerjual = 0;

  nonCancelledOrders.forEach((o) => {
    o.items.forEach((item) => {
      itemTerjual += item.qty;
      itemCounts[item.name] = (itemCounts[item.name] || 0) + item.qty;
      const lineTotal = (item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) * item.qty;
      const category = categoryByProductName[item.name] || 'Lainnya';
      categoryTotals[category] = (categoryTotals[category] || 0) + lineTotal;
    });
  });

  const topProducts = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  const salesByCategory = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([name, total]) => ({ name, total }));

  const paymentMethodTotals = {};
  payments.forEach((p) => {
    paymentMethodTotals[p.method] = (paymentMethodTotals[p.method] || 0) + p.amount;
  });

  const dineIn = nonCancelledOrders.filter((o) => o.orderType === 'DINE_IN').length;
  const takeAway = nonCancelledOrders.filter((o) => o.orderType === 'TAKE_AWAY').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === ORDER_STATUS.CANCELLED).length;

  const activeReservations = reservations.filter((r) =>
    ![RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.REJECTED].includes(r.status)
  );
  const guestCount = activeReservations.reduce((sum, r) => sum + (r.guestCount || 0), 0);
  const noShowCount = reservations.filter((r) => r.status === RESERVATION_STATUS.NO_SHOW).length;

  return {
    omzet, transaksi, rataRataTransaksi, itemTerjual, topProducts, salesByCategory,
    paymentMethodTotals, dineIn, takeAway, cancelledCount,
    reservationCount: activeReservations.length, guestCount, noShowCount
  };
}
