import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src="/images/JETNL-logo.png" alt="JETNL Logo" className="logo" />
        </Link>
      </div>
      <nav className="nav-menu">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/about" className="nav-link">About</Link>
        <Link to="/locations" className="nav-link">Locations</Link>
        <Link to="/gallery" className="nav-link">Gallery</Link>
        <Link to="/events" className="nav-link">Events</Link>
        <Link to="/registration" className="nav-link">Registration</Link>
        <Link to="/learn" className="nav-link">Learn</Link>
        <Link to="/volunteer" className="nav-link">Volunteer</Link>
        <Link to="/donate" className="nav-link">Donate</Link>
      </nav>
    </header>
  );
};

export default Header; 