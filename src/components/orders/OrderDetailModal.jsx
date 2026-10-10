import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { formatRupiah } from '../../lib/format';
import { transitionOrderStatus } from '../../services/orderService';
import { nextStatusOptions } from '../../lib/orderStateMachine';
import { ORDER_STATUS, ORDER_TYPE } from '../../constants';

const STATUS_ACTION_LABEL = {
  [ORDER_STATUS.CONFIRMED]: 'Konfirmasi Order',
  [ORDER_STATUS.PROCESSING]: 'Mulai Proses',
  [ORDER_STATUS.READY]: 'Tandai Siap',
  [ORDER_STATUS.SERVED]: 'Tandai Sudah Disajikan',
  [ORDER_STATUS.PICKED_UP]: 'Tandai Sudah Diambil',
  [ORDER_STATUS.COMPLETED]: 'Selesaikan Order',
  [ORDER_STATUS.CANCELLED]: 'Batalkan Order'
};

export function OrderDetailModal({ order, tableLabel, onClose }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const options = nextStatusOptions(order.orderStatus);

  async function handleTransition(nextStatus) {
    setSubmitting(true);
    setError(null);
    try {
      await transitionOrderStatus(order.id, nextStatus);
      if (nextStatus !== ORDER_STATUS.CANCELLED) onClose();
      else onClose();
    } catch (e) {
      console.error('transitionOrderStatus failed:', e);
      setError('Gagal mengubah status. Coba lagi.');
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
          <p className="font-bold text-lg">{order.orderNumber}</p>
          <Badge status={order.orderStatus}>{order.orderStatus}</Badge>
        </div>
        <p className="text-sm text-brand-dark/50 mb-4">
          {order.orderType === ORDER_TYPE.DINE_IN
            ? `Dine In${tableLabel ? ` · ${tableLabel}` : ''}`
            : `Take Away · ${order.customerName || '-'}${order.customerPhone ? ` · ${order.customerPhone}` : ''}`}
        </p>

        <div className="space-y-2 border-t border-b border-black/5 py-3">
          {order.items.map((item, i) => (
            <div key={i} className="text-sm">
              <div className="flex justify-between">
                <span>{item.qty}× {item.name}</span>
                <span>{formatRupiah((item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) * item.qty)}</span>
              </div>
              {item.modifiers?.length > 0 && (
                <p className="text-xs text-brand-dark/50">{item.modifiers.map((m) => m.optionName).join(', ')}</p>
              )}
              {item.notes && <p className="text-xs text-brand-dark/50 italic">"{item.notes}"</p>}
            </div>
          ))}
        </div>

        {order.notes && (
          <p className="text-sm text-brand-dark/70 mt-3"><span className="font-semibold">Catatan:</span> {order.notes}</p>
        )}

        <div className="flex justify-between font-bold text-base mt-3">
          <span>Total</span>
          <span>{formatRupiah(order.total)}</span>
        </div>
        <p className="text-xs text-brand-dark/50 mt-1">Status pembayaran: {order.paymentStatus}</p>

        {error && <p className="text-sm text-brand-red mt-3">{error}</p>}

        <div className="flex flex-col gap-2 mt-5">
          {options.map((status) => (
            <Button
              key={status}
              variant={status === ORDER_STATUS.CANCELLED ? 'outline' : 'primary'}
              className={status === ORDER_STATUS.CANCELLED ? '!border-brand-red !text-brand-red' : ''}
              disabled={submitting}
              onClick={() => handleTransition(status)}
            >
              {STATUS_ACTION_LABEL[status] || status}
            </Button>
          ))}
          <Button variant="ghost" onClick={onClose} disabled={submitting}>Tutup</Button>
        </div>
      </div>
    </div>
  );
}
