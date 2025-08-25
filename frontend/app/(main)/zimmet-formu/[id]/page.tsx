'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import personelZimmetService from '../../../../src/services/personelZimmetService';

interface ZimmetFormuData {
    id: number;
    // Personel bilgileri
    personelId: number;
    personelAd: string;
    personelSoyad: string;
    personelAdSoyad: string;
    personelEmail: string;
    personelTelefon: string;
    departmanAd: string;
    pozisyonAd: string;
    
    // Zimmet edilen malzeme bilgileri
    zimmetStokId: number;
    malzemeAdi: string;
    kategori: string;
    marka: string;
    model: string;
    seriNo: string;
    birim: string;
    aciklama: string;
    
    // Zimmet işlem bilgileri
    zimmetMiktar: number;
    zimmetTarihi: string;
    iadeTarihi?: string;
    durum: string;
    zimmetNotu: string;
    iadeNotu: string;
    
    // Zimmet veren bilgileri
    zimmetVerenId?: number;
    zimmetVerenAdSoyad?: string;
    zimmetVerenPozisyon?: string;
    
    // İade alan bilgileri
    iadeAlanId?: number;
    iadeAlanAdSoyad?: string;
    iadeAlanPozisyon?: string;
    
    aktif: boolean;
    olusturmaTarihi: string;
    guncellemeTarihi?: string;
}

