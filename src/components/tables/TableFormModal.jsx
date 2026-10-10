import { useState } from 'react';
import { Button } from '../ui/Button';
import { createTable, updateTable } from '../../services/tableService';

export function TableFormModal({ table, onClose }) {
  const isEdit = Boolean(table);
  const [tableNumber, setTableNumber] = useState(table?.tableNumber || '');
  const [capacity, setCapacity] = useState(table?.capacity || 4);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = tableNumber.trim().length > 0 && capacity > 0 && !submitting;

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      if (isEdit) {
        await updateTable(table.id, { tableNumber: tableNumber.trim(), capacity: Number(capacity) });
      } else {
        await createTable({ tableNumber: tableNumber.trim(), capacity: Number(capacity) });
      }
      onClose();
    } catch (e) {
      setError('Gagal menyimpan meja. Coba lagi.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-card p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <p className="font-bold text-lg mb-4">{isEdit ? 'Edit Meja' : 'Tambah Meja'}</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Nomor Meja</label>
            <input
              value={tableNumber}
              onChange={(e) => setTableNumber(e.target.value)}
              placeholder="Contoh: 01"
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Kapasitas (orang)</label>
            <input
              type="number"
              min={1}
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
            />
          </div>
        </div>

        {error && <p className="text-sm text-brand-red mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <Button variant="ghost" onClick={onClose} className="flex-1">Batal</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
