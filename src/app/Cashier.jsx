import { useEffect, useMemo, useState } from 'react';
import { subscribeAllOrders } from '../services/orderService';
import { subscribeRecentPayments } from '../services/paymentService';
import { subscribeTables } from '../services/tableService';
import { OrderListItem } from '../components/orders/OrderListItem';
import { PaymentPanel } from '../components/cashier/PaymentPanel';
import { PaymentHistoryItem } from '../components/cashier/PaymentHistoryItem';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { PAYMENT_STATUS, ORDER_STATUS } from '../constants';

export default function Cashier() {
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ACTIVE'); // ACTIVE | HISTORY
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    const unsubOrders = subscribeAllOrders((items) => {
      setOrders(items);
      setLoading(false);
    });
    const unsubPayments = subscribeRecentPayments(setPayments);
    const unsubTables = subscribeTables(setTables);
    return () => {
      unsubOrders();
      unsubPayments();
      unsubTables();
    };
  }, []);

  const tableMap = useMemo(() => {
    const map = {};
    tables.forEach((t) => { map[t.id] = `Meja ${t.tableNumber}`; });
    return map;
  }, [tables]);

  const orderMap = useMemo(() => {
    const map = {};
    orders.forEach((o) => { map[o.id] = o.orderNumber; });
    return map;
  }, [orders]);

  // Any order still awaiting payment, oldest first — regardless of
  // orderStatus, since dine-in tabs are commonly settled at different
  // points (some pay before eating, some after).
  const unpaidOrders = useMemo(() => {
    return orders
      .filter((o) =>
        o.orderStatus !== ORDER_STATUS.CANCELLED &&
        (o.paymentStatus === PAYMENT_STATUS.UNPAID || o.paymentStatus === PAYMENT_STATUS.PARTIAL)
      )
      .sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
  }, [orders]);

  return (
    <div className="p-5 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-lg">Kasir</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setTab('ACTIVE')}
            className={`px-4 py-2 rounded-full text-sm font-medium border
              ${tab === 'ACTIVE' ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
          >
            Belum Lunas
          </button>
          <button
            onClick={() => setTab('HISTORY')}
            className={`px-4 py-2 rounded-full text-sm font-medium border
              ${tab === 'HISTORY' ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
          >
            Riwayat
          </button>
        </div>
      </div>

      {tab === 'ACTIVE' ? (
        loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : unpaidOrders.length === 0 ? (
          <EmptyState title="Semua order sudah lunas" description="Tidak ada transaksi yang menunggu pembayaran." />
        ) : (
          <div className="space-y-3">
            {unpaidOrders.map((order) => (
              <OrderListItem
                key={order.id}
                order={order}
                tableLabel={tableMap[order.tableId]}
                onClick={() => setSelectedOrder(order)}
              />
            ))}
          </div>
        )
      ) : (
        payments.length === 0 ? (
          <EmptyState title="Belum ada riwayat transaksi" />
        ) : (
          <div className="space-y-2">
            {payments.map((p) => (
              <PaymentHistoryItem key={p.id} payment={p} orderNumber={orderMap[p.orderId]} />
            ))}
          </div>
        )
      )}

      {selectedOrder && (
        <PaymentPanel
          order={selectedOrder}
          tableLabel={tableMap[selectedOrder.tableId]}
          onClose={() => setSelectedOrder(null)}
          onSuccess={() => setSelectedOrder(null)}
        />
      )}
    </div>
  );
}