const ZimmetFormu = () => {
    const params = useParams();
    const [zimmetData, setZimmetData] = useState<ZimmetFormuData | null>(null);
    const [loading, setLoading] = useState(true);
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (params?.id) {
            loadZimmetFormu(Number(params.id));
        }
    }, [params?.id]);

    const loadZimmetFormu = async (id: number) => {
        try {
            setLoading(true);
            const response = await personelZimmetService.getZimmetFormu(id);
            if (response.success) {
                setZimmetData(response.data);
            } else {
                toast.current?.show({ severity: 'error', summary: 'Hata', detail: response.message });
            }
        } catch (error: any) {
            console.error('Zimmet formu yüklenemedi:', error);
            toast.current?.show({ severity: 'error', summary: 'Hata', detail: 'Zimmet formu yüklenemedi' });
        } finally {
            setLoading(false);
        }
    };


    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('tr-TR');
    };

    if (loading) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="text-center">
                            <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
                            <p>Zimmet formu yükleniyor...</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    if (!zimmetData) {
        return (
            <div className="grid">
                <div className="col-12">
                    <Card>
                        <div className="text-center">
                            <p>Zimmet formu bulunamadı.</p>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                
                {/* Header */}
                <div className="mb-3">
                    <h2>Zimmet Formu #{zimmetData.id}</h2>
                </div>

                {/* Zimmet Form Content */}
                <Card className="zimmet-form">
                    {/* Header */}
                    <div className="text-center mb-4">
                        <h1 className="text-3xl font-bold mb-2">BİLGE LOJİSTİK A.Ş.</h1>
                        <h2 className="text-2xl font-semibold mb-1">ZİMMET TESLİM FORMU</h2>
                        <p className="text-lg">Form No: ZF-{zimmetData.id.toString().padStart(6, '0')}</p>
                    </div>

                    <Divider />

                    {/* Personel Bilgileri */}
                    <Panel header="PERSONEL BİLGİLERİ" className="mb-4">
                        <div className="grid">
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Ad Soyad:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.personelAdSoyad}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Departman:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.departmanAd}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Pozisyon:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.pozisyonAd}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">E-posta:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.personelEmail || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* Malzeme Bilgileri */}
                    <Panel header="MALZEME BİLGİLERİ" className="mb-4">
                        <div className="grid">
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Malzeme Adı:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.malzemeAdi}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Kategori:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.kategori || '-'}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="field">
                                    <label className="font-semibold">Marka:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.marka || '-'}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="field">
                                    <label className="font-semibold">Model:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.model || '-'}</div>
                                </div>
                            </div>
                            <div className="col-4">
                                <div className="field">
                                    <label className="font-semibold">Seri No:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.seriNo || '-'}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Miktar:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.zimmetMiktar} {zimmetData.birim}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Durum:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.durum}</div>
                                </div>
                            </div>
                            {zimmetData.aciklama && (
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-semibold">Açıklama:</label>
                                        <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.aciklama}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>

                    {/* Teslim Bilgileri */}
                    <Panel header="TESLİM BİLGİLERİ" className="mb-4">
                        <div className="grid">
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">Zimmet Tarihi:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{formatDate(zimmetData.zimmetTarihi)}</div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="field">
                                    <label className="font-semibold">İade Tarihi:</label>
                                    <div className="ml-2 border-bottom-1 border-300 pb-1">{formatDate(zimmetData.iadeTarihi || '')}</div>
                                </div>
                            </div>
                            {zimmetData.zimmetNotu && (
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-semibold">Zimmet Notu:</label>
                                        <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.zimmetNotu}</div>
                                    </div>
                                </div>
                            )}
                            {zimmetData.iadeNotu && (
                                <div className="col-12">
                                    <div className="field">
                                        <label className="font-semibold">İade Notu:</label>
                                        <div className="ml-2 border-bottom-1 border-300 pb-1">{zimmetData.iadeNotu}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Panel>

                    {/* İmza Alanları */}
                    <Panel header="İMZA ALANLARI" className="mb-4">
                        <div className="grid">
                            <div className="col-6">
                                <div className="text-center">
                                    <div className="mb-2">
                                        <label className="font-semibold">TESLİM EDEN</label>
                                    </div>
                                    <div className="border-1 border-300 p-3 mb-2" style={{ height: '100px', backgroundColor: '#f8f9fa' }}>
                                        {/* İmza alanı */}
                                    </div>
                                    <div className="border-bottom-1 border-300 pb-1 mb-1">
                                        {zimmetData.zimmetVerenAdSoyad || '________________'}
                                    </div>
                                    <div className="text-sm text-600">
                                        {zimmetData.zimmetVerenPozisyon || 'Pozisyon'}
                                    </div>
                                    <div className="text-sm text-600 mt-1">
                                        Tarih: {formatDate(zimmetData.zimmetTarihi)}
                                    </div>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="text-center">
                                    <div className="mb-2">
                                        <label className="font-semibold">TESLİM ALAN</label>
                                    </div>
                                    <div className="border-1 border-300 p-3 mb-2" style={{ height: '100px', backgroundColor: '#f8f9fa' }}>
                                        {/* İmza alanı */}
                                    </div>
                                    <div className="border-bottom-1 border-300 pb-1 mb-1">
                                        {zimmetData.personelAdSoyad}
                                    </div>
                                    <div className="text-sm text-600">
                                        {zimmetData.pozisyonAd}
                                    </div>
                                    <div className="text-sm text-600 mt-1">
                                        Tarih: {formatDate(zimmetData.zimmetTarihi)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Panel>

                    {/* İade İmza Alanları (sadece iade edilmişse) */}
                    {zimmetData.durum === 'Iade Edildi' && zimmetData.iadeTarihi && (
                        <Panel header="İADE İMZA ALANLARI" className="mb-4">
                            <div className="grid">
                                <div className="col-6">
                                    <div className="text-center">
                                        <div className="mb-2">
                                            <label className="font-semibold">İADE EDEN</label>
                                        </div>
                                        <div className="border-1 border-300 p-3 mb-2" style={{ height: '100px', backgroundColor: '#f8f9fa' }}>
                                            {/* İmza alanı */}
                                        </div>
                                        <div className="border-bottom-1 border-300 pb-1 mb-1">
                                            {zimmetData.personelAdSoyad}
                                        </div>
                                        <div className="text-sm text-600">
                                            {zimmetData.pozisyonAd}
                                        </div>
                                        <div className="text-sm text-600 mt-1">
                                            Tarih: {formatDate(zimmetData.iadeTarihi)}
                                        </div>
                                    </div>
                                </div>
                                <div className="col-6">
                                    <div className="text-center">
                                        <div className="mb-2">
                                            <label className="font-semibold">İADE ALAN</label>
                                        </div>
                                        <div className="border-1 border-300 p-3 mb-2" style={{ height: '100px', backgroundColor: '#f8f9fa' }}>
                                            {/* İmza alanı */}
                                        </div>
                                        <div className="border-bottom-1 border-300 pb-1 mb-1">
                                            {zimmetData.iadeAlanAdSoyad || '________________'}
                                        </div>
                                        <div className="text-sm text-600">
                                            {zimmetData.iadeAlanPozisyon || 'Pozisyon'}
                                        </div>
                                        <div className="text-sm text-600 mt-1">
                                            Tarih: {formatDate(zimmetData.iadeTarihi)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Panel>
                    )}

                    {/* Footer */}
                    <div className="text-center mt-4 pt-3 border-top-1 border-300">
                        <p className="text-sm text-600 mb-1">Bu form, malzeme zimmet ve iade işlemlerinin kayıt altına alınması için hazırlanmıştır.</p>
                        <p className="text-sm text-600">Form Oluşturma: {formatDate(zimmetData.olusturmaTarihi)}</p>
                    </div>
                </Card>
            </div>

            <style jsx global>{`
                @media print {
                    .print-hide {
                        display: none !important;
                    }
                    
                    .zimmet-form {
                        box-shadow: none !important;
                        border: none !important;
                    }
                    
                    .p-panel .p-panel-header {
                        background: #f8f9fa !important;
                        border: 1px solid #dee2e6 !important;
                        font-weight: bold !important;
                    }
                    
                    .p-panel .p-panel-content {
                        border: 1px solid #dee2e6 !important;
                        border-top: none !important;
                    }
                    
                    body {
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ZimmetFormu;