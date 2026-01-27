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
    const isScrolled = scrolled;
    const isMobileMenuOpen = isOpen;
    const isDarkHeaderPage = ["/about", "/rooms", "/contact", "/admin-dashboard", "/dashboard", "/gallery", "/events"].includes(location.pathname);
    const forceLightText = isDarkHeaderPage && !isScrolled && !isMobileMenuOpen;

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
                isMobileMenuOpen
                    ? "bg-background shadow-xl border-b border-border py-4"
                    : isScrolled
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
                            (isScrolled || isMobileMenuOpen) ? "text-primary" : (forceLightText ? "text-white" : "text-foreground")
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
                                        ? "text-primary font-bold"
                                        : isScrolled
                                            ? "text-muted-foreground hover:text-primary"
                                            : (forceLightText ? "text-white/90 hover:text-white" : "text-foreground hover:text-primary")
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
                    <div className="hidden lg:flex items-center gap-2">
                        {user ? (
                            <>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className={cn(
                                        "rounded-full shadow-lg h-9 px-5",
                                        forceLightText ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-white hover:bg-primary/90"
                                    )}
                                    asChild
                                >
                                    <Link to={user.role === 'admin' ? "/admin-dashboard" : "/dashboard"}>
                                        <LayoutDashboard className="w-4 h-4 mr-2" />
                                        Dashboard
                                    </Link>
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className={cn(
                                        "rounded-full h-9 px-5 transition-all duration-300",
                                        forceLightText
                                            ? "bg-white border-white text-primary hover:bg-white/90"
                                            : "border-border text-foreground hover:bg-primary hover:text-white hover:border-primary"
                                    )}
                                >
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
                                        "rounded-full h-9 px-5 transition-all duration-300",
                                        isScrolled
                                            ? "text-primary border-primary/40 hover:bg-primary hover:text-white"
                                            : (forceLightText ? "bg-white border-white text-primary hover:bg-white/90" : "text-foreground border-primary/30 hover:bg-primary hover:text-white")
                                    )}
                                >
                                    Register
                                </Button>
                                <Button
                                    onClick={() => { setIsLoginModalOpen(true); setAuthView('login'); }}
                                    className={cn(
                                        "rounded-full h-9 px-6 shadow-glow transition-all transform hover:scale-105 active:scale-95",
                                        forceLightText ? "bg-white text-primary hover:bg-white/90" : "bg-primary text-white hover:bg-primary/90"
                                    )}
                                >
                                    Login
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={cn(
                            "lg:hidden p-2 rounded-lg transition-colors ml-auto",
                            forceLightText ? "text-white hover:bg-white/10" : "hover:bg-muted text-foreground"
                        )}
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="lg:hidden mt-4 pb-4 animate-slide-down">
                        <div className="flex flex-col gap-3">
                            <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        to={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3.5 rounded-lg transition-all duration-300 font-medium",
                                            isActive(link.href)
                                                ? "bg-primary text-white shadow-md shadow-primary/20"
                                                : "text-foreground/80 hover:bg-background hover:text-primary hover:shadow-sm"
                                        )}
                                    >
                                        {link.name}
                                        {isActive(link.href) && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 mt-2 px-1">
                                {user ? (
                                    <>
                                        <Button variant="default" size="lg" className="w-full rounded-xl shadow-lg" asChild>
                                            <Link to={user.role === 'admin' ? "/admin-dashboard" : "/dashboard"} onClick={() => setIsOpen(false)}>
                                                <LayoutDashboard className="w-5 h-5 mr-3" />
                                                Dashboard
                                            </Link>
                                        </Button>
                                        <Button variant="outline" size="lg" className="w-full rounded-xl border-border/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors" onClick={handleLogout}>
                                            <LogOut className="w-5 h-5 mr-3" />
                                            Logout
                                        </Button>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => { setIsOpen(false); setIsLoginModalOpen(true); setAuthView('login'); }}
                                            variant="outline"
                                            size="lg"
                                            className="w-full rounded-xl font-semibold border-primary/20 text-primary hover:bg-primary/5"
                                        >
                                            Login
                                        </Button>
                                        <Button
                                            onClick={() => { setIsOpen(false); setIsLoginModalOpen(true); setAuthView('register'); }}
                                            size="lg"
                                            className="w-full rounded-xl font-semibold shadow-lg shadow-primary/20"
                                        >
                                            Register
                                        </Button>
                                    </div>
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
