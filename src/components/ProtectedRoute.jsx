import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loading from './Loading';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading message="Checking your session..." />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={user.role === 'admin' ? '/admin' : '/employee'}
        replace
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;