import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import './Admin.css';

const AdminLayout = () => {
  const location = useLocation();

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