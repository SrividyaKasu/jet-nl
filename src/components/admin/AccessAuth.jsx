import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './Admin.css';

const secrets = {
  admin: import.meta.env.VITE_ADMIN_CODE,
  amstelveen: import.meta.env.VITE_AMSTELVEEN_SECRET,
  denhaag: import.meta.env.VITE_DENHAAG_SECRET,
  eindhoven: import.meta.env.VITE_EINDHOVEN_SECRET
};

const AccessAuth = () => {
  const { type } = useParams(); // "admin", "amstelveen", "denhaag", etc.
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Check if the code matches the location's secret
    const isValidCode = secrets[type] && secrets[type] === code;

    if (isValidCode) {
      sessionStorage.setItem(`auth_${type}`, 'true');
      if (type === 'admin') {
        navigate('/admin/stats');
      } else {
        navigate(`/location/${type}`);
      }
    } else {
      setError('Invalid access code.');
    }
  };

  if (!secrets[type]) {
    return <div className="admin-auth-container">Unknown access type: {type}</div>;
  }

  return (
    <div className="admin-auth-container">
      <div className="admin-auth-form">
        <h1>{type === 'admin' ? 'Admin Access' : `${type.charAt(0).toUpperCase() + type.slice(1)} Access`}</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Access Code:</label>
            <input
              type="password"
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter access code"
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AccessAuth;
