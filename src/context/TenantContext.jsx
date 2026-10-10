import { createContext, useContext, useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { resolveTenant, isValidSlug, setBusinessId } from '../lib/tenant';

const TenantContext = createContext(null);

/**
 * status:
 *   'root'       — platform root domain (marketing/signup), no tenant
 *   'loading'    — tenant resolved, checking it exists in Firestore
 *   'ready'      — tenant exists; business profile available
 *   'not-found'  — invalid slug or no such restaurant
 *   'error'      — could not reach Firestore (offline / rules / config)
 */
export function TenantProvider({ children }) {
  // Resolved synchronously, BEFORE any child renders, so services calling
  // getBusinessId() during the very first render of the tenant app already
  // see the right tenant. (State initializer is idempotent, StrictMode-safe.)
  const [resolution] = useState(() => {
    const r = resolveTenant();
    if (r.mode === 'tenant' && isValidSlug(r.slug)) setBusinessId(r.slug);
    return r;
  });

  const slugIsValid = resolution.mode === 'tenant' && isValidSlug(resolution.slug);

  const [state, setState] = useState(() => {
    if (resolution.mode === 'root') return { status: 'root', business: null };
    if (!slugIsValid) return { status: 'not-found', business: null };
    return { status: 'loading', business: null };
  });
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!slugIsValid) return undefined;

    const unsub = onSnapshot(
      doc(db, 'businesses', resolution.slug),
      (snap) => {
        if (snap.exists()) {
          setState({ status: 'ready', business: snap.data() });
        } else if (snap.metadata.fromCache) {
          // Not in the local cache yet — don't declare "not found" until the
          // server has answered, otherwise a first visit on a slow/offline
          // connection would wrongly look like a missing restaurant.
          setState((s) => (s.status === 'ready' ? s : { status: 'loading', business: null }));
        } else {
          setState({ status: 'not-found', business: null });
        }
      },
      (error) => {
        console.error('Tenant lookup failed:', error);
        setState({ status: 'error', business: null });
      }
    );
    return unsub;
  }, [slugIsValid, resolution.slug, retryKey]);

  const value = {
    status: state.status,
    tenantId: slugIsValid ? resolution.slug : null,
    business: state.business,
    retry: () => {
      setState({ status: 'loading', business: null });
      setRetryKey((k) => k + 1);
    }
  };

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenant() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenant harus dipakai di dalam <TenantProvider>');
  return ctx;
}
