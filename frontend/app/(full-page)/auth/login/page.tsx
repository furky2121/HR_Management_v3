'use client';

import { useRouter } from 'next/navigation';
import Login from '../../../../src/pages/Login';

export default function LoginPage() {
    const router = useRouter();
    
    const handleLogin = () => {
        console.log('LoginPage onLogin callback çağrıldı');
        router.push('/');
    };
    
    return <Login onLogin={handleLogin} />;
}
