import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, onSnapshot, query, where, orderBy, serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';

const categoriesRef = () => collection(db, 'businesses', getBusinessId(), 'categories');
const productsRef = () => collection(db, 'businesses', getBusinessId(), 'products');
const productDoc = (id) => doc(db, 'businesses', getBusinessId(), 'products', id);

/** Realtime categories, active only, sorted for menu tabs. */
export function subscribeCategories(callback) {
  const q = query(categoriesRef(), where('isActive', '==', true), orderBy('sortOrder', 'asc'));
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** Realtime products, available + not archived, sorted for menu grid. */
export function subscribeProducts(callback) {
  const q = query(
    productsRef(),
    where('isAvailable', '==', true),
    where('isArchived', '==', false),
    orderBy('sortOrder', 'asc')
  );
  return onSnapshot(q, (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** Realtime ALL products (available or not, archived or not) — for the
 *  admin Product Management list, which needs to see and toggle everything. */
export function subscribeAllProductsAdmin(callback) {
  return onSnapshot(productsRef(), (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
}

/** One-time fetch of a single product by its Firestore doc id. */
export async function getProductById(productId) {
  const snap = await getDoc(doc(productsRef(), productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Products are looked up by slug in the URL, so fetch by slug (small
 *  catalog for MVP — a client-side scan is fine; move to a slug index
 *  query if the catalog grows). */
export async function getProductBySlug(slug) {
  const snap = await getDocs(productsRef());
  const match = snap.docs.find((d) => d.data().slug === slug);
  return match ? { id: match.id, ...match.data() } : null;
}

function slugify(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export async function createProduct(data) {
  return addDoc(productsRef(), {
    ...data,
    slug: slugify(data.name),
    isArchived: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateProduct(productId, data) {
  const patch = { ...data, updatedAt: serverTimestamp() };
  if (data.name) patch.slug = slugify(data.name);
  return updateDoc(productDoc(productId), patch);
}

/** Soft delete only — never hard-delete a product that may already be
 *  referenced by historical orders (product-28: "JANGAN menghapus
 *  transaksi historis hanya karena produk dihapus dari menu"). */
export async function setProductArchived(productId, isArchived) {
  return updateDoc(productDoc(productId), { isArchived, updatedAt: serverTimestamp() });
}

export async function setProductAvailable(productId, isAvailable) {
  return updateDoc(productDoc(productId), { isAvailable, updatedAt: serverTimestamp() });
}

export async function setProductFeatured(productId, isFeatured) {
  return updateDoc(productDoc(productId), { isFeatured, updatedAt: serverTimestamp() });
}

/** Uploads a product photo to Firebase Storage and returns its public
 *  download URL, ready to store as the product's imageUrl. */
export async function uploadProductImage(productId, file) {
  const fileRef = ref(storage, `products/${productId}/${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

