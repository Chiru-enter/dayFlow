import { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';
import { createNotification } from '../../services/notificationService';

function LeaveManagement() {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [actionLoading, setActionLoading] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedAction, setSelectedAction] = useState(null);
  const [adminComment, setAdminComment] = useState('');

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const employees = {};
      snapshot.docs.forEach((doc) => {
        employees[doc.id] = doc.data();
      });
      return employees;
    } catch (err) {
      console.error('Error fetching employees:', err);
      return {};
    }
  };

  // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'leaveRequests'));
      const requests = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sort by updatedAt descending (newest first)
      return requests.sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0);
        const dateB = new Date(b.updatedAt || 0);
        return dateB - dateA;
      });
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      throw err;
    }
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const employees = await fetchEmployees();
        setEmployeeMap(employees);

        const requests = await fetchLeaveRequests();
        setLeaveRequests(requests);
      } catch (err) {
        console.error('Load error:', err);
        setError('Failed to load leave requests');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Open comment modal
  const openCommentModal = (request, action) => {
    setSelectedRequest(request);
    setSelectedAction(action);
    setAdminComment(request.adminComment || '');
    setShowCommentModal(true);
  };

  // Handle approve/reject
  const handleLeaveAction = async () => {
    if (!selectedRequest || !selectedAction) return;

    try {
      setActionLoading(selectedRequest.id);
      setMessage({ type: '', text: '' });

      const docRef = doc(db, 'leaveRequests', selectedRequest.id);
      const newStatus = selectedAction === 'approve' ? 'approved' : 'rejected';

      await updateDoc(docRef, {
        status: newStatus,
        adminComment: adminComment,
        updatedAt: new Date().toISOString(),
      });

      try {
        await createNotification({
          userId: selectedRequest.userId,
          type: newStatus === 'approved' ? 'leave-approved' : 'leave-rejected',
          title: newStatus === 'approved' ? 'Leave Approved' : 'Leave Request Rejected',
          message: `Your leave request for ${selectedRequest.startDate} - ${selectedRequest.endDate} has been ${newStatus}.`,
        });
      } catch (notificationError) {
        console.error('Leave decision notification failed:', notificationError);
      }

      // Update local state
      setLeaveRequests((prev) =>
        prev.map((req) =>
          req.id === selectedRequest.id
            ? {
                ...req,
                status: newStatus,
                adminComment: adminComment,
                updatedAt: new Date().toISOString(),
              }
            : req
        )
      );

      setMessage({
        type: 'success',
        text: `Leave request ${newStatus.toLowerCase()} successfully`,
      });

      setShowCommentModal(false);
      setSelectedRequest(null);
      setSelectedAction(null);
      setAdminComment('');

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error updating leave request:', err);
      setMessage({ type: 'error', text: 'Failed to update leave request' });
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTone = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Leave Management" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading leave requests...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="main-panel">
        <Navbar title="Leave Management" />

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

        {message.text && (
          <div style={{
            padding: '12px 16px',
            background: message.type === 'success' ? '#efe' : '#fee',
            border: message.type === 'success' ? '1px solid #cfc' : '1px solid #fcc',
            borderRadius: '8px',
            marginBottom: '16px',
            color: message.type === 'success' ? '#060' : '#c33',
          }}>
            {message.text}
          </div>
        )}

        {/* Header */}
        <section className="hero-row compact">
          <div>
            <p className="eyebrow">Approvals</p>
            <h2>Leave Management</h2>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {leaveRequests.length} requests
          </span>
        </section>

        {/* Leave Requests */}
        <section className="panel">
          {leaveRequests.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#9ca3af',
            }}>
              <p>No leave requests found</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gap: '16px',
            }}>
              {leaveRequests.map((request) => {
                const employee = employeeMap[request.userId] || {};
                const isPending = request.status?.toLowerCase() === 'pending';

                return (
                  <div
                    key={request.id}
                    style={{
                      padding: '20px',
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      display: 'grid',
                      gap: '16px',
                    }}
                  >
                    {/* Header row with employee and status */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '16px',
                      alignItems: 'start',
                    }}>
                      <div>
                        <div style={{
                          fontSize: '0.9rem',
                          color: '#6b7280',
                          marginBottom: '4px',
                        }}>
                          Employee
                        </div>
                        <div style={{
                          fontSize: '1.1rem',
                          fontWeight: '600',
                          color: '#111827',
                        }}>
                          {employee.name || 'Unknown Employee'}
                        </div>
                        {employee.employeeId && (
                          <div style={{
                            fontSize: '0.85rem',
                            color: '#6b7280',
                            marginTop: '4px',
                          }}>
                            ID: {employee.employeeId}
                          </div>
                        )}
                      </div>
                      <StatusBadge
                        label={request.status || 'Pending'}
                        tone={getStatusTone(request.status)}
                      />
                    </div>

                    {/* Request details grid */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '16px',
                    }}>
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}>
                          Leave Type
                        </label>
                        <div style={{ color: '#111827', fontWeight: '500' }}>
                          {request.type || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}>
                          Start Date
                        </label>
                        <div style={{ color: '#111827', fontWeight: '500' }}>
                          {request.startDate || 'N/A'}
                        </div>
                      </div>

                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}>
                          End Date
                        </label>
                        <div style={{ color: '#111827', fontWeight: '500' }}>
                          {request.endDate || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Remarks */}
                    {request.remarks && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}>
                          Remarks
                        </label>
                        <div style={{
                          color: '#111827',
                          padding: '10px 12px',
                          background: '#f9fafb',
                          borderRadius: '8px',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {request.remarks}
                        </div>
                      </div>
                    )}

                    {/* Admin Comment */}
                    {request.adminComment && (
                      <div>
                        <label style={{
                          display: 'block',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          color: '#6b7280',
                          marginBottom: '6px',
                        }}>
                          Admin Comment
                        </label>
                        <div style={{
                          color: '#111827',
                          padding: '10px 12px',
                          background: '#f0fdf4',
                          borderRadius: '8px',
                          borderLeft: '3px solid #10b981',
                          whiteSpace: 'pre-wrap',
                        }}>
                          {request.adminComment}
                        </div>
                      </div>
                    )}

                    {/* Action buttons for pending requests */}
                    {isPending && (
                      <div style={{
                        display: 'flex',
                        gap: '8px',
                        paddingTop: '8px',
                        borderTop: '1px solid #e5e7eb',
                      }}>
                        <Button
                          onClick={() => openCommentModal(request, 'approve')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? 'Processing...' : 'Approve'}
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => openCommentModal(request, 'reject')}
                          disabled={actionLoading === request.id}
                        >
                          {actionLoading === request.id ? 'Processing...' : 'Reject'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Comment Modal */}
      {showCommentModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#111827' }}>
              {selectedAction === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px',
              }}>
                Admin Comment (optional)
              </label>
              <textarea
                value={adminComment}
                onChange={(e) => setAdminComment(e.target.value)}
                placeholder="Add a comment for the employee..."
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end',
            }}>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedRequest(null);
                  setSelectedAction(null);
                  setAdminComment('');
                }}
                disabled={actionLoading !== null}
              >
                Cancel
              </Button>
              <Button
                onClick={handleLeaveAction}
                disabled={actionLoading !== null}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveManagement;