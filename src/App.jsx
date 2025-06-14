import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet,
  Navigate,
  useParams
} from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Registration from './components/Registration';
import Gallery from './components/Gallery';
import AdminLayout from './components/admin/AdminLayout';
import AccessAuth from './components/admin/AccessAuth';
import Registrations from './components/admin/Registrations';
import Stats from './components/admin/Stats';
import LocationPage from './components/locations/LocationPage';
import './App.css';
import DonateForm from './components/DonateForm';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFailed from './components/PaymentFailed';

const Layout = () => (
  <div className="app">
    <Header />
    <main className="main-content">
      <Outlet />
    </main>
    <footer className="footer">
      <div className="footer-content">
        <p>© {new Date().getFullYear()} Jeeyar Educational Trust NL</p>
        <p>A Non-Profit 501 (c)(3) Organization</p>
        <p>Administered by Swarakshetra</p>
        <p>Powered by Sitra Solutions</p>
      </div>
    </footer>
  </div>
);

// Protected route wrapper for location pages
const ProtectedLocationRoute = ({ children }) => {
  const { location } = useParams();
  const isAuthenticated = sessionStorage.getItem(`auth_${location}`) === 'true';
  
  if (!isAuthenticated) {
    return <Navigate to={`/access/${location}`} replace />;
  }
  
  return children;
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      {/* Public Pages */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/contribute" element={<DonateForm />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-failed" element={<PaymentFailed />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/access/admin" replace />} />
        <Route path="stats" element={<Stats />} />
        <Route path="registrations" element={<Registrations />} />
      </Route>

      {/* Location Pages */}
      <Route 
        path="/location/:location" 
        element={
          <ProtectedLocationRoute>
            <LocationPage />
          </ProtectedLocationRoute>
        } 
      />

      {/* Authentication Routes */}
      <Route path="/access/:type" element={<AccessAuth />} />
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
