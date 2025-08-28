'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import authService from '../src/services/authService';

export default function HomePage() {
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuth = () => {
            try {
                const isAuthenticated = authService.isLoggedIn();
                console.log('HomePage - Auth check:', isAuthenticated);
                
                if (isAuthenticated) {
                    console.log('HomePage - Kullanıcı giriş yapmış, dashboard\'a yönlendiriliyor');
                    router.replace('/Dashboard');
                } else {
                    console.log('HomePage - Kullanıcı giriş yapmamış, login\'e yönlendiriliyor');
                    router.replace('/auth/login');
                }
            } catch (error) {
                console.error('HomePage - Auth check error:', error);
                router.replace('/auth/login');
            } finally {
                setIsChecking(false);
            }
        };

        checkAuth();
    }, [router]);

    if (isChecking) {
        return (
            <div className="flex justify-content-center align-items-center min-h-screen">
                <div>Yönlendiriliyor...</div>
            </div>
        );
    }

    return null;
}