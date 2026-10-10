import { useEffect, useState } from 'react';
import { subscribeBusinessInfo, updateBusinessInfo, uploadBusinessLogo } from '../services/businessService';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Skeleton } from '../components/ui/Skeleton';

export default function Settings() {
  const [business, setBusiness] = useState(undefined);
  const [form, setForm] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsub = subscribeBusinessInfo((data) => {
      setBusiness(data);
      // Only seed the form once (on first load) — otherwise the realtime
      // listener would overwrite whatever the owner is mid-typing.
      setForm((prev) => prev ?? {
        name: data?.name || '',
        logoUrl: data?.logoUrl || '',
        address: data?.address || '',
        phone: data?.phone || '',
        whatsapp: data?.whatsapp || '',
        openingHours: data?.openingHours || '',
        taxEnabled: data?.tax?.enabled || false,
        taxPercent: data?.tax?.percent || 0,
        serviceChargeEnabled: data?.serviceCharge?.enabled || false,
        serviceChargePercent: data?.serviceCharge?.percent || 0,
        reservationDuration: data?.reservationSettings?.durationMinutes || 90
      });
    });
    return unsub;
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  function handleLogoPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      let logoUrl = form.logoUrl;
      if (logoFile) {
        logoUrl = await uploadBusinessLogo(logoFile);
      }
      await updateBusinessInfo({
        name: form.name.trim(),
        logoUrl,
        address: form.address.trim(),
        phone: form.phone.trim(),
        whatsapp: form.whatsapp.trim(),
        openingHours: form.openingHours.trim(),
        tax: { enabled: form.taxEnabled, percent: Number(form.taxPercent) },
        serviceCharge: { enabled: form.serviceChargeEnabled, percent: Number(form.serviceChargePercent) },
        reservationSettings: { durationMinutes: Number(form.reservationDuration) }
      });
      setLogoFile(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error('updateBusinessInfo failed:', e);
      setError('Gagal menyimpan pengaturan. Coba lagi.');
    } finally {
      setSaving(false);
    }
  }

  if (business === undefined || !form) {
    return (
      <div className="p-5 space-y-3">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="p-5 pb-16 max-w-xl">
      <h1 className="font-bold text-lg mb-1">Pengaturan Bisnis</h1>
      <p className="text-sm text-brand-dark/50 mb-5">Informasi ini tampil di halaman customer dan dipakai untuk perhitungan pajak/service charge.</p>

      <Card className="p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-lg bg-black/5 overflow-hidden shrink-0 flex items-center justify-center">
            {(logoPreview || form.logoUrl) ? (
              <img src={logoPreview || form.logoUrl} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-[10px] text-brand-dark/30">Tanpa logo</span>
            )}
          </div>
          <label className="text-sm font-semibold text-brand-red cursor-pointer">
            Ganti Logo
            <input type="file" accept="image/*" onChange={handleLogoPick} className="hidden" />
          </label>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Nama Bisnis</label>
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm" />
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Alamat</label>
          <textarea value={form.address} onChange={(e) => set('address', e.target.value)} rows={2} className="w-full rounded-lg border border-black/10 p-3 text-sm resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Telepon</label>
            <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">WhatsApp</label>
            <input value={form.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Jam Buka</label>
          <input value={form.openingHours} onChange={(e) => set('openingHours', e.target.value)} placeholder="Contoh: 10:00 - 22:00 setiap hari" className="w-full rounded-lg border border-black/10 p-3 text-sm" />
        </div>

        <div className="border-t border-black/5 pt-4">
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <input type="checkbox" checked={form.taxEnabled} onChange={(e) => set('taxEnabled', e.target.checked)} />
            Aktifkan Pajak
          </label>
          {form.taxEnabled && (
            <input type="number" min={0} max={100} value={form.taxPercent} onChange={(e) => set('taxPercent', e.target.value)}
              placeholder="Persen (%)" className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          )}
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-semibold mb-2">
            <input type="checkbox" checked={form.serviceChargeEnabled} onChange={(e) => set('serviceChargeEnabled', e.target.checked)} />
            Aktifkan Service Charge
          </label>
          {form.serviceChargeEnabled && (
            <input type="number" min={0} max={100} value={form.serviceChargePercent} onChange={(e) => set('serviceChargePercent', e.target.value)}
              placeholder="Persen (%)" className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          )}
        </div>

        <div className="border-t border-black/5 pt-4">
          <label className="text-sm font-semibold block mb-1">Durasi Reservasi Default (menit)</label>
          <input type="number" min={15} step={15} value={form.reservationDuration} onChange={(e) => set('reservationDuration', e.target.value)}
            className="w-full rounded-lg border border-black/10 p-3 text-sm" />
          <p className="text-xs text-brand-dark/40 mt-1">Dipakai untuk cek bentrok jadwal reservasi.</p>
        </div>

        {error && <p className="text-sm text-brand-red">{error}</p>}
        {saved && <p className="text-sm text-status-ready font-semibold">Tersimpan.</p>}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Menyimpan…' : 'Simpan Pengaturan'}
        </Button>
      </Card>
    </div>
  );
}
