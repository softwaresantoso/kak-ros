# Kak ROS (Restaurant Operational System) by SantoSoft — Architecture Plan

**Status:** Pivot dari project clone single-tenant (Mas Ndomien POS) menjadi SaaS multi-tenant.
**Kabar baik:** struktur Firestore `/businesses/{businessId}/...` dan Security Rules yang sudah dibangun di Mas Ndomien POS **sudah generik per-businessId** — tidak perlu rombak total. Perubahan inti ada di satu tempat: `businessId` yang tadinya statis (env var, ditentukan saat build) sekarang harus **resolve dinamis saat runtime** dari subdomain.

---

## 1. Keputusan yang Sudah Disepakati

- Nama produk: **Kak ROS** (Restaurant Operational System) by SantoSoft
- Model: **Multi-tenant SaaS** — satu Firebase project, satu deployment, melayani banyak resto sekaligus
- Identifikasi tenant: **Subdomain** — `restoran-a.kakros.id`, `restoran-b.kakros.id`, dst
- SantoCore (platform layer bersama untuk produk SantoSoft lain) **ditunda** — dibangun nanti kalau ada produk kedua yang benar-benar butuh, bukan sekarang (hindari premature abstraction)
- Logo: wordmark teks sederhana "Kak **ROS**" (hitam + oranye terracotta), sudah dibuat

## 2. Tenant Resolution (inti perubahan teknis)

```
restoran-a.kakros.id  →  subdomain = "restoran-a"  →  businessId = "restoran-a"
kakros.id (root, tanpa subdomain)  →  marketing site + signup + "cari resto saya"
```

- `TenantContext` baru: baca `window.location.hostname` saat app start, ekstrak subdomain, simpan sebagai `tenantId` yang dipakai SEMUA service (ganti `BUSINESS_ID` dari env var statis)
- Dev lokal: dukung override lewat `?tenant=restoran-a` di URL, atau subdomain `.localhost` (browser modern + Vite dev server sudah mendukung ini secara native)
- DNS: wildcard `*.kakros.id` → Cloudflare Pages (satu deployment melayani semua subdomain)
- Root domain (`kakros.id` tanpa subdomain) dirender sebagai halaman BERBEDA — bukan tenant manapun, isinya landing page produk + form signup

## 3. Model Akun Staff Lintas-Tenant

Tidak berubah banyak dari desain lama — satu hal penting: **Firebase Auth sekarang 1 pool untuk SEMUA tenant** (bukan per-client lagi). Login tetap divalidasi lewat `businesses/{tenantId}/users/{uid}` — kalau user A login di subdomain resto B tapi tidak ada dokumen `businesses/{B}/users/{uid-A}`, otomatis ditolak (fallback `staffProfile = null`, sudah ada di `AuthContext` lama). Jadi isolasi antar tenant **otomatis didapat tanpa kode tambahan**, asal `tenantId` benar-benar dibaca dari subdomain saat ini, bukan di-cache dari login sebelumnya.

## 4. Alur Signup Self-Service (baru — ini yang bikin "SaaS" beneran)

```
kakros.id → "Daftar Resto Anda" → isi nama resto, pilih subdomain, email+password Owner
→ cek subdomain belum dipakai (Firestore rule: allow create hanya jika businessId belum ada)
→ buat Firebase Auth user → buat businesses/{slug} doc → buat businesses/{slug}/users/{uid} role OWNER
→ redirect ke {slug}.kakros.id/app/dashboard
```

Catatan teknis: pengecekan "subdomain belum dipakai" dan pembuatan dokumen harus atomik. Firestore rules mendukung `allow create: if !exists(...)` yang dievaluasi di level rule, jadi aman dari race condition dasar tanpa perlu Cloud Function — cukup untuk MVP.

## 5. Firestore Rules — perubahan minimal

Sebagian besar rules dari Mas Ndomien POS **dipakai ulang apa adanya** (sudah parametrized `{businessId}`). Tambahan:
- `match /businesses/{businessId} { allow create: if !exists(...) && <validasi field wajib>; }` — untuk signup self-service
- Collection baru `platform/admins/{uid}` — daftar admin SantoSoft (Anda), dipakai rule super-admin panel untuk `allow list` ke seluruh collection `businesses` (saat ini tidak ada use case list-semua-tenant di app biasa, jadi aman di-restrict ketat ke platform admin saja)

## 6. Super-Admin Panel (internal SantoSoft, bukan untuk tenant)

