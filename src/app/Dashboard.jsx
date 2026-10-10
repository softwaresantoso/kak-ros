import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { subscribeAllOrders } from '../services/orderService';
import { getOrdersInRange, getPaymentsInRange, getReservationsInRange, getProductCategoryMap, aggregateReportData } from '../services/reportService';
import { StatCard } from '../components/dashboard/StatCard';
import { TopProductsList } from '../components/dashboard/TopProductsList';
import { Skeleton } from '../components/ui/Skeleton';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../lib/format';
import { ORDER_STATUS, PAYMENT_STATUS, ROLES } from '../constants';

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Dashboard() {
  const { role, staffProfile } = useAuth();
  const [allOrders, setAllOrders] = useState([]);
  const [todayStats, setTodayStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Live-updating "currently open" counts, independent of the day boundary.
  useEffect(() => {
    const unsub = subscribeAllOrders(setAllOrders);
    return unsub;
  }, []);

  // Today's aggregated numbers — refetched every 60s rather than realtime,
  // since a dashboard summary doesn't need per-keystroke freshness and
  // range queries are cheaper done this way than kept open indefinitely.
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [orders, payments, reservations, categoryMap] = await Promise.all([
          getOrdersInRange(startOfToday(), endOfToday()),
          getPaymentsInRange(startOfToday(), endOfToday()),
          getReservationsInRange(todayIso(), todayIso()),
          getProductCategoryMap()
        ]);
        if (cancelled) return;
        setTodayStats(aggregateReportData(orders, payments, reservations, categoryMap));
      } catch (e) {
        console.error('Dashboard load failed:', e);
        if (!cancelled) setTodayStats(aggregateReportData([], [], [], {}));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const pesananAktif = allOrders.filter((o) => ![ORDER_STATUS.COMPLETED, ORDER_STATUS.CANCELLED].includes(o.orderStatus)).length;
  const belumLunas = allOrders.filter((o) =>
    o.orderStatus !== ORDER_STATUS.CANCELLED &&
    [PAYMENT_STATUS.UNPAID, PAYMENT_STATUS.PARTIAL].includes(o.paymentStatus)
  ).length;

  return (
    <div className="p-5 pb-16">
      <div className="flex items-center justify-between mb-1">
        <h1 className="font-bold text-lg">Dashboard</h1>
        {role === ROLES.OWNER && (
          <Link to="/app/reports" className="text-sm font-semibold text-brand-red">Lihat Laporan →</Link>
        )}
      </div>
      <p className="text-sm text-brand-dark/50 mb-5">Halo, {staffProfile?.name || 'staff'} · kondisi bisnis hari ini</p>

      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <StatCard label="Omzet Hari Ini" value={formatRupiah(todayStats.omzet)} />
            <StatCard label="Transaksi" value={todayStats.transaksi} />
            <StatCard label="Item Terjual" value={todayStats.itemTerjual} />
            <StatCard label="Pesanan Aktif" value={pesananAktif} />
            <StatCard label="Belum Lunas" value={belumLunas} />
            <StatCard label="Reservasi Hari Ini" value={todayStats.reservationCount} sub={`${todayStats.guestCount} tamu`} />
          </div>

          <TopProductsList products={todayStats.topProducts} />
        </>
      )}
    </div>
  );
}
