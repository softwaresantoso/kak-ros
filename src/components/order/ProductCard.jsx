import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatRupiah } from '../../lib/format';

export function ProductCard({ product }) {
  return (
    <Link to={`/order/product/${product.slug}`}>
      <Card className="overflow-hidden h-full flex flex-col">
        <div className="aspect-square bg-black/5 relative">
          {product.imageUrl ? (
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-brand-dark/30 text-xs">
              Tanpa foto
            </div>
          )}
          {product.isFeatured && (
            <span className="absolute top-2 left-2">
              <Badge status="READY">Populer</Badge>
            </span>
          )}
        </div>
        <div className="p-3 flex-1 flex flex-col">
          <p className="font-semibold text-sm leading-snug line-clamp-2">{product.name}</p>
          <p className="text-brand-red font-bold mt-auto pt-2">{formatRupiah(product.price)}</p>
        </div>
      </Card>
    </Link>
  );
}