Route terpisah, misal `admin.kakros.id` atau `kakros.id/platform-admin` (diputuskan nanti) — daftar semua tenant terdaftar, status langganan, basic usage stats. **Bukan prioritas MVP**, dibangun setelah fondasi multi-tenant jalan.

## 7. Billing & Subscription — DITUNDA (Fase 2)

MVP jalan dengan semua tenant gratis/manual dulu (invite-only beta). Payment gateway (Midtrans/Xendit), plan tiers, dan feature gating baru dibangun setelah ada beberapa tenant beta yang stabil pakai sistemnya.

## 8. Migrasi dari Codebase Mas Ndomien POS

Project ini **di-fork** dari `mas-ndomien-pos` (bukan dari nol) — 90% kode (semua modul: Order, Kitchen, Cashier, Reservation, Dashboard, Reports, Products, Settings) dipakai ulang persis. Yang diubah:
1. Setiap `services/*.js` — ganti `import { BUSINESS_ID } from '../lib/firebase'` jadi baca dari `TenantContext`
2. Branding: nama "Kak ROS", logo, warna (terracotta-oranye, bukan merah Mas Ndomien — biar tidak terkesan khusus 1 resto)
3. Tambah: `TenantContext`, halaman signup, landing page marketing, root-domain routing
4. `scripts/seed-menu.js` — Mas Ndomien jadi tenant beta PERTAMA di sistem baru ini (data menunya reusable, tidak perlu entry ulang)

## 9. Roadmap Fase MVP Multi-Tenant

| Fase | Isi |
|---|---|
| 1 | Scaffold project + rebranding (logo, warna, nama) — **selesai** |
| 2 | `TenantContext` + ganti semua service dari `BUSINESS_ID` statis ke dinamis — **selesai** (lihat §10) |
| 3 | Landing page marketing + form signup self-service |
| 4 | Deploy infra: domain `kakros.id`, wildcard DNS, 1 Firebase project baru |
| 5 | Migrasi data Mas Ndomien jadi tenant beta pertama, testing isolasi antar-tenant |
| 6 | Super-admin panel dasar |
| 7 | QA khusus multi-tenant (yang paling kritis: pastikan Tenant A benar-benar TIDAK BISA lihat data Tenant B sama sekali) |
| 8+ | Billing & subscription (setelah beta stabil) |

---

## Asumsi yang diambil (dokumentasikan sesuai §49 pendekatan konservatif)

- Shared Firebase project untuk semua tenant — berarti biaya Firestore/Storage/Auth sekarang ditanggung terpusat oleh SantoSoft, bukan per-klien seperti model clone lama. Perlu dipikirkan ulang model harga supaya biaya ini ter-cover.
- Subdomain dipilih SAAT SIGNUP dan tidak mudah diganti nanti (karena jadi `businessId` yang dipakai di seluruh path Firestore) — perlu validasi ketat di form signup (lowercase, tanpa spasi, tidak bisa diubah setelah dibuat kecuali migrasi data manual).
- Tenant isolation mengandalkan Security Rules + `tenantId` yang benar dibaca dari subdomain — ini **satu-satunya** garis pertahanan antar data resto berbeda. Bug di resolusi subdomain = risiko kebocoran data lintas tenant. Butuh QA ekstra hati-hati di sini sebelum live.


---

## 10. Fase 2 — Yang Sudah Dibangun (TenantContext)

- `src/lib/tenant.js` — `resolveTenant()` (hostname → `{mode:'root'}` atau `{mode:'tenant', slug}`), `isValidSlug()` (3–40 karakter, huruf kecil/angka/strip, subdomain reserved seperti `www`, `admin`, `api` ditolak), `getBusinessId()`/`setBusinessId()`. `getBusinessId()` **melempar error** kalau dipanggil sebelum tenant ditentukan — sengaja, lebih baik gagal keras daripada diam-diam baca/tulis data tenant yang salah.
- `src/context/TenantContext.jsx` — menentukan tenant SEBELUM child pertama render, lalu memantau dokumen `businesses/{slug}` secara realtime. Status: `root` / `loading` / `ready` / `not-found` / `error`. Nama & logo restoran di Settings ikut berubah realtime di seluruh app.
- Semua service (`order`, `table`, `product`, `reservation`, `payment`, `report`, `business`) + `AuthContext` + `ReservationForm`: `BUSINESS_ID` statis → `getBusinessId()` dipanggil saat dipakai. Export `BUSINESS_ID` lama di `firebase.js` **dihapus** supaya tidak ada kode yang bisa diam-diam memakai tenant hardcoded.
- Halaman platform: `RootLanding` (placeholder, signup di Fase 3), `TenantNotFound`, `TenantError` (+ tombol coba lagi), `Splash`.
- Penyimpanan lokal (keranjang) sekarang per-tenant: `kakros-cart-v1:{tenant}`.
- Semua teks/identitas "Mas Ndomien" yang masih hardcoded dihapus; footer jadi "Powered by Kak ROS".
- `AuthContext`: akun Firebase yang BUKAN staf tenant ini dulu bisa membuat halaman macet di "Memuat…" (Security Rules menolak baca profil → error tak tertangani). Sekarang ditangani, dan `/login` menampilkan "Akun tidak terdaftar di restoran ini".

