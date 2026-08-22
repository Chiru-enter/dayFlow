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
  
  // Report feature states
  const [reportType, setReportType] = useState('week');
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportData, setReportData] = useState([]);

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

  // Calculate date range for report
  const getReportDateRange = (startDateStr) => {
    if (!startDateStr) return { start: '', end: '' };

    const startDate = new Date(startDateStr);
    let endDate = new Date(startDate);

    if (reportType === 'week') {
      // Get start of week (Monday)
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(startDate.setDate(diff));
      
      // Get end of week (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      return {
        start: weekStart.toISOString().slice(0, 10),
        end: weekEnd.toISOString().slice(0, 10),
      };
    } else {
      // Get start and end of month
      const monthStart = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);

      return {
        start: monthStart.toISOString().slice(0, 10),
        end: monthEnd.toISOString().slice(0, 10),
      };
    }
  };

  // Generate report data
  const generateReport = () => {
    if (!reportStartDate) return;

    const { start, end } = getReportDateRange(reportStartDate);
    if (!start || !end) return;

    let filtered = attendance.filter((record) => {
      const recordDate = record.date;
      return recordDate >= start && recordDate <= end;
    });

    if (selectedEmployee !== 'all') {
      filtered = filtered.filter((record) => record.userId === selectedEmployee);
    }

    setReportData(filtered);
  };

  // Calculate summary statistics
  const calculateSummary = () => {
    const summary = {
      present: 0,
      absent: 0,
      leave: 0,
      halfDay: 0,
      total: reportData.length,
    };

    reportData.forEach((record) => {
      const status = record.status?.toLowerCase() || '';
      if (status === 'present') summary.present += 1;
      else if (status === 'absent') summary.absent += 1;
      else if (status === 'leave') summary.leave += 1;
      else if (status === 'half day') summary.halfDay += 1;
    });

    const percentage = summary.total > 0 
      ? Math.round((summary.present / summary.total) * 100)
      : 0;

    return { ...summary, percentage };
  };

  // Download report as CSV
  const downloadReport = () => {
    if (reportData.length === 0) return;

    const summary = calculateSummary();
    const { start, end } = getReportDateRange(reportStartDate);
    const selectedEmp = selectedEmployee === 'all' 
      ? employeeMap[Object.keys(employeeMap)[0]]
      : employeeMap[selectedEmployee];

    let csv = 'DAYFLOW\nEmployee Attendance Report\n\n';
    csv += `Employee,${selectedEmp?.name || 'All Employees'}\n`;
    csv += `Employee ID,${selectedEmp?.employeeId || 'N/A'}\n`;
    csv += `Department,${selectedEmp?.department || 'N/A'}\n`;
    csv += `Report Period,${reportType.toUpperCase()} (${start} to ${end})\n\n`;
    
    csv += 'Summary:\n';
    csv += `Present,${summary.present}\n`;
    csv += `Absent,${summary.absent}\n`;
    csv += `Leave,${summary.leave}\n`;
    csv += `Half Day,${summary.halfDay}\n`;
    csv += `Attendance Percentage,${summary.percentage}%\n\n`;

    csv += 'Detailed Attendance Records:\n';
    csv += 'Date,Employee,Employee ID,Check In,Check Out,Status\n';

    reportData.forEach((record) => {
      const emp = employeeMap[record.userId] || {};
      csv += `"${record.date}","${emp.name || 'Unknown'}","${emp.employeeId || 'N/A'}","${formatTime(record.checkIn)}","${formatTime(record.checkOut)}","${record.status || 'N/A'}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    const filename = `Attendance-Report-${reportType}-${reportStartDate || 'export'}.csv`;
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

        {/* Attendance Reports Section */}
        <section className="panel" style={{ marginTop: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <p style={{
              fontSize: '0.9rem',
              fontWeight: '600',
              color: '#6b7280',
              marginBottom: '16px',
            }}>
              Attendance Reports
            </p>
            <h3 style={{ marginTop: 0 }}>Generate Report</h3>
          </div>

          {/* Report Controls */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '24px',
          }}>
            {/* Report Type */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px',
              }}>
                Report Type
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setReportType('week')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: reportType === 'week' ? '#188881' : '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: reportType === 'week' ? '#fff' : '#111827',
                  }}
                >
                  Week
                </button>
                <button
                  onClick={() => setReportType('month')}
                  style={{
                    flex: 1,
                    padding: '10px 12px',
                    background: reportType === 'month' ? '#188881' : '#f3f4f6',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    color: reportType === 'month' ? '#fff' : '#111827',
                  }}
                >
                  Month
                </button>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px',
              }}>
                Select Date
              </label>
              <input
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                }}
              />
            </div>

            {/* Employee Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.85rem',
                fontWeight: '600',
                color: '#6b7280',
                marginBottom: '8px',
              }}>
                Employee
              </label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'inherit',
                }}
              >
                <option value="all">All Employees</option>
                {Object.entries(employeeMap).map(([uid, emp]) => (
                  <option key={uid} value={uid}>
                    {emp.name || 'Unknown'} ({emp.employeeId || 'N/A'})
                  </option>
                ))}
              </select>
            </div>

            {/* Generate Button */}
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <button
                onClick={generateReport}
                disabled={!reportStartDate}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  background: reportStartDate ? '#188881' : '#d1d5db',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: reportStartDate ? 'pointer' : 'not-allowed',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#fff',
                }}
              >
                Generate Report
              </button>
            </div>
          </div>

          {/* Report Display */}
          {reportData.length > 0 && (
            <>
              {/* Summary Statistics */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '24px',
              }}>
                {(() => {
                  const summary = calculateSummary();
                  return (
                    <>
                      <div style={{
                        padding: '16px',
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        borderRadius: '8px',
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Present</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#10b981' }}>
                          {summary.present}
                        </div>
                      </div>
                      <div style={{
                        padding: '16px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '8px',
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Absent</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#ef4444' }}>
                          {summary.absent}
                        </div>
                      </div>
                      <div style={{
                        padding: '16px',
                        background: '#fef3c7',
                        border: '1px solid #fde047',
                        borderRadius: '8px',
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Leave</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#f59e0b' }}>
                          {summary.leave}
                        </div>
                      </div>
                      <div style={{
                        padding: '16px',
                        background: '#e0e7ff',
                        border: '1px solid #c7d2fe',
                        borderRadius: '8px',
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Half Day</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#6366f1' }}>
                          {summary.halfDay}
                        </div>
                      </div>
                      <div style={{
                        padding: '16px',
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                      }}>
                        <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>Attendance %</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '600', color: '#0284c7' }}>
                          {summary.percentage}%
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Download Button */}
              <div style={{ marginBottom: '24px' }}>
                <button
                  onClick={downloadReport}
                  style={{
                    padding: '10px 16px',
                    background: '#188881',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    color: '#fff',
                  }}
                >
                  Download Attendance Report
                </button>
              </div>

              {/* Report Table */}
              <div style={{ overflowX: 'auto' }}>
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
                        Date
                      </th>
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
                    {reportData.map((record) => {
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
                            color: '#6b7280',
                          }}>
                            {record.date || 'N/A'}
                          </td>
                          <td style={{
                            padding: '16px',
                            color: '#111827',
                            fontWeight: '500',
                          }}>
                            {employee.name || 'Unknown'}
                          </td>
                          <td style={{
                            padding: '16px',
                            color: '#6b7280',
                          }}>
                            {employee.employeeId || 'N/A'}
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
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default AttendanceManagement;