import React from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="container-x py-24 text-center">
        <ShieldAlert className="mx-auto size-12 text-muted" />
        <h1 className="mt-4 font-display text-2xl font-bold">Admins only</h1>
        <p className="mt-1 text-muted">Your account does not have access to this page.</p>
        <Link to="/" className="btn btn-primary mt-6">Back to home</Link>
      </div>
    );
  }

  return children;
};

export default AdminRoute;