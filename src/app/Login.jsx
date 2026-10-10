import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { Button } from '../components/ui/Button';

export default function Login() {
  const { login, logout, firebaseUser, isActive, loading } = useAuth();
  const { business } = useTenant();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Already logged in with an active staff profile — skip the form.
  if (firebaseUser && isActive) {
    navigate('/app/dashboard', { replace: true });
    return null;
  }

  // Signed in to Firebase, but has no active staff profile in THIS tenant
  // (e.g. staff of restaurant A opening restaurant B's address).
  if (firebaseUser && !loading && !isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-cream px-5">
        <div className="w-full max-w-sm bg-white rounded-card p-6 shadow-sm text-center">
          <h1 className="font-bold text-lg mb-2">Akun tidak terdaftar di restoran ini</h1>
          <p className="text-sm text-brand-dark/60 mb-5">
            Akun {firebaseUser.email} bukan staf aktif di {business?.name || 'restoran ini'}.
            Masuk dengan akun yang sesuai, atau hubungi Owner restoran.
          </p>
          <Button onClick={logout} className="w-full">Keluar &amp; ganti akun</Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/app/dashboard', { replace: true });
    } catch (err) {
      // Never surface raw Firebase auth error codes to staff either.
      setError('Email atau password salah, atau akun belum terdaftar.');
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white rounded-card p-6 shadow-sm">
        <h1 className="font-bold text-xl mb-1">Masuk Staff</h1>
        <p className="text-sm text-brand-dark/50 mb-5">{business?.name || 'Kak ROS'}</p>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-semibold block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
              autoComplete="username"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-black/10 p-3 text-sm"
              autoComplete="current-password"
            />
          </div>
        </div>

        {error && <p className="text-sm text-brand-red mt-3">{error}</p>}

        <Button type="submit" disabled={submitting} className="w-full mt-5">
          {submitting ? 'Masuk…' : 'Masuk'}
        </Button>
      </form>
    </div>
  );
}
