import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { calculatePayslip, downloadPayslip, getPayslipHistory, savePayslip } from '../../services/payslipService';

const currentPeriod = new Date().toISOString().slice(0, 7);

function Payslips() {
  const { user, loading: authLoading } = useAuth();
  const [period, setPeriod] = useState(currentPeriod);
  const [payslip, setPayslip] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user?.uid) {
      getPayslipHistory(user.uid).then(setHistory).catch(() => setHistory([]));
    }
  }, [authLoading, user]);

  const generate = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError('');
      const nextPayslip = await calculatePayslip(user, period);
      await savePayslip(nextPayslip);
      setPayslip(nextPayslip);
      setHistory((current) => [nextPayslip, ...current.filter((item) => item.payPeriod !== period)]);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to generate payslip.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <Frame><Loading message="Preparing your payslip..." /></Frame>;
  if (!user) return <Frame><div className="empty-state">Please sign in to view payslips.</div></Frame>;

  return <Frame>
    <section className="hero-row compact"><div><p className="eyebrow">Payroll</p><h2>My payslips</h2></div></section>
    <section className="panel">
      <div className="panel-header"><div><p className="eyebrow">Pay period</p><h3>Generate payslip</h3></div></div>
      <div className="inline-actions"><input type="month" value={period} onChange={(event) => setPeriod(event.target.value)} /><Button onClick={generate}>Generate</Button></div>
      {error && <div className="empty-state error-state" role="alert">{error}</div>}
    </section>
    {payslip && <PayslipCard payslip={payslip} onDownload={() => downloadPayslip(payslip)} />}
    <section className="panel"><div className="panel-header"><div><p className="eyebrow">History</p><h3>Previous payslips</h3></div></div>{history.length === 0 ? <div className="empty-state">No generated payslips yet.</div> : <div className="leave-history-list">{history.map((item) => <div className="leave-history-row" key={item.payPeriod}><strong>{item.payPeriod}</strong><Button variant="secondary" onClick={() => setPayslip(item)}>View</Button></div>)}</div>}</section>
  </Frame>;
}

function PayslipCard({ payslip, onDownload }) {
  return <section className="panel"><div className="panel-header"><div><p className="eyebrow">{payslip.payPeriod}</p><h3>{payslip.employee.name}</h3></div><Button onClick={onDownload}>Download</Button></div><div className="payroll-profile-grid"><Info label="Employee ID" value={payslip.employee.employeeId} /><Info label="Department" value={payslip.employee.department} /><Info label="Gross earnings" value={payslip.earnings.grossEarnings} /><Info label="Net salary" value={payslip.netSalary} /></div><div className="payroll-card"><Info label="Basic salary" value={payslip.earnings.basicSalary} /><Info label="Allowances" value={payslip.earnings.allowances} /><Info label="Overtime pay" value={`${payslip.earnings.overtimePay} (${payslip.attendance.overtimeHours}h)`} /><Info label="Deductions" value={payslip.deductions.total} /><Info label="Present / half / leave" value={`${payslip.attendance.presentDays} / ${payslip.attendance.halfDays} / ${payslip.attendance.leaveDays}`} /></div></section>;
}

function Info({ label, value }) { return <div className="payroll-info-item"><span className="muted-label">{label}</span><strong>{value || 0}</strong></div>; }
function Frame({ children }) { return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Payslips" />{children}</main></div>; }
export default Payslips;
