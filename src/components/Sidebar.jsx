import { NavLink } from 'react-router-dom';

const defaultItems = [
  { label: 'Overview', path: '/employee' },
  { label: 'Attendance', path: '/employee/attendance' },
  { label: 'Leave', path: '/employee/leave' },
  { label: 'Payroll', path: '/employee/payroll' },
  { label: 'Profile', path: '/employee/profile' },
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
          <NavLink
            key={item.label}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

    </aside>
  );
}

export default Sidebar;