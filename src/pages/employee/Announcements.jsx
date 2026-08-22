import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import { getAnnouncements } from '../../services/announcementService';

function Announcements() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { getAnnouncements().then(setItems).catch(() => setError('Unable to load announcements.')); }, []);
  return <Frame title="Announcements">{items === null ? <Loading message="Loading announcements..." /> : <section className="panel"><div className="panel-header"><div><p className="eyebrow">Updates</p><h3>Announcements</h3></div></div>{error ? <div className="empty-state error-state">{error}</div> : items.length === 0 ? <div className="empty-state">No announcements available.</div> : <div className="leave-history-list">{items.map((item) => <article className="leave-history-row" key={item.id}><div><strong>{item.title}</strong><small>{item.publicationDate} {item.author ? `- ${item.author}` : ''}</small><p>{item.message}</p></div></article>)}</div>}</section>}</Frame>;
}
function Frame({ children, title }) { return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title={title} />{children}</main></div>; }
export default Announcements;
