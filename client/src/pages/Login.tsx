import { LoginForm } from '@/components/auth/LoginForm';
// I'll assume divs for now or create Card component quickly. 
// Actually, using basic HTML structure for now to avoid errors if Card is missing.

const Login = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-lg p-8 animate-slide-up">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">Sign in to your account</p>
                </div>

                <LoginForm />
            </div>
        </div>
    );
};

export default Login;
