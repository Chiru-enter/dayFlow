import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import { getHolidays } from '../../services/holidayService';

function Holidays() {
  const [items, setItems] = useState(null);
  useEffect(() => { getHolidays().then(setItems).catch(() => setItems([])); }, []);
  return <Frame>{items === null ? <Loading message="Loading holidays..." /> : <section className="panel"><div className="panel-header"><div><p className="eyebrow">Calendar</p><h3>Holidays</h3></div></div>{items.length === 0 ? <div className="empty-state">No holidays available.</div> : <div className="leave-history-list">{items.map((item) => <div className="leave-history-row" key={item.id}><div><strong>{item.name}</strong><small>{item.date}</small><small>{item.description || 'Company holiday'}</small></div></div>)}</div>}</section>}</Frame>;
}
function Frame({ children }) { return <div className="employee-page-shell"><Sidebar /><main className="employee-main-panel"><Navbar title="Holidays" />{children}</main></div>; }
export default Holidays;
