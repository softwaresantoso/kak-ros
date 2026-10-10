import { useState } from 'react';
import { Button } from '../components/ui/Button';
import { buildTenantUrl, isValidSlug } from '../lib/tenant';

/**
 * Platform root page (no tenant). Placeholder for now — the real marketing
 * page and self-service signup arrive in Fase 3 (see ARCHITECTURE.md).
 * The "open my restaurant" form already works so tenants can be reached
 * (and tenant resolution can be tested) from the root domain.
 */
export default function RootLanding() {
  const [slug, setSlug] = useState('');
  const normalized = slug.trim().toLowerCase();
  const valid = isValidSlug(normalized);

  function handleGo(e) {
    e.preventDefault();
    if (valid) window.location.href = buildTenantUrl(normalized);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <img src="/branding/kak-ros-logo.png" alt="Kak ROS" className="w-72 max-w-full mb-6" />
      <p className="max-w-md text-brand-dark/70 mb-8">
        Sistem operasional restoran dalam satu aplikasi: pesan via QR, dapur, kasir,
        reservasi, dan laporan.
      </p>

      <Button disabled className="mb-2">Daftarkan Restoran Anda</Button>
      <p className="text-xs text-brand-dark/40 mb-10">Pendaftaran segera dibuka.</p>

      <form onSubmit={handleGo} className="w-full max-w-sm">
        <p className="text-sm font-semibold mb-2">Sudah punya restoran di Kak ROS?</p>
        <div className="flex gap-2">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="nama-restoran"
            className="flex-1 rounded-lg border border-black/10 p-3 text-sm"
            autoCapitalize="none"
            autoCorrect="off"
          />
          <Button type="submit" disabled={!valid}>Buka</Button>
        </div>
        <p className="text-xs text-brand-dark/40 mt-2">Masukkan nama subdomain restoran Anda.</p>
      </form>

      <p className="text-xs text-brand-dark/40 mt-12">Kak ROS by SantoSoft</p>
    </div>
  );
}
