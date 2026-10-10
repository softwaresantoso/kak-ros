import { useEffect, useState } from 'react';
import { getOrdersInRange, getPaymentsInRange, getReservationsInRange, getProductCategoryMap, aggregateReportData } from '../services/reportService';
import { StatCard } from '../components/dashboard/StatCard';
import { TopProductsList } from '../components/dashboard/TopProductsList';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';
import { formatRupiah } from '../lib/format';

function isoDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayIso() { return isoDaysAgo(0); }

const PRESETS = [
  { key: 'today', label: 'Hari Ini', start: () => todayIso(), end: () => todayIso() },
  { key: '7d', label: '7 Hari Terakhir', start: () => isoDaysAgo(6), end: () => todayIso() },
  { key: '30d', label: '30 Hari Terakhir', start: () => isoDaysAgo(29), end: () => todayIso() }
];

const METHOD_LABEL = { CASH: 'Cash', QRIS: 'QRIS', TRANSFER: 'Transfer', OTHER: 'Lainnya' };

export default function Reports() {
  const [preset, setPreset] = useState('7d');
  const [startDate, setStartDate] = useState(isoDaysAgo(6));
  const [endDate, setEndDate] = useState(todayIso());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  function applyPreset(key) {
    const p = PRESETS.find((x) => x.key === key);
    setPreset(key);
    setStartDate(p.start());
    setEndDate(p.end());
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const start = new Date(startDate); start.setHours(0, 0, 0, 0);
      const end = new Date(endDate); end.setHours(23, 59, 59, 999);
      const [orders, payments, reservations, categoryMap] = await Promise.all([
        getOrdersInRange(start, end),
        getPaymentsInRange(start, end),
        getReservationsInRange(startDate, endDate),
        getProductCategoryMap()
      ]);
      if (cancelled) return;
      setData(aggregateReportData(orders, payments, reservations, categoryMap));
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, [startDate, endDate]);

  return (
    <div className="p-5 pb-16">
      <h1 className="font-bold text-lg mb-4">Laporan</h1>

      <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => applyPreset(p.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
              ${preset === p.key ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-5">
        <input type="date" value={startDate} max={endDate}
          onChange={(e) => { setPreset(null); setStartDate(e.target.value); }}
          className="flex-1 rounded-lg border border-black/10 p-2.5 text-sm" />
        <span className="self-center text-brand-dark/40">–</span>
        <input type="date" value={endDate} min={startDate} max={todayIso()}
          onChange={(e) => { setPreset(null); setEndDate(e.target.value); }}
          className="flex-1 rounded-lg border border-black/10 p-2.5 text-sm" />
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="Total Omzet" value={formatRupiah(data.omzet)} />
            <StatCard label="Jumlah Transaksi" value={data.transaksi} />
            <StatCard label="Rata-rata Transaksi" value={formatRupiah(Math.round(data.rataRataTransaksi))} />
            <StatCard label="Item Terjual" value={data.itemTerjual} />
            <StatCard label="Order Dine In" value={data.dineIn} />
            <StatCard label="Order Take Away" value={data.takeAway} />
            <StatCard label="Order Dibatalkan" value={data.cancelledCount} />
            <StatCard label="Reservasi Tidak Hadir" value={data.noShowCount} />
          </div>

          <TopProductsList products={data.topProducts} />

          <Card className="p-4 mt-3">
            <p className="text-sm font-semibold mb-3">Penjualan per Kategori</p>
            {data.salesByCategory.length === 0 ? (
              <p className="text-sm text-brand-dark/40">Belum ada penjualan.</p>
            ) : (
              <div className="space-y-2">
                {data.salesByCategory.map((c) => (
                  <div key={c.name} className="flex justify-between text-sm">
                    <span>{c.name}</span>
                    <span className="font-semibold">{formatRupiah(c.total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 mt-3">
            <p className="text-sm font-semibold mb-3">Metode Pembayaran</p>
            {Object.keys(data.paymentMethodTotals).length === 0 ? (
              <p className="text-sm text-brand-dark/40">Belum ada transaksi.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(data.paymentMethodTotals).map(([method, total]) => (
                  <div key={method} className="flex justify-between text-sm">
                    <span>{METHOD_LABEL[method] || method}</span>
                    <span className="font-semibold">{formatRupiah(total)}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
