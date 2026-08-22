import { useAuth } from '../context/AuthContext';

function Navbar({
  title = 'Dashboard',
  user: providedUser,
}) {
  const { user: authenticatedUser, loading } = useAuth();
  const user = providedUser || authenticatedUser;
  const displayName = loading ? 'Loading...' : user?.name || user?.displayName || 'Employee';
  const displayRole = user?.role || 'Employee';
  const avatar = displayName === 'Loading...' ? '...' : displayName.slice(0, 2).toUpperCase();

  return (
    <header className="employee-topbar">
      <div>
        <p className="eyebrow">Employee portal</p>
        <h1 className="employee-page-title">{title}</h1>
      </div>

      <div className="employee-topbar-actions">
        <button type="button" className="icon-button" aria-label="Notifications">
          🔔
        </button>
        <button type="button" className="icon-button" aria-label="Messages">
          ✦
        </button>

        <div className="profile-pill">
          <div className="avatar">{avatar}</div>
          <div>
            <strong>{displayName}</strong>
            <small>{displayRole}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;