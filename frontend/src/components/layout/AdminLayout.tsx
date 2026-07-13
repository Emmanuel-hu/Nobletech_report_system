import { NavLink, Outlet } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { NotificationTray } from '../feedback/NotificationTray';

const navLinks = [
  { to: '/admin/curricula', label: 'Curricula', permission: 'curriculum.view' },
  { to: '/admin/curricula/create', label: 'Create', permission: 'curriculum.create' },
  { to: '/health', label: 'Health', permission: 'curriculum.view' },
];

export const AdminLayout = () => {
  const { session, can } = useAuth();

  return (
    <div className="admin-shell">
      <header className="admin-header">
        <div>
          <p className="eyebrow">Nobletech Administrative Portal</p>
          <h1>Curriculum Authoring and Review</h1>
        </div>
        <div className="session-pill" aria-label="Current session">
          <span>User</span>
          <strong>{session.userId}</strong>
        </div>
      </header>

      <div className="admin-grid">
        <aside className="admin-nav" aria-label="Administrative navigation">
          <nav>
            {navLinks
              .filter((link) => can(link.permission))
              .map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) => (isActive ? 'admin-link active' : 'admin-link')}
                >
                  {link.label}
                </NavLink>
              ))}
          </nav>
        </aside>

        <main className="admin-main">
          <Outlet />
        </main>
      </div>

      <NotificationTray />
    </div>
  );
};
