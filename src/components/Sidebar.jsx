import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const employeeItems = [
  { label: 'Overview', path: '/employee' },
  { label: 'Attendance', path: '/employee/attendance' },
  { label: 'Leave', path: '/employee/leave' },
  { label: 'Payroll', path: '/employee/payroll' },
  { label: 'Payslips', path: '/employee/payslips' },
  { label: 'Overtime', path: '/employee/overtime' },
  { label: 'Announcements', path: '/employee/announcements' },
  { label: 'Holidays', path: '/employee/holidays' },
  { label: 'Correction', path: '/employee/attendance-correction' },
  { label: 'Profile', path: '/employee/profile' },
  { label: 'Employee Concerns', path: '/employee/concerns' },
];

const adminItems = [
  { label: 'Overview', path: '/admin' },
  { label: 'Employees', path: '/admin/employees' },
  { label: 'Attendance', path: '/admin/attendance' },
  { label: 'Leave', path: '/admin/leave' },
  { label: 'Payroll', path: '/admin/payroll' },
  { label: 'Employee Concerns', path: '/admin/concerns' },
  { label: 'Payroll Review', path: '/admin/payroll/review' },
  { label: 'Announcements', path: '/admin/announcements' },
  { label: 'Holidays', path: '/admin/holidays' },
  { label: 'Corrections', path: '/admin/attendance-corrections' },
  { label: 'Profile', path: '/admin/profile' },
];

function Sidebar({ items, title = 'Dayflow' }) {
  const { user } = useAuth();
  const navigationItems = items || (user?.role === 'admin' ? adminItems : employeeItems);

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
        {navigationItems.map((item) => (
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