import React from 'react';
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
}
interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    updateUser: (userData: User) => void;
    logout: () => void;
    isAdmin: boolean;
    loading: boolean;
}
export declare const AuthProvider: React.FC<{
    children: React.ReactNode;
}>;
export declare const useAuth: () => AuthContextType;
export {};
