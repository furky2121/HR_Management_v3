import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import VideoPlayer from '../components/VideoPlayer';
import videoEgitimService from '../services/videoEgitimService';
import './VideoEgitimIzle.css';

const VideoEgitimIzle = ({ egitimId }) => {
    console.log('🚀 VideoEgitimIzle component loaded with egitimId:', egitimId);
    console.log('🚀 VideoEgitimIzle component initialization at:', new Date().toLocaleTimeString());
    const router = useRouter();
    const toast = useRef(null);
    const [egitim, setEgitim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [personelId, setPersonelId] = useState(null);
    const [completionDialog, setCompletionDialog] = useState(false);
    const [certificateDialog, setCertificateDialog] = useState(false);
    const [certificate, setCertificate] = useState(null);
    const [relatedVideos, setRelatedVideos] = useState([]);

    useEffect(() => {
        loadPersonalInfo();
    }, []);

    useEffect(() => {
        console.log('🔍 VideoEgitimIzle useEffect triggered - egitimId:', egitimId, 'personelId:', personelId);
        if (egitimId && personelId) {
            console.log('✅ Loading egitim with both IDs...');
            loadEgitim();
        } else if (egitimId && !personelId) {
            console.log('⚠️ PersonelId not loaded yet, trying to load egitim without personelId...');
            // Load egitim without personelId for now
            loadEgitim();
        } else if (!egitimId) {
            console.log('❌ No egitimId provided, redirecting...');
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Geçersiz eğitim ID.'
            });
            router.push('/egitimler');
        }
    }, [egitimId, personelId]);

    const loadPersonalInfo = () => {
        console.log('Loading personal info...');
        // Get personal ID from token or session
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('Full token payload:', payload);
                // Backend'de "PersonelId" (büyük P ile) claim'i kullanılıyor
                const personelId = payload.PersonelId || payload.personelId || payload.sub;
                console.log('PersonelId from token:', personelId);
                setPersonelId(personelId);
            } catch (error) {
                console.error('Error parsing token:', error);
            }
        }
    };

    const loadEgitim = async () => {
        console.log('🔄 VideoEgitimIzle loadEgitim called with:', { egitimId, personelId });
        setLoading(true);
        
        try {
            const response = await videoEgitimService.getEgitimDetay(egitimId, personelId);
            console.log('📡 VideoEgitimIzle API Response:', response);
            if (response.success) {
                const egitimData = response.data.egitim || response.data;
                console.log('✅ VideoEgitimIzle Setting egitim data:', egitimData);
                setEgitim(egitimData);
                
                // Load related videos from same category
                if (egitimData.kategoriId) {
                    loadRelatedVideos(egitimData.kategoriId);
                }
            } else {
                console.log('⚠️ VideoEgitimIzle API Response unsuccessful:', response.message);
                
                // Test: Add mock data if API fails
                const mockData = {
                    id: egitimId,
                    baslik: 'Test Video Eğitim',
                    aciklama: 'Bu bir test eğitimidir.',
                    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                    sureDakika: 120,
                    seviye: 'Başlangıç',
                    egitmen: 'Test Eğitmen',
                    zorunluMu: false,
                    izlenmeMinimum: 80
                };
                console.log('🎭 VideoEgitimIzle Using mock data for testing:', mockData);
                setEgitim(mockData);
            }
        } catch (error) {
            console.error('❌ VideoEgitimIzle Error loading egitim:', error);
            
            // Test: Add mock data on error too
            const mockData = {
                id: egitimId,
                baslik: 'Test Video Eğitim (Mock)',
                aciklama: 'Bu bir test eğitimidir (API hatası nedeniyle mock data).',
                videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                sureDakika: 120,
                seviye: 'Başlangıç',
                egitmen: 'Test Eğitmen',
                zorunluMu: false,
                izlenmeMinimum: 80
            };
            console.log('🎭 VideoEgitimIzle Using mock data due to API error:', mockData);
            setEgitim(mockData);
        } finally {
            console.log('🏁 VideoEgitimIzle Loading finished, setting loading to false');
            setLoading(false);
        }
    };

    const loadRelatedVideos = async (kategoriId) => {
        try {
            const response = await videoEgitimService.getEgitimlerByKategori(kategoriId);
            if (response.success) {
                // Filter out current video and limit to 6 videos
                const filtered = response.data
                    .filter(v => v.id !== parseInt(egitimId))
                    .slice(0, 6);
                setRelatedVideos(filtered);
            }
        } catch (error) {
            console.error('Error loading related videos:', error);
        }
    };

    const handleVideoComplete = (completedEgitim) => {
        setCompletionDialog(true);
        
        // Update local state
        setEgitim(prev => ({
            ...prev,
            tamamlandiMi: true
        }));
    };

    const handleCreateCertificate = async () => {
        if (egitim?.id && personelId) {
            try {
                const response = await videoEgitimService.sertifikaOlustur(egitim.id);
                if (response.success) {
                    setCertificate(response.data);
                    setCertificateDialog(true);
                    setCompletionDialog(false);
                    
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Sertifikanız oluşturuldu!'
                    });
                } else {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Hata',
                        detail: 'Sertifika oluşturulamadı.'
                    });
                }
            } catch (error) {
                console.error('Error creating certificate:', error);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Sertifika oluşturulurken hata oluştu.'
                });
            }
        }
    };

    const handleGoToEgitimler = () => {
        router.push('/egitimler');
    };

    const handleWatchRelated = (videoId) => {
        router.push(`/egitimler/izle/${videoId}`);
    };

    const completionDialogFooter = (
        <div className="flex justify-content-between w-full">
            <Button 
                label="Eğitimlere Dön" 
                icon="pi pi-arrow-left" 
                className="p-button-secondary"
                onClick={handleGoToEgitimler}
            />
            <div className="flex gap-2">
                <Button 
                    label="Sertifika Oluştur" 
                    icon="pi pi-verified" 
                    onClick={handleCreateCertificate}
                />
            </div>
        </div>
    );

    const certificateDialogFooter = (
        <div className="flex justify-content-center w-full">
            <Button 
                label="Tamam" 
                icon="pi pi-check" 
                onClick={() => setCertificateDialog(false)}
                className="p-button-success"
            />
        </div>
    );

    if (loading) {
        return (
            <div className="video-egitim-izle-container">
                <div className="video-skeleton">
                    <Skeleton height="400px" className="mb-3" />
                    <Skeleton height="2rem" className="mb-2" />
                    <Skeleton height="1rem" width="60%" className="mb-3" />
                    <div className="flex gap-2 mb-3">
                        <Skeleton width="80px" height="2rem" />
                        <Skeleton width="100px" height="2rem" />
                        <Skeleton width="120px" height="2rem" />
                    </div>
                    <Skeleton height="100px" />
                </div>
            </div>
        );
    }

    if (!egitim) {
        return (
            <div className="video-egitim-izle-container">
                <Card className="text-center p-4">
                    <i className="pi pi-exclamation-triangle text-6xl text-yellow-500 mb-3"></i>
                    <h3>Video Eğitim Bulunamadı</h3>
                    <p className="text-500 mb-4">Aradığınız video eğitim mevcut değil veya erişim yetkiniz bulunmuyor.</p>
                    <Button 
                        label="Eğitimlere Dön" 
                        icon="pi pi-arrow-left" 
                        onClick={handleGoToEgitimler}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="video-egitim-izle-container">
            <Toast ref={toast} />
            
            {/* Back Navigation */}
            <div className="back-navigation">
                <Button 
                    icon="pi pi-arrow-left" 
                    label="Eğitimlere Dön"
                    className="p-button-text"
                    onClick={handleGoToEgitimler}
                />
            </div>

            {/* Main Video Player */}
            {console.log('🎬 VideoEgitimIzle Rendering VideoPlayer with egitim:', egitim, 'personelId:', personelId)}
            <VideoPlayer
                egitim={egitim}
                personelId={personelId}
                onComplete={handleVideoComplete}
            />

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
                <Card className="related-videos-card mt-4">
                    <h3 className="related-videos-title">
                        <i className="pi pi-play-circle mr-2"></i>
                        İlgili Videolar
                    </h3>
                    <div className="related-videos-grid">
                        {relatedVideos.map((video) => (
                            <Card 
                                key={video.id}
                                className="related-video-card"
                                onClick={() => handleWatchRelated(video.id)}
                            >
                                <div className="related-video-thumbnail">
                                    <img 
                                        src={video.thumbnailUrl || '/layout/images/bilge_lojistik.png'}
                                        alt={video.baslik}
                                        className="thumbnail-img"
                                    />
                                    <div className="video-overlay">
                                        <i className="pi pi-play play-icon"></i>
                                    </div>
                                </div>
                                <div className="related-video-info">
                                    <h5 className="video-title">{video.baslik}</h5>
                                    <div className="video-meta">
                                        <span className="duration">
                                            <i className="pi pi-clock mr-1"></i>
                                            {videoEgitimService.formatDuration(video.sureDakika)}
                                        </span>
                                        <Badge 
                                            value={video.seviye} 
                                            severity={videoEgitimService.getLevelBadgeClass(video.seviye)}
                                            className="level-badge"
                                        />
                                    </div>
                                    <p className="video-description">
                                        {video.aciklama?.substring(0, 100)}
                                        {video.aciklama?.length > 100 && '...'}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </Card>
            )}

            {/* Completion Celebration Dialog */}
            <Dialog
                visible={completionDialog}
                onHide={() => setCompletionDialog(false)}
                header="🎉 Tebrikler!"
                footer={completionDialogFooter}
                className="completion-dialog"
                modal
                style={{ width: '500px' }}
            >
                <div className="completion-content">
                    <div className="completion-icon">
                        <i className="pi pi-check-circle"></i>
                    </div>
                    <h3>Video Eğitimi Tamamladınız!</h3>
                    <p>
                        "<strong>{egitim.baslik}</strong>" eğitimini başarıyla tamamladınız. 
                        Artık sertifikanızı oluşturabilirsiniz.
                    </p>
                    <div className="completion-stats">
                        <div className="stat-item">
                            <i className="pi pi-clock"></i>
                            <span>Süre: {videoEgitimService.formatDuration(egitim.sureDakika)}</span>
                        </div>
                        <div className="stat-item">
                            <i className="pi pi-user"></i>
                            <span>Eğitmen: {egitim.egitmen}</span>
                        </div>
                        <div className="stat-item">
                            <i className="pi pi-verified"></i>
                            <span>Seviye: {egitim.seviye}</span>
                        </div>
                    </div>
                </div>
            </Dialog>

            {/* Certificate Dialog */}
            <Dialog
                visible={certificateDialog}
                onHide={() => setCertificateDialog(false)}
                header="🏆 Sertifikanız Hazır!"
                footer={certificateDialogFooter}
                className="certificate-dialog"
                modal
                style={{ width: '600px' }}
            >
                {certificate && (
                    <div className="certificate-content">
                        <div className="certificate-preview">
                            <div className="certificate-header">
                                <h2>BAŞARI SERTİFİKASI</h2>
                                <div className="certificate-number">
                                    Sertifika No: {certificate.sertifikaNo}
                                </div>
                            </div>
                            
                            <div className="certificate-body">
                                <p className="certificate-text">
                                    Bu sertifika ile <strong>{egitim.baslik}</strong> video eğitimini
                                    başarıyla tamamladığınız onaylanır.
                                </p>
                                
                                <div className="certificate-details">
                                    <div className="detail-row">
                                        <span>Tamamlanma Tarihi:</span>
                                        <span>{new Date(certificate.verilmeTarihi).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Geçerlilik Tarihi:</span>
                                        <span>{new Date(certificate.gecerlilikTarihi).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Eğitim Süresi:</span>
                                        <span>{videoEgitimService.formatDuration(egitim.sureDakika)}</span>
                                    </div>
                                    {certificate.quizPuani && (
                                        <div className="detail-row">
                                            <span>Quiz Puanı:</span>
                                            <span>{certificate.quizPuani}/100</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="certificate-footer">
                                <div className="company-seal">
                                    <i className="pi pi-verified"></i>
                                    <span>Bilge Lojistik İK</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="certificate-actions">
                            <Button 
                                label="PDF İndir" 
                                icon="pi pi-download" 
                                className="p-button-outlined"
                                onClick={() => window.print()}
                            />
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default VideoEgitimIzle;