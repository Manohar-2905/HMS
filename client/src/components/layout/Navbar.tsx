import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { LoginForm } from "@/components/auth/LoginForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import toast from "react-hot-toast";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Rooms", href: "/rooms" },
    { name: "Contact", href: "/contact" },
];

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [authView, setAuthView] = useState<'login' | 'forgot-password' | 'register'>('login');
    const [scrolled, setScrolled] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success("Logged out successfully", {
            icon: '👋',
        });
        navigate("/");
    };

    const isActive = (href: string) => location.pathname === href;
    const isScrolledOrOpen = scrolled || isOpen;

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isScrolledOrOpen
                    ? "bg-background/80 backdrop-blur-xl shadow-lg border-b border-primary/20 py-3"
                    : "bg-transparent py-5"
            )}
        >
            <div className="container mx-auto px-4">
                <div className="flex items-center">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group"
                    >
                        <img
                            src="/logo.png"
                            alt="Hosteller Logo"
                            className="w-10 h-10 rounded-lg object-cover shadow-md group-hover:shadow-glow transition-all duration-300"
                        />
                        <span className={cn(
                            "font-display text-xl font-semibold transition-colors duration-300",
                            isScrolledOrOpen ? "text-primary" : "text-white"
                        )}>
                            Yashoda bhavan
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8 ml-auto mr-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={cn(
                                    "relative text-sm font-medium transition-colors duration-300",
                                    isActive(link.href)
                                        ? "text-primary"
                                        : isScrolledOrOpen ? "text-muted-foreground hover:text-primary" : "text-white/70 hover:text-white"
                                )}
                            >
                                {link.name}
                                {isActive(link.href) && (
                                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full" />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Auth Buttons */}
                    <div className="hidden lg:flex items-center gap-3">
                        {user ? (
                            <>
                                <Button variant="default" size="sm" className="rounded-full shadow-lg" asChild>
                                    <Link to={user.role === 'admin' ? "/admin-dashboard" : "/dashboard"}>
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Link>
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors duration-300">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={"outline"}
                                    onClick={() => { setIsLoginModalOpen(true); setAuthView('register'); }}
                                    className={cn(
                                        "rounded-full border-primary/30 transition-all duration-300 bg-white/5 backdrop-blur-sm hover:bg-primary hover:border-primary hover:text-white",
                                        isScrolledOrOpen ? "text-primary border-primary/50" : "text-white"
                                    )}
                                >
                                    Register
                                </Button>
                                <Button
                                    onClick={() => { setIsLoginModalOpen(true); setAuthView('login'); }}
                                    className={"rounded-full shadow-glow bg-primary hover:bg-primary/90 text-white transition-all transform hover:scale-105 active:scale-95 px-8"}
                                >
                                    Login
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors ml-auto"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden mt-4 pb-4 animate-fade-in">
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "px-4 py-3 rounded-lg transition-colors",
                                        isActive(link.href)
                                            ? "bg-primary/10 text-primary"
                                            : "hover:bg-muted text-muted-foreground"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="border-t border-border mt-2 pt-4 flex flex-col gap-2">
                                {user ? (
                                    <>
                                        <Button variant="default" className="justify-start rounded-full" asChild>
                                            <Link to={user.role === 'admin' ? "/admin-dashboard" : "/dashboard"} onClick={() => setIsOpen(false)}>
                                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                                Dashboard
                                            </Link>
                                        </Button>
                                        <Button variant="outline" className="justify-start rounded-full hover:bg-primary hover:text-white hover:border-primary transition-colors duration-300" onClick={handleLogout}>
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button onClick={() => { setIsOpen(false); setIsLoginModalOpen(true); setAuthView('login'); }} variant="outline" className="w-full rounded-full">
                                            Login
                                        </Button>
                                        <Button onClick={() => { setIsOpen(false); setIsLoginModalOpen(true); setAuthView('register'); }} className="w-full rounded-full">
                                            Register
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                title={authView === 'login' ? "Welcome Back" : authView === 'register' ? "Student Registration" : "Reset Password"}
            >
                {authView === 'login' ? (
                    <LoginForm
                        onSuccess={() => setIsLoginModalOpen(false)}
                        onForgotPassword={() => setAuthView('forgot-password')}
                    />
                ) : authView === 'register' ? (
                    <RegisterForm
                        onSuccess={() => setIsLoginModalOpen(false)}
                        onLoginClick={() => setAuthView('login')}
                    />
                ) : (
                    <ForgotPasswordForm
                        onBack={() => setAuthView('login')}
                        onSuccess={() => { setIsLoginModalOpen(false); setAuthView('login'); }}
                    />
                )}
            </Modal>
        </nav >
    );
}
