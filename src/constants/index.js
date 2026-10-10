// Single source of truth for enums used across the app.
// Never hardcode these strings elsewhere — import from here.

export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  KITCHEN_CASHIER: 'KITCHEN_CASHIER'
};

export const ORDER_TYPE = {
  DINE_IN: 'DINE_IN',
  TAKE_AWAY: 'TAKE_AWAY'
  // DELIVERY reserved for future phase
};

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  READY: 'READY',
  SERVED: 'SERVED',
  PICKED_UP: 'PICKED_UP',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

export const PAYMENT_STATUS = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  REFUNDED: 'REFUNDED'
};

export const PAYMENT_METHOD = {
  CASH: 'CASH',
  QRIS: 'QRIS',
  TRANSFER: 'TRANSFER',
  OTHER: 'OTHER'
};

export const TABLE_STATUS = {
  AVAILABLE: 'AVAILABLE',
  RESERVED: 'RESERVED',
  OCCUPIED: 'OCCUPIED',
  CLEANING: 'CLEANING',
  DISABLED: 'DISABLED'
};

export const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  ARRIVED: 'ARRIVED',
  SEATED: 'SEATED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  REJECTED: 'REJECTED',
  NO_SHOW: 'NO_SHOW'
};

// Legal transitions for the reservation state machine — mirrors
// ORDER_STATUS_TRANSITIONS above. Enforced in
// src/lib/reservationStateMachine.js.
export const RESERVATION_STATUS_TRANSITIONS = {
  [RESERVATION_STATUS.PENDING]: [RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.REJECTED, RESERVATION_STATUS.CANCELLED],
  [RESERVATION_STATUS.CONFIRMED]: [RESERVATION_STATUS.ARRIVED, RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.NO_SHOW],
  [RESERVATION_STATUS.ARRIVED]: [RESERVATION_STATUS.SEATED],
  [RESERVATION_STATUS.SEATED]: [RESERVATION_STATUS.COMPLETED],
  [RESERVATION_STATUS.COMPLETED]: [],
  [RESERVATION_STATUS.CANCELLED]: [],
  [RESERVATION_STATUS.REJECTED]: [],
  [RESERVATION_STATUS.NO_SHOW]: []
};

export const STATION = {
  KITCHEN: 'kitchen',
  BEVERAGE: 'beverage',
  CASHIER: 'cashier',
  MIXED: 'mixed'
};

// Legal transitions for the order state machine.
// Enforced in src/lib/orderStateMachine.js — do not mutate orderStatus
// anywhere else in the codebase.
// PENDING -> PROCESSING is allowed directly (in addition to the
// PENDING -> CONFIRMED -> PROCESSING path) because most small restaurants
// don't gate every order behind an explicit admin confirmation — the
// kitchen needs to be able to start cooking the moment an order arrives.
// Admin can still use CONFIRMED as an explicit checkpoint when they want
// one (e.g. verifying a take-away order's details first).
export const ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PROCESSING, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.READY],
  [ORDER_STATUS.READY]: [ORDER_STATUS.SERVED, ORDER_STATUS.PICKED_UP],
  [ORDER_STATUS.SERVED]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.PICKED_UP]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: []
};

export const RESERVATION_DEFAULT_DURATION_MINUTES = 90;
