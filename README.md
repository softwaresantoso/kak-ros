# Kak ROS — Restaurant Operational System by SantoSoft

Lihat `ARCHITECTURE.md` untuk rencana lengkap, keputusan arsitektur, risiko yang diketahui, dan cara uji.

## Status

- [x] **Fase 1** — Scaffold (fork dari `mas-ndomien-pos`) + rebranding (logo, icon, warna terracotta-oranye, nama)
- [x] **Fase 2** — Multi-tenant inti: tenant dibaca dari subdomain saat runtime (`src/lib/tenant.js`, `TenantContext`), semua service memakai `getBusinessId()` dinamis
- [ ] Fase 3 — Landing page marketing + signup self-service (saat ini `/` di root hanya placeholder)
- [ ] Fase 4 — Firebase project baru (bisa duluan, lihat ARCHITECTURE.md §14) + hosting/domain (§13: Pages tidak mendukung wildcard domain, butuh domain sendiri)
- [ ] Fase 5 — Migrasi Mas Ndomien jadi tenant beta pertama
- [ ] Fase 6 — Super-admin panel
- [ ] Fase 7 — QA isolasi antar-tenant **+ hardening Security Rules** (lihat ARCHITECTURE.md §11, wajib sebelum tenant pihak ketiga)
- [ ] Fase 8+ — Billing & subscription

## Menjalankan lokal

```bash
npm install
cp .env.example .env.local   # isi 6 variabel VITE_FIREBASE_*; VITE_BUSINESS_ID=kak-ros-test
npm run dev
```

Pilih tenant saat dev lewat `?tenant=<slug>` (atau `slug.localhost:5173`). Panduan uji lengkap: ARCHITECTURE.md §12.

> Project ini BELUM siap dipakai klien nyata: signup self-service, infra produksi, dan hardening rules (Fase 3, 4, 7) belum dikerjakan.
