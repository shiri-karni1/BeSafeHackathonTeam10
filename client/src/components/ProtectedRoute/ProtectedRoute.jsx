import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  console.log("in ProtectedRoute - isAuthenticated:", isAuthenticated, "loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to onboarding1");
    return <Navigate to="/onBoarding/OnBoarding1" replace />;
  }

  return <Outlet />; // Render child routes
};

export default ProtectedRoute;
