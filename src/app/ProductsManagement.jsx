import { useEffect, useMemo, useState } from 'react';
import { subscribeAllProductsAdmin, subscribeCategories } from '../services/productService';
import { ProductRow } from '../components/products/ProductRow';
import { ProductFormModal } from '../components/products/ProductFormModal';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants';

export default function ProductsManagement() {
  const { role } = useAuth();
  const canEdit = role === ROLES.OWNER;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [formProduct, setFormProduct] = useState(undefined); // undefined=closed, null=create, object=edit

  useEffect(() => {
    const unsubProducts = subscribeAllProductsAdmin((items) => {
      setProducts(items);
      setLoading(false);
    });
    const unsubCategories = subscribeCategories(setCategories);
    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  const categoryNameById = useMemo(() => {
    const map = {};
    categories.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [categories]);

  const filtered = useMemo(() => {
    let list = products;
    if (categoryFilter !== 'ALL') list = list.filter((p) => p.categoryId === categoryFilter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, categoryFilter, search]);

  return (
    <div className="p-5 pb-16">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-bold text-lg">Menu</h1>
        {canEdit && <Button onClick={() => setFormProduct(null)}>+ Tambah</Button>}
      </div>

      {!canEdit && (
        <p className="text-xs text-brand-dark/50 mb-3 bg-black/5 rounded-lg p-2">
          Admin hanya bisa melihat menu. Perubahan harga/produk perlu Owner.
        </p>
      )}

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Cari produk…"
        className="w-full rounded-lg border border-black/10 p-3 text-sm mb-3"
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
            ${categoryFilter === 'ALL' ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
        >
          Semua
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryFilter(c.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium border
              ${categoryFilter === c.id ? 'bg-brand-red text-white border-brand-red' : 'border-black/10 text-brand-dark/70'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Tidak ada produk" description="Coba ganti filter atau kata kunci." />
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              categoryName={categoryNameById[p.categoryId] || '-'}
              onEdit={canEdit ? setFormProduct : () => {}}
              readOnly={!canEdit}
            />
          ))}
        </div>
      )}

      {canEdit && formProduct !== undefined && (
        <ProductFormModal
          product={formProduct}
          categories={categories}
          onClose={() => setFormProduct(undefined)}
        />
      )}
    </div>
  );
}
