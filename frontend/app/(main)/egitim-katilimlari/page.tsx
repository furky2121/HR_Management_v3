'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { MultiSelect } from 'primereact/multiselect';
import { Tag } from 'primereact/tag';
import { ProgressBar } from 'primereact/progressbar';
import videoEgitimService from '../../../src/services/videoEgitimService';
import personelService from '../../../src/services/personelService';
import departmanService from '../../../src/services/departmanService';
import pozisyonService from '../../../src/services/pozisyonService';

interface VideoEgitimAtama {
    id?: number;
    videoEgitimAd?: string;
    personelAd?: string;
    departmanAd?: string;
    pozisyonAd?: string;
    atayanPersonelAd?: string;
    atamaTarihi: Date;
    durum: string;
    not?: string;
    // Eski interface alanları - eski atama dialogu için
    personelId?: number;
    videoEgitimId?: number;
    atamaYapan?: string;
    baslangicTarihi?: Date | null;
    bitisTarihi?: Date | null;
}

const EgitimKatilimlariPage = () => {
    const [atamalar, setAtamalar] = useState<VideoEgitimAtama[]>([]);
    const [loading, setLoading] = useState(true);
    const [atamaDialog, setAtamaDialog] = useState(false);
    const [deleteAtamaDialog, setDeleteAtamaDialog] = useState(false);
    const [topluAtamaDialog, setTopluAtamaDialog] = useState(false);
    const [selectedAtama, setSelectedAtama] = useState<VideoEgitimAtama | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [personeller, setPersoneller] = useState<any[]>([]);
    const [videoEgitimler, setVideoEgitimler] = useState<any[]>([]);
    const [departmanlar, setDepartmanlar] = useState<any[]>([]);
    const [pozisyonlar, setPozisyonlar] = useState<any[]>([]);
    const [selectedVideoEgitimler, setSelectedVideoEgitimler] = useState<any[]>([]);
    const [selectedPersoneller, setSelectedPersoneller] = useState<any[]>([]);
    const [selectedDepartmanlar, setSelectedDepartmanlar] = useState<any[]>([]);
    const [selectedPozisyonlar, setSelectedPozisyonlar] = useState<any[]>([]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<VideoEgitimAtama[]>>(null);

    const durumOptions = [
        { label: 'Atandı', value: 'Atandı' },
        { label: 'Başlanmadı', value: 'Başlanmadı' },
        { label: 'İzleniyor', value: 'İzleniyor' },
        { label: 'Tamamlandı', value: 'Tamamlandı' },
        { label: 'İptal', value: 'İptal' }
    ];

    useEffect(() => {
        loadAtamalar();
        loadPersoneller();
        loadVideoEgitimler();
        loadDepartmanlar();
        loadPozisyonlar();
    }, []);

    const loadAtamalar = async () => {
        try {
            setLoading(true);
            const response = await videoEgitimService.getAtamalar();
            console.log('Atamalar response:', response);
            if (response.success) {
                console.log('Atamalar data:', response.data);
                console.log('Sample atama:', response.data[0]);
                setAtamalar(response.data);
            }
        } catch (error) {
            console.error('Atamalar yükleme hatası:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Atamalar yüklenirken hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadPersoneller = async () => {
        try {
            const response = await personelService.getPersonellerAktif();
            if (response.success) {
                setPersoneller(response.data.map((p: any) => ({
                    label: `${p.ad} ${p.soyad}`,
                    value: p.id
                })));
            }
        } catch (error) {
            console.error('Personeller yüklenirken hata:', error);
        }
    };

    const loadVideoEgitimler = async () => {
        try {
            const response = await videoEgitimService.getVideoEgitimler();
            if (response.success) {
                setVideoEgitimler(response.data.map((e: any) => ({
                    label: e.baslik,
                    value: e.id
                })));
            }
        } catch (error) {
            console.error('Video eğitimler yüklenirken hata:', error);
        }
    };

    const loadDepartmanlar = async () => {
        try {
            const response = await departmanService.getDepartmanlarAktif();
            if (response.success) {
                setDepartmanlar(response.data.map((d: any) => ({
                    label: d.ad,
                    value: d.id
                })));
            }
        } catch (error) {
            console.error('Departmanlar yüklenirken hata:', error);
        }
    };

    const loadPozisyonlar = async () => {
        try {
            const response = await pozisyonService.getPozisyonlarAktif();
            if (response.success) {
                setPozisyonlar(response.data.map((p: any) => ({
                    label: `${p.ad} (${p.departmanAd})`,
                    value: p.id
                })));
            }
        } catch (error) {
            console.error('Pozisyonlar yüklenirken hata:', error);
        }
    };


    const hideDeleteAtamaDialog = () => {
        setDeleteAtamaDialog(false);
    };

    const editAtama = (atama: VideoEgitimAtama) => {
        setSelectedAtama(atama);
        setAtamaDialog(true);
    };

    const confirmDeleteAtama = (atama: VideoEgitimAtama) => {
        setSelectedAtama(atama);
        setDeleteAtamaDialog(true);
    };

    const deleteAtama = async () => {
        if (!selectedAtama?.id) return;
        
        try {
            const response = await videoEgitimService.deleteAtama(selectedAtama.id);
            if (response.success) {
                toast.current?.show({ 
                    severity: 'success', 
                    summary: 'Başarılı', 
                    detail: 'Atama silindi' 
                });
                loadAtamalar();
                setDeleteAtamaDialog(false);
            }
        } catch (error) {
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Hata', 
                detail: 'Silme işlemi başarısız' 
            });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const openTopluAtama = () => {
        setSelectedVideoEgitimler([]);
        setSelectedPersoneller([]);
        setSelectedDepartmanlar([]);
        setSelectedPozisyonlar([]);
        setTopluAtamaDialog(true);
    };

    const saveTopluAtama = async () => {
        if (selectedVideoEgitimler.length === 0) {
            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Uyarı', 
                detail: 'En az bir video eğitim seçmelisiniz' 
            });
            return;
        }

        if (selectedPersoneller.length === 0 && selectedDepartmanlar.length === 0 && selectedPozisyonlar.length === 0) {
            toast.current?.show({ 
                severity: 'warn', 
                summary: 'Uyarı', 
                detail: 'Personel, departman veya pozisyon seçmelisiniz' 
            });
            return;
        }

        try {
            // Toplu atama için tek bir API çağrısı yap
            const topluAtamaData = {
                videoEgitimIds: selectedVideoEgitimler,
                personelIds: selectedPersoneller,
                departmanIds: selectedDepartmanlar,
                pozisyonIds: selectedPozisyonlar,
                not: 'Toplu atama'
            };

            const response = await videoEgitimService.topluAtamaYap(topluAtamaData);
            
            toast.current?.show({ 
                severity: 'success', 
                summary: 'Başarılı', 
                detail: `${selectedVideoEgitimler.length} video eğitim için toplu atama tamamlandı` 
            });
            
            loadAtamalar();
            setTopluAtamaDialog(false);
        } catch (error: any) {
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Hata', 
                detail: error.response?.data?.message || 'Toplu atama başarısız' 
            });
        }
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Toplu Atama" icon="pi pi-users" severity="success" onClick={openTopluAtama} />
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData: VideoEgitimAtama) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editAtama(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteAtama(rowData)} />
            </React.Fragment>
        );
    };

    const durumBodyTemplate = (rowData: VideoEgitimAtama) => {
        const getSeverity = (durum: string): "success" | "info" | "danger" | "warning" | null => {
            switch (durum) {
                case 'Tamamlandı': return 'success';
                case 'İzleniyor': return 'info';
                case 'Atandı': return 'warning';
                case 'Başlanmadı': return null;  // secondary yerine null
                case 'İptal': return 'danger';
                default: return null;
            }
        };
        return <Tag value={rowData.durum} severity={getSeverity(rowData.durum)} />;
    };


    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Video Eğitim Atamaları</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    onInput={(e) => setGlobalFilter((e.target as HTMLInputElement).value)} 
                    placeholder="Ara..." 
                />
            </span>
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <div className="card">
                    <Toast ref={toast} />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                    <DataTable 
                        ref={dt}
                        value={atamalar} 
                        dataKey="id"
                        loading={loading}
                        paginator 
                        rows={10} 
                        rowsPerPageOptions={[5, 10, 25]}
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="{first} - {last} / {totalRecords} kayıt"
                        globalFilter={globalFilter}
                        header={header}
                        responsiveLayout="scroll"
                    >
                        <Column field="videoEgitimAd" header="Video Eğitim" sortable />
                        <Column field="personelAd" header="Personel" sortable />
                        <Column field="departmanAd" header="Departman" sortable />
                        <Column field="pozisyonAd" header="Pozisyon" sortable />
                        <Column field="atayanPersonelAd" header="Atayan" sortable />
                        <Column field="atamaTarihi" header="Atama Tarihi" body={(rowData) => new Date(rowData.atamaTarihi).toLocaleDateString('tr-TR')} sortable />
                        <Column field="durum" header="Durum" body={durumBodyTemplate} sortable />
                        <Column field="not" header="Not" sortable />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                    </DataTable>


                    <Dialog 
                        visible={deleteAtamaDialog} 
                        style={{ width: '450px' }} 
                        header="Onayla" 
                        modal 
                        footer={
                            <>
                                <Button label="Hayır" icon="pi pi-times" outlined onClick={hideDeleteAtamaDialog} />
                                <Button label="Evet" icon="pi pi-check" severity="danger" onClick={deleteAtama} />
                            </>
                        }
                        onHide={hideDeleteAtamaDialog}
                    >
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>Bu video eğitim atamasını silmek istediğinizden emin misiniz?</span>
                        </div>
                    </Dialog>

                    {/* Toplu Atama Dialog */}
                    <Dialog 
                        visible={topluAtamaDialog} 
                        style={{ width: '90vw', maxWidth: '800px' }} 
                        header="🎯 Toplu Video Eğitim Atama" 
                        modal 
                        className="p-fluid"
                        footer={
                            <>
                                <Button label="İptal" icon="pi pi-times" outlined onClick={() => setTopluAtamaDialog(false)} />
                                <Button label="Toplu Ata" icon="pi pi-check" onClick={saveTopluAtama} />
                            </>
                        }
                        onHide={() => setTopluAtamaDialog(false)}
                        breakpoints={{'960px': '75vw', '641px': '100vw'}}
                    >
                        <div className="formgrid grid">
                            <div className="col-12">
                                <h5 className="text-900 mb-3">📚 Video Eğitim Seçimi</h5>
                            </div>
                            
                            <div className="col-12">
                                <label className="block text-900 font-medium mb-2">
                                    Video Eğitimler *
                                </label>
                                <MultiSelect 
                                    value={selectedVideoEgitimler} 
                                    options={videoEgitimler} 
                                    onChange={(e) => setSelectedVideoEgitimler(e.value)} 
                                    placeholder="Video eğitimler seçin..."
                                    filter
                                    showClear
                                    display="chip"
                                    className="w-full"
                                />
                            </div>

                            <div className="col-12">
                                <h5 className="text-900 mb-3">👥 Hedef Seçimi</h5>
                                <p className="text-600 text-sm mb-3">En az bir hedef grubu seçmelisiniz</p>
                            </div>
                            
                            <div className="col-12">
                                <label className="block text-900 font-medium mb-2">
                                    Kişi Bazlı Atama
                                </label>
                                <MultiSelect 
                                    value={selectedPersoneller} 
                                    options={personeller} 
                                    onChange={(e) => setSelectedPersoneller(e.value)} 
                                    placeholder="Personel seçin..."
                                    filter
                                    showClear
                                    display="chip"
                                    className="w-full"
                                />
                            </div>
                            
                            <div className="col-12 md:col-6">
                                <label className="block text-900 font-medium mb-2">
                                    Departman Bazlı Atama
                                </label>
                                <MultiSelect 
                                    value={selectedDepartmanlar} 
                                    options={departmanlar} 
                                    onChange={(e) => setSelectedDepartmanlar(e.value)} 
                                    placeholder="Departman seçin..."
                                    showClear
                                    display="chip"
                                    className="w-full"
                                />
                            </div>
                            
                            <div className="col-12 md:col-6">
                                <label className="block text-900 font-medium mb-2">
                                    Pozisyon Bazlı Atama
                                </label>
                                <MultiSelect 
                                    value={selectedPozisyonlar} 
                                    options={pozisyonlar} 
                                    onChange={(e) => setSelectedPozisyonlar(e.value)} 
                                    placeholder="Pozisyon seçin..."
                                    showClear
                                    display="chip"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default EgitimKatilimlariPage;