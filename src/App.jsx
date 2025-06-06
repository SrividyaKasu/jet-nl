import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet,
  Navigate
} from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Registration from './components/Registration';
import Gallery from './components/Gallery';
import AdminLayout from './components/admin/AdminLayout';
import Stats from './components/admin/Stats';
import Registrations from './components/admin/Registrations';
import './App.css';

const Layout = () => (
  <div className="app">
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Jeeyar Educational Trust NL</p>
        <p>A Non-Profit 501 (c)(3) Organization.</p>
      </div>
    </footer>
  </div>
);

// Simple admin authentication check
const isAdmin = () => {
  // Replace this with your actual admin authentication logic
  return true; // For development, always return true
};

// Protected route component
const ProtectedRoute = ({ children }) => {
  if (!isAdmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/gallery" element={<Gallery />} />
      
      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="stats" replace />} />
        <Route path="stats" element={<Stats />} />
        <Route path="registrations" element={<Registrations />} />
      </Route>
    </Route>
  ),
  {
    future: {
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }
  }
);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
