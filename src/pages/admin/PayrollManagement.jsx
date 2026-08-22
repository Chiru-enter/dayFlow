import { useEffect, useState } from 'react';
import { getAllEmployees, updateEmployeeSalary } from '../../services/payrollService';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import Button from '../../components/Button';

function PayrollManagement() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Load employees on mount
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const emps = await getAllEmployees();
        setEmployees(emps);
        setFilteredEmployees(emps);
      } catch (err) {
        console.error('Error loading employees:', err);
        setError('Failed to load employee payroll data');
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = employees.filter((emp) => {
      const name = emp.name?.toLowerCase() || '';
      const email = emp.email?.toLowerCase() || '';
      const empId = emp.employeeId?.toLowerCase() || '';
      const dept = emp.department?.toLowerCase() || '';

      return (
        name.includes(lowerQuery) ||
        email.includes(lowerQuery) ||
        empId.includes(lowerQuery) ||
        dept.includes(lowerQuery)
      );
    });

    setFilteredEmployees(filtered);
  };

  // Start editing
  const handleEdit = (employee) => {
    setEditingId(employee.uid);
    setEditingData({
      base: employee.salary?.base || 0,
      allowances: employee.salary?.allowances || 0,
      deductions: employee.salary?.deductions || 0,
    });
    setMessage({ type: '', text: '' });
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  // Handle input change
  const handleInputChange = (field, value) => {
    setEditingData((prev) => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  // Save salary changes
  const handleSave = async (uid) => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      await updateEmployeeSalary(uid, editingData);

      // Update local state
      setEmployees((prev) =>
        prev.map((emp) =>
          emp.uid === uid
            ? {
                ...emp,
                salary: editingData,
              }
            : emp
        )
      );

      setEditingId(null);
      setEditingData({});
      setMessage({
        type: 'success',
        text: 'Salary updated successfully',
      });

      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Error saving salary:', err);
      setMessage({ type: 'error', text: 'Failed to save salary changes' });
    } finally {
      setSaving(false);
    }
  };

  // Calculate net salary
  const calculateNetSalary = (salary) => {
    if (!salary) return 0;
    return (salary.base || 0) + (salary.allowances || 0) - (salary.deductions || 0);
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Payroll Management" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading payroll data...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="main-panel">
        <Navbar title="Payroll Management" />

        {error && (
          <div
            style={{
              padding: '12px 16px',
              background: '#fee',
              border: '1px solid #fcc',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#c33',
            }}
          >
            {error}
          </div>
        )}

        {message.text && (
          <div
            style={{
              padding: '12px 16px',
              background: message.type === 'success' ? '#efe' : '#fee',
              border:
                message.type === 'success' ? '1px solid #cfc' : '1px solid #fcc',
              borderRadius: '8px',
              marginBottom: '16px',
              color: message.type === 'success' ? '#060' : '#c33',
            }}
          >
            {message.text}
          </div>
        )}

        {/* Header */}
        <section className="hero-row compact">
          <div>
            <p className="eyebrow">Administration</p>
            <h2>Payroll Management</h2>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {filteredEmployees.length} of {employees.length} employees
          </span>
        </section>

        {/* Search */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search by name, email, ID, or department..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-box"
            style={{ width: '100%', maxWidth: '540px' }}
          />
        </div>

        {/* Payroll Table */}
        <section className="panel">
          {filteredEmployees.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                color: '#9ca3af',
              }}
            >
              {employees.length === 0 ? (
                <p>No employees found in the system</p>
              ) : (
                <>
                  <p>No employees match your search</p>
                  <Button
                    variant="secondary"
                    onClick={() => handleSearch('')}
                    style={{ marginTop: '16px' }}
                  >
                    Clear Search
                  </Button>
                </>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                }}
              >
                <thead>
                  <tr
                    style={{
                      background: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                    }}
                  >
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Employee
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Employee ID
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Base Salary
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Allowances
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Deductions
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'right',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Net Salary
                    </th>
                    <th
                      style={{
                        padding: '12px 16px',
                        textAlign: 'center',
                        fontWeight: '600',
                        color: '#6b7280',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => {
                    const isEditing = editingId === emp.uid;
                    const salary = isEditing ? editingData : emp.salary || {};
                    const netSalary = calculateNetSalary(
                      isEditing ? editingData : salary
                    );

                    return (
                      <tr
                        key={emp.uid}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
                          background: isEditing ? '#f0fdf4' : 'transparent',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (!isEditing) {
                            e.currentTarget.style.background = '#f9fafb';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isEditing) {
                            e.currentTarget.style.background = 'transparent';
                          }
                        }}
                      >
                        <td
                          style={{
                            padding: '16px',
                            color: '#111827',
                            fontWeight: '500',
                          }}
                        >
                          {emp.name || 'N/A'}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            color: '#6b7280',
                          }}
                        >
                          {emp.employeeId || 'N/A'}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            color: '#111827',
                            textAlign: 'right',
                            fontWeight: '500',
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingData.base || 0}
                              onChange={(e) =>
                                handleInputChange('base', e.target.value)
                              }
                              style={{
                                width: '120px',
                                padding: '6px 8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                textAlign: 'right',
                              }}
                            />
                          ) : (
                            formatCurrency(salary.base)
                          )}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            color: '#111827',
                            textAlign: 'right',
                            fontWeight: '500',
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingData.allowances || 0}
                              onChange={(e) =>
                                handleInputChange('allowances', e.target.value)
                              }
                              style={{
                                width: '120px',
                                padding: '6px 8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                textAlign: 'right',
                              }}
                            />
                          ) : (
                            formatCurrency(salary.allowances)
                          )}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            color: '#111827',
                            textAlign: 'right',
                            fontWeight: '500',
                          }}
                        >
                          {isEditing ? (
                            <input
                              type="number"
                              value={editingData.deductions || 0}
                              onChange={(e) =>
                                handleInputChange('deductions', e.target.value)
                              }
                              style={{
                                width: '120px',
                                padding: '6px 8px',
                                border: '1px solid #e5e7eb',
                                borderRadius: '6px',
                                fontSize: '0.9rem',
                                textAlign: 'right',
                              }}
                            />
                          ) : (
                            formatCurrency(salary.deductions)
                          )}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            color: isEditing ? '#10b981' : '#111827',
                            textAlign: 'right',
                            fontWeight: '600',
                            background: isEditing
                              ? 'rgba(16, 185, 129, 0.05)'
                              : 'transparent',
                          }}
                        >
                          {formatCurrency(netSalary)}
                        </td>
                        <td
                          style={{
                            padding: '16px',
                            textAlign: 'center',
                          }}
                        >
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '4px' }}>
                              <Button
                                onClick={() => handleSave(emp.uid)}
                                disabled={saving}
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                              >
                                {saving ? '...' : 'Save'}
                              </Button>
                              <Button
                                variant="secondary"
                                onClick={handleCancel}
                                disabled={saving}
                                style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="secondary"
                              onClick={() => handleEdit(emp)}
                              style={{ fontSize: '0.85rem', padding: '6px 12px' }}
                            >
                              Edit
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default PayrollManagement;