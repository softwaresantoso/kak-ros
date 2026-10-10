import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeReservation } from '../services/reservationService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { RESERVATION_STATUS } from '../constants';

const STATUS_TEXT = {
  [RESERVATION_STATUS.PENDING]: 'Menunggu konfirmasi dari kami',
  [RESERVATION_STATUS.CONFIRMED]: 'Reservasi Anda sudah dikonfirmasi',
  [RESERVATION_STATUS.ARRIVED]: 'Selamat datang! Silakan tunggu diarahkan ke meja',
  [RESERVATION_STATUS.SEATED]: 'Selamat menikmati',
  [RESERVATION_STATUS.COMPLETED]: 'Terima kasih sudah berkunjung',
  [RESERVATION_STATUS.CANCELLED]: 'Reservasi ini telah dibatalkan',
  [RESERVATION_STATUS.REJECTED]: 'Mohon maaf, reservasi ini tidak dapat kami konfirmasi',
  [RESERVATION_STATUS.NO_SHOW]: 'Reservasi ini ditandai tidak hadir'
};

export default function ReservationStatus() {
  const { code: reservationId } = useParams();
  const [reservation, setReservation] = useState(undefined);

  useEffect(() => {
    const unsub = subscribeReservation(reservationId, setReservation);
    return unsub;
  }, [reservationId]);

  if (reservation === undefined) {
    return <div className="p-6 text-center text-brand-dark/60">Memuat status reservasi…</div>;
  }
  if (reservation === null) {
    return <div className="p-6 text-center text-brand-dark/60">Reservasi tidak ditemukan.</div>;
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
      <p className="text-xs text-brand-dark/50">Kode Reservasi</p>
      <h1 className="font-bold text-xl mb-3">{reservation.reservationCode}</h1>
      <Badge status={reservation.status}>{reservation.status}</Badge>
      {reservation._pendingSync && (
        <p className="text-xs text-status-pending font-semibold mt-2">
          Menyinkronkan… pastikan koneksi internet stabil.
        </p>
      )}

      <p className="mt-4 text-base font-semibold">{STATUS_TEXT[reservation.status]}</p>

      <div className="mt-6 rounded-card border border-black/5 p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-brand-dark/50">Tanggal</span><span className="font-semibold">{reservation.date}</span></div>
        <div className="flex justify-between"><span className="text-brand-dark/50">Jam</span><span className="font-semibold">{reservation.time}</span></div>
        <div className="flex justify-between"><span className="text-brand-dark/50">Jumlah Tamu</span><span className="font-semibold">{reservation.guestCount} orang</span></div>
        <div className="flex justify-between"><span className="text-brand-dark/50">Nama</span><span className="font-semibold">{reservation.customerName}</span></div>
        {reservation.notes && (
          <div className="pt-2 border-t border-black/5">
            <span className="text-brand-dark/50">Catatan:</span> <span>{reservation.notes}</span>
          </div>
        )}
      </div>

      <Link to="/order" className="block mt-6">
        <Button variant="outline" className="w-full">Kembali ke Beranda</Button>
      </Link>
    </div>
  );
}
