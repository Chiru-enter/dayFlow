import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from '../../services/announcementService';

const blank = { title: '', message: '', publicationDate: new Date().toISOString().slice(0, 10), author: '' };
function Announcements() {
  const [items, setItems] = useState(null); const [form, setForm] = useState(blank); const [editing, setEditing] = useState(null); const [error, setError] = useState('');
  const load = () => getAnnouncements().then(setItems).catch(() => setError('Unable to load announcements.'));
  useEffect(() => { load(); }, []);
  const submit = async (event) => { event.preventDefault(); try { if (editing) await updateAnnouncement(editing, form); else await createAnnouncement(form); setForm(blank); setEditing(null); await load(); } catch { setError('Unable to save announcement.'); } };
  const remove = async (id) => { try { await deleteAnnouncement(id); setItems((current) => current.filter((item) => item.id !== id)); } catch { setError('Unable to delete announcement.'); } };
  if (!items) return <Frame><Loading message="Loading announcements..." /></Frame>;
  return <Frame><section className="panel"><div className="panel-header"><div><p className="eyebrow">Publish</p><h3>{editing ? 'Edit announcement' : 'New announcement'}</h3></div></div><form onSubmit={submit}><div className="leave-form-grid"><Field label="Title" name="title" value={form.title} setForm={setForm} required /><Field label="Publication date" name="publicationDate" type="date" value={form.publicationDate} setForm={setForm} required /><Field label="Author" name="author" value={form.author} setForm={setForm} /><div className="field-group full-span"><label>Message</label><textarea required value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} /></div></div><div className="leave-actions"><Button type="submit">{editing ? 'Update' : 'Publish'}</Button>{editing && <Button variant="secondary" onClick={() => { setEditing(null); setForm(blank); }}>Cancel</Button>}</div></form></section>{error && <div className="empty-state error-state">{error}</div>}<section className="panel"><div className="panel-header"><h3>Published announcements</h3></div>{items.length === 0 ? <div className="empty-state">No announcements yet.</div> : <div className="leave-history-list">{items.map((item) => <div className="leave-history-row" key={item.id}><div><strong>{item.title}</strong><small>{item.publicationDate} {item.author && `- ${item.author}`}</small><p>{item.message}</p></div><div className="inline-actions"><Button variant="secondary" onClick={() => { setEditing(item.id); setForm({ title: item.title || '', message: item.message || '', publicationDate: item.publicationDate || '', author: item.author || '' }); }}>Edit</Button><Button variant="secondary" onClick={() => remove(item.id)}>Delete</Button></div></div>)}</div>}</section></Frame>;
}
function Field({ label, name, type = 'text', value, setForm, required = false }) { return <div className="field-group"><label>{label}</label><input required={required} name={name} type={type} value={value} onChange={(event) => setForm((current) => ({ ...current, [name]: event.target.value }))} /></div>; }
function Frame({ children }) { return <div className="dashboard-shell"><Sidebar /><main className="main-panel"><Navbar title="Announcements" />{children}</main></div>; }
export default Announcements;
