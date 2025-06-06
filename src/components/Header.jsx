import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/" onClick={closeMenu}>
          <img src="/images/JETNL-logo.png" alt="JETNL Logo" className="logo" />
        </Link>
      </div>
      
      <button 
        className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
        <Link to="/about" className="nav-link" onClick={closeMenu}>About</Link>
        <Link to="/locations" className="nav-link" onClick={closeMenu}>Locations</Link>
        <Link to="/gallery" className="nav-link" onClick={closeMenu}>Gallery</Link>
        <Link to="/events" className="nav-link" onClick={closeMenu}>Events</Link>
        <Link to="/registration" className="nav-link" onClick={closeMenu}>Registration</Link>
        <Link to="/learn" className="nav-link" onClick={closeMenu}>Learn</Link>
        <Link to="/volunteer" className="nav-link" onClick={closeMenu}>Volunteer</Link>
        <Link to="/donate" className="nav-link" onClick={closeMenu}>Donate</Link>
      </nav>
    </header>
  );
};

export default Header; 