import { useEffect, useMemo, useState } from 'react';
import { subscribeReservations } from '../services/reservationService';
import { subscribeTables } from '../services/tableService';
import { ReservationListItem } from '../components/reservations/ReservationListItem';
import { ReservationDetailModal } from '../components/reservations/ReservationDetailModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { RESERVATION_STATUS } from '../constants';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const STATUS_FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: RESERVATION_STATUS.PENDING, label: 'Pending' },
  { key: RESERVATION_STATUS.CONFIRMED, label: 'Confirmed' },
  { key: RESERVATION_STATUS.ARRIVED, label: 'Arrived' },
  { key: RESERVATION_STATUS.SEATED, label: 'Seated' },
  { key: RESERVATION_STATUS.COMPLETED, label: 'Completed' },
  { key: RESERVATION_STATUS.CANCELLED, label: 'Cancelled/Rejected/No-Show' }
];

export default function ReservationsManagement() {
  const [reservations, setReservations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(todayIso());
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsubRes = subscribeReservations((items) => {
      setReservations(items);
      setLoading(false);
    });
    const unsubTables = subscribeTables(setTables);
    return () => {
      unsubRes();
      unsubTables();
    };
  }, []);

  const tableMap = useMemo(() => {
    const map = {};
    tables.forEach((t) => { map[t.id] = `Meja ${t.tableNumber}`; });
    return map;
  }, [tables]);

  const selectedLive = selected ? reservations.find((r) => r.id === selected) || null : null;

  const filtered = useMemo(() => {
    let list = reservations;
    if (dateFilter) list = list.filter((r) => r.date === dateFilter);
    if (statusFilter === RESERVATION_STATUS.CANCELLED) {
      list = list.filter((r) => [RESERVATION_STATUS.CANCELLED, RESERVATION_STATUS.REJECTED, RESERVATION_STATUS.NO_SHOW].includes(r.status));
    } else if (statusFilter !== 'ALL') {
      list = list.filter((r) => r.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        r.customerName.toLowerCase().includes(q) || r.reservationCode.toLowerCase().includes(q)
      );
    }
    return [...list].sort((a, b) => a.time.localeCompare(b.time));
  }, [reservations, dateFilter, statusFilter, search]);

  return (
    <div className="p-5 pb-16">
      <h1 className="font-bold text-lg mb-4">Reservasi</h1>

      <div className="flex gap-2 mb-3">
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-lg border border-black/10 p-3 text-sm"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau kode…"
          className="flex-1 rounded-lg border border-black/10 p-3 text-sm"
        />
      </div>
      <button onClick={() => setDateFilter('')} className="text-xs text-brand-red font-semibold mb-3">
        {dateFilter ? 'Lihat semua tanggal' : ''}
      </button>

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
              ${statusFilter === f.key ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada reservasi" description="Coba ganti tanggal atau filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationListItem
              key={r.id}
              reservation={r}
              tableLabel={tableMap[r.tableId]}
              onClick={() => setSelected(r.id)}
            />
          ))}
        </div>
      )}

      {selectedLive && (
        <ReservationDetailModal
          reservation={selectedLive}
          tableLabel={tableMap[selectedLive.tableId]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
