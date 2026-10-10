import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { subscribeCategories, subscribeProducts } from '../services/productService';
import { ProductCard } from '../components/order/ProductCard';
import { StickyCartBar } from '../components/order/StickyCartBar';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

export default function OrderMenu() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category');

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const categoryMap = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = c; });
    return map;
  }, [categories]);

  const filtered = activeCategory
    ? products.filter((p) => categoryMap[p.categoryId]?.slug === activeCategory)
    : products;

  return (
    <div className="pb-28">
      <div className="sticky top-0 z-30 bg-brand-cream/95 backdrop-blur px-5 pt-4 pb-3 border-b border-black/5">
        <h1 className="font-bold text-lg mb-3">Menu</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setSearchParams({})}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
              ${!activeCategory ? 'bg-brand-red text-white border-brand-red' : 'border-black/10'}`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSearchParams({ category: c.slug })}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
                ${activeCategory === c.slug ? 'bg-brand-red text-white border-brand-red' : 'border-black/10'}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40" />)}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState title="Menu belum tersedia" description="Coba pilih kategori lain." />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <StickyCartBar />
    </div>
  );
}
