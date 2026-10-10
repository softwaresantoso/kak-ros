import { useState } from 'react';
import { Button } from '../ui/Button';
import { formatRupiah } from '../../lib/format';
import { recordPayment } from '../../services/paymentService';
import { PAYMENT_METHOD, ORDER_TYPE } from '../../constants';
import { useAuth } from '../../context/AuthContext';

const METHOD_LABEL = {
  [PAYMENT_METHOD.CASH]: 'Cash',
  [PAYMENT_METHOD.QRIS]: 'QRIS',
  [PAYMENT_METHOD.TRANSFER]: 'Transfer',
  [PAYMENT_METHOD.OTHER]: 'Lainnya'
};

export function PaymentPanel({ order, tableLabel, onClose, onSuccess }) {
  const { firebaseUser } = useAuth();
  const [method, setMethod] = useState(PAYMENT_METHOD.CASH);
  const [paidInput, setPaidInput] = useState('');
  const [reference, setReference] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const paidAmount = method === PAYMENT_METHOD.CASH ? Number(paidInput || 0) : order.total;
  const change = method === PAYMENT_METHOD.CASH ? Math.max(0, paidAmount - order.total) : 0;
  const isCashInsufficient = method === PAYMENT_METHOD.CASH && paidAmount < order.total;
  const canSubmit = !submitting && !isCashInsufficient && (method !== PAYMENT_METHOD.CASH || paidInput !== '');

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await recordPayment({
        orderId: order.id,
        amount: order.total,
        method,
        reference: reference || null,
        paidAmount,
        change,
        cashierId: firebaseUser.uid
      });
      onSuccess();
    } catch (e) {
      console.error('recordPayment failed:', e);
      setError('Gagal menyimpan pembayaran. Coba lagi.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-card w-full max-w-md max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-lg">{order.orderNumber}</p>
        <p className="text-sm text-brand-dark/50 mb-4">
          {order.orderType === ORDER_TYPE.DINE_IN ? `Dine In${tableLabel ? ` · ${tableLabel}` : ''}` : `Take Away · ${order.customerName || '-'}`}
        </p>

        <div className="space-y-1 border-t border-b border-black/5 py-3 mb-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span>{item.qty}× {item.name}</span>
              <span>{formatRupiah((item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-base pt-2">
            <span>Total</span>
            <span>{formatRupiah(order.total)}</span>
          </div>
        </div>

        <p className="text-sm font-semibold mb-2">Metode Pembayaran</p>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {Object.values(PAYMENT_METHOD).map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`rounded-lg border-2 py-2 text-xs font-bold
                ${method === m ? 'border-brand-red bg-brand-red/5 text-brand-red' : 'border-black/10 text-brand-dark/60'}`}
            >
              {METHOD_LABEL[m]}
            </button>
          ))}
        </div>

        {method === PAYMENT_METHOD.CASH ? (
          <div className="mb-4">
            <label className="text-sm font-semibold block mb-1">Jumlah Dibayar</label>
            <input
              type="number"
              min={0}
              value={paidInput}
              onChange={(e) => setPaidInput(e.target.value)}
              placeholder={`Minimal ${order.total}`}
              className="w-full rounded-lg border border-black/10 p-3 text-lg font-bold"
            />
            {isCashInsufficient && paidInput !== '' && (
              <p className="text-xs text-brand-red mt-1">Jumlah kurang dari total.</p>
            )}
            {!isCashInsufficient && paidInput !== '' && (
              <div className="flex justify-between mt-2 text-sm">
                <span className="text-brand-dark/60">Kembalian</span>
                <span className="font-bold">{formatRupiah(change)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <label className="text-sm font-semibold block mb-1">Nomor Referensi (opsional)</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Contoh: ID transaksi QRIS"
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
            />
          </div>
        )}

        {error && <p className="text-sm text-brand-red mb-3">{error}</p>}

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} disabled={submitting} className="flex-1">Batal</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
            {submitting ? 'Menyimpan…' : 'Selesaikan Pembayaran'}
          </Button>
        </div>
      </div>
    </div>
  );
}
