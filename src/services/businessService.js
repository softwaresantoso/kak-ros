import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';

const businessDoc = () => doc(db, 'businesses', getBusinessId());

export async function getBusinessInfo() {
  const snap = await getDoc(businessDoc());
  return snap.exists() ? snap.data() : null;
}

/** Realtime business profile — used by the Settings form so changes made
 *  in another tab/device are reflected immediately. */
export function subscribeBusinessInfo(callback) {
  return onSnapshot(businessDoc(), (snap) => callback(snap.exists() ? snap.data() : null));
}

export async function updateBusinessInfo(data) {
  return updateDoc(businessDoc(), { ...data, updatedAt: serverTimestamp() });
}

export async function uploadBusinessLogo(file) {
  const fileRef = ref(storage, `business/${getBusinessId()}/logo-${Date.now()}-${file.name}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
