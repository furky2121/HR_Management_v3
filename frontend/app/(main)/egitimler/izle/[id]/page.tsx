import React from 'react';
import VideoEgitimClient from './VideoEgitimClient';

interface Props {
    params: Promise<{
        id: string;
    }>;
}

const VideoEgitimIzlePage = async ({ params }: Props) => {
    const { id } = await params;
    
    return <VideoEgitimClient id={id} />;
};

export default VideoEgitimIzlePage;