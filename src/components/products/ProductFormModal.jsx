import { useState } from 'react';
import { Button } from '../ui/Button';
import { ModifierGroupEditor } from './ModifierGroupEditor';
import { createProduct, updateProduct, uploadProductImage } from '../../services/productService';
import { STATION } from '../../constants';

const STATION_LABEL = { kitchen: 'Dapur', beverage: 'Minuman', cashier: 'Kasir', mixed: 'Campuran' };

export function ProductFormModal({ product, categories, onClose }) {
  const isEdit = Boolean(product);
  const [name, setName] = useState(product?.name || '');
  const [categoryId, setCategoryId] = useState(product?.categoryId || categories[0]?.id || '');
  const [description, setDescription] = useState(product?.description || '');
  const [price, setPrice] = useState(product?.price || 0);
  const [station, setStation] = useState(product?.station || STATION.KITCHEN);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured || false);
  const [modifierGroups, setModifierGroups] = useState(product?.modifierGroups || []);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = name.trim().length > 0 && categoryId && price >= 0 && !submitting;

  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      const cleanGroups = modifierGroups
        .filter((g) => g.name.trim())
        .map((g) => ({ ...g, options: g.options.filter((o) => o.name.trim()) }));

      const data = {
        name: name.trim(),
        categoryId,
        description: description.trim(),
        price: Number(price),
        station,
        isFeatured,
        modifierGroups: cleanGroups
      };

      let productId = product?.id;
      if (isEdit) {
        await updateProduct(productId, data);
      } else {
        data.isAvailable = true;
        data.sortOrder = 0;
        const ref = await createProduct(data);
        productId = ref.id;
      }

      if (imageFile) {
        const url = await uploadProductImage(productId, imageFile);
        await updateProduct(productId, { imageUrl: url });
      }

      onClose();
    } catch (e) {
      console.error('Product save failed:', e);
      setError('Gagal menyimpan produk. Coba lagi.');
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl md:rounded-card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="font-bold text-lg mb-4">{isEdit ? 'Edit Produk' : 'Tambah Produk'}</p>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 rounded-lg bg-black/5 overflow-hidden shrink-0">
              {imagePreview && <img src={imagePreview} alt="" className="w-full h-full object-cover" />}
            </div>
            <label className="text-sm font-semibold text-brand-red cursor-pointer">
              {imagePreview ? 'Ganti Foto' : 'Upload Foto'}
              <input type="file" accept="image/*" onChange={handleImagePick} className="hidden" />
            </label>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Nama Produk</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold block mb-1">Kategori</label>
              <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold block mb-1">Station</label>
              <select value={station} onChange={(e) => setStation(e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm">
                {Object.values(STATION).map((s) => <option key={s} value={s}>{STATION_LABEL[s]}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Harga (Rp)</label>
            <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>

          <div>
            <label className="text-sm font-semibold block mb-1">Deskripsi (opsional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 p-3 text-sm resize-none" />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            Tandai sebagai Menu Populer
          </label>

          <div>
            <p className="text-sm font-semibold mb-2">Modifier (opsional)</p>
            <ModifierGroupEditor groups={modifierGroups} onChange={setModifierGroups} />
          </div>
        </div>

        {error && <p className="text-sm text-brand-red mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <Button variant="ghost" onClick={onClose} disabled={submitting} className="flex-1">Batal</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
            {submitting ? 'Menyimpan…' : 'Simpan'}
          </Button>
        </div>
      </div>
    </div>
  );
}
