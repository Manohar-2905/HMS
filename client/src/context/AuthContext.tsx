/// <reference types="vite/client" />
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'admin' | 'user';
    token: string;
    phone?: string;
    address?: string;
    roomType?: string;
    totalAmount?: number;
    paidAmount?: number;
    remainingAmount?: number;
    photo?: string;
    paymentHistory?: Array<{
        amount: number;
        date: string;
        remarks: string;
    }>;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    updateUser: (userData: User) => void;
    logout: () => void;
    isAdmin: boolean;
    loading: boolean;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            setUser(JSON.parse(userInfo));
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/api/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const refreshUser = async () => {
        try {
            const { data } = await api.get('/api/auth/profile');
            // Merge new data with existing token (backend profile doesn't send token)
            // But we can just use the existing user token if needed, or if backend sends token, use it.
            // Backend profile sends all fields but NO token usually (or depends on implementation).
            // My implementation above DOES NOT send token. So we must preserve it.

            setUser(prev => {
                if (!prev) return null;
                const updated = { ...prev, ...data };
                localStorage.setItem('userInfo', JSON.stringify(updated));
                return updated;
            });
        } catch (error) {
            console.error('Failed to refresh user profile', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, login, updateUser, logout, isAdmin, loading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
