import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../lib/auth.jsx';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Hanya tampilkan layar tunggu jika sedang loading dan belum ada cache user
  if (loading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center font-poppins text-sm text-slate-500">
        Memuat...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective dashboard if wrong role
    const redirectPath = user.role === 'PUSTAKAWAN' ? '/admin' : '/siswa';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
