import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '../ui/Button';
import { buildTableOrderUrl } from '../../services/tableService';

export function QrCodeModal({ table, onClose }) {
  const canvasWrapRef = useRef(null);
  const url = buildTableOrderUrl(table.id);

  function handleDownload() {
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `qr-meja-${table.tableNumber}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function handlePrint() {
    const canvas = canvasWrapRef.current?.querySelector('canvas');
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head><title>QR Meja ${table.tableNumber}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">
          <h2 style="margin-bottom:8px;">Meja ${table.tableNumber}</h2>
          <img src="${dataUrl}" style="width:280px;height:280px;" />
          <p style="margin-top:8px;color:#666;">Scan untuk pesan</p>
          <script>window.onload = () => { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-5" onClick={onClose}>
      <div className="bg-white rounded-card p-6 w-full max-w-xs text-center" onClick={(e) => e.stopPropagation()}>
        <p className="font-bold text-lg mb-1">Meja {table.tableNumber}</p>
        <p className="text-xs text-brand-dark/50 mb-4 break-all">{url}</p>

        <div ref={canvasWrapRef} className="flex justify-center mb-4">
          <QRCodeCanvas value={url} size={220} level="M" includeMargin />
        </div>

        <div className="flex flex-col gap-2">
          <Button onClick={handleDownload} className="w-full">Download PNG</Button>
          <Button variant="outline" onClick={handlePrint} className="w-full">Print</Button>
          <Button variant="ghost" onClick={onClose} className="w-full">Tutup</Button>
        </div>
      </div>
    </div>
  );
}
