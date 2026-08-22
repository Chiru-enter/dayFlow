import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';
import Button from '../../components/Button';

function Employees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch employees from Firestore
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(collection(db, 'users'));
        const employeeList = snapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
        }));

        setEmployees(employeeList);
        setFilteredEmployees(employeeList);
      } catch (err) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employee data');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
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

  // Navigate to employee details
  const handleRowClick = (uid) => {
    setSelectedEmployeeId(uid);
    // Navigate to EmployeeDetails with employee UID
    navigate(`/admin/employees/${uid}`);
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Employee Management" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading employees...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="main-panel">
        <Navbar title="Employee Management" />

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
            <p className="eyebrow">Team Management</p>
            <h2>Employees</h2>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {filteredEmployees.length} of {employees.length}
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

        {/* Table */}
        <section className="panel">
          {filteredEmployees.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#9ca3af',
            }}>
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
            <div style={{
              overflowX: 'auto',
            }}>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem',
                }}
              >
                <thead>
                  <tr style={{
                    background: '#f9fafb',
                    borderBottom: '1px solid #e5e7eb',
                  }}>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Employee
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Employee ID
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Department
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Job Title
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Email
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.uid}
                      onClick={() => handleRowClick(emp.uid)}
                      style={{
                        borderBottom: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <td style={{
                        padding: '16px',
                        color: '#111827',
                        fontWeight: '500',
                      }}>
                        {emp.name || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#6b7280',
                      }}>
                        {emp.employeeId || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#6b7280',
                      }}>
                        {emp.department || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#6b7280',
                      }}>
                        {emp.jobTitle || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                        color: '#6b7280',
                        fontSize: '0.85rem',
                      }}>
                        {emp.email || 'N/A'}
                      </td>
                      <td style={{
                        padding: '16px',
                      }}>
                        <StatusBadge
                          label={emp.role === 'admin' ? 'Admin' : 'Active'}
                          tone={emp.role === 'admin' ? 'warning' : 'success'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Employees;