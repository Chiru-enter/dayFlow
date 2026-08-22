import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import Loading from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { getMyLeaveRequests, submitLeaveRequest } from '../../services/leaveService';
import { createNotificationsForAdmins } from '../../services/notificationService';

const defaultForm = {
  type: 'Paid Leave',
  startDate: '',
  endDate: '',
  remarks: '',
};

function Leave() {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.uid;
  const [form, setForm] = useState(defaultForm);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadLeaveRequests = async (currentUserId) => {
    if (!currentUserId) {
      setLeaveHistory([]);
      setError('');
      setSuccessMessage('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const records = await getMyLeaveRequests(currentUserId);
      setLeaveHistory(records);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    loadLeaveRequests(userId);
  }, [authLoading, userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!form.type || !form.startDate || !form.endDate || !form.remarks.trim()) {
      return 'Please complete all fields before submitting.';
    }

    if (new Date(form.endDate) < new Date(form.startDate)) {
      return 'End date must be on or after the start date.';
    }

    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!userId) {
      setError('Please sign in to submit a leave request.');
      return;
    }

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      setSuccessMessage('');
      await submitLeaveRequest(userId, form);
      try {
        await createNotificationsForAdmins({
          type: 'leave-submitted',
          title: 'New Leave Request',
          message: `${user?.name || user?.displayName || user?.email || 'An employee'} has submitted a leave request.`,
        });
      } catch (notificationError) {
        console.error('Leave request notification failed:', notificationError);
      }
      setForm(defaultForm);
      setSuccessMessage('Leave request submitted successfully.');
      await loadLeaveRequests(userId);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Leave request failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="employee-page-shell">
        <Sidebar />
        <main className="employee-main-panel">
          <Navbar title="Leave" />
          <Loading message="Checking your session..." />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="employee-page-shell">
        <Sidebar />
        <main className="employee-main-panel">
          <Navbar title="Leave" />
          <div className="empty-state">Please sign in to manage your leave requests.</div>
        </main>
      </div>
    );
  }

  const isSubmitDisabled = submitting || !form.type || !form.startDate || !form.endDate || !form.remarks.trim();

  return (
    <div className="employee-page-shell">
      <Sidebar />

      <main className="employee-main-panel">
        <Navbar title="Leave" />

        <section className="panel leave-form-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Apply</p>
              <h3>Leave request</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="leave-form-grid">
              <div className="field-group">
                <label htmlFor="leave-type">Leave type</label>
                <select
                  id="leave-type"
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  aria-invalid={!form.type}
                >
                  <option>Paid Leave</option>
                  <option>Half Day</option>
                  <option>Sick Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </div>

              <div className="field-group">
                <label htmlFor="start-date">Start date</label>
                <input
                  id="start-date"
                  name="startDate"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange}
                  aria-invalid={!form.startDate}
                />
              </div>

              <div className="field-group">
                <label htmlFor="end-date">End date</label>
                <input
                  id="end-date"
                  name="endDate"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange}
                  aria-invalid={!form.endDate}
                />
              </div>

              <div className="field-group full-span">
                <label htmlFor="remarks">Remarks</label>
                <textarea
                  id="remarks"
                  name="remarks"
                  rows="4"
                  value={form.remarks}
                  onChange={handleChange}
                  aria-invalid={!form.remarks.trim()}
                />
              </div>
            </div>

            {error && (
              <div className="empty-state error-state" role="alert">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="empty-state success-state" role="status">
                {successMessage}
              </div>
            )}

            <div className="leave-actions">
              <Button type="submit" disabled={isSubmitDisabled} aria-label="Submit leave request">
                {submitting ? 'Submitting...' : 'Submit request'}
              </Button>
            </div>
          </form>
        </section>

        <section className="panel table-panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">History</p>
              <h3>Leave requests</h3>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">Loading your leave requests...</div>
          ) : leaveHistory.length === 0 ? (
            <div className="empty-state">No leave requests yet.</div>
          ) : (
            <div className="leave-history-list">
              {leaveHistory.map((item) => {
                const tone = item.status === 'Approved' || item.status === 'approved' ? 'success' : item.status === 'Pending' || item.status === 'pending' ? 'warning' : 'danger';
                return (
                  <div key={item.id || `${item.type}-${item.startDate}`} className="leave-history-row">
                    <div>
                      <strong>{item.type}</strong>
                      <small>
                        {item.startDate} - {item.endDate}
                      </small>
                    </div>

                    <div className="leave-status-block">
                      <StatusBadge label={item.status || 'Pending'} tone={tone} />
                      <small>{item.adminComment || 'Awaiting review'}</small>
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

export default Leave;