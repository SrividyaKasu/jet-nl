import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
  
  // Check if we're on auth page
  const isAuthPage = location.pathname === '/admin/auth';

  // If not authenticated and not on auth page, redirect to auth
  if (!isAuthenticated && !isAuthPage) {
    return <Navigate to="/admin/auth" replace />;
  }

  // Only show navigation if authenticated
  const showNav = isAuthenticated;

  return (
    <div className="admin-layout">
      {showNav && (
        <div className="admin-sidebar">
          <h2>Admin Panel</h2>
          <nav className="admin-nav">
            <Link 
              to="/admin/stats"
              className={`admin-nav-link ${location.pathname === '/admin/stats' ? 'active' : ''}`}
            >
              Statistics
            </Link>
            <Link 
              to="/admin/registrations"
              className={`admin-nav-link ${location.pathname === '/admin/registrations' ? 'active' : ''}`}
            >
              Registrations
            </Link>
          </nav>
        </div>
      )}
      <div className={`admin-content ${!showNav ? 'full-width' : ''}`}>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 