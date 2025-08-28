'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        // Ana sayfa yüklendiğinde auth/login'e yönlendir
        router.replace('/auth/login');
    }, [router]);

    return (
        <div className="flex justify-content-center align-items-center min-h-screen">
            <div>Yönlendiriliyor...</div>
        </div>
    );
}