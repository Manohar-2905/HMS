import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // Admin Dashboard
import UserDashboard from './pages/UserDashboard';
import Rooms from './pages/Rooms';
import Contact from './pages/Contact';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/rooms" element={<Rooms />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />

              {/* Private User Routes */}
              <Route path="/dashboard" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />

              {/* Private Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
            </Routes>
          </main>
          <ToastContainer />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
