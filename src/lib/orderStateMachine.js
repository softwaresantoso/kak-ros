import { ORDER_STATUS_TRANSITIONS } from '../constants';

/**
 * Returns true if moving from `current` to `next` orderStatus is legal.
 */
export function canTransitionOrderStatus(current, next) {
  const allowed = ORDER_STATUS_TRANSITIONS[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

/**
 * Throws if the transition is illegal. Call this before every Firestore
 * update to orderStatus — never set orderStatus directly elsewhere.
 */
export function assertValidOrderTransition(current, next) {
  if (!canTransitionOrderStatus(current, next)) {
    throw new Error(`Transisi order tidak valid: ${current} -> ${next}`);
  }
}

export function nextStatusOptions(current) {
  return ORDER_STATUS_TRANSITIONS[current] || [];
}
