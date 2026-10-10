const STATUS_COLOR = {
  PENDING: 'bg-status-pending/15 text-status-pending',
  CONFIRMED: 'bg-status-confirmed/15 text-status-confirmed',
  PROCESSING: 'bg-status-processing/15 text-status-processing',
  READY: 'bg-status-ready/15 text-status-ready',
  SERVED: 'bg-status-completed/15 text-status-completed',
  PICKED_UP: 'bg-status-completed/15 text-status-completed',
  COMPLETED: 'bg-status-completed/15 text-status-completed',
  CANCELLED: 'bg-status-cancelled/15 text-status-cancelled',
  // Reservation-specific statuses
  ARRIVED: 'bg-status-processing/15 text-status-processing',
  SEATED: 'bg-status-ready/15 text-status-ready',
  REJECTED: 'bg-status-cancelled/15 text-status-cancelled',
  NO_SHOW: 'bg-status-cancelled/15 text-status-cancelled'
};

export function Badge({ status, children, className = '' }) {
  const color = STATUS_COLOR[status] || 'bg-black/10 text-brand-dark';
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${color} ${className}`}>
      {children}
    </span>
  );
}
