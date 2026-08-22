import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { getOvertimeRequests, submitOvertimeRequest } from '../../services/overtimeService';

function Overtime() {
  const { user } = useAuth();
  const [form, setForm] = useState({ date: '', hours: '', reason: '' });
  const [items, setItems] = useState([]);
  useEffect(() => { if (user?.uid) getOvertimeRequests(user.uid).then(setItems).catch(() => setItems([])); }, [user]);
  const submit = async (event) => { event.preventDefault(); const item = await submitOvertimeRequest(user.uid, form); setItems((current) => [item, ...current]); setForm({ date: '', hours: '', reason: '' }); };
  return <Frame><section className="panel"><div className="panel-header"><h3>Request overtime</h3></div><form onSubmit={submit}><div className="leave-form-grid"><div className="field-group"><label>Date</label><input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} /></div><div className="field-group"><label>Hours</label><input required min="0.5" step="0.5" type="number" value={form.hours} onChange={(event) => setForm({ ...form, hours: event.target.value })} /></div><div className="field-group full-span"><label>Reason</label><textarea required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} /></div></div><div className="leave-actions"><Button type="submit">Submit overtime</Button></div></form></section><section className="panel"><div className="panel-header"><h3>Overtime history</h3></div>{items.length === 0 ? <div className="empty-state">No overtime requests yet.</div> : <div className="leave-history-list">{items.map((item) => <div className="leave-history-row" key={item.id}><div><strong>{item.date}</strong><small>{item.hours} hours - {item.reason}</small></div><StatusBadge label={item.status} tone={item.status === 'approved' ? 'success' : item.status === 'rejected' ? 'danger' : 'warning'} /></div>)}</div>}</section></Frame>;
}
function Frame({ children }) { return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Overtime" />{children}</main></div>; }
export default Overtime;
