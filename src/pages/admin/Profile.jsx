import { useEffect, useState } from 'react';
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Loading from '../../components/Loading';
import Button from '../../components/Button';
import { db } from '../../firebase/firestore';

const emptyForm = {
  name: '',
  phone: '',
  address: '',
  jobTitle: '',
  department: '',
  joinDate: '',
  base: 0,
  allowances: 0,
  deductions: 0,
};

function Profile() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError('');
        const snapshot = await getDocs(collection(db, 'users'));
        const employeeList = snapshot.docs
          .map((item) => ({ uid: item.id, ...item.data() }))
          .filter((item) => item.role !== 'admin');
        setEmployees(employeeList);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unable to load employees.');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const selectEmployee = (employee) => {
    setSelectedEmployee(employee);
    setForm({
      name: employee.name || '',
      phone: employee.phone || '',
      address: employee.address || '',
      jobTitle: employee.jobTitle || '',
      department: employee.department || '',
      joinDate: employee.joinDate || '',
      base: employee.salary?.base || 0,
      allowances: employee.salary?.allowances || 0,
      deductions: employee.salary?.deductions || 0,
    });
    setMessage('');
    setError('');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: ['base', 'allowances', 'deductions'].includes(name) ? parseFloat(value) || 0 : value,
    }));
    setMessage('');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!selectedEmployee?.uid) return;

    try {
      setSaving(true);
      setError('');
      setMessage('');
      const updatedFields = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        jobTitle: form.jobTitle.trim(),
        department: form.department.trim(),
        joinDate: form.joinDate,
        salary: {
          base: form.base,
          allowances: form.allowances,
          deductions: form.deductions,
        },
      };

      await updateDoc(doc(db, 'users', selectedEmployee.uid), updatedFields);
      const updatedEmployee = { ...selectedEmployee, ...updatedFields };
      setSelectedEmployee(updatedEmployee);
      setEmployees((current) => current.map((employee) => employee.uid === updatedEmployee.uid ? updatedEmployee : employee));
      setMessage('Employee profile updated successfully.');
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to save employee profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <AdminFrame><Loading message="Loading employee profiles..." /></AdminFrame>;
  }

  return (
    <AdminFrame>
      <section className="hero-row compact">
        <div>
          <p className="eyebrow">Administration</p>
          <h2>Employee profiles</h2>
        </div>
        <span className="muted-label">{employees.length} employees</span>
      </section>

      {error && <div className="empty-state error-state" role="alert">{error}</div>}
      {message && <div className="empty-state success-state" role="status">{message}</div>}

      <div className="content-grid employee-content-grid">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Directory</p>
              <h3>Employees</h3>
            </div>
          </div>
          {employees.length === 0 ? (
            <div className="empty-state">No employees found.</div>
          ) : (
            <div className="leave-list">
              {employees.map((employee) => (
                <button
                  type="button"
                  className={`leave-item profile-directory-item${selectedEmployee?.uid === employee.uid ? ' selected' : ''}`}
                  key={employee.uid}
                  onClick={() => selectEmployee(employee)}
                >
                  <span>
                    <strong>{employee.name || 'Employee'}</strong>
                    <small>{employee.employeeId || employee.email || 'No identifier'}</small>
                  </span>
                  <span>
                    <small>{employee.department || 'Department not provided'}</small>
                    <small>{employee.jobTitle || 'Job title not provided'}</small>
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Selected employee</p>
              <h3>{selectedEmployee?.name || 'Choose an employee'}</h3>
            </div>
          </div>
          {!selectedEmployee ? (
            <div className="empty-state">Select an employee to view and edit their profile.</div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="leave-form-grid">
                <EditableField label="Name" name="name" value={form.name} onChange={handleChange} />
                <ReadOnlyField label="Email" value={selectedEmployee.email} />
                <ReadOnlyField label="Employee ID" value={selectedEmployee.employeeId} />
                <EditableField label="Phone" name="phone" value={form.phone} onChange={handleChange} />
                <EditableField label="Job title" name="jobTitle" value={form.jobTitle} onChange={handleChange} />
                <EditableField label="Department" name="department" value={form.department} onChange={handleChange} />
                <EditableField label="Join date" name="joinDate" type="date" value={form.joinDate} onChange={handleChange} />
                <div className="field-group full-span">
                  <label htmlFor="admin-profile-address">Address</label>
                  <textarea id="admin-profile-address" name="address" rows="3" value={form.address} onChange={handleChange} />
                </div>
                <EditableField label="Base salary" name="base" type="number" value={form.base} onChange={handleChange} />
                <EditableField label="Allowances" name="allowances" type="number" value={form.allowances} onChange={handleChange} />
                <EditableField label="Deductions" name="deductions" type="number" value={form.deductions} onChange={handleChange} />
              </div>
              <div className="leave-actions">
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
              </div>
            </form>
          )}
        </section>
      </div>
    </AdminFrame>
  );
}

function EditableField({ label, name, type = 'text', value, onChange }) {
  return (
    <div className="field-group">
      <label htmlFor={`admin-profile-${name}`}>{label}</label>
      <input id={`admin-profile-${name}`} name={name} type={type} value={value} onChange={onChange} />
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="field-group">
      <label>{label}</label>
      <input value={value || 'Not provided'} readOnly />
    </div>
  );
}

function AdminFrame({ children }) {
  return (
    <div className="dashboard-shell">
      <Sidebar />
      <main className="main-panel">
        <Navbar title="Profile" />
        {children}
      </main>
    </div>
  );
}

export default Profile;
