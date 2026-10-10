// Run with: node scripts/seed-menu.js
// Requires: npm install firebase-admin --save-dev
// And a service account key at ./serviceAccountKey.json (never commit this file).
//
// Seeds categories + products using ONLY the data confirmed from the
// official branded menu card (photos 3 & 4 — "Pondok Es Teler Mas
// Ndomien"). Items with conflicting or unreadable prices are listed in
// MENU-DATA.md and intentionally NOT included here — see that file for
// what still needs owner confirmation before it can be added.
//
// ============================================================
// ✏️ EDIT PER CLIENT — see ONBOARDING.md Fase 3
// This whole file is Mas Ndomien's specific menu data. For a new client,
// replace BUSINESS_ID, CATEGORIES and PRODUCTS below with that client's
// own data (extracted from their menu photos the same conservative way —
// never guess an unreadable or conflicting price, flag it instead, same
// as MENU-DATA.md did here).
// ============================================================

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';

const serviceAccount = JSON.parse(readFileSync('./serviceAccountKey.json', 'utf-8'));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

const BUSINESS_ID = process.env.VITE_BUSINESS_ID || 'mas-ndomien'; // ✏️ EDIT PER CLIENT

const CATEGORIES = [ // ✏️ EDIT PER CLIENT
  { slug: 'menu-spesial', name: 'Menu Spesial', sortOrder: 1 },
  { slug: 'menu-makanan', name: 'Menu Makanan', sortOrder: 2 },
  { slug: 'nasi-goreng', name: 'Nasi Goreng', sortOrder: 3 },
  { slug: 'bakmi', name: 'Bakmi & Lain-lain', sortOrder: 4 },
  { slug: 'menu-geprek', name: 'Menu Geprek', sortOrder: 5 },
  { slug: 'hotplate', name: 'Hotplate', sortOrder: 6 },
  { slug: 'makanan-ringan', name: 'Makanan Ringan', sortOrder: 7 },
  { slug: 'es-teler', name: 'Es Teler', sortOrder: 8 },
  { slug: 'minuman', name: 'Minuman', sortOrder: 9 },
  { slug: 'aneka-jus', name: 'Aneka Jus', sortOrder: 10 },
  { slug: 'milkshake', name: 'Milkshake', sortOrder: 11 }
];

