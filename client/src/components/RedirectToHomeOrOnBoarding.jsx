import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
export default function RedirectToHomeOrOnBoarding() {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return <div>טוען...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Navigate to="/onBoarding/OnBoarding1" replace />;
}
