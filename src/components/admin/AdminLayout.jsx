import React from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();
  const isAuthenticated = sessionStorage.getItem('auth_admin') === 'true';
  
  // If not authenticated, redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/access/admin" replace />;
  }

  return (
    <div className="admin-layout">
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
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 