### Cara resolusi tenant

| Host | Hasil |
|---|---|
| `kakros.id`, `www.kakros.id`, subdomain reserved | root (marketing/signup) |
| `restoran-a.kakros.id` | tenant `restoran-a` |
| `restoran-a.localhost:5173` | tenant `restoran-a` (dev) |
| `localhost`, `*.pages.dev`, host lain | `?tenant=slug` (diingat per tab), lalu `VITE_BUSINESS_ID`, lalu root |

`?tenant=root` memaksa tampilan root; `?tenant=` (kosong) menghapus override yang tersimpan. Override HANYA berlaku di host non-produksi.

## 11. Catatan Penting & Risiko yang Diketahui

1. **Sesi login per-subdomain.** Subdomain berbeda = origin berbeda, jadi sesi Firebase Auth TIDAK dibagi antar restoran. Staf harus login di tiap subdomain. Ini baik untuk isolasi; konsekuensinya satu akun tidak "otomatis masuk" ke restoran lain.
2. **Firebase Auth → Authorized domains** — perlu diverifikasi di Fase 4 apakah wildcard/subdomain `*.kakros.id` perlu didaftarkan satu-satu atau cukup domain induk (login email+password biasanya tidak bergantung ini, tapi alur lain seperti link email/OAuth iya). Jangan diasumsikan; uji langsung di Fase 4.
3. **PWA manifest sama untuk semua tenant** — saat di-install, nama & icon app tetap "Kak ROS", bukan nama restoran. Manifest per-tenant (dinamis) bisa ditambahkan nanti.
4. **Hardening Security Rules (WAJIB sebelum buka ke tenant pihak ketiga, masuk Fase 7).** Rules lama dirancang untuk 1 restoran milik sendiri dan masih longgar untuk skenario multi-tenant publik:
   - `orders`/`reservations` `allow create: if true` — siapa pun bisa membuat dokumen di tenant mana pun, termasuk dengan field arbitrer (mis. `paymentStatus: 'PAID'`). Perlu validasi field saat create (status awal harus `PENDING`/`UNPAID`, dst.) dan idealnya rate-limit/App Check.
   - `counters/*` `allow read, write: if true` — pihak luar bisa mengacak penomoran order tenant lain. Perlu dibatasi ke increment yang valid.
   - Total harga order dihitung di klien dalam transaction; rules tidak memverifikasinya. Untuk tenant pihak ketiga sebaiknya dipindah ke Cloud Function.
   Untuk Mas Ndomien (milik sendiri) risikonya kecil; untuk SaaS terbuka ini harus beres dulu.
5. Dokumen `businesses/{slug}` bisa dibaca publik (dibutuhkan halaman customer), jadi keberadaan suatu subdomain bisa dicek siapa saja. Jangan simpan data sensitif di dokumen tersebut.

## 12. Cara Menguji Fase 2 (lokal)

1. Firestore Console → `businesses` → Add document, ID `kak-ros-test`, field `name` (string) = `Resto Uji Kak ROS`. (Tanpa dokumen ini tenant dianggap tidak ada → "Restoran tidak ditemukan".)
2. `npm run dev` → `http://localhost:5173/order` → tampil "Resto Uji Kak ROS", menu kosong.
3. `…/order?tenant=mas-ndomien` → menu Mas Ndomien (54 item) muncul. **Hanya lihat** — ini Firebase project yang sama dengan Mas Ndomien live, jangan buat order/ubah data.
4. `…/order?tenant=nama-ngawur` → "Restoran tidak ditemukan".
5. `…/?tenant=root` → halaman root; ketik `kak-ros-test` → Buka.
6. **Uji isolasi:** `?tenant=mas-ndomien` → `/login` pakai akun Owner Mas Ndomien → masuk dashboard. Lalu `?tenant=kak-ros-test` → buka `/login`: harus muncul "Akun tidak terdaftar di restoran ini" (bukan dashboard, bukan macet).
