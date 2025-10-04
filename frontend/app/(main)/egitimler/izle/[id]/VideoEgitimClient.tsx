'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Skeleton } from 'primereact/skeleton';
import { Dialog } from 'primereact/dialog';
import VideoPlayer from '@/src/components/VideoPlayer.js';

// Type assertion for JavaScript component
const VideoPlayerComponent = VideoPlayer as any;
import videoEgitimService from '@/src/services/videoEgitimService';

interface Props {
    id: string;
}

const VideoEgitimClient = ({ id }: Props) => {
    const router = useRouter();
    const toast = useRef<Toast>(null);
    const videoPlayerRef = useRef<any>(null);
    const [egitim, setEgitim] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [personelId, setPersonelId] = useState<number | null>(null);
    const [completionDialog, setCompletionDialog] = useState(false);
    const [certificateDialog, setCertificateDialog] = useState(false);
    const [certificate, setCertificate] = useState<any>(null);
    const [relatedVideos, setRelatedVideos] = useState<any[]>([]);

    useEffect(() => {
        loadPersonalInfo();
    }, []);

    useEffect(() => {
        if (id && personelId) {
            loadEgitim();
        } else if (id && !personelId) {
            loadEgitim();
        } else if (!id) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Geçersiz eğitim ID.'
            });
            router.push('/egitimler');
        }
    }, [id, personelId, router]);

    const loadPersonalInfo = () => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    const personelId = payload.PersonelId || payload.personelId || payload.sub;
                    setPersonelId(personelId);
                } catch (error) {
                    console.error('Error parsing token:', error);
                }
            }
        }
    };

    const loadEgitim = async () => {
        setLoading(true);
        
        try {
            console.log('Loading egitim with ID:', id, 'PersonelId:', personelId);
            console.log('API Base URL:', process.env.NEXT_PUBLIC_API_BASE_URL);
            
            const response = await videoEgitimService.getEgitimDetay(id, personelId as any);
            console.log('API Response:', response);
            
            if (response.success) {
                const egitimData = response.data.egitim || response.data;
                console.log('Egitim data:', egitimData);
                setEgitim(egitimData);
                
                if (egitimData.kategoriId) {
                    loadRelatedVideos(egitimData.kategoriId);
                }
            } else {
                console.error('API Error Response:', response);
                toast.current?.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: response.message || 'Video eğitim bilgileri alınamadı.'
                });
                // Don't redirect immediately, give user option to retry
                setTimeout(() => {
                    router.push('/egitimler');
                }, 3000);
            }
        } catch (error) {
            console.error('Error loading egitim:', error);
            
            // Provide more detailed error information
            let errorMessage = 'Video eğitim yüklenirken bir hata oluştu.';
            
            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    errorMessage = 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin ve tekrar deneyin.';
                } else if (error.message.includes('NetworkError')) {
                    errorMessage = 'Ağ hatası. Sunucu şu anda erişilemiyor.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.';
                } else if (error.message.includes('401') || error.message.includes('403')) {
                    errorMessage = 'Yetki hatası. Lütfen tekrar giriş yapın.';
                } else if (error.message.includes('404')) {
                    errorMessage = 'Video eğitim bulunamadı.';
                }
            }
            
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: errorMessage,
                life: 5000
            });
            
            // Don't redirect immediately for network errors, give user option to retry
            setTimeout(() => {
                router.push('/egitimler');
            }, 5000);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedVideos = async (kategoriId: number) => {
        try {
            const response = await videoEgitimService.getEgitimlerByKategori(kategoriId);
            if (response.success) {
                const filtered = response.data
                    .filter((v: any) => v.id !== parseInt(id))
                    .slice(0, 6);
                setRelatedVideos(filtered);
            }
        } catch (error) {
            console.error('Error loading related videos:', error);
        }
    };

    const handleVideoComplete = (completedEgitim: any) => {
        setCompletionDialog(true);
        // Update egitim state to reflect completion for immediate UI update
        setEgitim((prev: any) => ({
            ...prev,
            tamamlandiMi: true,
            izlemeYuzdesi: prev?.izlenmeMinimum || 80 // Set to minimum required percentage
        }));
    };

    const handleContinueWatching = () => {
        setCompletionDialog(false);
        // Video continues playing from where it left off
    };

    const handleCreateCertificateAndExit = async () => {
        // Save progress first
        if (videoPlayerRef.current && videoPlayerRef.current.saveCurrentProgress) {
            try {
                console.log('Saving progress before certificate creation...');
                await videoPlayerRef.current.saveCurrentProgress();
            } catch (error) {
                console.error('Error saving progress before certificate:', error);
            }
        }

        // Create certificate
        if (egitim?.id && personelId) {
            try {
                const response = await videoEgitimService.sertifikaOlustur(egitim.id);
                if (response.success) {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Sertifikanız oluşturuldu! Bana Atanan Eğitimler sayfasına yönlendiriliyorsunuz.'
                    });

                    // Redirect to assigned trainings after short delay
                    setTimeout(() => {
                        router.push('/bana-atanan-egitimler');
                    }, 2000);
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

        setCompletionDialog(false);
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

    const handleGoToEgitimler = async () => {
        // Save progress before navigating away
        if (videoPlayerRef.current && videoPlayerRef.current.saveCurrentProgress) {
            try {
                console.log('Saving progress before navigation...');
                await videoPlayerRef.current.saveCurrentProgress();
            } catch (error) {
                console.error('Error saving progress before navigation:', error);
            }
        }
        router.push('/egitimler');
    };

    const handleWatchRelated = (videoId: number) => {
        router.push(`/egitimler/izle/${videoId}`);
    };

    const getEgitimDurumu = (egitim: any) => {
        if (!egitim) return { label: 'Yeni', value: 'yeni', severity: 'info' };

        // Backend'den gelen tamamlanma durumunu kontrol et
        const tamamlandiMi = egitim.tamamlandiMi || false;
        const izlemeYuzdesi = egitim.izlemeYuzdesi || 0;
        const izlenmeMinimum = egitim.izlenmeMinimum || 80;

        // DB'de tamamlandı olarak işaretlenmişse veya minimum orana ulaşmışsa
        if (tamamlandiMi || izlemeYuzdesi >= izlenmeMinimum) {
            return { label: 'Tamamlandı', value: 'tamamlandi', severity: 'success' };
        } else if (izlemeYuzdesi > 0) {
            return { label: 'Devam Ediyor', value: 'devam', severity: 'warning' };
        } else {
            return { label: 'Yeni', value: 'yeni', severity: 'info' };
        }
    };

    if (loading) {
        return (
            <div style={{ padding: '20px' }}>
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
        );
    }

    if (!egitim) {
        return (
            <div style={{ padding: '20px' }}>
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
        <div style={{ padding: '20px' }}>
            <Toast ref={toast} />
            
            {/* Back Navigation */}
            <div style={{ marginBottom: '20px' }}>
                <Button 
                    icon="pi pi-arrow-left" 
                    label="Eğitimlere Dön"
                    className="p-button-text"
                    onClick={handleGoToEgitimler}
                />
            </div>

            {/* Main Video Player */}
            <VideoPlayerComponent
                ref={videoPlayerRef}
                egitim={egitim}
                personelId={personelId}
                onComplete={handleVideoComplete}
                onProgress={(progressData: any) => {
                    console.log('Video progress:', progressData);
                }}
            />

            {/* Status Badge - Positioned at bottom right */}
            {egitim && (
                <div style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 1000
                }}>
                    <Badge
                        value={getEgitimDurumu(egitim).label}
                        severity={getEgitimDurumu(egitim).severity as any}
                        size="large"
                        style={{
                            fontSize: '0.875rem',
                            padding: '0.75rem 1rem',
                            borderRadius: '6px',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                        }}
                    />
                </div>
            )}

            {/* Completion Dialog */}
            <Dialog
                visible={completionDialog}
                onHide={() => setCompletionDialog(false)}
                header="🎉 Eğitim Tamamlandı!"
                modal
                style={{ width: '500px' }}
                footer={
                    <div className="flex justify-content-between w-full">
                        <Button
                            label="Videoyu Devam Ettir"
                            icon="pi pi-play"
                            className="p-button-secondary"
                            onClick={handleContinueWatching}
                        />
                        <Button
                            label="Sertifika Oluştur ve Çık"
                            icon="pi pi-verified"
                            onClick={handleCreateCertificateAndExit}
                        />
                    </div>
                }
            >
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', color: '#22c55e', marginBottom: '1rem' }}>
                        <i className="pi pi-check-circle"></i>
                    </div>
                    <h3>Minimum İzlenme Oranına Ulaştınız!</h3>
                    <p>
                        &quot;<strong>{egitim.baslik}</strong>&quot; eğitimini gerekli oranda izlediğiniz için tamamlandı olarak işaretlendi.
                    </p>
                    <div className="mt-3 p-3 border-round surface-100">
                        <p className="mb-2"><strong>İzlenme Oranı:</strong> {egitim?.izlenmeMinimum || 80}% (tamamlandı)</p>
                        <p className="mb-0">Videoyu sonuna kadar izlemeye devam edebilir veya sertifikanızı oluşturup çıkabilirsiniz.</p>
                    </div>
                </div>
            </Dialog>

            {/* Certificate Dialog */}
            <Dialog
                visible={certificateDialog}
                onHide={() => setCertificateDialog(false)}
                header="🏆 Sertifikanız Hazır!"
                modal
                style={{ width: '600px' }}
                footer={
                    <div className="flex justify-content-center w-full">
                        <Button 
                            label="Tamam" 
                            icon="pi pi-check" 
                            onClick={() => setCertificateDialog(false)}
                            className="p-button-success"
                        />
                    </div>
                }
            >
                {certificate && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ border: '2px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '20px' }}>
                            <h2>BAŞARI SERTİFİKASI</h2>
                            <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '20px' }}>
                                Sertifika No: {certificate.sertifikaNo}
                            </div>
                            <p>
                                Bu sertifika ile <strong>{egitim.baslik}</strong> video eğitimini
                                başarıyla tamamladığınız onaylanır.
                            </p>
                            <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
                                <div>Tamamlanma Tarihi: {new Date(certificate.verilmeTarihi).toLocaleDateString('tr-TR')}</div>
                                <div>Geçerlilik Tarihi: {new Date(certificate.gecerlilikTarihi).toLocaleDateString('tr-TR')}</div>
                            </div>
                        </div>
                        <Button 
                            label="PDF İndir" 
                            icon="pi pi-download" 
                            className="p-button-outlined"
                            onClick={() => window.print()}
                        />
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default VideoEgitimClient;