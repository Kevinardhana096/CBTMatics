'use client';

// Custom hook untuk authentication
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string, role?: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Check if user is logged in on mount
    useEffect(() => {
        console.log('=== useAuth initializing ===');
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            const parsedUser = JSON.parse(savedUser);
            console.log('Found saved user:', parsedUser);
            setUser(parsedUser);
        } else {
            console.log('No saved user found');
        }
        setLoading(false);
        console.log('=== useAuth initialized ===');
    }, []);

    const login = async (email: string, password: string) => {
        try {
            console.log('Login attempt:', { email });
            const response = await api.post('/auth/login', { email, password });
            console.log('Login response:', response.data);

            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            console.log('User logged in:', user);

            // Redirect based on role
            if (user.role === 'admin' || user.role === 'teacher') {
                router.push('/admin/questions');
            } else {
                router.push('/student/exams');
            }
        } catch (error: any) {
            console.error('Login error in hook:', error);
            console.error('Error response:', error.response?.data);
            throw new Error(error.response?.data?.error || 'Login failed');
        }
    };

    const register = async (username: string, email: string, password: string, role: string = 'student') => {
        try {
            const response = await api.post('/auth/register', { username, email, password, role });
            // After registration, automatically login
            await login(email, password);
        } catch (error: any) {
            throw new Error(error.response?.data?.error || 'Registration failed');
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
