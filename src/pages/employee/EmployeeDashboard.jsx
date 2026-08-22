import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { getTodayAttendance } from '../../services/attendanceService';
import { getMyLeaveRequests } from '../../services/leaveService';

function EmployeeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [attendance, setAttendance] = useState(null);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');

        const [today, leaves] = await Promise.all([
          getTodayAttendance(user.uid),
          getMyLeaveRequests(user.uid),
        ]);

        setAttendance(today);
        setLeaveRequests(leaves);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load dashboard data.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authLoading, user]);

  if (authLoading || loading) {
    return (
      <DashboardFrame user={user}>
        <Loading message="Loading your dashboard..." />
      </DashboardFrame>
    );
  }

  if (!user) {
    return (
      <DashboardFrame>
        <div className="empty-state">
          Please sign in to view your dashboard.
        </div>
      </DashboardFrame>
    );
  }

  const status = attendance?.status || 'No record';

  const statusTone =
    status === 'Present'
      ? 'success'
      : status === 'Late'
        ? 'warning'
        : 'neutral';

  const formatTime = (value) =>
    value
      ? new Date(value).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '—';

  const formatAmount = (value) =>
    typeof value === 'number'
      ? new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
        }).format(value)
      : String(value ?? '—');

  const salary = user.salary || {};

  const hasSalary = [
    salary.base,
    salary.allowances,
    salary.deductions,
  ].some(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== ''
  );

  return (
    <DashboardFrame user={user}>
      <section className="hero-row compact">
        <div>
          <p className="eyebrow">Welcome back</p>
          <h2>{user.name || user.displayName || 'Employee'}</h2>
        </div>
      </section>

      {error && (
        <div className="empty-state error-state" role="alert">
          {error}
        </div>
      )}

      <div className="content-grid employee-content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Today</p>
              <h3>Attendance summary</h3>
            </div>

            <StatusBadge
              label={status}
              tone={statusTone}
            />
          </div>

          <div className="attendance-summary-box">
            <div className="attendance-clock">
              <span>
                {attendance ? 'Recorded' : 'No record'}
              </span>
            </div>

            <div className="attendance-meta two-column">
              <div>
                <label>Check-in</label>
                <strong>
                  {formatTime(attendance?.checkIn)}
                </strong>
              </div>

              <div>
                <label>Check-out</label>
                <strong>
                  {formatTime(attendance?.checkOut)}
                </strong>
              </div>
            </div>
          </div>

          <Link
            className="primary-button dashboard-link"
            to="/employee/attendance"
          >
            Open attendance
          </Link>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Requests</p>
              <h3>Recent leave</h3>
            </div>
          </div>

          {leaveRequests.length === 0 ? (
            <div className="empty-state">
              No leave requests yet.
            </div>
          ) : (
            <div className="leave-list">
              {leaveRequests.slice(0, 3).map((item) => {
                const normalizedStatus =
                  item.status?.toLowerCase();

                return (
                  <div
                    key={item.id}
                    className="leave-item"
                  >
                    <div>
                      <strong>
                        {item.type || 'Leave'}
                      </strong>

                      <small>
                        {item.startDate} - {item.endDate}
                      </small>
                    </div>

                    <StatusBadge
                      label={item.status || 'Pending'}
                      tone={
                        normalizedStatus === 'approved'
                          ? 'success'
                          : normalizedStatus === 'pending'
                            ? 'warning'
                            : 'danger'
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}

          <Link
            className="link-button dashboard-link"
            to="/employee/leave"
          >
            Manage leave
          </Link>
        </section>
      </div>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Payroll</p>
            <h3>Salary information</h3>
          </div>
        </div>

        {hasSalary ? (
          <div className="payroll-card">
            <div>
              <span className="muted-label">
                Base salary
              </span>
              <strong>
                {formatAmount(salary.base)}
              </strong>
            </div>

            <div>
              <span className="muted-label">
                Allowances
              </span>
              <strong>
                {formatAmount(salary.allowances)}
              </strong>
            </div>

            <div>
              <span className="muted-label">
                Deductions
              </span>
              <strong>
                {formatAmount(salary.deductions)}
              </strong>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            Payroll information is not available yet.
          </div>
        )}
      </section>
    </DashboardFrame>
  );
}

function DashboardFrame({ children, user }) {
  return (
    <div className="employee-page-shell">
      <Sidebar />

      <main className="employee-main-panel">
        <Navbar
          title="Dashboard"
          user={
            user
              ? {
                  name:
                    user.name ||
                    user.displayName ||
                    'Employee',
                  role: user.role || 'Employee',
                  avatar: (
                    user.name ||
                    user.displayName ||
                    'E'
                  )
                    .slice(0, 2)
                    .toUpperCase(),
                }
              : undefined
          }
        />

        {children}
      </main>
    </div>
  );
}

export default EmployeeDashboard;