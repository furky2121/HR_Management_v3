'use client';

import { Suspense } from 'react';

interface SuspenseWrapperProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export default function SuspenseWrapper({ children, fallback = null }: SuspenseWrapperProps) {
    return (
        <Suspense fallback={fallback}>
            {children}
        </Suspense>
    );
}