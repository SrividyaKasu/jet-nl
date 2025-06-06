import React from 'react';
import { 
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Outlet
} from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import About from './components/About';
import Registration from './components/Registration';
import Gallery from './components/Gallery';
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/registration" element={<Registration />} />
      <Route path="/gallery" element={<Gallery />} />
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
