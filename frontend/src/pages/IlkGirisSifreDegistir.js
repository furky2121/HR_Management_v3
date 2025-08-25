import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SifreDegistir from './SifreDegistir';

const IlkGirisSifreDegistir = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const kullaniciAdi = searchParams.get('kullaniciAdi');

    return (
        <SifreDegistir 
            isFirstLogin={true} 
            kullaniciAdi={kullaniciAdi || ''} 
        />
    );
};

export default IlkGirisSifreDegistir;