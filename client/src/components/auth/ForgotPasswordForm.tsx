import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import api from '../../api/axios';

interface ForgotPasswordFormProps {
    onBack: () => void;
    onSuccess: () => void;
}

export function ForgotPasswordForm({ onBack, onSuccess }: ForgotPasswordFormProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/api/auth/forgot-password', { email });
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await api.post('/api/auth/verify-otp', { email, otp });
            setStep(3);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/api/auth/reset-password', { email, otp, password: newPassword });
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium">
                    {step === 1 && "Forgot Password"}
                    {step === 2 && "Enter OTP"}
                    {step === 3 && "Reset Password"}
                </h3>
                <p className="text-sm text-muted-foreground">
                    {step === 1 && "Enter your email to receive a verification code"}
                    {step === 2 && `Enter the 4-digit code sent to ${email}`}
                    {step === 3 && "Create a new password for your account"}
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email Address</label>
                        <Input
                            type="email"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Sending..." : "Send Verification Code"}
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Verification Code</label>
                        <Input
                            type="text"
                            placeholder="0000"
                            maxLength={4}
                            className="text-center text-2xl tracking-widest"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Verifying..." : "Verify Code"}
                    </Button>
                </form>
            )}

            {step === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm Password</label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Resetting..." : "Reset Password"}
                    </Button>
                </form>
            )}

            <div className="text-center">
                <Button variant="link" size="sm" onClick={onBack} className="text-muted-foreground">
                    Back to Login
                </Button>
            </div>
        </div>
    );
}
