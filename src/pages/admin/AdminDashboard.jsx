import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { createNotification } from '../../services/notificationService';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeave: 0,
    absent: 0,
  });
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users = {};
      snapshot.docs.forEach((doc) => {
        users[doc.id] = doc.data();
      });
      setEmployeeMap(users);
      return Object.keys(users).length;
    } catch (err) {
      console.error('Error fetching users:', err);
      return 0;
    }
  };

  // Fetch today's attendance
  const fetchAttendanceToday = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const q = query(
        collection(db, 'attendance'),
        where('date', '==', today)
      );
      const snapshot = await getDocs(q);
      
      const attendanceByUserId = {};
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        attendanceByUserId[data.userId] = data.status;
      });

      return attendanceByUserId;
    } catch (err) {
      console.error('Error fetching attendance:', err);
      return {};
    }
  };

  // Fetch leave requests (pending and approved)
  const fetchLeaveRequests = async () => {
    try {
      const q = query(
        collection(db, 'leaveRequests'),
        where('status', 'in', ['Pending', 'Approved'])
      );
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return requests;
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      return [];
    }
  };

  // Calculate statistics
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const totalEmp = await fetchUsers();
        const attendanceToday = await fetchAttendanceToday();
        const leaveReqs = await fetchLeaveRequests();

        // Count present and absent
        let present = 0;
        let absent = 0;
        Object.values(attendanceToday).forEach((status) => {
          if (status === 'Present') present += 1;
          else if (status === 'Absent') absent += 1;
        });

        // Count on leave (approved leave on current date)
        const today = new Date().toISOString().slice(0, 10);
        let onLeaveCount = 0;
        leaveReqs.forEach((req) => {
          if (req.status === 'Approved') {
            if (req.startDate <= today && today <= req.endDate) {
              onLeaveCount += 1;
            }
          }
        });

        setStats({
          totalEmployees: totalEmp,
          presentToday: present,
          onLeave: onLeaveCount,
          absent: absent,
        });

        // Get pending leave requests for display
        const pending = leaveReqs.filter((r) => r.status === 'Pending');
        setLeaveRequests(pending);

        setLoading(false);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Handle approve/reject leave
  const handleLeaveAction = async (requestId, newStatus, comment = '') => {
    try {
      const request = leaveRequests.find((item) => item.id === requestId);
      const docRef = doc(db, 'leaveRequests', requestId);
      await updateDoc(docRef, {
        status: newStatus,
        adminComment: comment,
        updatedAt: new Date().toISOString(),
      });

      if (request?.userId) {
        try {
          await createNotification({
            userId: request.userId,
            type: newStatus === 'Approved' ? 'leave-approved' : 'leave-rejected',
            title: newStatus === 'Approved' ? 'Leave Approved' : 'Leave Request Rejected',
            message: `Your leave request for ${request.startDate} - ${request.endDate} has been ${newStatus.toLowerCase()}.`,
          });
        } catch (notificationError) {
          console.error('Leave decision notification failed:', notificationError);
        }
      }

      // Update local state
      setLeaveRequests((prev) =>
        prev.filter((req) => req.id !== requestId)
      );

      // Refresh stats
      const leaveReqs = await fetchLeaveRequests();
      const today = new Date().toISOString().slice(0, 10);
      let onLeaveCount = 0;
      leaveReqs.forEach((req) => {
        if (req.status === 'Approved') {
          if (req.startDate <= today && today <= req.endDate) {
            onLeaveCount += 1;
          }
        }
      });

      setStats((prev) => ({
        ...prev,
        onLeave: onLeaveCount,
      }));
    } catch (err) {
      console.error('Error updating leave request:', err);
      setError('Failed to update leave request');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Admin Dashboard" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="main-panel">
        <Navbar title="Admin Dashboard" />

        {error && (
          <div style={{
            padding: '12px 16px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#c33',
          }}>
            {error}
          </div>
        )}

        {/* Header */}
        <section className="hero-row compact">
          <div>
            <p className="eyebrow">HR Management</p>
            <h2>DAYFLOW ADMIN</h2>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="stats-grid" aria-label="Admin summary metrics">
          <article className="stat-card">
            <div className="stat-header">
              <span>Total Employees</span>
            </div>
            <div className="stat-value">{stats.totalEmployees}</div>
          </article>

          <article className="stat-card">
            <div className="stat-header">
              <span>Present Today</span>
            </div>
            <div className="stat-value">{stats.presentToday}</div>
            <div className="stat-detail" style={{ color: '#10b981' }}>
              On time
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-header">
              <span>On Leave</span>
            </div>
            <div className="stat-value">{stats.onLeave}</div>
            <div className="stat-detail" style={{ color: '#f59e0b' }}>
              Approved
            </div>
          </article>

          <article className="stat-card">
            <div className="stat-header">
              <span>Absent</span>
            </div>
            <div className="stat-value">{stats.absent}</div>
            <div className="stat-detail" style={{ color: '#ef4444' }}>
              No check-in
            </div>
          </article>
        </section>

        {/* Recent Leave Requests */}
        <section className="panel" style={{ marginTop: '24px' }}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Pending Approvals</p>
              <h3>Recent Leave Requests</h3>
            </div>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              {leaveRequests.length} pending
            </span>
          </div>

          {leaveRequests.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#9ca3af',
            }}>
              <p>No pending leave requests</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '12px',
            }}>
              {leaveRequests.map((req) => {
                const empName = employeeMap[req.userId]?.name || 'Unknown Employee';
                return (
                  <div
                    key={req.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto 1fr auto auto',
                      gap: '16px',
                      alignItems: 'center',
                      padding: '16px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ minWidth: '200px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Employee
                      </div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {empName}
                      </div>
                    </div>

                    <div style={{ minWidth: '150px' }}>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Leave Type
                      </div>
                      <div style={{ fontWeight: '600', color: '#111827' }}>
                        {req.type || 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                        Duration
                      </div>
                      <div style={{ fontSize: '0.9rem', color: '#111827' }}>
                        {req.startDate} to {req.endDate}
                      </div>
                    </div>

                    <StatusBadge
                      label={req.status}
                      tone={req.status === 'Pending' ? 'warning' : 'success'}
                    />

                    <div style={{ display: 'flex', gap: '8px', minWidth: '180px' }}>
                      <Button
                        variant="primary"
                        onClick={() =>
                          handleLeaveAction(req.id, 'Approved')
                        }
                        style={{ flex: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          handleLeaveAction(req.id, 'Rejected')
                        }
                        style={{ flex: 1 }}
                      >
                        Reject
                      </Button>
                    </div>
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

export default AdminDashboard;