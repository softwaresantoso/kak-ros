import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatRupiah } from '../../lib/format';

export function StickyCartBar() {
  const { itemCount, subtotal } = useCart();
  if (itemCount === 0) return null;

  return (
    <Link
      to="/order/cart"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-md
        bg-brand-red text-white rounded-card shadow-lg px-5 py-4
        flex items-center justify-between"
    >
      <span className="text-sm font-semibold">{itemCount} item di keranjang</span>
      <span className="font-bold">{formatRupiah(subtotal)}</span>
    </Link>
  );
}
