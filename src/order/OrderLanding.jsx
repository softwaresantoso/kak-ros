import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getBusinessInfo } from '../services/businessService';
import { getTableById } from '../services/tableService';
import { subscribeCategories, subscribeProducts } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { ProductCard } from '../components/order/ProductCard';
import { StickyCartBar } from '../components/order/StickyCartBar';
import { PoweredByKakRos } from '../components/PoweredByKakRos';

export default function OrderLanding() {
  const [searchParams] = useSearchParams();
  const tableIdFromQr = searchParams.get('table');
  const { bindTable, tableId } = useCart();
  const { firebaseUser, isActive, role } = useAuth();

  const [business, setBusiness] = useState(null);
  const [table, setTable] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Bind table once from the QR param — subsequent renders keep whatever
  // is already in CartContext (product-11: locked once entered via QR).
  useEffect(() => {
    if (tableIdFromQr && tableIdFromQr !== tableId) {
      bindTable(tableIdFromQr);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableIdFromQr]);

  useEffect(() => {
    getBusinessInfo().then(setBusiness);
  }, []);

  useEffect(() => {
    if (tableId) getTableById(tableId).then(setTable);
  }, [tableId]);

  useEffect(() => {
    const unsubCat = subscribeCategories(setCategories);
    const unsubProd = subscribeProducts((items) => {
      setProducts(items);
      setLoading(false);
    });
    return () => {
      unsubCat();
      unsubProd();
    };
  }, []);

  const featured = products.filter((p) => p.isFeatured).slice(0, 6);

  // Staff who already logged in before (session persists across app
  // launches) get a quick way back to their dashboard — otherwise an
  // installed PWA always opens to this customer page with no visible
  // path to the staff area (the manifest's start_url is customer-first
  // since most installs are customers; see ONBOARDING.md for context).
  const showStaffShortcut = firebaseUser && isActive && role;

  return (
    <div className="pb-28">
      {showStaffShortcut ? (
        <Link
          to="/app/dashboard"
          className="block bg-brand-dark text-white text-sm font-semibold text-center py-2.5"
        >
          Login sebagai {role} · Buka Dashboard →
        </Link>
      ) : (
        <div className="flex justify-end px-4 pt-3">
          <Link to="/login" className="text-xs text-brand-dark/40 font-medium underline">
            Staff Login
          </Link>
        </div>
      )}

      {/* Hero */}
      <div className="bg-brand-red text-white px-5 pt-8 pb-10 rounded-b-3xl">
        <p className="text-xs uppercase tracking-wide text-white/70">
          {table ? `Meja ${table.tableNumber}` : 'Selamat datang di'}
        </p>
        {business?.logoUrl && (
          <img src={business.logoUrl} alt={business.name} className="h-10 w-auto object-contain mb-2" />
        )}
        <h1 className="text-2xl font-bold mt-1">{business?.name || 'Selamat datang'}</h1>
        <div className="flex gap-3 mt-5">
          <Link to="/order/menu" className="flex-1">
            <Button className="w-full">Pesan Sekarang</Button>
          </Link>
          <Link to="/order/reservasi" className="flex-1">
            <Button variant="outline" className="w-full !border-white !text-white">Reservasi Meja</Button>
          </Link>
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div className="px-5 mt-6 flex gap-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/order/menu?category=${c.slug}`}
              className="whitespace-nowrap rounded-full border border-black/10 px-4 py-2 text-sm font-medium"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {/* Featured products */}
      <div className="px-5 mt-6">
        <h2 className="font-semibold mb-3">Menu Populer</h2>
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : featured.length === 0 ? (
          <p className="text-sm text-brand-dark/50">Belum ada menu andalan yang ditandai.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>

      <PoweredByKakRos />

      <StickyCartBar />
    </div>
  );
}
