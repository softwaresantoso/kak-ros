import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTenant } from '../context/TenantContext';
import { PoweredByKakRos } from './PoweredByKakRos';
import { ROLES } from '../constants';

const NAV_ITEMS = [
  { to: '/app/dashboard', label: 'Dashboard', roles: [ROLES.OWNER, ROLES.ADMIN, ROLES.KITCHEN_CASHIER] },
  { to: '/app/orders', label: 'Order', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/reservations', label: 'Reservasi', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/tables', label: 'Meja', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/kitchen', label: 'Dapur', roles: [ROLES.OWNER, ROLES.KITCHEN_CASHIER] },
  { to: '/app/cashier', label: 'Kasir', roles: [ROLES.OWNER, ROLES.KITCHEN_CASHIER] },
  { to: '/app/products', label: 'Menu', roles: [ROLES.OWNER, ROLES.ADMIN] },
  { to: '/app/reports', label: 'Laporan', roles: [ROLES.OWNER] },
  { to: '/app/settings', label: 'Pengaturan', roles: [ROLES.OWNER] }
];

function NavLinks({ items, onNavigate }) {
  return (
    <nav className="flex flex-col gap-1 flex-1">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `px-3 py-2.5 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-red/10 text-brand-red' : 'text-brand-dark/70 hover:bg-black/5'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppShell({ children }) {
  const { role, staffProfile, logout } = useAuth();
  const { business } = useTenant();
  const businessName = business?.name || 'Kak ROS';
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const items = NAV_ITEMS.filter((item) => item.roles.includes(role));
  const currentLabel = items.find((item) => location.pathname.startsWith(item.to))?.label || 'Dashboard';

  // Close the drawer automatically whenever the route changes (tapping a
  // link already closes it via onNavigate below, but this also covers
  // back/forward navigation and deep links).
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar — unchanged, plenty of room on wider screens */}
      <aside className="hidden md:flex md:flex-col md:w-56 border-r border-black/5 bg-white p-4">
        <p className="font-bold text-brand-red mb-6 px-2 truncate">{businessName}</p>
        <NavLinks items={items} />
        <div className="px-2 pt-4 border-t border-black/5">
          <p className="text-xs text-brand-dark/50 mb-2">{staffProfile?.name} · {role}</p>
          <button onClick={handleLogout} className="text-xs font-semibold text-brand-red">Keluar</button>
        </div>
        <PoweredByKakRos className="!py-2" />
      </aside>

      {/* Mobile top bar — hamburger opens the slide-in drawer below */}
      <div className="md:hidden sticky top-0 z-30 bg-white border-b border-black/5 px-4 py-3 flex items-center justify-between"
        style={{ paddingTop: 'calc(0.75rem + env(safe-area-inset-top, 0px))' }}>
        <button onClick={() => setDrawerOpen(true)} className="p-1 -ml-1" aria-label="Buka menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <p className="font-bold text-sm">{currentLabel}</p>
        <NavLink to="/app/dashboard" className="p-1 -mr-1" aria-label="Dashboard">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" />
          </svg>
        </NavLink>
      </div>

      {/* Mobile slide-in drawer */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex" onClick={() => setDrawerOpen(false)}>
          <div className="w-72 max-w-[80vw] bg-white h-full flex flex-col p-4" onClick={(e) => e.stopPropagation()}
            style={{ paddingTop: 'calc(1rem + env(safe-area-inset-top, 0px))' }}>
            <p className="font-bold text-brand-red mb-6 px-2 truncate">{businessName}</p>
            <NavLinks items={items} onNavigate={() => setDrawerOpen(false)} />
            <div className="px-2 pt-4 border-t border-black/5">
              <p className="text-xs text-brand-dark/50 mb-2">{staffProfile?.name} · {role}</p>
              <button onClick={handleLogout} className="text-xs font-semibold text-brand-red">Keluar</button>
            </div>
            <PoweredByKakRos className="!py-2" />
          </div>
          <div className="flex-1 bg-black/40" />
        </div>
      )}

      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
