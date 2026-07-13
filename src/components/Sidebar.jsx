import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const LINKS = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/categories', label: 'Categories' },
  { to: '/listings', label: 'Listings' },
  { to: '/listings/import', label: 'Bulk Import' },
  { to: '/sellers', label: 'Sellers' },
  { to: '/buyers', label: 'Buyers' },
  { to: '/orders', label: 'Orders & Escrow' },
  { to: '/logistics-providers', label: 'Logistics Providers' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Asset<span>Wave</span> Admin</span>
        <NotificationBell />
      </div>
      <nav>
        {LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) => (isActive ? 'active' : '')}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">{user?.full_name || user?.email}</div>
        <button className="btn-logout" onClick={logout}>Log out</button>
      </div>
    </aside>
  );
}
