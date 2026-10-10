import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

export function ReservationListItem({ reservation, tableLabel, onClick }) {
  return (
    <Card onClick={onClick} className="p-4 cursor-pointer hover:border-brand-red/40 transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-bold text-sm">{reservation.time} · {reservation.customerName}</p>
          <p className="text-xs text-brand-dark/50 mt-0.5">
            {reservation.guestCount} orang{tableLabel ? ` · ${tableLabel}` : ' · belum ada meja'}
          </p>
          <p className="text-xs text-brand-dark/40 mt-0.5">{reservation.reservationCode}</p>
        </div>
        <Badge status={reservation.status}>{reservation.status}</Badge>
      </div>
    </Card>
  );
}
