import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';
import Attendance from '../pages/employee/Attendance';
import Leave from '../pages/employee/Leave';
import Payroll from '../pages/employee/Payroll';
import Profile from '../pages/employee/Profile';
import AdminDashboard from '../pages/admin/AdminDashboard';
import Employees from '../pages/admin/Employees';
import EmployeeDetails from '../pages/admin/EmployeeDetails';
import AttendanceManagement from '../pages/admin/AttendanceManagement';
import LeaveManagement from '../pages/admin/LeaveManagement';
import PayrollManagement from '../pages/admin/PayrollManagement';

function AppRoutes() {
  const { user } = useAuth();
  const home = user ? `/${user.role}` : '/login';
  return <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
      <Route path="/employee" element={<EmployeeDashboard />} />
      <Route path="/employee/attendance" element={<Attendance userId={user?.uid} />} />
      <Route path="/employee/leave" element={<Leave userId={user?.uid} />} />
      <Route path="/employee/payroll" element={<Payroll />} />
      <Route path="/employee/profile" element={<Profile />} />
    </Route>
    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/employees" element={<Employees />} />
      <Route path="/admin/employees/:employeeId" element={<EmployeeDetails />} />
      <Route path="/admin/attendance" element={<AttendanceManagement />} />
      <Route path="/admin/leave" element={<LeaveManagement />} />
      <Route path="/admin/payroll" element={<PayrollManagement />} />
    </Route>
    <Route path="/" element={<Navigate to={home} replace />} />
    <Route path="*" element={<Navigate to={home} replace />} />
  </Routes>;
}

export default AppRoutes;