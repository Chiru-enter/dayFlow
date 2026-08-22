import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import StatusBadge from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { createConcern, getMyConcerns } from '../../services/concernService';
import { createNotificationsForAdmins } from '../../services/notificationService';

const categories = ['Workplace', 'Management', 'Compensation', 'Attendance', 'Leave', 'Harassment / Misconduct', 'Facilities', 'Other'];
const emptyForm = { subject: '', category: '', description: '' };

function Concerns() {
  const { user, loading: authLoading } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadConcerns = async () => {
    if (!user?.uid) { setConcerns([]); setLoading(false); return; }
    try {
      setLoading(true);
      setConcerns(await getMyConcerns(user.uid));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load your concerns.');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (!authLoading) loadConcerns(); }, [authLoading, user?.uid]);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError(''); setSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.uid) return setError('Please sign in before submitting a concern.');
    try {
      setSubmitting(true); setError(''); setSuccess('');
      await createConcern({
        employeeUid: user.uid,
        employeeName: user.name || user.displayName || user.email,
        employeeId: user.employeeId,
        department: user.department,
        jobTitle: user.jobTitle,
        ...form,
      });
      try {
        await createNotificationsForAdmins({
          type: 'employee-concern',
          title: 'New Employee Concern',
          message: `An employee has submitted a new concern regarding ${form.category}.`,
          link: '/admin/concerns',
        });
      } catch (notificationError) { console.error('Concern notification failed:', notificationError); }
      setForm(emptyForm); setSuccess('Your concern was submitted to HR.'); await loadConcerns();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit your concern.');
    } finally { setSubmitting(false); }
  };

  if (authLoading || loading) return <Page><Loading message="Loading your concerns..." /></Page>;
  if (!user) return <Page><div className="empty-state">Please sign in to view your concerns.</div></Page>;

  return <Page>
    <section className="panel">
      <div className="panel-header"><div><p className="eyebrow">Private HR support</p><h3>Employee Concerns</h3></div></div>
      <p className="muted-label">Have something you'd like HR to know?</p>
      <form onSubmit={handleSubmit}>
        <div className="leave-form-grid">
          <div className="field-group"><label htmlFor="concern-subject">Concern subject</label><input id="concern-subject" name="subject" value={form.subject} onChange={handleChange} required maxLength="120" /></div>
          <div className="field-group"><label htmlFor="concern-category">Category</label><select id="concern-category" name="category" value={form.category} onChange={handleChange} required><option value="">Select category</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
          <div className="field-group full-span"><label htmlFor="concern-description">Description</label><textarea id="concern-description" name="description" rows="6" value={form.description} onChange={handleChange} required maxLength="4000" /></div>
        </div>
        {error && <div className="empty-state error-state" role="alert">{error}</div>}
        {success && <div className="empty-state success-state" role="status">{success}</div>}
        <div className="leave-actions"><Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit concern'}</Button></div>
      </form>
    </section>
    <section className="panel table-panel">
      <div className="panel-header"><div><p className="eyebrow">History</p><h3>My concerns</h3></div></div>
      {concerns.length === 0 ? <div className="empty-state">No concerns submitted yet.</div> : <div className="leave-list">{concerns.map((concern) => <article className="leave-item" key={concern.id}><div><strong>{concern.subject}</strong><small>{concern.category} · {formatDate(concern.createdAt)}</small>{concern.adminResponse && <small>HR response: {concern.adminResponse}</small>}</div><div><StatusBadge label={concern.status || 'Pending'} tone={concern.status === 'Resolved' || concern.status === 'Closed' ? 'success' : concern.status === 'Under Review' ? 'warning' : 'neutral'} /><small>Updated {formatDate(concern.updatedAt)}</small></div></article>)}</div>}
    </section>
  </Page>;
}

function formatDate(value) {
  if (!value) return 'Just now';
  const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? 'Just now' : date.toLocaleDateString();
}

function Page({ children }) { return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Employee Concerns" />{children}</main></div>; }
export default Concerns;
