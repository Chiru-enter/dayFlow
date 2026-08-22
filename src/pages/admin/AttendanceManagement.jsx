import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firestore';
import Sidebar from '../../components/Sidebar';
import Navbar from '../../components/Navbar';
import StatusBadge from '../../components/StatusBadge';

function AttendanceManagement() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [employeeMap, setEmployeeMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch all attendance records
  const fetchAttendance = async () => {
    try {
      const q = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return records;
    } catch (err) {
      console.error('Error fetching attendance:', err);
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

        const records = await fetchAttendance();
        setAttendance(records);
        setFilteredAttendance(records);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load attendance data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle search and date filtering
  useEffect(() => {
    let filtered = attendance;

    // Filter by search query
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter((record) => {
        const employee = employeeMap[record.userId] || {};
        const name = employee.name?.toLowerCase() || '';
        const empId = employee.employeeId?.toLowerCase() || '';
        return name.includes(lowerQuery) || empId.includes(lowerQuery);
      });
    }

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((record) => record.date === selectedDate);
    }

    setFilteredAttendance(filtered);
  }, [searchQuery, selectedDate, attendance, employeeMap]);

  // Format time for display
  const formatTime = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return 'N/A';
    }
  };

  // Get status tone for badge
  const getStatusTone = (status) => {
    switch (status) {
      case 'Present':
        return 'success';
      case 'Absent':
        return 'danger';
      case 'Late':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-shell">
        <Sidebar />
        <main className="main-panel">
          <Navbar title="Attendance Management" />
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p>Loading attendance records...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="main-panel">
        <Navbar title="Attendance Management" />

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
            <p className="eyebrow">Records</p>
            <h2>Attendance Management</h2>
          </div>
          <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
            {filteredAttendance.length} of {attendance.length} records
          </span>
        </section>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}>
          <input
            type="text"
            placeholder="Search by employee name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-box"
            style={{ width: '100%' }}
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{
              padding: '10px 12px',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
            }}
          />
          {(searchQuery || selectedDate) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedDate('');
              }}
              style={{
                padding: '10px 12px',
                background: '#f3f4f6',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Table */}
        <section className="panel">
          {filteredAttendance.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: '#9ca3af',
            }}>
              {attendance.length === 0 ? (
                <p>No attendance records found</p>
              ) : (
                <>
                  <p>No records match your filters</p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedDate('');
                    }}
                    style={{
                      marginTop: '16px',
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: '500',
                    }}
                  >
                    Clear Filters
                  </button>
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
                      Date
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Check In
                    </th>
                    <th style={{
                      padding: '12px 16px',
                      textAlign: 'left',
                      fontWeight: '600',
                      color: '#6b7280',
                    }}>
                      Check Out
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
                  {filteredAttendance.map((record) => {
                    const employee = employeeMap[record.userId] || {};
                    return (
                      <tr
                        key={record.id}
                        style={{
                          borderBottom: '1px solid #e5e7eb',
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
                          {employee.name || 'Unknown'}
                          {employee.employeeId && (
                            <div style={{
                              fontSize: '0.8rem',
                              color: '#6b7280',
                              marginTop: '4px',
                            }}>
                              {employee.employeeId}
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: '16px',
                          color: '#6b7280',
                        }}>
                          {record.date || 'N/A'}
                        </td>
                        <td style={{
                          padding: '16px',
                          color: '#111827',
                          fontWeight: '500',
                        }}>
                          {formatTime(record.checkIn)}
                        </td>
                        <td style={{
                          padding: '16px',
                          color: '#111827',
                          fontWeight: '500',
                        }}>
                          {formatTime(record.checkOut)}
                        </td>
                        <td style={{
                          padding: '16px',
                        }}>
                          <StatusBadge
                            label={record.status || 'N/A'}
                            tone={getStatusTone(record.status)}
                          />
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

export default AttendanceManagement;