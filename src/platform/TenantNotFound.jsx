import { buildRootUrl } from '../lib/tenant';

export default function TenantNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-white">
      <img src="/branding/kak-ros-logo.png" alt="Kak ROS" className="w-56 max-w-full mb-6" />
      <h1 className="font-bold text-xl mb-2">Restoran tidak ditemukan</h1>
      <p className="max-w-sm text-sm text-brand-dark/60 mb-6">
        Alamat ini belum terdaftar di Kak ROS. Periksa kembali penulisan alamatnya,
        atau hubungi restoran yang bersangkutan.
      </p>
      <a href={buildRootUrl()} className="text-sm font-semibold text-brand-red">Ke halaman utama Kak ROS</a>
    </div>
  );
}
