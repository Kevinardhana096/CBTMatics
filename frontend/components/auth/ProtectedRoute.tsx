'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: string[]; // ['admin', 'teacher', 'student']
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            // Redirect to login if not authenticated
            if (!user) {
                router.push('/login');
                return;
            }

            // Check role-based access
            if (allowedRoles && !allowedRoles.includes(user.role)) {
                // Redirect based on user's actual role
                if (user.role === 'admin' || user.role === 'teacher') {
                    router.push('/admin/questions');
                } else {
                    router.push('/student/exams');
                }
            }
        }
    }, [user, loading, allowedRoles, router]);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#112C70] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Show nothing while redirecting
    if (!user) {
        return null;
    }

    // Check role access
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return null;
    }

    // Render protected content
    return <>{children}</>;
}
