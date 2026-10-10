import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductBySlug } from '../services/productService';
import { useCart } from '../context/CartContext';
import { Button } from '../components/ui/Button';
import { QtyStepper } from '../components/ui/QtyStepper';
import { ModifierGroup } from '../components/order/ModifierGroup';
import { Skeleton } from '../components/ui/Skeleton';
import { formatRupiah } from '../lib/format';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [selections, setSelections] = useState({}); // { groupId: [optionId, ...] }

  useEffect(() => {
    setLoading(true);
    getProductBySlug(slug).then((p) => {
      setProduct(p);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="p-5 space-y-3">
        <Skeleton className="h-64" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!product) {
    return <div className="p-6 text-center text-brand-dark/60">Produk tidak ditemukan.</div>;
  }

  const groups = product.modifierGroups || [];

  function handleSelectionChange(groupId, optionIds) {
    setSelections((s) => ({ ...s, [groupId]: optionIds }));
  }

  const missingRequired = groups.some((g) => g.required && !(selections[g.id]?.length > 0));

  const modifierTotal = groups.reduce((sum, g) => {
    const chosen = selections[g.id] || [];
    return sum + chosen.reduce((s, optId) => {
      const opt = g.options.find((o) => o.id === optId);
      return s + (opt?.priceDelta || 0);
    }, 0);
  }, 0);

  const lineTotal = (product.price + modifierTotal) * qty;

  function handleAddToCart() {
    if (missingRequired) return;
    const modifiers = groups.flatMap((g) => (selections[g.id] || []).map((optId) => {
      const opt = g.options.find((o) => o.id === optId);
      return { groupId: g.id, groupName: g.name, optionId: optId, optionName: opt.name, priceDelta: opt.priceDelta || 0 };
    }));

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty,
      modifiers,
      notes,
      station: product.station
    });
    navigate('/order/cart');
  }

  return (
    <div className="pb-28">
      <div className="aspect-square bg-black/5">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-dark/30 text-sm">Tanpa foto</div>
        )}
      </div>

      <div className="p-5">
        <h1 className="text-xl font-bold">{product.name}</h1>
        <p className="text-brand-red font-bold text-lg mt-1">{formatRupiah(product.price)}</p>
        {product.description && <p className="text-sm text-brand-dark/70 mt-2">{product.description}</p>}

        {groups.length > 0 && (
          <div className="mt-4">
            {groups.map((g) => (
              <ModifierGroup
                key={g.id}
                group={g}
                selected={selections[g.id] || []}
                onChange={handleSelectionChange}
              />
            ))}
          </div>
        )}

        <div className="mt-4">
          <p className="font-semibold text-sm mb-2">Catatan</p>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Jangan pakai kol"
            className="w-full rounded-lg border border-black/10 p-3 text-sm resize-none"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between mt-6">
          <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} min={1} />
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/5 p-4">
        <Button className="w-full flex items-center justify-between" onClick={handleAddToCart} disabled={missingRequired}>
          <span>Tambah ke Keranjang</span>
          <span>{formatRupiah(lineTotal)}</span>
        </Button>
        {missingRequired && (
          <p className="text-xs text-brand-red text-center mt-2">Lengkapi pilihan wajib di atas.</p>
        )}
      </div>
    </div>
  );
}
