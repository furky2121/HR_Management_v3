'use client';
import dynamic from 'next/dynamic';

const Sertifikalar = dynamic(() => import('../../../src/pages/Sertifikalar'), { ssr: false });

const SertifikalarPage = () => {
    return <Sertifikalar />;
};

export default SertifikalarPage;