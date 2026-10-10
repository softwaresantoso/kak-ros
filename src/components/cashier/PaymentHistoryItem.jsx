import { Card } from '../ui/Card';
import { formatRupiah } from '../../lib/format';

const METHOD_LABEL = { CASH: 'Cash', QRIS: 'QRIS', TRANSFER: 'Transfer', OTHER: 'Lainnya' };

function formatTime(timestamp) {
  if (!timestamp?.toDate) return '';
  return timestamp.toDate().toLocaleString('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function PaymentHistoryItem({ payment, orderNumber }) {
  return (
    <Card className="p-3 flex items-center justify-between">
      <div>
        <p className="font-semibold text-sm">{orderNumber || payment.orderId}</p>
        <p className="text-xs text-brand-dark/50">{METHOD_LABEL[payment.method]} · {formatTime(payment.paidAt)}</p>
      </div>
      <p className="font-bold text-sm">{formatRupiah(payment.amount)}</p>
    </Card>
  );
}
