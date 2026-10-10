import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { subscribeOrder } from '../services/orderService';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { formatRupiah } from '../lib/format';
import { ORDER_STATUS } from '../constants';

const STEPS = [
  { key: ORDER_STATUS.PENDING, label: 'Order diterima' },
  { key: ORDER_STATUS.PROCESSING, label: 'Sedang diproses' },
  { key: ORDER_STATUS.READY, label: 'Siap' },
  { key: ORDER_STATUS.COMPLETED, label: 'Selesai' }
];

function stepIndex(status) {
  if (status === ORDER_STATUS.CANCELLED) return -1;
  if (status === ORDER_STATUS.CONFIRMED) return 0;
  if (status === ORDER_STATUS.SERVED || status === ORDER_STATUS.PICKED_UP) return 2;
  return STEPS.findIndex((s) => s.key === status);
}

export default function OrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(undefined); // undefined = loading, null = not found

  useEffect(() => {
    const unsub = subscribeOrder(orderId, setOrder);
    return unsub;
  }, [orderId]);

  if (order === undefined) {
    return <div className="p-6 text-center text-brand-dark/60">Memuat status pesanan…</div>;
  }
  if (order === null) {
    return <div className="p-6 text-center text-brand-dark/60">Pesanan tidak ditemukan.</div>;
  }

  const current = stepIndex(order.orderStatus);
  const isCancelled = order.orderStatus === ORDER_STATUS.CANCELLED;

  return (
    <div className="px-5 pt-6 pb-10">
      <p className="text-xs text-brand-dark/50">Nomor Pesanan</p>
      <h1 className="font-bold text-xl mb-3">{order.orderNumber}</h1>
      <Badge status={order.orderStatus}>{order.orderStatus}</Badge>
      {order._pendingSync && (
        <p className="text-xs text-status-pending font-semibold mt-2">
          Menyinkronkan… pastikan koneksi internet stabil.
        </p>
      )}

      {isCancelled ? (
        <p className="mt-6 text-sm text-brand-red">Pesanan ini telah dibatalkan.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-4">
          {STEPS.map((step, i) => {
            const done = i <= current;
            return (
              <div key={step.key} className="flex items-center gap-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${done ? 'bg-status-ready text-white' : 'bg-black/10 text-transparent'}`}>
                  ✓
                </span>
                <span className={done ? 'font-semibold' : 'text-brand-dark/40'}>{step.label}</span>
              </div>
            );
          })}
          {order.orderStatus === ORDER_STATUS.READY && (
            <p className="mt-2 text-brand-red font-bold">PESANAN ANDA SUDAH SIAP</p>
          )}
        </div>
      )}

      <div className="mt-8 rounded-card border border-black/5 p-4">
        <p className="text-sm font-semibold mb-2">Ringkasan</p>
        {order.items.map((item, i) => (
          <div key={i} className="flex justify-between text-sm text-brand-dark/70">
            <span>{item.qty}× {item.name}</span>
            <span>{formatRupiah((item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) * item.qty)}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold text-sm mt-3 pt-3 border-t border-black/5">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
      </div>

      <Link to="/order" className="block mt-6">
        <Button variant="outline" className="w-full">Kembali ke Menu</Button>
      </Link>
    </div>
  );
}
