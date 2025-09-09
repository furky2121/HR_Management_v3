'use client';

import React, { useEffect, useState } from 'react';


interface Props {
    params: {
        id: string;
    };
}

const VideoEgitimIzlePage = ({ params }: Props) => {
    console.log('🎯 VideoEgitimIzlePage wrapper called with params:', params);
    console.log('🎯 VideoEgitimIzlePage wrapper called at:', new Date().toLocaleTimeString());
    const [VideoComponent, setVideoComponent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('🔄 VideoEgitimIzlePage Loading VideoEgitimIzle component dynamically for ID:', params.id);
        
        // Use dynamic import to load the component
        const loadComponent = async () => {
            try {
                console.log('🔄 VideoEgitimIzlePage Attempting to import VideoEgitimIzle component...');
                const module = await import('../../../../../src/pages/VideoEgitimIzle.js');
                console.log('✅ VideoEgitimIzlePage VideoEgitimIzle component loaded successfully:', module);
                setVideoComponent(() => module.default);
                setIsLoading(false);
            } catch (err: any) {
                console.error('❌ VideoEgitimIzlePage Error loading VideoEgitimIzle component:', err);
                setError(err.message);
                setIsLoading(false);
            }
        };

        loadComponent();
    }, [params.id]);

    if (isLoading) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Video Yükleniyor...</h2>
                <p>Video ID: {params.id}</p>
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Video Yüklenemiyor</h2>
                <p>Video ID: {params.id}</p>
                <p>Hata: {error}</p>
            </div>
        );
    }

    if (!VideoComponent) {
        return (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Video Bileşeni Bulunamadı</h2>
                <p>Video ID: {params.id}</p>
            </div>
        );
    }

    console.log('🎬 VideoEgitimIzlePage Rendering VideoComponent with egitimId:', params.id);
    return <VideoComponent egitimId={params.id} />;
};

export default VideoEgitimIzlePage;