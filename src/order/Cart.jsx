import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { QtyStepper } from '../components/ui/QtyStepper';
import { EmptyState } from '../components/ui/EmptyState';
import { formatRupiah } from '../lib/format';
import { ORDER_TYPE } from '../constants';

export default function Cart() {
  const { items, subtotal, updateItemQty, removeItem, orderType, setOrderType, tableId } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="pb-10">
        <EmptyState title="Keranjang masih kosong" description="Yuk pilih menu favoritmu dulu." />
        <div className="px-5">
          <Link to="/order/menu">
            <Button className="w-full">Lihat Menu</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-32 px-5 pt-4">
      <h1 className="font-bold text-lg mb-4">Keranjang</h1>

      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <Card key={index} className="p-3">
            <div className="flex justify-between">
              <div className="flex-1 pr-3">
                <p className="font-semibold text-sm">{item.name}</p>
                {item.modifiers?.length > 0 && (
                  <p className="text-xs text-brand-dark/50 mt-1">
                    {item.modifiers.map((m) => m.optionName).join(', ')}
                  </p>
                )}
                {item.notes && <p className="text-xs text-brand-dark/50 italic mt-1">"{item.notes}"</p>}
              </div>
              <button onClick={() => removeItem(index)} className="text-brand-red text-xs font-semibold h-fit">
                Hapus
              </button>
            </div>
            <div className="flex items-center justify-between mt-3">
              <QtyStepper value={item.qty} onChange={(v) => updateItemQty(index, v)} />
              <p className="font-bold text-sm">
                {formatRupiah((item.price + (item.modifiers || []).reduce((s, m) => s + (m.priceDelta || 0), 0)) * item.qty)}
              </p>
            </div>
          </Card>
        ))}
      </div>

      {/* Order type — locked to DINE_IN if a table came in via QR */}
      {!tableId && (
        <div className="mt-6">
          <p className="font-semibold text-sm mb-2">Jenis Pesanan</p>
          <div className="flex gap-2">
            <button
              onClick={() => setOrderType(ORDER_TYPE.DINE_IN)}
              className={`flex-1 rounded-lg border py-3 text-sm font-medium
                ${orderType === ORDER_TYPE.DINE_IN ? 'border-brand-red bg-brand-red/5 text-brand-red' : 'border-black/10'}`}
            >
              Dine In
            </button>
            <button
              onClick={() => setOrderType(ORDER_TYPE.TAKE_AWAY)}
              className={`flex-1 rounded-lg border py-3 text-sm font-medium
                ${orderType === ORDER_TYPE.TAKE_AWAY ? 'border-brand-red bg-brand-red/5 text-brand-red' : 'border-black/10'}`}
            >
              Take Away
            </button>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-4">
        <div className="flex justify-between text-sm mb-3">
          <span className="text-brand-dark/60">Subtotal</span>
          <span className="font-bold">{formatRupiah(subtotal)}</span>
        </div>
        <Button
          className="w-full"
          disabled={!orderType}
          onClick={() => navigate('/order/checkout')}
        >
          Lanjut ke Checkout
        </Button>
      </div>
    </div>
  );
}
