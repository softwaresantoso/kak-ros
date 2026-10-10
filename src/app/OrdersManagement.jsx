import { useEffect, useMemo, useState } from 'react';
import { subscribeAllOrders } from '../services/orderService';
import { subscribeTables } from '../services/tableService';
import { OrderListItem } from '../components/orders/OrderListItem';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { ORDER_STATUS, PAYMENT_STATUS } from '../constants';

const FILTERS = [
  { key: 'ALL', label: 'Semua' },
  { key: ORDER_STATUS.PENDING, label: 'Pending' },
  { key: ORDER_STATUS.CONFIRMED, label: 'Confirmed' },
  { key: ORDER_STATUS.PROCESSING, label: 'Processing' },
  { key: ORDER_STATUS.READY, label: 'Ready' },
  { key: ORDER_STATUS.COMPLETED, label: 'Completed' },
  { key: ORDER_STATUS.CANCELLED, label: 'Cancelled' },
  { key: 'UNPAID', label: 'Belum Lunas' }
];

export default function OrdersManagement() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const unsubOrders = subscribeAllOrders((items) => {
      setOrders(items);
      setLoading(false);
    });
    const unsubTables = subscribeTables(setTables);
    return () => {
      unsubOrders();
      unsubTables();
    };
  }, []);

  const tableMap = useMemo(() => {
    const map = {};
    tables.forEach((t) => { map[t.id] = `Meja ${t.tableNumber}`; });
    return map;
  }, [tables]);

  // Keep the modal's data fresh as the realtime subscription updates —
  // otherwise the open modal would show a stale status after an action.
  const selectedLive = selected ? orders.find((o) => o.id === selected) || null : null;

  const filtered = useMemo(() => {
    let list = orders;
    if (filter === 'UNPAID') {
      list = list.filter((o) => o.paymentStatus === PAYMENT_STATUS.UNPAID);
    } else if (filter !== 'ALL') {
      list = list.filter((o) => o.orderStatus === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((o) =>
        o.orderNumber.toLowerCase().includes(q) ||
        (o.customerName || '').toLowerCase().includes(q) ||
        (tableMap[o.tableId] || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [orders, filter, search, tableMap]);

  return (
    <div className="p-5 pb-16">
      <h1 className="font-bold text-lg mb-4">Order Management</h1>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari nomor order, nama, atau meja…"
        className="w-full rounded-lg border border-black/10 p-3 text-sm mb-3"
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
              ${filter === f.key ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada order" description="Coba ganti filter atau kata kunci pencarian." />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderListItem
              key={order.id}
              order={order}
              tableLabel={tableMap[order.tableId]}
              onClick={() => setSelected(order.id)}
            />
          ))}
        </div>
      )}

      {selectedLive && (
        <OrderDetailModal
          order={selectedLive}
          tableLabel={tableMap[selectedLive.tableId]}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
