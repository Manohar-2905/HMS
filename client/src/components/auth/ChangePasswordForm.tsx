/// <reference types="vite/client" />
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import api from '../../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ChangePasswordFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export function ChangePasswordForm({ onSuccess, onCancel }: ChangePasswordFormProps) {
    const [step, setStep] = useState<1 | 2>(1);
    const [oldPassword, setOldPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { logout, updateUser } = useAuth();
    const navigate = useNavigate();

    const handleInitiate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await api.post('/api/auth/change-password-initiate', { oldPassword });
            setStep(2);
            toast.success('OTP sent to your email!');
        } catch (err: any) {
            const message = err.response?.data?.message || err.message;
            if (message.toLowerCase().includes('authorized') || message.toLowerCase().includes('token')) {
                logout();
                navigate('/');
                onCancel();
                toast.error('Session expired. Please login again.');
            } else {
                setError(message);
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError("New passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const { data } = await api.post('/api/auth/change-password-complete', { otp, newPassword });
            updateUser(data);
            toast.success('Password changed successfully!');
            onSuccess();
        } catch (err: any) {
            const message = err.response?.data?.message || err.message;
            if (message.toLowerCase().includes('authorized') || message.toLowerCase().includes('token')) {
                logout();
                navigate('/');
                onCancel();
                toast.error('Session expired. Please login again.');
            } else {
                setError(message);
                toast.error(message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">
                    {step === 1 ? "Verify your current password" : "Enter OTP sent to your email"}
                </p>
            </div>

            {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                    {error}
                </div>
            )}

            {step === 1 && (
                <form onSubmit={handleInitiate} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Current Password</label>
                        <div className="relative">
                            <Input
                                type={showOldPassword ? "text" : "password"}
                                placeholder="Current Password"
                                value={oldPassword}
                                onChange={(e) => setOldPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="w-full" onClick={onCancel} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Verifying..." : "Next"}
                        </Button>
                    </div>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleComplete} className="space-y-4">
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Confirm New Password</label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm New Password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="w-full" onClick={() => setStep(1)} disabled={isLoading}>
                            Back
                        </Button>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
