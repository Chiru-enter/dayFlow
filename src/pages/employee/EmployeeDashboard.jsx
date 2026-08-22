<<<<<<< Updated upstream
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
        const [today, leaves] = await Promise.all([getTodayAttendance(user.uid), getMyLeaveRequests(user.uid)]);
        setAttendance(today);
        setLeaveRequests(leaves);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [authLoading, user]);

  if (authLoading || loading) return <DashboardFrame user={user}><Loading message="Loading your dashboard..." /></DashboardFrame>;
  if (!user) return <DashboardFrame><div className="empty-state">Please sign in to view your dashboard.</div></DashboardFrame>;

  const status = attendance?.status || 'No record';
  const statusTone = status === 'Present' ? 'success' : status === 'Late' ? 'warning' : 'neutral';
  const formatTime = (value) => value ? new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const salary = user.salary || {};
  const hasSalary = [salary.base, salary.allowances, salary.deductions].some((value) => value !== undefined && value !== null && value !== '');

  return <DashboardFrame user={user}>
    <section className="hero-row compact"><div><p className="eyebrow">Welcome back</p><h2>{user.name || user.displayName || 'Employee'}</h2></div></section>
    {error && <div className="empty-state error-state" role="alert">{error}</div>}
    <div className="content-grid employee-content-grid">
      <section className="panel"><div className="panel-header"><div><p className="eyebrow">Today</p><h3>Attendance summary</h3></div><StatusBadge label={status} tone={statusTone} /></div><div className="attendance-summary-box"><div className="attendance-clock"><span>{attendance ? 'Recorded' : 'No record'}</span></div><div className="attendance-meta two-column"><div><label>Check-in</label><strong>{formatTime(attendance?.checkIn)}</strong></div><div><label>Check-out</label><strong>{formatTime(attendance?.checkOut)}</strong></div></div></div><Link className="primary-button dashboard-link" to="/employee/attendance">Open attendance</Link></section>
      <section className="panel"><div className="panel-header"><div><p className="eyebrow">Requests</p><h3>Recent leave</h3></div></div>{leaveRequests.length === 0 ? <div className="empty-state">No leave requests yet.</div> : <div className="leave-list">{leaveRequests.slice(0, 3).map((item) => { const normalizedStatus = item.status?.toLowerCase(); return <div key={item.id} className="leave-item"><div><strong>{item.type || 'Leave'}</strong><small>{item.startDate} - {item.endDate}</small></div><StatusBadge label={item.status || 'Pending'} tone={normalizedStatus === 'approved' ? 'success' : normalizedStatus === 'pending' ? 'warning' : 'danger'} /></div>; })}</div>}<Link className="link-button dashboard-link" to="/employee/leave">Manage leave</Link></section>
    </div>
    <section className="panel full-width-panel"><div className="panel-header"><div><p className="eyebrow">Payroll</p><h3>Salary information</h3></div></div>{hasSalary ? <div className="payroll-card"><div><span className="muted-label">Base salary</span><strong>{salary.base ?? '—'}</strong></div><div><span className="muted-label">Allowances</span><strong>{salary.allowances ?? '—'}</strong></div><div><span className="muted-label">Deductions</span><strong>{salary.deductions ?? '—'}</strong></div></div> : <div className="empty-state">Payroll information is not available yet.</div>}</section>
  </DashboardFrame>;
=======
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const styles = {
  page: { minHeight: "100vh", padding: "40px 24px", background: "#f5f7fb", color: "#172033", textAlign: "left" },
  shell: { maxWidth: "1080px", margin: "0 auto" },
  eyebrow: { margin: "0 0 8px", color: "#2563eb", fontSize: "13px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" },
  title: { margin: 0, color: "#172033", fontSize: "32px", lineHeight: 1.2 },
  subtitle: { margin: "10px 0 28px", color: "#64748b", fontSize: "16px" },
  cards: { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px", marginBottom: "26px" },
  card: { background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)" },
  label: { margin: "0 0 14px", color: "#64748b", fontSize: "14px", fontWeight: 700 },
  value: { margin: 0, color: "#172033", fontSize: "24px", fontWeight: 700 },
  note: { margin: "8px 0 0", color: "#64748b", fontSize: "14px" },
  actions: { display: "flex", flexWrap: "wrap", gap: "12px" },
  link: { display: "inline-flex", padding: "11px 16px", borderRadius: "6px", background: "#2563eb", color: "#fff", textDecoration: "none", fontWeight: 700 },
  secondaryLink: { background: "#e8eefc", color: "#1d4ed8" },
};

function EmployeeDashboard() {
  const { user, userProfile, loading } = useAuth();

  if (loading) return <main style={styles.page}><div style={styles.shell}><p>Loading your dashboard...</p></div></main>;

  const name = userProfile?.name || user?.displayName || "there";
  const salary = userProfile?.salary || {};
  const netSalary = (Number(salary.base) || 0) + (Number(salary.allowances) || 0) - (Number(salary.deductions) || 0);
  const formattedSalary = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(netSalary);

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <p style={styles.eyebrow}>Employee dashboard</p>
        <h1 style={styles.title}>Good morning, {name}</h1>
        <p style={styles.subtitle}>Here is your latest workplace overview.</p>
        <section style={styles.cards} aria-label="Workplace overview">
          <article style={styles.card}><p style={styles.label}>Today's attendance</p><p style={styles.value}>Not checked in</p><p style={styles.note}>Attendance status will appear here when available.</p></article>
          <article style={styles.card}><p style={styles.label}>Leave status</p><p style={styles.value}>Unavailable</p><p style={styles.note}>Your leave requests will appear here when available.</p></article>
          <article style={styles.card}><p style={styles.label}>Net salary</p><p style={styles.value}>{formattedSalary}</p><p style={styles.note}>Based on your current salary profile.</p></article>
        </section>
        <section style={styles.card} aria-labelledby="quick-actions">
          <h2 id="quick-actions" style={{ margin: "0 0 16px", color: "#172033", fontSize: "19px" }}>Quick actions</h2>
          <div style={styles.actions}>
            <Link to="/employee/attendance" style={styles.link}>Check in</Link>
            <Link to="/employee/leave" style={{ ...styles.link, ...styles.secondaryLink }}>Apply leave</Link>
            <Link to="/employee/profile" style={{ ...styles.link, ...styles.secondaryLink }}>View profile</Link>
          </div>
        </section>
      </div>
    </main>
  );
>>>>>>> Stashed changes
}

function DashboardFrame({ children, user }) {
  return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Dashboard" user={user ? { name: user.name || user.displayName || 'Employee', role: user.role || 'Employee', avatar: (user.name || user.displayName || 'E').slice(0, 2).toUpperCase() } : undefined} />{children}</main></div>;
}

export default EmployeeDashboard;
