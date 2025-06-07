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
        <Link to="/gallery" className="nav-link" onClick={closeMenu}>Gallery</Link>
        <Link to="/registration" className="nav-link" onClick={closeMenu}>Registration</Link>
        <Link to="/donate" className="nav-link" onClick={closeMenu}>Donate</Link>
      </nav>

      <div className="logo-container logo-container-right">
        <Link to="/" onClick={closeMenu}>
          <img src="/images/JETNL-logo.png" alt="JETNL Logo" className="logo" />
        </Link>
      </div>
    </header>
  );
};

export default Header; 