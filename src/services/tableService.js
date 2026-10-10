import { doc, getDoc, collection, addDoc, updateDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';
import { TABLE_STATUS } from '../constants';

const tablesRef = () => collection(db, 'businesses', getBusinessId(), 'tables');
const tableDoc = (tableId) => doc(db, 'businesses', getBusinessId(), 'tables', tableId);

export async function getTableById(tableId) {
  if (!tableId) return null;
  const snap = await getDoc(tableDoc(tableId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Realtime subscription for the admin table grid. */
export function subscribeTables(callback) {
  const q = query(tablesRef(), orderBy('tableNumber', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

export async function createTable({ tableNumber, capacity }) {
  return addDoc(tablesRef(), {
    tableNumber,
    capacity,
    status: TABLE_STATUS.AVAILABLE,
    isActive: true,
    createdAt: serverTimestamp()
  });
}

export async function updateTable(tableId, data) {
  return updateDoc(tableDoc(tableId), { ...data, updatedAt: serverTimestamp() });
}

/** Sets operational status. DISABLED also flips isActive so reservation
 *  availability queries (which filter on isActive) stay consistent
 *  without needing a second write from the UI. */
export async function setTableStatus(tableId, status) {
  return updateDoc(tableDoc(tableId), {
    status,
    isActive: status !== TABLE_STATUS.DISABLED,
    updatedAt: serverTimestamp()
  });
}

/** The QR simply encodes the customer ordering URL bound to this table —
 *  no image is generated/stored server-side, it's rendered on demand by
 *  <QrCodeModal> using the table's id. */
export function buildTableOrderUrl(tableId) {
  return `${window.location.origin}/order?table=${tableId}`;
}
