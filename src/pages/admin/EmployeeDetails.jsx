import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth } from '../../firebase/auth';
import { db as firestoreDb } from '../../firebase/firestore';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';

function EmployeeDetails() {
  const { employeeId } = useParams();
  const navigate = useNavigate();

  const [employee, setEmployee] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          navigate('/login');
          return;
        }

        const userDoc = await getDoc(doc(firestoreDb, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().role === 'admin') {
          setIsAdmin(true);
        } else {
          setMessage({
            type: 'error',
            text: 'You do not have permission to access this page.',
          });
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
        setMessage({ type: 'error', text: 'Error verifying admin access' });
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Fetch employee data
  useEffect(() => {
    if (!employeeId) {
      setMessage({ type: 'error', text: 'Employee ID not found' });
      setLoading(false);
      return;
    }

    const fetchEmployee = async () => {
      try {
        setLoading(true);
        const docRef = doc(firestoreDb, 'users', employeeId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setEmployee(data);
          setFormData(data);
          setMessage({ type: '', text: '' });
        } else {
          setMessage({ type: 'error', text: 'Employee not found' });
        }
      } catch (err) {
        console.error('Error fetching employee:', err);
        setMessage({ type: 'error', text: 'Failed to load employee data' });
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      setMessage({ type: 'error', text: 'You do not have permission to edit' });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      const docRef = doc(firestoreDb, 'users', employeeId);
      const editableFields = {
        name: formData.name || '',
        phone: formData.phone || '',
        address: formData.address || '',
        jobTitle: formData.jobTitle || '',
        department: formData.department || '',
        joinDate: formData.joinDate || '',
      };
      await updateDoc(docRef, editableFields);

      setEmployee((current) => ({ ...current, ...editableFields }));
      setIsEditing(false);
      setMessage({
        type: 'success',
        text: 'Employee information updated successfully',
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving employee:', err);
      setMessage({ type: 'error', text: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(employee);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Employee Details" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading employee information...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Employee Details" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            {message.text && (
              <div style={{
                padding: '12px 16px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33',
                marginBottom: '16px',
              }}>
                {message.text}
              </div>
            )}
            <Button
              variant="secondary"
              onClick={() => navigate('/admin/employees')}
              style={{ marginTop: '16px' }}
            >
              Back to Employees
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="main-panel">
        <Navbar title="Employee Details" />

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

        {!isAdmin && (
          <div style={{
            padding: '16px',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            marginBottom: '16px',
            color: '#92400e',
          }}>
            View-only mode: You do not have permission to edit this employee.
          </div>
        )}

        <section className="hero-row compact">
          <div>
            <p className="eyebrow">Team Member</p>
            <h2>{employee.name || 'Employee'}</h2>
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Profile Picture Section */}
        {employee.profilePicUrl && (
          <div style={{
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <img
              src={employee.profilePicUrl}
              alt={employee.name}
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '12px',
                objectFit: 'cover',
                border: '2px solid #e5e7eb',
              }}
            />
          </div>
        )}

        {/* Employee Information Grid */}
        <section className="panel">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
          }}>
            {/* Employee ID */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Employee ID
              </label>
              <div style={{
                padding: '10px 12px',
                background: '#f9fafb',
                borderRadius: '8px',
                color: '#111827',
              }}>
                {employee.employeeId || 'N/A'}
              </div>
            </div>

            {/* Name - Editable */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                }}>
                  {employee.name || 'N/A'}
                </div>
              )}
            </div>

            {/* Email - Editable */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Email
              </label>
              <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                }}>
                {employee.email || 'N/A'}
              </div>
            </div>

            {/* Phone - Editable */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Phone
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                }}>
                  {employee.phone || 'N/A'}
                </div>
              )}
            </div>

            {/* Job Title - Editable */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Job Title
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.jobTitle || ''}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                }}>
                  {employee.jobTitle || 'N/A'}
                </div>
              )}
            </div>

            {/* Department - Editable */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Department
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department || ''}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                }}>
                  {employee.department || 'N/A'}
                </div>
              )}
            </div>

            {/* Join Date - Editable */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Join Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={formData.joinDate || ''}
                  onChange={(e) => handleInputChange('joinDate', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                }}>
                  {employee.joinDate || 'N/A'}
                </div>
              )}
            </div>

            {/* Address - Editable */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Address
              </label>
              {isEditing ? (
                <textarea
                  value={formData.address || ''}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    minHeight: '80px',
                  }}
                />
              ) : (
                <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                  whiteSpace: 'pre-wrap',
                }}>
                  {employee.address || 'N/A'}
                </div>
              )}
            </div>

            {/* Role - Editable (Admin only) */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.9rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#6b7280',
              }}>
                Role
              </label>
              <div style={{
                  padding: '10px 12px',
                  background: '#f9fafb',
                  borderRadius: '8px',
                  color: '#111827',
                  textTransform: 'capitalize',
                }}>
                {employee.role || 'employee'}
              </div>
            </div>
          </div>
        </section>

        {employee.salary && (
          <section className="panel" style={{ marginTop: '24px' }}>
            <div className="panel-header">
              <div>
                <p className="eyebrow">Compensation</p>
                <h3>Salary information</h3>
              </div>
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
            }}>
              <SalaryValue label="Base salary" value={employee.salary.base} />
              <SalaryValue label="Allowances" value={employee.salary.allowances} />
              <SalaryValue label="Deductions" value={employee.salary.deductions} />
            </div>
          </section>
        )}

        {/* Back Button */}
        <div style={{ marginTop: '24px' }}>
          <Button
            variant="secondary"
            onClick={() => navigate('/admin/employees')}
          >
            Back to Employees
          </Button>
        </div>
      </main>
    </div>
  );
}

function SalaryValue({ label, value }) {
  return (
    <div style={{
      padding: '10px 12px',
      background: '#f9fafb',
      borderRadius: '8px',
      color: '#111827',
    }}>
      <span style={{ display: 'block', color: '#6b7280', fontSize: '0.8rem', marginBottom: '6px' }}>{label}</span>
      <strong>{typeof value === 'number' ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value) : value || 'N/A'}</strong>
    </div>
  );
}

export default EmployeeDetails;