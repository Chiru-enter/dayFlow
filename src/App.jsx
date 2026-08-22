import './App.css';

const navItems = [
  { label: 'Overview', active: true },
  { label: 'Attendance' },
  { label: 'Employees' },
  { label: 'Leave' },
  { label: 'Payroll' },
  { label: 'Reports' },
];

const stats = [
  { label: 'Present today', value: '184', delta: '+12%', tone: 'success' },
  { label: 'On leave', value: '16', delta: '4 pending', tone: 'warning' },
  { label: 'Late arrivals', value: '7', delta: '-3 vs avg', tone: 'danger' },
  { label: 'Payroll', value: '$48.2K', delta: 'This month', tone: 'neutral' },
];

const attendanceData = [
  { day: 'Mon', checkIn: '09:04', checkOut: '18:06', status: 'Present' },
  { day: 'Tue', checkIn: '09:11', checkOut: '18:12', status: 'Present' },
  { day: 'Wed', checkIn: '08:59', checkOut: '17:58', status: 'Present' },
  { day: 'Thu', checkIn: '09:33', checkOut: '18:16', status: 'Late' },
  { day: 'Fri', checkIn: '09:02', checkOut: '18:04', status: 'Present' },
];

const leaves = [
  { type: 'Annual Leave', date: '24 Aug - 28 Aug', status: 'Approved', tone: 'success' },
  { type: 'Sick Leave', date: '15 Aug', status: 'Pending', tone: 'warning' },
  { type: 'Personal', date: '08 Aug', status: 'Rejected', tone: 'danger' },
];

const activity = [
  { title: 'Aisha submitted payroll approval', time: '12 mins ago' },
  { title: 'New emergency leave request', time: '2 hrs ago' },
  { title: 'Olivia checked in from remote', time: 'Today, 9:12 AM' },
  { title: 'Monthly attendance report shared', time: 'Yesterday' },
];

function App() {
  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">D</div>
          <div>
            <div className="brand-name">Dayflow</div>
            <div className="brand-subtitle">HRMS</div>
          </div>
        </div>

        <nav className="side-nav" aria-label="Sidebar navigation">
          {navItems.map((item) => (
            <button key={item.label} className={`nav-item ${item.active ? 'active' : ''}`} type="button">
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-summary">
          <p>Team utilization</p>
          <strong>87%</strong>
          <span>+4.2% vs last month</span>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="search-box">Search employees, reports...</div>

          <div className="topbar-actions">
            <button type="button" className="icon-button" aria-label="Notifications">
              🔔
            </button>
            <button type="button" className="icon-button" aria-label="Messages">
              ✦
            </button>
            <div className="profile-pill">
              <div className="avatar">M</div>
              <div>
                <strong>Maya Shah</strong>
                <small>HR Manager</small>
              </div>
            </div>
          </div>
        </header>

        <section className="hero-row">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h1>Good morning, Maya.</h1>
          </div>
          <button type="button" className="primary-button">+ Add employee</button>
        </section>

        <section className="stats-grid" aria-label="Key metrics">
          {stats.map((stat) => (
            <article key={stat.label} className={`stat-card ${stat.tone}`}>
              <div className="stat-header">
                <span>{stat.label}</span>
                <span className="mini-icon">↗</span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-detail">{stat.delta}</div>
            </article>
          ))}
        </section>

        <div className="content-grid">
          <section className="panel attendance-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Today</p>
                <h2>Attendance</h2>
              </div>
              <span className="status-pill success">Present</span>
            </div>

            <div className="attendance-focus">
              <div className="time-badge">8h 42m</div>
              <div className="attendance-meta">
                <div>
                  <label>Check-in</label>
                  <strong>09:02 AM</strong>
                </div>
                <div>
                  <label>Check-out</label>
                  <strong>05:44 PM</strong>
                </div>
              </div>
            </div>

            <div className="attendance-actions">
              <button type="button" className="primary-button">Check In</button>
              <button type="button" className="secondary-button">Check Out</button>
            </div>

            <div className="attendance-table">
              <div className="table-head">
                <span>Day</span>
                <span>Check-in</span>
                <span>Check-out</span>
                <span>Status</span>
              </div>
              {attendanceData.map((row) => (
                <div key={row.day} className="table-row">
                  <span>{row.day}</span>
                  <span>{row.checkIn}</span>
                  <span>{row.checkOut}</span>
                  <span className={`row-status ${row.status === 'Late' ? 'warning' : 'success'}`}>
                    {row.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel activity-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Updates</p>
                <h2>Recent activity</h2>
              </div>
            </div>

            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item.title}>
                  <div className="dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <small>{item.time}</small>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="lower-grid">
          <section className="panel leave-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Requests</p>
                <h2>Leave</h2>
              </div>
              <button type="button" className="link-button">View all</button>
            </div>

            <div className="leave-form">
              <div className="field-group">
                <label>Leave type</label>
                <select defaultValue="Annual Leave">
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Personal</option>
                </select>
              </div>
              <div className="field-group">
                <label>Date range</label>
                <input type="text" defaultValue="24 Aug - 28 Aug" />
              </div>
              <button type="button" className="primary-button full-width">Submit request</button>
            </div>

            <div className="leave-list">
              {leaves.map((leave) => (
                <div key={leave.type} className="leave-item">
                  <div>
                    <strong>{leave.type}</strong>
                    <small>{leave.date}</small>
                  </div>
                  <span className={`status-pill ${leave.tone}`}>{leave.status}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="panel payroll-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Finance</p>
                <h2>Payroll overview</h2>
              </div>
            </div>

            <div className="payroll-stack">
              <div className="payroll-row">
                <span>Net payroll</span>
                <strong>$48.2K</strong>
              </div>
              <div className="payroll-row">
                <span>Pending approvals</span>
                <strong>6</strong>
              </div>
              <div className="payroll-row">
                <span>Reimbursements</span>
                <strong>$4.8K</strong>
              </div>
              <div className="payroll-row">
                <span>Tax estimate</span>
                <strong>$9.4K</strong>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default App;
