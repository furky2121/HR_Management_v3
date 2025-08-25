import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Card } from 'primereact/card';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Badge } from 'primereact/badge';
import { ProgressBar } from 'primereact/progressbar';
import { Panel } from 'primereact/panel';
import { TabView, TabPanel } from 'primereact/tabview';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Skeleton } from 'primereact/skeleton';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import { Timeline } from 'primereact/timeline';
import axios from 'axios';
import api from '../services/api';
import authService from '../services/authService';
import './Dashboard.css';

const Dashboard = () => {
    const [genelIstatistikler, setGenelIstatistikler] = useState(null);
    const [personelTrend, setPersonelTrend] = useState([]);
    const [izinTrend, setIzinTrend] = useState([]);
    const [egitimAnaliz, setEgitimAnaliz] = useState(null);
    const [maasAnaliz, setMaasAnaliz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);
    const [trendPeriod, setTrendPeriod] = useState(12);
    const toast = useRef(null);

    // Typewriter effect state
    const [typewriterText, setTypewriterText] = useState('');
    const [showCursor, setShowCursor] = useState(true);

    const trendPeriodOptions = [
        { label: 'Son 7 Gün', value: 7 },
        { label: 'Son 30 Gün', value: 30 },
        { label: 'Son 12 Ay', value: 12 }
    ];

    useEffect(() => {
        loadAllData();
        // Refresh data every 30 seconds
        const interval = setInterval(() => {
            loadAllData();
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        loadPersonelTrend();
    }, [trendPeriod]);

    // Typewriter effect
    useEffect(() => {
        const phrases = [
            'Canlı Veriler',
            'Gerçek Zamanlı Analiz', 
            'Güncel İstatistikler',
            'Anlık Raporlar',
            'Canlı Veriler'
        ];
        
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let timeoutId;

        const typeEffect = () => {
            const currentPhrase = phrases[phraseIndex];
            
            if (isDeleting) {
                setTypewriterText(currentPhrase.substring(0, charIndex - 1));
                charIndex--;
            } else {
                setTypewriterText(currentPhrase.substring(0, charIndex + 1));
                charIndex++;
            }

            let typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentPhrase.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                phraseIndex = (phraseIndex + 1) % phrases.length;
                typeSpeed = 500; // Pause between phrases
            }

            timeoutId = setTimeout(typeEffect, typeSpeed);
        };

        // Start typewriter effect after initial load
        const startTimeout = setTimeout(() => {
            typeEffect();
        }, 1000);

        // Cursor blink effect
        const cursorInterval = setInterval(() => {
            setShowCursor(prev => !prev);
        }, 500);

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(timeoutId);
            clearInterval(cursorInterval);
        };
    }, []);

    const loadAllData = async () => {
        setLoading(true);
        try {
            await Promise.all([
                loadGenelIstatistikler(),
                loadPersonelTrend(),
                loadIzinTrend(),
                loadEgitimAnaliz(),
                loadMaasAnaliz()
            ]);
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Dashboard verileri yüklenemedi.' });
        } finally {
            setLoading(false);
        }
    };

    const loadGenelIstatistikler = async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${api.getBaseURL()}/Dashboard/Genel`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                console.log('Dashboard Data Loaded:', response.data.data);
                setGenelIstatistikler(response.data.data);
            }
        } catch (error) {
            console.error('Genel istatistikler yüklenemedi:', error);
        }
    };

    const loadPersonelTrend = async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${api.getBaseURL()}/Dashboard/PersonelTrend?aylikMi=${trendPeriod}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setPersonelTrend(response.data.data);
            }
        } catch (error) {
            console.error('Personel trend verileri yüklenemedi:', error);
        }
    };

    const loadIzinTrend = async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${api.getBaseURL()}/Dashboard/IzinTrend`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setIzinTrend(response.data.data);
            }
        } catch (error) {
            console.error('İzin trend verileri yüklenemedi:', error);
        }
    };

    const loadEgitimAnaliz = async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${api.getBaseURL()}/Dashboard/EgitimAnaliz`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setEgitimAnaliz(response.data.data);
            }
        } catch (error) {
            console.error('Eğitim analiz verileri yüklenemedi:', error);
        }
    };

    const loadMaasAnaliz = async () => {
        try {
            const token = authService.getToken();
            const response = await axios.get(`${api.getBaseURL()}/Dashboard/MaasAnaliz`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.data.success) {
                setMaasAnaliz(response.data.data);
            }
        } catch (error) {
            console.error('Maaş analiz verileri yüklenemedi:', error);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('tr-TR', { 
            style: 'currency', 
            currency: 'TRY',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };

    const getPersonelTrendChart = useMemo(() => {
        if (!personelTrend.length) return null;

        const data = {
            labels: personelTrend.map(item => item.donem),
            datasets: [
                {
                    label: 'Yeni Personel',
                    data: personelTrend.map(item => item.yeniPersonel),
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2
                },
                {
                    label: 'Çıkan Personel',
                    data: personelTrend.map(item => item.cikanPersonel),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Personel Giriş-Çıkış Trendi'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        };

        return <Chart type="bar" data={data} options={options} style={{ height: '300px' }} />;
    }, [personelTrend]);

    const getIzinTrendChart = useMemo(() => {
        if (!izinTrend.length) return null;

        const data = {
            labels: izinTrend.map(item => item.donem),
            datasets: [
                {
                    label: 'Onaylanan İzinler',
                    data: izinTrend.map(item => item.onaylananSayisi),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    type: 'bar'
                },
                {
                    label: 'Onay Oranı (%)',
                    data: izinTrend.map(item => item.onayOrani),
                    backgroundColor: 'rgba(255, 206, 86, 0.6)',
                    borderColor: 'rgba(255, 206, 86, 1)',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'İzin Talepleri ve Onay Oranları'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        drawOnChartArea: false,
                    },
                }
            }
        };

        return <Chart type="bar" data={data} options={options} style={{ height: '300px' }} />;
    }, [izinTrend]);

    const getDepartmanDagilimiChart = useMemo(() => {
        if (!genelIstatistikler?.departmanDagilimi) return null;

        const data = {
            labels: genelIstatistikler.departmanDagilimi.map(item => item.departman),
            datasets: [{
                data: genelIstatistikler.departmanDagilimi.map(item => item.personelSayisi),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384',
                    '#36A2EB'
                ],
                hoverBackgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF',
                    '#FF9F40',
                    '#FF6384',
                    '#36A2EB'
                ]
            }]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Departman Dağılımı'
                },
                legend: {
                    position: 'bottom'
                }
            }
        };

        return <Chart type="doughnut" data={data} options={options} style={{ height: '300px' }} />;
    }, [genelIstatistikler?.departmanDagilimi]);

    const getMaasTrendChart = useMemo(() => {
        if (!maasAnaliz?.bordroTrendAnalizi) return null;

        const data = {
            labels: maasAnaliz.bordroTrendAnalizi.map(item => item.donem),
            datasets: [
                {
                    label: 'Toplam Brüt Maaş',
                    data: maasAnaliz.bordroTrendAnalizi.map(item => item.toplamBrutMaas),
                    backgroundColor: 'rgba(75, 192, 192, 0.6)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 2,
                    yAxisID: 'y'
                },
                {
                    label: 'Ortalama Maaş',
                    data: maasAnaliz.bordroTrendAnalizi.map(item => item.ortalamaMaas),
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        };

        const options = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Maaş Trend Analizi'
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    beginAtZero: true,
                    grid: {
                        drawOnChartArea: false,
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            }
        };

        return <Chart type="bar" data={data} options={options} style={{ height: '300px' }} />;
    }, [maasAnaliz?.bordroTrendAnalizi]);

    const renderStatCard = (title, value, icon, color, subtitle = null, trend = null) => {
        return (
            <Card className="stat-card">
                <div className="flex align-items-center justify-content-between">
                    <div>
                        <div className="text-500 font-medium mb-2">{title}</div>
                        <div className={`text-3xl font-bold ${color}`}>{value}</div>
                        {subtitle && <div className="text-500 text-sm mt-1">{subtitle}</div>}
                        {trend && (
                            <div className="mt-2">
                                <Tag 
                                    value={trend.label} 
                                    severity={trend.positive ? 'success' : 'danger'}
                                    icon={trend.positive ? 'pi pi-arrow-up' : 'pi pi-arrow-down'}
                                />
                            </div>
                        )}
                    </div>
                    <div className="stat-icon">
                        <i className={`${icon} text-4xl ${color}`}></i>
                    </div>
                </div>
            </Card>
        );
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="grid">
                    {[1,2,3,4].map(i => (
                        <div key={i} className="col-12 lg:col-3 md:col-6">
                            <Skeleton height="120px" className="mb-2"></Skeleton>
                        </div>
                    ))}
                    {[1,2,3,4].map(i => (
                        <div key={i} className="col-12 lg:col-6">
                            <Skeleton height="350px" className="mb-2"></Skeleton>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <Toast ref={toast} />
            
            <div className="dashboard-header mb-4">
                <h1 className="text-3xl font-bold text-white m-0">BilgeLojistik İK Dashboard</h1>
                <p className="text-white m-0 mt-1" style={{opacity: 0.9}}>
                    İnsan kaynakları yönetim sistemi genel bakış - 
                    <span style={{minWidth: '120px', display: 'inline-block'}}>
                        {typewriterText}
                        <span style={{opacity: showCursor ? 1 : 0}}>|</span>
                    </span>
                </p>
            </div>

            <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                <TabPanel header="Genel Bakış" leftIcon="pi pi-home">
                    {/* İstatistik Kartları */}
                    <div className="grid mb-4">
                        <div className="col-12 lg:col-3 md:col-6">
                            {renderStatCard(
                                'Toplam Personel',
                                genelIstatistikler?.personelIstatistikleri?.toplamPersonel || 0,
                                'pi pi-users',
                                'text-blue-500'
                            )}
                        </div>
                        <div className="col-12 lg:col-3 md:col-6">
                            {renderStatCard(
                                'Aktif Personel',
                                genelIstatistikler?.personelIstatistikleri?.aktifPersonel || 0,
                                'pi pi-check-circle',
                                'text-green-500'
                            )}
                        </div>
                        <div className="col-12 lg:col-3 md:col-6">
                            {renderStatCard(
                                'Bekleyen İzinler',
                                genelIstatistikler?.izinIstatistikleri?.bekleyenIzin || 0,
                                'pi pi-clock',
                                'text-orange-500'
                            )}
                        </div>
                        <div className="col-12 lg:col-3 md:col-6">
                            {renderStatCard(
                                'Devam Eden Eğitimler',
                                genelIstatistikler?.egitimIstatistikleri?.devamEdenEgitim || 0,
                                'pi pi-book',
                                'text-purple-500'
                            )}
                        </div>
                    </div>

                    {/* Grafikler */}
                    <div className="grid mb-4">
                        <div className="col-12 lg:col-6">
                            <Card title="Departman Dağılımı" className="h-full">
                                {getDepartmanDagilimiChart}
                            </Card>
                        </div>
                        <div className="col-12 lg:col-6">
                            <Card className="h-full">
                                <div className="flex align-items-center justify-content-between mb-3">
                                    <h3 className="m-0">Personel Trendi</h3>
                                    <Dropdown 
                                        value={trendPeriod} 
                                        options={trendPeriodOptions} 
                                        onChange={(e) => setTrendPeriod(e.value)} 
                                        className="w-auto"
                                    />
                                </div>
                                {getPersonelTrendChart}
                            </Card>
                        </div>
                    </div>

                    {/* Hızlı İstatistikler */}
                    <div className="grid">
                        <div className="col-12 lg:col-4">
                            <Panel header="İzin İstatistikleri" className="h-full">
                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Toplam Talep</span>
                                        <Badge value={genelIstatistikler?.izinIstatistikleri?.toplamIzinTalebi || 0} />
                                    </div>
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Onaylanan</span>
                                        <Badge value={genelIstatistikler?.izinIstatistikleri?.onaylananIzin || 0} severity="success" />
                                    </div>
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Reddedilen</span>
                                        <Badge value={genelIstatistikler?.izinIstatistikleri?.reddedilenIzin || 0} severity="danger" />
                                    </div>
                                </div>
                            </Panel>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Panel header="Eğitim İstatistikleri" className="h-full">
                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Bu Ay Toplam</span>
                                        <Badge value={genelIstatistikler?.egitimIstatistikleri?.buAyToplamEgitim || 0} />
                                    </div>
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Tamamlanan</span>
                                        <Badge value={genelIstatistikler?.egitimIstatistikleri?.tamamlananEgitim || 0} severity="success" />
                                    </div>
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Planlanan</span>
                                        <Badge value={genelIstatistikler?.egitimIstatistikleri?.planlananEgitim || 0} severity="info" />
                                    </div>
                                </div>
                            </Panel>
                        </div>
                        <div className="col-12 lg:col-4">
                            <Panel header="Maaş İstatistikleri" className="h-full">
                                <div className="flex flex-column gap-3">
                                    <div className="flex align-items-center justify-content-between">
                                        <span>Bu Ay Bordro</span>
                                        <Badge value={genelIstatistikler?.maasIstatistikleri?.buAyBordroSayisi || 0} />
                                    </div>
                                    <div className="text-sm text-600">
                                        Toplam Brüt: {formatCurrency(genelIstatistikler?.maasIstatistikleri?.toplamBrutMaas || 0)}
                                    </div>
                                    <div className="text-sm text-600">
                                        Ortalama: {formatCurrency(genelIstatistikler?.maasIstatistikleri?.ortalamaMaas || 0)}
                                    </div>
                                </div>
                            </Panel>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="İzin Analizi" leftIcon="pi pi-calendar">
                    <div className="grid">
                        <div className="col-12">
                            <Card title="İzin Trend Analizi">
                                {getIzinTrendChart}
                            </Card>
                        </div>
                    </div>
                </TabPanel>

                <TabPanel header="Eğitim Analizi" leftIcon="pi pi-book">
                    {egitimAnaliz && (
                        <div className="grid">
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'Toplam Eğitim',
                                    egitimAnaliz.genelAnaliz?.toplamEgitimSayisi || 0,
                                    'pi pi-book',
                                    'text-blue-500'
                                )}
                            </div>
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'Katılımcı Sayısı',
                                    egitimAnaliz.genelAnaliz?.toplamKatilimciSayisi || 0,
                                    'pi pi-users',
                                    'text-green-500'
                                )}
                            </div>
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'Başarı Oranı',
                                    `%${Math.round(egitimAnaliz.basariOrani || 0)}`,
                                    'pi pi-check-circle',
                                    'text-orange-500'
                                )}
                            </div>
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'Ortalama Puan',
                                    (egitimAnaliz.genelAnaliz?.ortalamaPuan || 0).toFixed(1),
                                    'pi pi-star',
                                    'text-purple-500'
                                )}
                            </div>
                            
                            {egitimAnaliz.departmanKatilimi && (
                                <div className="col-12">
                                    <Card title="Departman Bazında Eğitim Katılımı">
                                        <DataTable value={egitimAnaliz.departmanKatilimi} paginator rows={10}>
                                            <Column field="departman" header="Departman" />
                                            <Column field="toplamKatilim" header="Toplam Katılım" />
                                            <Column field="basariliKatilim" header="Başarılı Katılım" />
                                            <Column 
                                                field="basariOrani" 
                                                header="Başarı Oranı" 
                                                body={(rowData) => (
                                                    <div className="flex align-items-center gap-2">
                                                        <ProgressBar value={rowData.basariOrani} style={{ width: '100px' }} />
                                                        <span>%{Math.round(rowData.basariOrani)}</span>
                                                    </div>
                                                )}
                                            />
                                            <Column 
                                                field="ortalamaPuan" 
                                                header="Ortalama Puan"
                                                body={(rowData) => rowData.ortalamaPuan.toFixed(1)}
                                            />
                                        </DataTable>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </TabPanel>

                <TabPanel header="Maaş Analizi" leftIcon="pi pi-money-bill">
                    {maasAnaliz && (
                        <div className="grid">
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'Ortalama Maaş',
                                    formatCurrency(maasAnaliz.genelIstatistikler?.ortalamaMaas || 0),
                                    'pi pi-chart-line',
                                    'text-blue-500'
                                )}
                            </div>
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'En Yüksek Maaş',
                                    formatCurrency(maasAnaliz.genelIstatistikler?.enYuksekMaas || 0),
                                    'pi pi-arrow-up',
                                    'text-green-500'
                                )}
                            </div>
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'En Düşük Maaş',
                                    formatCurrency(maasAnaliz.genelIstatistikler?.enDusukMaas || 0),
                                    'pi pi-arrow-down',
                                    'text-orange-500'
                                )}
                            </div>
                            <div className="col-12 lg:col-3">
                                {renderStatCard(
                                    'Toplam Personel',
                                    maasAnaliz.genelIstatistikler?.toplamAktifPersonel || 0,
                                    'pi pi-users',
                                    'text-purple-500'
                                )}
                            </div>

                            <div className="col-12">
                                <Card title="Maaş Trend Analizi">
                                    {getMaasTrendChart}
                                </Card>
                            </div>

                            {maasAnaliz.departmanMaasAnalizi && (
                                <div className="col-12">
                                    <Card title="Departman Bazında Maaş Analizi">
                                        <DataTable value={maasAnaliz.departmanMaasAnalizi} paginator rows={10}>
                                            <Column field="departman" header="Departman" />
                                            <Column field="personelSayisi" header="Personel Sayısı" />
                                            <Column 
                                                field="ortalamaMaas" 
                                                header="Ortalama Maaş"
                                                body={(rowData) => formatCurrency(rowData.ortalamaMaas)}
                                                sortable
                                            />
                                            <Column 
                                                field="minMaas" 
                                                header="Min Maaş"
                                                body={(rowData) => formatCurrency(rowData.minMaas)}
                                            />
                                            <Column 
                                                field="maxMaas" 
                                                header="Max Maaş"
                                                body={(rowData) => formatCurrency(rowData.maxMaas)}
                                            />
                                            <Column 
                                                field="toplamMaas" 
                                                header="Toplam Maaş"
                                                body={(rowData) => formatCurrency(rowData.toplamMaas)}
                                            />
                                        </DataTable>
                                    </Card>
                                </div>
                            )}
                        </div>
                    )}
                </TabPanel>
            </TabView>
        </div>
    );
};

export default Dashboard;