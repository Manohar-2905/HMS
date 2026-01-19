import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                <Link to="/" className="text-xl font-bold font-display text-primary">
                    HostelHaven
                </Link>

                <div className="flex items-center gap-6">
                    <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link to="/rooms" className="text-sm font-medium hover:text-primary transition-colors">
                        Rooms
                    </Link>
                    <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                        Contact
                    </Link>

                    {user ? (
                        <>
                            <Link to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}>
                                <Button variant="ghost">Dashboard</Button>
                            </Link>
                            <Button onClick={handleLogout} variant="outline">
                                Logout
                            </Button>
                        </>
                    ) : (
                        <Link to="/login">
                            <Button>Login</Button>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
