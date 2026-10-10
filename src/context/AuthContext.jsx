import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getBusinessId } from '../lib/tenant';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [staffProfile, setStaffProfile] = useState(null); // { role, permissions, name, isActive }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (!user) {
        setStaffProfile(null);
        setLoading(false);
        return;
      }
      // Hold "loading" while the staff profile of THIS tenant is fetched, so
      // the UI can't briefly treat a valid staff member as an outsider.
      setLoading(true);
      try {
        const snap = await getDoc(doc(db, 'businesses', getBusinessId(), 'users', user.uid));
        setStaffProfile(snap.exists() ? snap.data() : null);
      } catch (e) {
        // Expected for a Firebase account that is NOT staff of this tenant:
        // Security Rules deny the read (this is tenant isolation working).
        // Treat as "no staff profile here" instead of crashing/hanging.
        console.warn('Staff profile unavailable for this tenant:', e.code || e.message);
        setStaffProfile(null);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  const logout = () => signOut(auth);

  const value = {
    firebaseUser,
    staffProfile,
    role: staffProfile?.role || null,
    isActive: staffProfile?.isActive ?? false,
    loading,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}