// station: 'kitchen' for food, 'beverage' for drinks — drives Kitchen
// Display System routing later (product-21).
const PRODUCTS = [ // ✏️ EDIT PER CLIENT
  // Menu Spesial
  p('Paket Keluarga', 'menu-spesial', 110000, 'kitchen', {
    description: 'Ayam panggang jowo utuh + nasi + lalapan & urapan + es teh, untuk 5 orang', isFeatured: true }),

  // Menu Makanan
  p('Nasi Ayam Panggang Jowo', 'menu-makanan', 25000, 'kitchen'),
  p('Nasi Ayam Goreng Jowo', 'menu-makanan', 25000, 'kitchen'),
  p('Nasi Nila Bakar', 'menu-makanan', 25000, 'kitchen'),
  p('Nasi Nila Goreng', 'menu-makanan', 25000, 'kitchen'),
  p('Nasi Lele Bakar', 'menu-makanan', 15000, 'kitchen'),
  p('Nasi Lele Goreng', 'menu-makanan', 15000, 'kitchen'),
  p('Nasi Sop Ayam Pecok Jowo', 'menu-makanan', 25000, 'kitchen'),

  // Nasi Goreng
  p('Nasi Goreng Original', 'nasi-goreng', 12000, 'kitchen', { isFeatured: true }),
  p('Nasi Goreng Mawut', 'nasi-goreng', 15000, 'kitchen'),
  p('Nasi Goreng Selimut', 'nasi-goreng', 15000, 'kitchen'),

  // Bakmi & Lain-lain
  p('Mi Goreng Jowo', 'bakmi', 12000, 'kitchen'),
  p('Mi Godog Jowo', 'bakmi', 12000, 'kitchen'),
  p('Indomie Goreng', 'bakmi', 12000, 'kitchen'),
  p('Indomie Kuah', 'bakmi', 12000, 'kitchen'),
  p('Kwe Tiaw Goreng', 'bakmi', 15000, 'kitchen'),
  p('Kwe Tiaw Kuah', 'bakmi', 15000, 'kitchen'),
  p('Cap Cay Goreng', 'bakmi', 15000, 'kitchen'),
  p('Cap Cay Kuah', 'bakmi', 15000, 'kitchen'),

  // Menu Geprek
  p('Nasi Ayam Geprek', 'menu-geprek', 13000, 'kitchen', { isFeatured: true }),
  p('Nasi Ayam Gepuk BBQ', 'menu-geprek', 13000, 'kitchen'),
  p('Nasi Ayam Gepuk Teriyaki', 'menu-geprek', 13000, 'kitchen'),
  p('Nasi Ayam Gepuk Lada Hitam', 'menu-geprek', 13000, 'kitchen'),

  // Hotplate — price per MENU-DATA.md §1 (official card); conflicting
  // board price of 12k is in MENU-DATA.md §2, needs owner confirmation.
  p('Chicken Hotplate', 'hotplate', 15000, 'kitchen'),
  p('Sosis Hotplate', 'hotplate', 15000, 'kitchen'),
  p('Bakso Hotplate', 'hotplate', 15000, 'kitchen'),

  // Makanan Ringan
  p('Siomai', 'makanan-ringan', 12000, 'kitchen'),
  p('Kentang Goreng', 'makanan-ringan', 12000, 'kitchen'),
  p('Sosis Goreng', 'makanan-ringan', 12000, 'kitchen'),
  p('Tahu Bakso Goreng', 'makanan-ringan', 12000, 'kitchen'),
  p('MIX (Sosis & Kentang)', 'makanan-ringan', 15000, 'kitchen'),

  // Es Teler — the brand's namesake, kept as its own category
  p('Es Teler', 'es-teler', 12000, 'beverage', { isFeatured: true }),
  p('Es Kelapa Muda', 'es-teler', 6000, 'beverage'),

  // Minuman
  minuman('Teh', 3000),
  minuman('Jeruk', 4000),
  minuman('Lemon Tea', 4000),
  minuman('Milktea', 5000),
  minuman('Kopi Hitam', 5000),
  minuman('Kopi Susu', 6000),
  minuman('Susu Jahe', 5000),
  minuman('Jahe', 5000),
  p('Susu Coklat/Putih', 'minuman', 5000, 'beverage'),

  // Aneka Jus
  p('Jus Alpukat', 'aneka-jus', 12000, 'beverage'),
  p('Jus Jambu', 'aneka-jus', 10000, 'beverage'),
  p('Jus Buah Naga', 'aneka-jus', 12000, 'beverage'),
  p('Jus Mangga', 'aneka-jus', 12000, 'beverage'),
  p('Jus Wortel', 'aneka-jus', 10000, 'beverage'),
  p('Jus Timun', 'aneka-jus', 10000, 'beverage'),
  p('Jus Tomat', 'aneka-jus', 10000, 'beverage'),

  // Milkshake
  p('Milkshake Coklat', 'milkshake', 8000, 'beverage'),
  p('Milkshake Strawberry', 'milkshake', 8000, 'beverage'),
  p('Milkshake Melon', 'milkshake', 8000, 'beverage'),
  p('Cappuccino Cincau', 'milkshake', 8000, 'beverage'),
  p('Es Coklat', 'milkshake', 6000, 'beverage')
];

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function p(name, categoryId, price, station, extra = {}) {
  return {
    name,
    slug: slugify(name),
    categoryId,
    price,
    station,
    description: extra.description || '',
    imageUrl: '',
    isAvailable: true,
    isFeatured: extra.isFeatured || false,
    isArchived: false,
    sortOrder: extra.sortOrder || 0,
    modifierGroups: extra.modifierGroups || []
  };
}

// "Panas/Dingin" drinks share one price on the card — modeled as a single
// product with a required single-select modifier group (priceDelta 0),
// instead of two near-duplicate products.
function minuman(baseName, price) {
  return p(`${baseName} Panas/Dingin`, 'minuman', price, 'beverage', {
    modifierGroups: [{
      id: 'suhu',
      name: 'Pilihan',
      type: 'single',
      required: true,
      options: [
        { id: 'panas', name: 'Panas', priceDelta: 0 },
        { id: 'dingin', name: 'Dingin', priceDelta: 0 }
      ]
    }]
  });
}

async function seed() {
  const businessRef = db.collection('businesses').doc(BUSINESS_ID);

  // ✏️ EDIT PER CLIENT — or leave as a placeholder and fill it in properly
  // via /app/settings after the first deploy (Fase 4 of ONBOARDING.md);
  // this set() uses merge:true so it won't clobber Settings-page edits
  // if the script is re-run later.
  await businessRef.set({
    name: 'Pondok Es Teler Mas Ndomien',
    currency: 'IDR',
    tax: { enabled: false, percent: 0 },
    serviceCharge: { enabled: false, percent: 0 },
    reservationSettings: { durationMinutes: 90 }
  }, { merge: true });

  const catBatch = db.batch();
  CATEGORIES.forEach((cat) => {
    catBatch.set(businessRef.collection('categories').doc(cat.slug), { ...cat, isActive: true });
  });
  await catBatch.commit();

  // Firestore batches cap at 500 writes — fine for this catalog size,
  // but chunk anyway so this script keeps working as the menu grows.
  const chunks = [];
  for (let i = 0; i < PRODUCTS.length; i += 400) chunks.push(PRODUCTS.slice(i, i + 400));

  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach((product) => {
      batch.set(businessRef.collection('products').doc(), product);
    });
    await batch.commit();
  }

  console.log(`Seeded ${CATEGORIES.length} categories and ${PRODUCTS.length} products.`);
  console.log('See MENU-DATA.md for items still pending verification before they can be added.');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
