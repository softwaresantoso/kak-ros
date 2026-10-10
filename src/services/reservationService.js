import {
  collection, doc, getDoc, getDocs, runTransaction, updateDoc, onSnapshot,
  query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';
import {
  RESERVATION_STATUS, TABLE_STATUS, RESERVATION_DEFAULT_DURATION_MINUTES
} from '../constants';
import { assertValidReservationTransition } from '../lib/reservationStateMachine';

const reservationsRef = () => collection(db, 'businesses', getBusinessId(), 'reservations');
const reservationDoc = (id) => doc(db, 'businesses', getBusinessId(), 'reservations', id);
const tableDoc = (tableId) => doc(db, 'businesses', getBusinessId(), 'tables', tableId);
// Separate per-day counter, same public-writable pattern as order numbers
// (see orderService.js) — customers need to generate this without auth.
const countersDoc = () => doc(db, 'businesses', getBusinessId(), 'counters', 'reservationCounters');

function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function timeToMinutes(time) {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** True if two [start, start+duration) ranges on the same day overlap. */
function rangesOverlap(startA, durA, startB, durB) {
  const endA = startA + durA;
  const endB = startB + durB;
  return startA < endB && startB < endA;
}

async function generateReservationCode(transaction) {
  const key = dateKey();
  const counterSnap = await transaction.get(countersDoc());
  const current = counterSnap.exists() ? (counterSnap.data()[key] || 0) : 0;
  const next = current + 1;
  transaction.set(countersDoc(), { [key]: next }, { merge: true });
  return `RSV-${key.slice(2)}-${String(next).padStart(3, '0')}`;
}

/**
 * Creates a reservation with status PENDING. Deliberately does NOT lock
 * the table slot yet — per ARCHITECTURE.md §6, a table is only reserved
 * once an admin confirms, so an unconfirmed/spam reservation can't lock
 * out a real customer. The actual double-booking check happens in
 * confirmReservation below.
 */
export async function createReservation({ date, time, guestCount, tableId, customerName, customerPhone, notes }) {
  return runTransaction(db, async (transaction) => {
    const code = await generateReservationCode(transaction);
    const newDocRef = doc(reservationsRef());
    transaction.set(newDocRef, {
      reservationCode: code,
      date,
      time,
      guestCount: Number(guestCount),
      tableId: tableId || null,
      durationMinutes: RESERVATION_DEFAULT_DURATION_MINUTES,
      customerName,
      customerPhone,
      notes: notes || '',
      status: RESERVATION_STATUS.PENDING,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: newDocRef.id, reservationCode: code };
  });
}

/**
 * Checks whether `tableId` already has a CONFIRMED reservation overlapping
 * the given date/time window. Run as a plain query (not inside a
 * transaction — Firestore transactions can't run arbitrary `where`
 * queries) before the actual confirm write; acceptable for a small
 * restaurant's admin-side confirm rate (see product-14/§6 assumptions).
 */
async function hasConflictingConfirmedReservation(tableId, date, time, durationMinutes, excludeId) {
  const q = query(
    reservationsRef(),
    where('tableId', '==', tableId),
    where('date', '==', date),
    where('status', '==', RESERVATION_STATUS.CONFIRMED)
  );
  const snap = await getDocs(q);
  const startMinutes = timeToMinutes(time);
  return snap.docs.some((d) => {
    if (d.id === excludeId) return false;
    const other = d.data();
    return rangesOverlap(startMinutes, durationMinutes, timeToMinutes(other.time), other.durationMinutes || RESERVATION_DEFAULT_DURATION_MINUTES);
  });
}

/**
 * Confirms a reservation — the one transition with an extra rule beyond
 * the plain state machine: it re-checks for a conflicting CONFIRMED
 * reservation on the same table first, and throws a friendly, specific
 * error if found (so the admin can choose a different table or reject
 * this reservation instead of double-booking it).
 */
export async function confirmReservation(reservationId) {
  const snap = await getDoc(reservationDoc(reservationId));
  if (!snap.exists()) throw new Error('Reservasi tidak ditemukan.');
  const reservation = snap.data();

  assertValidReservationTransition(reservation.status, RESERVATION_STATUS.CONFIRMED);

  if (!reservation.tableId) {
    throw new Error('Reservasi ini belum punya meja — pilih meja dulu sebelum konfirmasi.');
  }

  const conflict = await hasConflictingConfirmedReservation(
    reservation.tableId, reservation.date, reservation.time, reservation.durationMinutes, reservationId
  );
  if (conflict) {
    throw new Error('Meja ini sudah dikonfirmasi untuk reservasi lain di jam yang sama. Pilih meja lain atau tolak salah satu reservasi.');
  }

  await updateDoc(reservationDoc(reservationId), {
    status: RESERVATION_STATUS.CONFIRMED,
    updatedAt: serverTimestamp()
  });
  // Best-effort: reflect the reservation on the floor-status grid. Admin
  // can always override manually in Table Management — see product-16.
  await updateDoc(tableDoc(reservation.tableId), { status: TABLE_STATUS.RESERVED });
}

/**
 * Handles every other reservation transition (reject/cancel/arrived/
 * seated/completed/no-show), keeping the table's floor status roughly in
 * sync. This is a best-effort heuristic, not a source of truth — Table
 * Management always lets staff correct it manually.
 */
export async function transitionReservationStatus(reservationId, nextStatus) {
  const snap = await getDoc(reservationDoc(reservationId));
  if (!snap.exists()) throw new Error('Reservasi tidak ditemukan.');
  const reservation = snap.data();

  assertValidReservationTransition(reservation.status, nextStatus);

  await updateDoc(reservationDoc(reservationId), {
    status: nextStatus,
    updatedAt: serverTimestamp()
  });

  if (!reservation.tableId) return;

  if (nextStatus === RESERVATION_STATUS.SEATED) {
    await updateDoc(tableDoc(reservation.tableId), { status: TABLE_STATUS.OCCUPIED });
  } else if (nextStatus === RESERVATION_STATUS.COMPLETED) {
    await updateDoc(tableDoc(reservation.tableId), { status: TABLE_STATUS.CLEANING });
  } else if ([RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.REJECTED, RESERVATION_STATUS.NO_SHOW].includes(nextStatus)) {
    const tableSnap = await getDoc(tableDoc(reservation.tableId));
    if (tableSnap.exists() && tableSnap.data().status === TABLE_STATUS.RESERVED) {
      await updateDoc(tableDoc(reservation.tableId), { status: TABLE_STATUS.AVAILABLE });
    }
  }
}

/** Realtime subscription for the admin Reservation Management list. */
export function subscribeReservations(callback) {
  const q = query(reservationsRef(), orderBy('date', 'desc'), orderBy('time', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** Realtime subscription for the customer reservation status page. Same
 *  pending-sync metadata as subscribeOrder above. */
export function subscribeReservation(reservationId, callback) {
  return onSnapshot(reservationDoc(reservationId), { includeMetadataChanges: true }, (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data(), _pendingSync: snap.metadata.hasPendingWrites } : null);
  });
}
