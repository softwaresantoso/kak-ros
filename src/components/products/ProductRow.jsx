import { Card } from '../ui/Card';
import { formatRupiah } from '../../lib/format';
import { setProductAvailable, setProductFeatured, setProductArchived } from '../../services/productService';

export function ProductRow({ product, categoryName, onEdit, readOnly }) {
  return (
    <Card className={`p-3 flex items-center gap-3 ${product.isArchived ? 'opacity-50' : ''}`}>
      <div className="w-14 h-14 rounded-lg bg-black/5 overflow-hidden shrink-0">
        {product.imageUrl && <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />}
      </div>

      <div className="flex-1 min-w-0" onClick={() => onEdit(product)}>
        <p className="font-semibold text-sm truncate cursor-pointer">{product.name}</p>
        <p className="text-xs text-brand-dark/50">{categoryName} · {formatRupiah(product.price)}</p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0">
        <label className="flex items-center gap-1 text-[10px] text-brand-dark/60">
          <input
            type="checkbox"
            checked={product.isAvailable}
            onChange={(e) => setProductAvailable(product.id, e.target.checked)}
            disabled={readOnly || product.isArchived}
          />
          Tersedia
        </label>
        <label className="flex items-center gap-1 text-[10px] text-brand-dark/60">
          <input
            type="checkbox"
            checked={product.isFeatured}
            onChange={(e) => setProductFeatured(product.id, e.target.checked)}
            disabled={readOnly || product.isArchived}
          />
          Populer
        </label>
        {!readOnly && (
          <button
            onClick={() => setProductArchived(product.id, !product.isArchived)}
            className="text-[10px] font-semibold text-brand-red"
          >
            {product.isArchived ? 'Aktifkan' : 'Arsipkan'}
          </button>
        )}
      </div>
    </Card>
  );
}
