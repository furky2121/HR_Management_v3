'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface Props {
    params: {
        id: string;
    };
}

// Use Next.js dynamic import with proper loading component
const VideoEgitimIzle = dynamic(
    () => import('../../../../../src/pages/VideoEgitimIzle.js'),
    { 
        loading: () => (
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <h2>Video Yükleniyor...</h2>
                <div className="spinner" style={{ margin: '20px auto', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
            </div>
        ),
        ssr: false // Disable server-side rendering for this component
    }
);

const VideoEgitimIzlePage = ({ params }: Props) => {
    return <VideoEgitimIzle egitimId={params.id} />;
};

export default VideoEgitimIzlePage;