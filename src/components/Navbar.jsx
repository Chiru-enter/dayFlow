import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

function Navbar({
  title = 'Dashboard',
  user: providedUser,
}) {
  const { user: authenticatedUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const accountRef = useRef(null);
  const user = providedUser || authenticatedUser;
  const displayName = loading ? 'Loading...' : user?.name || user?.displayName || 'Employee';
  const displayRole = user?.role || 'Employee';
  const avatar = displayName === 'Loading...' ? '...' : displayName.slice(0, 2).toUpperCase();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!accountRef.current?.contains(event.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate('/login', { replace: true });
  };

  return (
    <header className="employee-topbar">
      <div>
        <p className="eyebrow">Employee portal</p>
        <h1 className="employee-page-title">{title}</h1>
      </div>

      <div className="employee-topbar-actions">
        <NotificationBell />

        <div className="account-menu" ref={accountRef}>
          <button type="button" className="profile-pill account-button" onClick={() => setMenuOpen((current) => !current)} aria-expanded={menuOpen} aria-haspopup="menu">
          <div className="avatar">{avatar}</div>
          <div>
            <strong>{displayName}</strong>
            <small>{displayRole}</small>
          </div>
          </button>
          {menuOpen && <div className="account-dropdown" role="menu">
            <strong>{displayName}</strong>
            <small>{user?.email || 'Email unavailable'}</small>
            <small>{displayRole}</small>
            <button type="button" onClick={handleLogout} role="menuitem">Logout</button>
          </div>}
        </div>
      </div>
    </header>
  );
}

export default Navbar;