import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';

const stats = [
  { label: 'Present today', value: '184', delta: '+12% vs last week', tone: 'success' },
  { label: 'Leave balance', value: '18 days', delta: '4 remaining this quarter', tone: 'warning' },
  { label: 'Net pay', value: '$4,280', delta: 'This month', tone: 'neutral' },
  { label: 'Working hours', value: '168h', delta: 'Target met', tone: 'success' },
];

const activities = [
  { title: 'Payroll approved for August', time: '12 minutes ago' },
  { title: 'Leave request submitted for 24 Aug', time: '1 hour ago' },
  { title: 'Attendance report synced', time: 'Today, 9:12 AM' },
  { title: 'Team check-in reminder sent', time: 'Yesterday' },
];

const quickActions = ['Clock in', 'Request leave', 'View payslip', 'Update profile'];

function EmployeeDashboard() {
  return (
    <div className="employee-page-shell">
      <Sidebar />

      <main className="employee-main-panel">
        <Navbar title="Dashboard" />

        <section className="hero-row compact">
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2>Good morning, Maya.</h2>
          </div>
          <Button>+ Add time entry</Button>
        </section>

        <section className="stats-grid employee-stats" aria-label="Employee key metrics">
          {stats.map((stat) => (
            <article key={stat.label} className="stat-card employee-stat-card">
              <div className="stat-header">
                <span>{stat.label}</span>
                <span className="mini-icon">↗</span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-detail">{stat.delta}</div>
            </article>
          ))}
        </section>

        <div className="content-grid employee-content-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Today</p>
                <h3>Attendance summary</h3>
              </div>
              <StatusBadge label="Present" tone="success" />
            </div>

            <div className="attendance-summary-box">
              <div className="attendance-clock">
                <span>8h 42m</span>
              </div>
              <div className="attendance-meta two-column">
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

            <div className="inline-actions">
              <Button>Check in</Button>
              <Button variant="secondary">Check out</Button>
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Overview</p>
                <h3>Leave summary</h3>
              </div>
            </div>

            <div className="leave-summary-box">
              <div className="summary-number">18</div>
              <div>
                <strong>Available days</strong>
                <small>4 days used this quarter</small>
              </div>
            </div>

            <div className="status-list">
              <div className="list-row">
                <span>Approved</span>
                <StatusBadge label="2" tone="success" />
              </div>
              <div className="list-row">
                <span>Pending</span>
                <StatusBadge label="1" tone="warning" />
              </div>
              <div className="list-row">
                <span>Rejected</span>
                <StatusBadge label="0" tone="danger" />
              </div>
            </div>
          </section>
        </div>

        <div className="lower-grid employee-lower-grid">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Quick actions</p>
                <h3>Ready to go</h3>
              </div>
            </div>

            <div className="quick-actions-grid">
              {quickActions.map((action) => (
                <button key={action} type="button" className="quick-action-button">
                  {action}
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Payroll</p>
                <h3>Current payout</h3>
              </div>
            </div>

            <div className="payroll-card">
              <div>
                <span className="muted-label">Gross salary</span>
                <strong>$5,000</strong>
              </div>
              <div>
                <span className="muted-label">Net pay</span>
                <strong>$4,280</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="panel full-width-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Updates</p>
              <h3>Recent activity</h3>
            </div>
          </div>

          <ul className="activity-list">
            {activities.map((item) => (
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
      </main>
    </div>
  );
}

export default EmployeeDashboard;