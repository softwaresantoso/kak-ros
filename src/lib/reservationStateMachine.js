import { RESERVATION_STATUS_TRANSITIONS } from '../constants';

export function canTransitionReservationStatus(current, next) {
  const allowed = RESERVATION_STATUS_TRANSITIONS[current];
  if (!allowed) return false;
  return allowed.includes(next);
}

export function assertValidReservationTransition(current, next) {
  if (!canTransitionReservationStatus(current, next)) {
    throw new Error(`Transisi reservasi tidak valid: ${current} -> ${next}`);
  }
}

export function nextReservationStatusOptions(current) {
  return RESERVATION_STATUS_TRANSITIONS[current] || [];
}
