import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getCorrections, submitCorrection } from '../../services/correctionService';
import { createNotificationsForAdmins } from '../../services/notificationService';

function AttendanceCorrection() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  useEffect(() => { if (!authLoading && user?.uid) getCorrections(user.uid).then(setItems).finally(() => setLoading(false)); }, [authLoading, user]);
  const submit = async (event) => { event.preventDefault(); if (!user?.uid) return; if (form.requestedCheckIn && form.requestedCheckOut && form.requestedCheckOut < form.requestedCheckIn) { setMessage('Requested check-out must be later than requested check-in.'); return; } try { const item = await submitCorrection(user.uid, form); await createNotificationsForAdmins({ type: 'attendance-correction', title: 'Attendance correction request', message: `${user.name || user.email} submitted a correction for ${form.date}.` }); setItems((current) => [item, ...current]); setForm({ date: '', requestedCheckIn: '', requestedCheckOut: '', reason: '' }); setMessage('Correction request submitted.'); } catch { setMessage('Unable to submit correction.'); } };
  if (authLoading || loading) return <Frame><Loading message="Loading attendance corrections..." /></Frame>;
  return <Frame><section className="panel"><div className="panel-header"><div><p className="eyebrow">Attendance</p><h3>Request a correction</h3></div></div><form onSubmit={submit}><div className="leave-form-grid"><Field label="Date" name="date" type="date" value={form.date} setForm={setForm} /><Field label="Requested check-in" name="requestedCheckIn" type="time" value={form.requestedCheckIn} setForm={setForm} /><Field label="Requested check-out" name="requestedCheckOut" type="time" value={form.requestedCheckOut} setForm={setForm} /><div className="field-group full-span"><label>Reason</label><textarea required value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} /></div></div><div className="leave-actions"><Button type="submit">Submit request</Button></div>{message && <div className="empty-state" role="status">{message}</div>}</form></section><section className="panel"><div className="panel-header"><h3>Request history</h3></div>{items.length === 0 ? <div className="empty-state">No correction requests yet.</div> : <div className="leave-history-list">{items.map((item) => <div className="leave-history-row" key={item.id}><div><strong>{item.date}</strong><small>{item.reason}</small></div><StatusBadge label={item.status} tone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'} /></div>)}</div>}</section></Frame>;
}
function Field({ label, name, type, value, setForm }) { return <div className="field-group"><label>{label}</label><input required name={name} type={type} value={value} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} /></div>; }
function Frame({ children }) { return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Attendance Correction" />{children}</main></div>; }
export default AttendanceCorrection;
