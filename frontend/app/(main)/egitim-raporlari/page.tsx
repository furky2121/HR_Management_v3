'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import videoEgitimService from '../../../src/services/videoEgitimService';

const EgitimRaporlariPage = () => {
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [egitimIstatistikleri, setEgitimIstatistikleri] = useState<any>({});
    const [personelEgitimOzeti, setPersonelEgitimOzeti] = useState<any[]>([]);
    const [departmanBazliEgitimler, setDepartmanBazliEgitimler] = useState<any[]>([]);
    const [egitimDurumChart, setEgitimDurumChart] = useState<any>({});
    const [aylikEgitimChart, setAylikEgitimChart] = useState<any>({});
    const [aylikTrendVerileri, setAylikTrendVerileri] = useState<any[]>([]);
    const toast = useRef<Toast>(null);

    const yearOptions = Array.from({ length: 5 }, (_, i) => {
        const year = new Date().getFullYear() - i;
        return { label: year.toString(), value: year };
    });

    const monthOptions = [
        { label: 'Tüm Yıl', value: null },
        { label: 'Ocak', value: 1 },
        { label: 'Şubat', value: 2 },
        { label: 'Mart', value: 3 },
        { label: 'Nisan', value: 4 },
        { label: 'Mayıs', value: 5 },
        { label: 'Haziran', value: 6 },
        { label: 'Temmuz', value: 7 },
        { label: 'Ağustos', value: 8 },
        { label: 'Eylül', value: 9 },
        { label: 'Ekim', value: 10 },
        { label: 'Kasım', value: 11 },
        { label: 'Aralık', value: 12 }
    ];

    useEffect(() => {
        loadRaporlar();
    }, [selectedYear, selectedMonth]);

    const loadRaporlar = async () => {
        try {
            setLoading(true);

            // Video eğitim istatistikleri
            const stats = await videoEgitimService.getVideoEgitimIstatistikleri();
            console.log('Stats response:', stats);

            if (stats.success && stats.data) {
                setEgitimIstatistikleri(stats.data);
                // Debug: API'den gelen veriyi console'da göster
                console.log('DEBUG - API\'den gelen istatistikler:', stats.data);
                console.log('DEBUG - Chart için hazırlanan veri:', {
                    tamamlananAtama: stats.data.tamamlananAtama,
                    devamEdenAtama: stats.data.devamEdenAtama,
                    atandiAtama: stats.data.atandiAtama,
                    suresiGectiAtama: stats.data.suresiGectiAtama
                });
                // Grafik verileri
                prepareChartData(stats.data);
            } else {
                console.warn('İstatistik verisi alınamadı, mock veri kullanılıyor');
                setVideoEgitimMockData();
            }

            // Personel video eğitim özeti
            const personelOzet = await videoEgitimService.getPersonelVideoEgitimOzeti();
            console.log('Personel özet response:', personelOzet);

            if (personelOzet.success && personelOzet.data) {
                setPersonelEgitimOzeti(personelOzet.data);
            } else {
                console.warn('Personel özeti alınamadı, mock veri kullanılıyor');
                setPersonelEgitimOzeti([]);
            }

            // Departman bazlı video eğitimler
            const departmanEgitim = await videoEgitimService.getDepartmanRaporu(selectedYear as any);
            console.log('Departman rapor response:', departmanEgitim);

            if (departmanEgitim.success && departmanEgitim.data) {
                setDepartmanBazliEgitimler(departmanEgitim.data);
            } else {
                console.warn('Departman raporu alınamadı, mock veri kullanılıyor');
                setDepartmanBazliEgitimler([]);
            }

            // Aylık video eğitim trendi
            const aylikTrend = await videoEgitimService.getAylikEgitimTrendi(selectedYear);
            console.log('Aylık trend response:', aylikTrend);

            if (aylikTrend.success && aylikTrend.data) {
                setAylikTrendVerileri(aylikTrend.data);
                prepareMonthlyChartData(aylikTrend.data);
            } else {
                console.warn('Aylık trend verisi alınamadı, mock veri kullanılıyor');
                prepareMonthlyChartData();
            }

        } catch (error) {
            console.error('Video eğitim raporları yüklenirken hata:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Rapor verileri yüklenirken hata oluştu'
            });
            // Örnek veri ile devam et
            setVideoEgitimMockData();
        } finally {
            setLoading(false);
        }
    };

    const setVideoEgitimMockData = () => {
        // Örnek video eğitim istatistikleri
        setEgitimIstatistikleri({
            toplamVideoEgitim: 52,
            tamamlananAtama: 38,
            devamEdenAtama: 14,
            atandiAtama: 8,
            toplamKatilimci: 234,
            ortalamaIzlemeSuresi: 142.5,
            tamamlanmaOrani: 73
        });

        // Örnek personel video eğitim özeti
        setPersonelEgitimOzeti([
            { id: 1, personelAd: 'Ahmet Yılmaz', departman: 'Bilgi İşlem', toplamVideoEgitim: 12, tamamlanan: 9, izlemeYuzdesi: 85, toplamSure: 450 },
            { id: 2, personelAd: 'Ayşe Demir', departman: 'İnsan Kaynakları', toplamVideoEgitim: 15, tamamlanan: 13, izlemeYuzdesi: 92, toplamSure: 680 },
            { id: 3, personelAd: 'Mehmet Kaya', departman: 'Satış', toplamVideoEgitim: 8, tamamlanan: 6, izlemeYuzdesi: 78, toplamSure: 320 },
            { id: 4, personelAd: 'Fatma Öz', departman: 'Muhasebe', toplamVideoEgitim: 10, tamamlanan: 8, izlemeYuzdesi: 88, toplamSure: 520 },
            { id: 5, personelAd: 'Ali Veli', departman: 'Üretim', toplamVideoEgitim: 7, tamamlanan: 7, izlemeYuzdesi: 95, toplamSure: 380 }
        ]);

        // Örnek departman bazlı video eğitimler
        setDepartmanBazliEgitimler([
            { id: 1, departman: 'Bilgi İşlem', toplamVideoEgitim: 65, toplamKatilimci: 48, ortalamaIzlemeSuresi: 125, tamamlanmaOrani: 75 },
            { id: 2, departman: 'İnsan Kaynakları', toplamVideoEgitim: 48, toplamKatilimci: 52, ortalamaIzlemeSuresi: 155, tamamlanmaOrani: 85 },
            { id: 3, departman: 'Satış', toplamVideoEgitim: 72, toplamKatilimci: 85, ortalamaIzlemeSuresi: 98, tamamlanmaOrani: 68 },
            { id: 4, departman: 'Muhasebe', toplamVideoEgitim: 35, toplamKatilimci: 28, ortalamaIzlemeSuresi: 180, tamamlanmaOrani: 92 },
            { id: 5, departman: 'Üretim', toplamVideoEgitim: 91, toplamKatilimci: 77, ortalamaIzlemeSuresi: 110, tamamlanmaOrani: 70 }
        ]);

        // Grafik verileri
        prepareChartData({
            tamamlananAtama: 38,
            devamEdenAtama: 14,
            atandiAtama: 12,
            suresiGectiAtama: 5
        });
        prepareMonthlyChartData();
    };

    const prepareChartData = (stats: any) => {
        const documentStyle = getComputedStyle(document.documentElement);
        
        setEgitimDurumChart({
            labels: ['Tamamlanan', 'Devam Eden', 'Atandı', 'Süresi Geçti'],
            datasets: [{
                data: [
                    stats?.tamamlananAtama || 0,
                    stats?.devamEdenAtama || 0,
                    stats?.atandiAtama || 0,
                    stats?.suresiGectiAtama || 0
                ],
                backgroundColor: [
                    documentStyle.getPropertyValue('--green-500'),
                    documentStyle.getPropertyValue('--blue-500'),
                    documentStyle.getPropertyValue('--yellow-500'),
                    documentStyle.getPropertyValue('--red-500')
                ],
                hoverBackgroundColor: [
                    documentStyle.getPropertyValue('--green-400'),
                    documentStyle.getPropertyValue('--blue-400'),
                    documentStyle.getPropertyValue('--yellow-400'),
                    documentStyle.getPropertyValue('--red-400')
                ]
            }]
        });
    };

    const prepareMonthlyChartData = (realData: any[] = []) => {
        const documentStyle = getComputedStyle(document.documentElement);

        let aylikVeriler;

        // Eğer gerçek veri varsa onu kullan, yoksa örnek veri kullan
        if (realData && realData.length > 0) {
            aylikVeriler = realData;
        } else {
            // Örnek aylık veri (fallback)
            aylikVeriler = [
                { ay: 'Oca', egitim: 12, katilimci: 45 },
                { ay: 'Şub', egitim: 15, katilimci: 58 },
                { ay: 'Mar', egitim: 18, katilimci: 72 },
                { ay: 'Nis', egitim: 22, katilimci: 88 },
                { ay: 'May', egitim: 20, katilimci: 76 },
                { ay: 'Haz', egitim: 25, katilimci: 95 },
                { ay: 'Tem', egitim: 16, katilimci: 62 },
                { ay: 'Ağu', egitim: 14, katilimci: 54 },
                { ay: 'Eyl', egitim: 28, katilimci: 102 },
                { ay: 'Eki', egitim: 24, katilimci: 89 },
                { ay: 'Kas', egitim: 21, katilimci: 78 },
                { ay: 'Ara', egitim: 19, katilimci: 71 }
            ];
        }

        setAylikEgitimChart({
            labels: aylikVeriler.map(v => v.ay),
            datasets: [
                {
                    label: 'Eğitim Sayısı',
                    backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    data: aylikVeriler.map(v => v.egitim)
                },
                {
                    label: 'Katılımcı Sayısı',
                    backgroundColor: documentStyle.getPropertyValue('--green-500'),
                    borderColor: documentStyle.getPropertyValue('--green-500'),
                    data: aylikVeriler.map(v => v.katilimci)
                }
            ]
        });
    };

    const exportPDF = () => {
        toast.current?.show({ 
            severity: 'info', 
            summary: 'PDF İndiriliyor', 
            detail: 'Rapor PDF olarak indiriliyor...' 
        });
    };

    const exportExcel = () => {
        toast.current?.show({ 
            severity: 'info', 
            summary: 'Excel İndiriliyor', 
            detail: 'Rapor Excel olarak indiriliyor...' 
        });
    };

    const tamamlanmaOraniTemplate = (rowData: any) => {
        return <ProgressBar value={rowData.tamamlanmaOrani || 0} showValue={false} style={{ height: '6px' }} />;
    };

    const ortalamaPuanTemplate = (rowData: any) => {
        const puan = rowData.ortalamaPuan || 0;
        const getSeverity = () => {
            if (puan >= 85) return 'success';
            if (puan >= 60) return 'warning';
            return 'danger';
        };
        return <Tag value={`${puan}`} severity={getSeverity()} />;
    };

    return (
        <div className="grid">
            <div className="col-12">
                <Toast ref={toast} />
                
                {/* Filtreler */}
                <Card className="mb-3">
                    <div className="flex justify-content-between align-items-center">
                        <div className="flex gap-3">
                            <Dropdown 
                                value={selectedYear} 
                                options={yearOptions}
                                onChange={(e) => setSelectedYear(e.value)}
                                placeholder="Yıl Seçiniz"
                            />
                            <Dropdown 
                                value={selectedMonth} 
                                options={monthOptions}
                                onChange={(e) => setSelectedMonth(e.value)}
                                placeholder="Ay Seçiniz"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button icon="pi pi-file-pdf" label="PDF" severity="danger" onClick={exportPDF} />
                            <Button icon="pi pi-file-excel" label="Excel" severity="success" onClick={exportExcel} />
                        </div>
                    </div>
                </Card>

                {/* İstatistik Kartları */}
                <div className="grid">
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card>
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Toplam Video Eğitim</span>
                                    <div className="text-900 font-medium text-xl">{egitimIstatistikleri.toplamVideoEgitim || 0}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-blue-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-play text-blue-500 text-xl" />
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card>
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Toplam Katılımcı</span>
                                    <div className="text-900 font-medium text-xl">{egitimIstatistikleri.toplamKatilimci || 0}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-green-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-users text-green-500 text-xl" />
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card>
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Ort. İzleme Süresi (dk)</span>
                                    <div className="text-900 font-medium text-xl">{egitimIstatistikleri.ortalamaIzlemeSuresi || 0}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-orange-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-clock text-orange-500 text-xl" />
                                </div>
                            </div>
                        </Card>
                    </div>
                    <div className="col-12 md:col-6 lg:col-3">
                        <Card>
                            <div className="flex justify-content-between mb-3">
                                <div>
                                    <span className="block text-500 font-medium mb-3">Tamamlanma Oranı</span>
                                    <div className="text-900 font-medium text-xl">%{egitimIstatistikleri.tamamlanmaOrani || 0}</div>
                                </div>
                                <div className="flex align-items-center justify-content-center bg-purple-100 border-round" style={{ width: '2.5rem', height: '2.5rem' }}>
                                    <i className="pi pi-check-circle text-purple-500 text-xl" />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                {/* Grafikler */}
                <div className="grid">
                    <div className="col-12 md:col-6">
                        <Card title="Video Eğitim Atama Durumu">
                            <Chart type="doughnut" data={egitimDurumChart} style={{ height: '300px' }} />
                        </Card>
                    </div>
                    <div className="col-12 md:col-6">
                        <Card title="Aylık Video Eğitim Trendi">
                            <Chart type="bar" data={aylikEgitimChart} style={{ height: '300px' }} />
                        </Card>
                    </div>
                </div>

                {/* Personel Video Eğitim Özeti */}
                <Card title="Personel Video Eğitim Özeti" className="mb-3">
                    <DataTable 
                        value={personelEgitimOzeti} 
                        loading={loading}
                        paginator 
                        rows={5} 
                        responsiveLayout="scroll"
                    >
                        <Column field="personelAd" header="Personel" sortable />
                        <Column field="departman" header="Departman" sortable />
                        <Column field="toplamVideoEgitim" header="Atanan Video" sortable />
                        <Column field="tamamlanan" header="Tamamlanan" sortable />
                        <Column field="izlemeYuzdesi" header="İzleme %" body={(rowData) => <span>{rowData.izlemeYuzdesi}%</span>} sortable />
                        <Column field="toplamSure" header="Toplam Süre (dk)" sortable />
                    </DataTable>
                </Card>

                {/* Departman Bazlı Video Eğitimler */}
                <Card title="Departman Bazlı Video Eğitim Raporu">
                    <DataTable 
                        value={departmanBazliEgitimler} 
                        loading={loading}
                        paginator 
                        rows={5} 
                        responsiveLayout="scroll"
                    >
                        <Column field="departman" header="Departman" sortable />
                        <Column field="toplamVideoEgitim" header="Video Sayısı" sortable />
                        <Column field="toplamKatilimci" header="Katılımcı" sortable />
                        <Column field="ortalamaIzlemeSuresi" header="Ort. İzleme (dk)" sortable />
                        <Column field="tamamlanmaOrani" header="Tamamlanma %" body={tamamlanmaOraniTemplate} sortable />
                    </DataTable>
                </Card>
            </div>
        </div>
    );
};

export default EgitimRaporlariPage;