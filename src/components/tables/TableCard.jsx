import { Card } from '../ui/Card';
import { TABLE_STATUS } from '../../constants';

const STATUS_STYLE = {
  [TABLE_STATUS.AVAILABLE]: 'bg-status-ready/10 border-status-ready text-status-ready',
  [TABLE_STATUS.RESERVED]: 'bg-status-confirmed/10 border-status-confirmed text-status-confirmed',
  [TABLE_STATUS.OCCUPIED]: 'bg-status-cancelled/10 border-status-cancelled text-status-cancelled',
  [TABLE_STATUS.CLEANING]: 'bg-status-pending/10 border-status-pending text-status-pending',
  [TABLE_STATUS.DISABLED]: 'bg-black/5 border-black/20 text-brand-dark/40'
};

const STATUS_LABEL = {
  [TABLE_STATUS.AVAILABLE]: 'Tersedia',
  [TABLE_STATUS.RESERVED]: 'Direservasi',
  [TABLE_STATUS.OCCUPIED]: 'Terisi',
  [TABLE_STATUS.CLEANING]: 'Dibersihkan',
  [TABLE_STATUS.DISABLED]: 'Nonaktif'
};

export function TableCard({ table, onShowQr, onEdit, onChangeStatus }) {
  const style = STATUS_STYLE[table.status] || STATUS_STYLE[TABLE_STATUS.AVAILABLE];

  return (
    <Card className={`p-4 border-2 ${style}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="font-bold text-lg text-brand-dark">Meja {table.tableNumber}</p>
          <p className="text-xs text-brand-dark/50">{table.capacity} orang</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${style}`}>
          {STATUS_LABEL[table.status] || table.status}
        </span>
      </div>

      <select
        value={table.status}
        onChange={(e) => onChangeStatus(table.id, e.target.value)}
        className="w-full mt-3 rounded-lg border border-black/10 p-2 text-xs bg-white text-brand-dark"
      >
        {Object.values(TABLE_STATUS).map((s) => (
          <option key={s} value={s}>{STATUS_LABEL[s]}</option>
        ))}
      </select>

      <div className="flex gap-2 mt-3">
        <button onClick={() => onShowQr(table)} className="flex-1 text-xs font-semibold text-brand-red border border-brand-red rounded-lg py-2">
          QR Code
        </button>
        <button onClick={() => onEdit(table)} className="flex-1 text-xs font-semibold text-brand-dark border border-black/10 rounded-lg py-2">
          Edit
        </button>
      </div>
    </Card>
  );
}
