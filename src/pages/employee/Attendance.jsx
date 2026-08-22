import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import { checkIn, checkOut, getTodayAttendance, getWeeklyAttendance } from '../../services/attendanceService';

function Attendance({ userId }) {
  const [todayRecord, setTodayRecord] = useState(null);
  const [weeklyRecords, setWeeklyRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadAttendance = async (currentUserId) => {
    if (!currentUserId) {
      setTodayRecord(null);
      setWeeklyRecords([]);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const [today, weekly] = await Promise.all([
        getTodayAttendance(currentUserId),
        getWeeklyAttendance(currentUserId),
      ]);

      setTodayRecord(today);
      setWeeklyRecords(weekly);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load attendance data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance(userId);
  }, [userId]);

  const handleCheckIn = async () => {
    if (!userId) {
      setError('Please sign in to check in.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const updatedRecord = await checkIn(userId);
      setTodayRecord(updatedRecord);
      await loadAttendance(userId);
    } catch (checkInError) {
      setError(checkInError instanceof Error ? checkInError.message : 'Check-in failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!userId) {
      setError('Please sign in to check out.');
      return;
    }

    try {
      setActionLoading(true);
      setError('');
      const updatedRecord = await checkOut(userId);
      setTodayRecord(updatedRecord);
      await loadAttendance(userId);
    } catch (checkOutError) {
      setError(checkOutError instanceof Error ? checkOutError.message : 'Check-out failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (!userId) {
    return (
      <div className="employee-page-shell">
        <Sidebar />
        <main className="employee-main-panel">
          <Navbar title="Attendance" />
          <div className="empty-state">Please sign in to view your attendance.</div>
        </main>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="employee-page-shell">
        <Sidebar />
        <main className="employee-main-panel">
          <Navbar title="Attendance" />
          <Loading message="Loading attendance data..." />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="employee-page-shell">
        <Sidebar />
        <main className="employee-main-panel">
          <Navbar title="Attendance" />
          <div className="empty-state error-state">{error}</div>
        </main>
      </div>
    );
  }

  const todayStatus = todayRecord?.status || 'Not checked in';
  const todayCheckIn = todayRecord?.checkIn ? new Date(todayRecord.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const todayCheckOut = todayRecord?.checkOut ? new Date(todayRecord.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
  const tone = todayStatus === 'Present' ? 'success' : todayStatus === 'Late' ? 'warning' : 'neutral';

  return (
    <div className="employee-page-shell">
      <Sidebar />

      <main className="employee-main-panel">
        <Navbar title="Attendance" />

        <section className="panel attendance-focus-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Today</p>
              <h3>Attendance</h3>
            </div>
            <StatusBadge label={todayStatus} tone={tone} />
          </div>

          <div className="attendance-summary-box">
            <div className="attendance-clock">
              <span>{todayRecord ? 'In office' : 'No record'}</span>
            </div>
            <div className="attendance-meta two-column">
              <div>
                <label>Check-in</label>
                <strong>{todayCheckIn}</strong>
              </div>
              <div>
                <label>Check-out</label>
                <strong>{todayCheckOut}</strong>
              </div>
            </div>
          </div>

          <div className="inline-actions">
            <Button onClick={handleCheckIn} disabled={actionLoading}>
              {actionLoading ? 'Processing...' : 'Check in'}
            </Button>
            <Button variant="secondary" onClick={handleCheckOut} disabled={actionLoading}>
              Check out
            </Button>
          </div>
        </section>

        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Weekly</p>
              <h3>Attendance log</h3>
            </div>
          </div>

          {weeklyRecords.length === 0 ? (
            <div className="empty-state">No attendance records available yet.</div>
          ) : (
            <div className="data-table">
              <div className="table-head">
                <span>Date</span>
                <span>Check-in</span>
                <span>Check-out</span>
                <span>Status</span>
              </div>

              {weeklyRecords.map((item) => {
                const checkInTime = item.checkIn ? new Date(item.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                const checkOutTime = item.checkOut ? new Date(item.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
                const recordTone = item.status === 'Late' ? 'warning' : item.status === 'Present' ? 'success' : 'neutral';

                return (
                  <div key={item.id} className="table-row">
                    <span>{item.date}</span>
                    <span>{checkInTime}</span>
                    <span>{checkOutTime}</span>
                    <StatusBadge label={item.status || 'Unknown'} tone={recordTone} />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Attendance;