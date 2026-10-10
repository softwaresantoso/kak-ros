import { useEffect, useState } from 'react';
import { subscribeTables, setTableStatus } from '../services/tableService';
import { TableCard } from '../components/tables/TableCard';
import { TableFormModal } from '../components/tables/TableFormModal';
import { QrCodeModal } from '../components/tables/QrCodeModal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formTable, setFormTable] = useState(undefined); // undefined = closed, null = create, object = edit
  const [qrTable, setQrTable] = useState(null);

  useEffect(() => {
    const unsub = subscribeTables((items) => {
      setTables(items);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function handleChangeStatus(tableId, status) {
    try {
      await setTableStatus(tableId, status);
    } catch (e) {
      // Non-blocking — the select will just revert on next snapshot if it failed.
      console.error('Gagal mengubah status meja', e);
    }
  }

  return (
    <div className="p-5 pb-16">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="font-bold text-lg">Manajemen Meja</h1>
          <p className="text-sm text-brand-dark/50">{tables.length} meja terdaftar</p>
        </div>
        <Button onClick={() => setFormTable(null)}>+ Tambah Meja</Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      ) : tables.length === 0 ? (
        <EmptyState title="Belum ada meja" description="Tambahkan meja pertama untuk mulai generate QR." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {tables.map((t) => (
            <TableCard
              key={t.id}
              table={t}
              onShowQr={setQrTable}
              onEdit={setFormTable}
              onChangeStatus={handleChangeStatus}
            />
          ))}
        </div>
      )}

      {formTable !== undefined && (
        <TableFormModal table={formTable} onClose={() => setFormTable(undefined)} />
      )}
      {qrTable && (
        <QrCodeModal table={qrTable} onClose={() => setQrTable(null)} />
      )}
    </div>
  );
}
