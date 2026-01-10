import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';

const PublicRoute = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  console.log("in PublicRoute - isAuthenticated:", isAuthenticated, "loading:", loading);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
