import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AppShell } from './AppShell';

/**
 * Client-side route guard — this is UX convenience only. The real
 * enforcement lives in firestore.rules; never assume this component is
 * a security boundary on its own.
 */
export function ProtectedRoute({ allow, children }) {
  const { firebaseUser, role, isActive, loading } = useAuth();

  if (loading) return <div className="p-6 text-center text-brand-dark/60">Memuat…</div>;
  if (!firebaseUser || !isActive) return <Navigate to="/login" replace />;
  if (allow && !allow.includes(role)) return <Navigate to="/app/forbidden" replace />;

  return <AppShell>{children}</AppShell>;
}
