// withAuth.js
import { useAuth } from "@app/_components/_core/AuthProvider/hooks";
import { Spinner } from "@app/_shared";
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const withAuth = (Component, allowedRoles = []) => {
  return (props) => {
    const { isAuthenticated, loading, user } = useAuth();
    const location = useLocation();
    
    if (loading && !isAuthenticated) {
      return <Spinner />;
    }

    if (!isAuthenticated) {
      return <Navigate to="/auth/login-1" replace state={{ from: location }} />;
    }

    // If user is authenticated but no role specified, allow access
    if (!user?.role) {
      return <Component {...props} />;
    }

    // If allowedRoles are specified, check if user's role is allowed
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // Redirect based on user role
      if (user.role === 'admin') {
        return <Navigate to="/admindashboard" replace />;
      } else if (user.role === 'user') {
        return <Navigate to="/" replace />;
      }
    }

    return <Component {...props} />;
  };
};

export default withAuth;