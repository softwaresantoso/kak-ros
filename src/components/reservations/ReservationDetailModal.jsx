import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { confirmReservation, transitionReservationStatus } from '../../services/reservationService';
import { nextReservationStatusOptions } from '../../lib/reservationStateMachine';
import { RESERVATION_STATUS } from '../../constants';

const ACTION_LABEL = {
  [RESERVATION_STATUS.CONFIRMED]: 'Konfirmasi',
  [RESERVATION_STATUS.REJECTED]: 'Tolak',
  [RESERVATION_STATUS.CANCELLED]: 'Batalkan',
  [RESERVATION_STATUS.ARRIVED]: 'Tandai Datang',
  [RESERVATION_STATUS.SEATED]: 'Tandai Duduk',
  [RESERVATION_STATUS.COMPLETED]: 'Selesaikan',
  [RESERVATION_STATUS.NO_SHOW]: 'Tandai Tidak Hadir'
};

const DESTRUCTIVE = [RESERVATION_STATUS.REJECTED, RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.NO_SHOW];

export function ReservationDetailModal({ reservation, tableLabel, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const options = nextReservationStatusOptions(reservation.status);

  async function handleTransition(nextStatus) {
    setSubmitting(true);
    setError(null);
    try {
      if (nextStatus === RESERVATION_STATUS.CONFIRMED) {
        await confirmReservation(reservation.id);
      } else {
        await transitionReservationStatus(reservation.id, nextStatus);
      }
      onClose();
    } catch (e) {
      console.error('Reservation transition failed:', e);
      setError(e.message || 'Gagal mengubah status. Coba lagi.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-card w-full max-w-md max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <p className="font-bold text-lg">{reservation.reservationCode}</p>
          <Badge status={reservation.status}>{reservation.status}</Badge>
        </div>

        <div className="space-y-2 text-sm mt-4 border-t border-b border-black/5 py-3">
          <div className="flex justify-between"><span className="text-brand-dark/50">Nama</span><span className="font-semibold">{reservation.customerName}</span></div>
          <div className="flex justify-between"><span className="text-brand-dark/50">WhatsApp</span><span className="font-semibold">{reservation.customerPhone}</span></div>
          <div className="flex justify-between"><span className="text-brand-dark/50">Tanggal</span><span className="font-semibold">{reservation.date}</span></div>
          <div className="flex justify-between"><span className="text-brand-dark/50">Jam</span><span className="font-semibold">{reservation.time}</span></div>
          <div className="flex justify-between"><span className="text-brand-dark/50">Jumlah Tamu</span><span className="font-semibold">{reservation.guestCount} orang</span></div>
          <div className="flex justify-between"><span className="text-brand-dark/50">Meja</span><span className="font-semibold">{tableLabel || '-'}</span></div>
          {reservation.notes && (
            <div className="pt-2"><span className="text-brand-dark/50">Catatan:</span> {reservation.notes}</div>
          )}
        </div>

        {error && <p className="text-sm text-brand-red mt-3">{error}</p>}

        <div className="flex flex-col gap-2 mt-5">
          {options.map((status) => (
            <Button
              key={status}
              variant={DESTRUCTIVE.includes(status) ? 'outline' : 'primary'}
              className={DESTRUCTIVE.includes(status) ? '!border-brand-red !text-brand-red' : ''}
              disabled={submitting}
              onClick={() => handleTransition(status)}
            >
              {ACTION_LABEL[status] || status}
            </Button>
          ))}
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Tutup</Button>
        </div>
      </div>
    </div>
  );
}
