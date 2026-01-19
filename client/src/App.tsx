
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import About from './pages/About';
import Rooms from './pages/Rooms';
import Login from './pages/Login';
import UserDashboard from './pages/Dashboard/UserDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import Contact from './pages/Contact';

// Protected Route Component
const PrivateRoute = ({ children, adminOnly = false }: { children: React.ReactElement, adminOnly?: boolean }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/" />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

const App = () => {
  return (
    <HelmetProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(20 30% 12%)',
            color: '#fff',
            borderRadius: '1rem',
            border: '1px solid hsl(25 35% 20%)',
          },
          success: {
            iconTheme: {
              primary: 'hsl(25 95% 53%)',
              secondary: '#fff',
            },
          },
        }}
      />
      <Router>
        <AuthProvider>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact" element={<Contact />} />

              {/* User Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin-dashboard"
                element={
                  <PrivateRoute adminOnly>
                    <AdminDashboard />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
        </AuthProvider>
      </Router>
    </HelmetProvider>
  );
};

export default App;
