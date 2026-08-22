function Navbar({
  title = 'Dashboard',
  user = { name: 'Maya Shah', role: 'HR Manager', avatar: 'MS' },
}) {
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
          <div className="avatar">{user.avatar}</div>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;