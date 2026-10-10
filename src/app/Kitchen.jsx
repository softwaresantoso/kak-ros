import { useEffect, useMemo, useState } from 'react';
import { subscribeAllOrders, transitionOrderStatus } from '../services/orderService';
import { subscribeTables } from '../services/tableService';
import { KitchenTicketCard } from '../components/kitchen/KitchenTicketCard';
import { ORDER_STATUS, STATION } from '../constants';

const STATION_TABS = [
  { key: 'ALL', label: 'Semua' },
  { key: STATION.KITCHEN, label: 'Dapur' },
  { key: STATION.BEVERAGE, label: 'Minuman' }
];

const COLUMNS = [
  { key: 'NEW', label: 'BARU', statuses: [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED] },
  { key: 'PROCESSING', label: 'DIPROSES', statuses: [ORDER_STATUS.PROCESSING] },
  { key: 'READY', label: 'SIAP', statuses: [ORDER_STATUS.READY] }
];

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [stationFilter, setStationFilter] = useState('ALL');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const unsubOrders = subscribeAllOrders(setOrders);
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

  // Only orders relevant to the kitchen workflow, and (unless "Semua")
  // only orders that actually have an item for the selected station —
  // a beverage-only ticket shouldn't clutter the Dapur tab.
  const kitchenOrders = useMemo(() => {
    let list = orders.filter((o) =>
      [ORDER_STATUS.PENDING, ORDER_STATUS.CONFIRMED, ORDER_STATUS.PROCESSING, ORDER_STATUS.READY].includes(o.orderStatus)
    );
    if (stationFilter !== 'ALL') {
      list = list.filter((o) => o.items.some((i) => i.station === stationFilter || i.station === 'mixed'));
    }
    // FIFO within each column — oldest first, so staff process in order.
    return [...list].sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
  }, [orders, stationFilter]);

  async function handleAdvance(order) {
    const next = order.orderStatus === ORDER_STATUS.PROCESSING ? ORDER_STATUS.READY : ORDER_STATUS.PROCESSING;
    setBusyId(order.id);
    try {
      await transitionOrderStatus(order.id, next);
    } catch (e) {
      console.error('Kitchen transitionOrderStatus failed:', e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="p-4 pb-16 bg-brand-cream min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-extrabold text-2xl">Dapur</h1>
        <div className="flex gap-2">
          {STATION_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStationFilter(tab.key)}
              className={`px-4 py-2 rounded-full text-sm font-bold border-2
                ${stationFilter === tab.key ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/60'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
        {COLUMNS.map((col) => {
          const columnOrders = kitchenOrders.filter((o) => col.statuses.includes(o.orderStatus));
          return (
            <div key={col.key} className="shrink-0 w-[85vw] sm:w-80 snap-start">
              <div className="flex items-center justify-between mb-2 px-1">
                <p className="font-extrabold text-sm tracking-wide text-brand-dark/60">{col.label}</p>
                <span className="text-sm font-bold bg-black/10 rounded-full w-6 h-6 flex items-center justify-center">
                  {columnOrders.length}
                </span>
              </div>
              <div className="flex flex-col gap-3">
                {columnOrders.length === 0 ? (
                  <p className="text-sm text-brand-dark/40 px-2 py-6 text-center">Tidak ada order</p>
                ) : (
                  columnOrders.map((order) => (
                    <KitchenTicketCard
                      key={order.id}
                      order={order}
                      tableLabel={tableMap[order.tableId]}
                      stationFilter={stationFilter}
                      onAdvance={handleAdvance}
                      busy={busyId === order.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
