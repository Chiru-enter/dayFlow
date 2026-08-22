import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { getAllConcerns, updateConcern } from '../../services/concernService';
import { createNotification } from '../../services/notificationService';

const statuses = ['Pending', 'Under Review', 'Resolved', 'Closed'];
const categories = ['Workplace', 'Management', 'Compensation', 'Attendance', 'Leave', 'Harassment / Misconduct', 'Facilities', 'Other'];

function Concerns() {
  const [concerns, setConcerns] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', category: '' });
  const [response, setResponse] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadConcerns = async () => {
    try { setLoading(true); setConcerns(await getAllConcerns()); } catch (loadError) { setError(loadError.message || 'Unable to load concerns.'); } finally { setLoading(false); }
  };
  useEffect(() => { loadConcerns(); }, []);

  const filtered = concerns.filter((concern) => {
    const search = filters.search.toLowerCase();
    return (!filters.status || concern.status === filters.status) && (!filters.category || concern.category === filters.category) && (!search || [concern.employeeName, concern.employeeId, concern.subject].some((value) => value?.toLowerCase().includes(search)));
  });

  const openConcern = (concern) => { setSelected(concern); setResponse(concern.adminResponse || ''); setStatus(concern.status || 'Pending'); setSuccess(''); setError(''); };
  const save = async (event) => {
    event.preventDefault();
    if (!selected) return;
    try {
      setSaving(true); setError(''); setSuccess('');
      const updates = { status, adminResponse: response.trim() };
      if (status === 'Resolved') updates.resolvedAt = new Date();
      await updateConcern(selected.id, updates);
      const statusChanged = status !== selected.status;
      const responseAdded = response.trim() !== (selected.adminResponse || '').trim();
      if (statusChanged || responseAdded) {
        let title = 'Concern updated';
        let message = 'HR has updated your concern.';
        if (statusChanged) { title = `Concern ${status}`; message = `Your concern is now ${status.toLowerCase()}.`; }
        if (responseAdded) { title = 'HR has responded'; message = 'HR has responded to your concern.'; }
        try { await createNotification({ userId: selected.employeeUid, type: 'concern-updated', title, message, link: '/employee/concerns' }); } catch (notificationError) { console.error('Concern update notification failed:', notificationError); }
      }
      setConcerns((current) => current.map((item) => item.id === selected.id ? { ...item, ...updates } : item));
      setSelected((current) => ({ ...current, ...updates })); setSuccess('Concern updated successfully.');
    } catch (saveError) { setError(saveError.message || 'Unable to update concern.'); } finally { setSaving(false); }
  };

  if (loading) return <Page><Loading message="Loading employee concerns..." /></Page>;
  return <Page>
    <section className="hero-row compact"><div><p className="eyebrow">HR support</p><h2>Employee Concerns</h2></div><span>{filtered.length} concerns</span></section>
    <section className="panel">
      <div className="concern-filters"><input aria-label="Search employees or concerns" placeholder="Search employees or concerns..." value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /><select aria-label="Filter by status" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All Status</option>{statuses.map((item) => <option key={item}>{item}</option>)}</select><select aria-label="Filter by category" value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value })}><option value="">All Categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</select></div>
      {error && <div className="empty-state error-state" role="alert">{error}</div>}
      {filtered.length === 0 ? <div className="empty-state">No concerns found.</div> : <div className="concern-table-wrap"><table className="concern-table"><thead><tr><th>Employee</th><th>Employee ID</th><th>Subject</th><th>Category</th><th>Date</th><th>Status</th></tr></thead><tbody>{filtered.map((concern) => <tr key={concern.id} onClick={() => openConcern(concern)}><td>{concern.employeeName || 'Employee'}</td><td>{concern.employeeId || '—'}</td><td>{concern.subject}</td><td>{concern.category}</td><td>{formatDate(concern.createdAt)}</td><td><StatusBadge label={concern.status || 'Pending'} tone={concern.status === 'Resolved' || concern.status === 'Closed' ? 'success' : concern.status === 'Under Review' ? 'warning' : 'neutral'} /></td></tr>)}</tbody></table></div>}
    </section>
    {selected && <div className="modal-backdrop"><section className="concern-detail panel" role="dialog" aria-modal="true" aria-labelledby="concern-detail-title"><div className="panel-header"><div><p className="eyebrow">Concern details</p><h3 id="concern-detail-title">{selected.subject}</h3></div><button type="button" className="link-button" onClick={() => setSelected(null)}>Close</button></div><div className="concern-detail-grid"><div><strong>Employee</strong><span>{selected.employeeName}</span></div><div><strong>Employee ID</strong><span>{selected.employeeId || '—'}</span></div><div><strong>Department</strong><span>{selected.department || '—'}</span></div><div><strong>Job title</strong><span>{selected.jobTitle || '—'}</span></div><div><strong>Category</strong><span>{selected.category}</span></div><div><strong>Date submitted</strong><span>{formatDate(selected.createdAt)}</span></div></div><div className="concern-description"><strong>Description</strong><p>{selected.description}</p></div><form onSubmit={save}><div className="field-group"><label htmlFor="concern-status">Status</label><select id="concern-status" value={status} onChange={(event) => setStatus(event.target.value)}>{statuses.map((item) => <option key={item}>{item}</option>)}</select></div><div className="field-group"><label htmlFor="admin-response">HR response</label><textarea id="admin-response" rows="5" value={response} onChange={(event) => setResponse(event.target.value)} /></div>{success && <div className="empty-state success-state">{success}</div>}<Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save update'}</Button></form></section></div>}
  </Page>;
}

function formatDate(value) { if (!value) return 'Just now'; const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value); return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString(); }
function Page({ children }) { return <div className="dashboard-shell"><Sidebar /><main className="main-panel"><Navbar title="Employee Concerns" />{children}</main></div>; }
export default Concerns;
