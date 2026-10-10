import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';
import { createReservation } from '../services/reservationService';
import { Button } from '../components/ui/Button';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ReservationForm() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: date/time/guests, 2: pick table, 3: contact info
  const [date, setDate] = useState(todayIso());
  const [time, setTime] = useState('19:00');
  const [guestCount, setGuestCount] = useState(2);

  const [candidateTables, setCandidateTables] = useState(null); // null = not searched yet
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [searching, setSearching] = useState(false);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSearchTables() {
    setSearching(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'businesses', getBusinessId(), 'tables'),
        where('isActive', '==', true)
      );
      const snap = await getDocs(q);
      const tables = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.capacity >= Number(guestCount))
        .sort((a, b) => a.capacity - b.capacity); // smallest fitting capacity first = "recommended"

      if (tables.length === 0) {
        setError('Tidak ada meja dengan kapasitas cukup untuk jumlah tamu ini. Coba kurangi jumlah tamu atau hubungi kami langsung.');
        setSearching(false);
        return;
      }
      setCandidateTables(tables);
      setSelectedTableId(tables[0].id);
      setStep(2);
    } catch (e) {
      console.error('Gagal mencari meja:', e);
      setError('Gagal memuat data meja. Periksa koneksi dan coba lagi.');
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const { id } = await createReservation({
        date, time, guestCount, tableId: selectedTableId,
        customerName, customerPhone, notes
      });
      navigate(`/order/reservasi/${id}`);
    } catch (e) {
      console.error('createReservation failed:', e);
      setError('Reservasi belum berhasil dikirim. Periksa koneksi dan coba lagi.');
      setSubmitting(false);
    }
  }

  return (
    <div className="px-5 pt-6 pb-10 max-w-md mx-auto">
      <h1 className="font-bold text-xl mb-1">Reservasi Meja</h1>
      <p className="text-sm text-brand-dark/50 mb-5">Langkah {step} dari 3</p>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Tanggal</label>
            <input type="date" min={todayIso()} value={date} onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Jam</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Jumlah Tamu</label>
            <input type="number" min={1} value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <Button className="w-full" onClick={handleSearchTables} disabled={searching}>
            {searching ? 'Mencari meja…' : 'Cek Ketersediaan'}
          </Button>
        </div>
      )}

      {step === 2 && candidateTables && (
        <div className="space-y-3">
          <p className="text-sm text-brand-dark/60 mb-2">
            {date} · {time} · {guestCount} orang — pilih meja:
          </p>
          {candidateTables.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setSelectedTableId(t.id)}
              className={`w-full flex items-center justify-between rounded-lg border-2 p-3 text-left
                ${selectedTableId === t.id ? 'border-brand-red bg-brand-red/5' : 'border-black/10'}`}
            >
              <span className="font-semibold">Meja {t.tableNumber} <span className="text-xs text-brand-dark/50 font-normal">({t.capacity} orang)</span></span>
              {i === 0 && <span className="text-xs font-bold text-brand-red">Direkomendasikan</span>}
            </button>
          ))}
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" className="flex-1" onClick={() => setStep(1)}>Kembali</Button>
            <Button className="flex-1" onClick={() => setStep(3)} disabled={!selectedTableId}>Lanjut</Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Nama *</label>
            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm" placeholder="Nama Anda" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Nomor WhatsApp *</label>
            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm" placeholder="08xxxxxxxxxx" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Catatan (opsional)</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
              className="w-full rounded-lg border border-black/10 p-3 text-sm resize-none" />
          </div>
          {error && <p className="text-sm text-brand-red">{error}</p>}
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setStep(2)} disabled={submitting}>Kembali</Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={submitting || !customerName.trim() || !customerPhone.trim()}
            >
              {submitting ? 'Mengirim…' : 'Konfirmasi Reservasi'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
