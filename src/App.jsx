import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Registration from './components/Registration';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Header />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/registration" element={<Registration />} />
            {/* Add more routes as needed */}
          </Routes>
        </main>
        <footer className="footer">
          <div className="footer-content">
            <p>© {new Date().getFullYear()} Jeeyar Educational Trust NL</p>
            <p>A Non-Profit 501 (c)(3) Organization. Federal Tax ID: 36-3977444</p>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
