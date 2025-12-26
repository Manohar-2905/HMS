import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { FaUserCircle, FaSignOutAlt } from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-primary">HostelStay</Link>
                <div className="flex space-x-6 items-center">
                    <Link to="/" className="hover:text-primary">Home</Link>
                    <Link to="/rooms" className="hover:text-primary">Rooms</Link>
                    <Link to="/contact" className="hover:text-primary">Contact</Link>

                    {user ? (
                        <>
                            {user.role === 'admin' ? (
                                <Link to="/admin/dashboard" className="hover:text-primary">Dashboard</Link>
                            ) : (
                                <Link to="/dashboard" className="hover:text-primary">Dashboard</Link>
                            )}
                            <button onClick={handleLogout} className="flex items-center space-x-1 hover:text-red-500">
                                <FaSignOutAlt />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="flex items-center space-x-1 hover:text-primary">
                            <FaUserCircle />
                            <span>Login</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
