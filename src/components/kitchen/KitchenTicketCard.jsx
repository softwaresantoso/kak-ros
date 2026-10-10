import { ORDER_TYPE, ORDER_STATUS } from '../../constants';

/**
 * Filters an order's items down to the ones relevant for `stationFilter`.
 * 'ALL' (the combined kitchen+cashier user) shows everything.
 */
function itemsForStation(items, stationFilter) {
  if (stationFilter === 'ALL') return items;
  return items.filter((i) => i.station === stationFilter || i.station === 'mixed');
}

const ACTION_LABEL = {
  [ORDER_STATUS.PENDING]: 'MULAI PROSES',
  [ORDER_STATUS.CONFIRMED]: 'MULAI PROSES',
  [ORDER_STATUS.PROCESSING]: 'TANDAI SIAP'
};

export function KitchenTicketCard({ order, tableLabel, stationFilter, onAdvance, busy }) {
  const items = itemsForStation(order.items, stationFilter);
  const actionLabel = ACTION_LABEL[order.orderStatus];

  return (
    <div className="bg-white rounded-2xl border-2 border-black/10 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <p className="font-extrabold text-xl">{order.orderNumber}</p>
        {order.orderType === ORDER_TYPE.DINE_IN && tableLabel && (
          <span className="bg-brand-red text-white text-sm font-bold px-3 py-1 rounded-full">
            {tableLabel}
          </span>
        )}
      </div>

      <ul className="space-y-1.5 mb-3">
        {items.map((item, i) => (
          <li key={i} className="text-lg font-semibold leading-snug">
            {item.qty}× {item.name}
            {item.modifiers?.length > 0 && (
              <span className="block text-sm font-normal text-brand-dark/60">
                {item.modifiers.map((m) => m.optionName).join(', ')}
              </span>
            )}
          </li>
        ))}
      </ul>

      {order.notes && (
        <p className="text-base font-semibold text-brand-red bg-brand-red/5 rounded-lg px-3 py-2 mb-3">
          Catatan: {order.notes}
        </p>
      )}
      {items.some((i) => i.notes) && (
        <ul className="mb-3 space-y-1">
          {items.filter((i) => i.notes).map((i, idx) => (
            <li key={idx} className="text-sm font-semibold text-brand-red">
              {i.name}: "{i.notes}"
            </li>
          ))}
        </ul>
      )}

      {actionLabel && (
        <button
          onClick={() => onAdvance(order)}
          disabled={busy}
          className="w-full py-4 rounded-xl bg-brand-red text-white text-lg font-extrabold tracking-wide
            active:scale-[0.98] transition disabled:opacity-40"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
