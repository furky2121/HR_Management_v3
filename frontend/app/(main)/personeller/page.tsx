'use client';
import { Metadata } from 'next';
import Personeller from '../../../src/pages/Personeller';

export const dynamic = 'force-dynamic';

const PersonellerPage = () => {
    return <Personeller />;
};

export default PersonellerPage;