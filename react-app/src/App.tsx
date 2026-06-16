import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Lazy load pages for chunk splitting and optimized performance
const Home = lazy(() => import('./pages/Home'));
const Category = lazy(() => import('./pages/Category'));
const Product = lazy(() => import('./pages/Product'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white">
        {/* Navigation Bar */}
        <Navbar />
        
        {/* Page Routing */}
        <div className="flex-grow">
          <Suspense fallback={
            <div className="pt-[140px] pb-24 text-center min-h-[60vh] flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-error border-t-transparent rounded-full animate-spin"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:id" element={<Category />} />
              <Route path="/product/:id" element={<Product />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              {/* Fallback route */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Suspense>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
