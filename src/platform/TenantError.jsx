import { Button } from '../components/ui/Button';

export default function TenantError({ onRetry }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <h1 className="font-bold text-xl mb-2">Tidak dapat memuat restoran</h1>
      <p className="max-w-sm text-sm text-brand-dark/60 mb-6">
        Periksa koneksi internet Anda lalu coba lagi.
      </p>
      <Button onClick={onRetry}>Coba Lagi</Button>
    </div>
  );
}
