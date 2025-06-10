import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import './Admin.css';

// Admin access code
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE || 'admin2025';

const AdminAuth = () => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check if code is valid
    if (ADMIN_CODE === accessCode) {
      // Set authentication in session storage
      sessionStorage.setItem('adminAuthenticated', 'true');
      // Redirect to stats page
      navigate('/admin/stats');
    } else {
      setError('Invalid access code. Please try again.');
    }
  };

  // If already authenticated, redirect to stats
  if (sessionStorage.getItem('adminAuthenticated') === 'true') {
    return <Navigate to="/admin/stats" replace />;
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-form">
        <h1>Admin Access</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="accessCode">Access Code:</label>
            <input
              type="password"
              id="accessCode"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              placeholder="Enter access code"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAuth; 