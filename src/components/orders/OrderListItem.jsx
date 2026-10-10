import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatRupiah } from '../../lib/format';
import { ORDER_TYPE, PAYMENT_STATUS } from '../../constants';

const PAYMENT_STYLE = {
  [PAYMENT_STATUS.UNPAID]: 'bg-status-cancelled/15 text-status-cancelled',
  [PAYMENT_STATUS.PARTIAL]: 'bg-status-pending/15 text-status-pending',
  [PAYMENT_STATUS.PAID]: 'bg-status-ready/15 text-status-ready',
  [PAYMENT_STATUS.REFUNDED]: 'bg-black/10 text-brand-dark/60'
};

function timeAgo(timestamp) {
  if (!timestamp?.toDate) return '';
  const diffMs = Date.now() - timestamp.toDate().getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} menit lalu`;
  const hrs = Math.floor(mins / 60);
  return `${hrs} jam lalu`;
}

export function OrderListItem({ order, tableLabel, onClick }) {
  const itemsSummary = order.items.map((i) => `${i.qty}× ${i.name}`).join(', ');

  return (
    <Card onClick={onClick} className="p-4 cursor-pointer hover:border-brand-red/40 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">{order.orderNumber}</p>
            <span className="text-xs text-brand-dark/40">{timeAgo(order.createdAt)}</span>
          </div>
          <p className="text-xs text-brand-dark/50 mt-0.5">
            {order.orderType === ORDER_TYPE.DINE_IN ? `Dine In${tableLabel ? ` · ${tableLabel}` : ''}` : `Take Away${order.customerName ? ` · ${order.customerName}` : ''}`}
          </p>
          <p className="text-xs text-brand-dark/60 mt-1 line-clamp-1">{itemsSummary}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-sm">{formatRupiah(order.total)}</p>
          <div className="flex flex-col items-end gap-1 mt-1">
            <Badge status={order.orderStatus}>{order.orderStatus}</Badge>
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${PAYMENT_STYLE[order.paymentStatus]}`}>
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
