import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';

function Payroll() {
  const { user, loading } = useAuth();

  if (loading) {
    return <PayrollFrame><Loading message="Loading your payroll information..." /></PayrollFrame>;
  }

  if (!user) {
    return <PayrollFrame><div className="empty-state">Please sign in to view your payroll.</div></PayrollFrame>;
  }

  const salary = user.salary;
  const salaryFields = salary ? [
    { label: 'Base salary', value: salary.base },
    { label: 'Allowances', value: salary.allowances },
    { label: 'Deductions', value: salary.deductions },
  ].filter(({ value }) => value !== undefined && value !== null && value !== '') : [];
  const payrollStatus = user.payrollStatus || user.paymentStatus || user.payroll?.status;

  return (
    <PayrollFrame user={user}>
      <section className="hero-row compact">
        <div>
          <p className="eyebrow">Finance</p>
          <h2>Payroll</h2>
          <p className="auth-subtitle">Your payroll information and payment details.</p>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Employee</p>
            <h3>{user.name || user.displayName || 'Employee'}</h3>
          </div>
        </div>
        <div className="payroll-profile-grid">
          <InfoItem label="Employee ID" value={user.employeeId} />
          <InfoItem label="Department" value={user.department} />
          <InfoItem label="Job title" value={user.jobTitle} />
          <InfoItem label="Payment status" value={payrollStatus} />
        </div>
      </section>

      <section className="panel full-width-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Compensation</p>
            <h3>Salary information</h3>
          </div>
        </div>
        {salaryFields.length === 0 ? (
          <div className="empty-state">Payroll information is not available yet.</div>
        ) : (
          <div className="payroll-card">
            {salaryFields.map(({ label, value }) => (
              <div key={label}>
                <span className="muted-label">{label}</span>
                <strong>{formatAmount(value)}</strong>
              </div>
            ))}
          </div>
        )}
      </section>

      {!payrollStatus && <div className="empty-state">Payment status is not available yet.</div>}
    </PayrollFrame>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="payroll-info-item">
      <span className="muted-label">{label}</span>
      <strong>{value || 'Not provided'}</strong>
    </div>
  );
}

function formatAmount(value) {
  if (typeof value !== 'number') return String(value);
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
}

function PayrollFrame({ children, user }) {
  return (
    <div className="employee-page-shell">
      <Sidebar />
      <main className="employee-main-panel">
        <Navbar title="Payroll" user={user ? {
          name: user.name || user.displayName || 'Employee',
          role: user.role || 'Employee',
          avatar: (user.name || user.displayName || 'E').slice(0, 2).toUpperCase(),
        } : undefined} />
        {children}
      </main>
    </div>
  );
}

export default Payroll;
