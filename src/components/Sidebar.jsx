const defaultItems = [
  { label: 'Overview', active: true },
  { label: 'Attendance' },
  { label: 'Leave' },
  { label: 'Payroll' },
  { label: 'Profile' },
  { label: 'Reports' },
];

function Sidebar({ items = defaultItems, title = 'Dayflow' }) {
  return (
    <aside className="employee-sidebar">
      <div className="brand-block">
        <div className="brand-mark">D</div>
        <div>
          <div className="brand-name">{title}</div>
          <div className="brand-subtitle">Employee</div>
        </div>
      </div>

      <nav className="side-nav" aria-label="Sidebar navigation">
        {items.map((item) => (
          <button
            key={item.label}
            type="button"
            className={`nav-item ${item.active ? 'active' : ''}`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-summary">
        <p>Work status</p>
        <strong>78%</strong>
        <span>Productivity this month</span>
      </div>
    </aside>
  );
}

export default Sidebar;