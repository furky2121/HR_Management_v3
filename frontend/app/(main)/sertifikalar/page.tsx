'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Toolbar } from 'primereact/toolbar';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import egitimService from '../../../src/services/egitimService';

interface Sertifika {
    id?: number;
    personelId: number;
    personelAdSoyad?: string;
    egitimId: number;
    egitimAdi?: string;
    sertifikaNo: string;
    verilisTarihi: Date | null;
    gecerlilikTarihi: Date | null;
    kurum: string;
    puan: number;
    durum: string;
}

const SertifikalarPage = () => {
    const [sertifikalar, setSertifikalar] = useState<Sertifika[]>([]);
    const [loading, setLoading] = useState(true);
    const [sertifikaDialog, setSertifikaDialog] = useState(false);
    const [selectedSertifika, setSelectedSertifika] = useState<Sertifika | null>(null);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Sertifika[]>>(null);

    useEffect(() => {
        loadSertifikalar();
    }, []);

    const loadSertifikalar = async () => {
        try {
            setLoading(true);
            // Örnek veri - gerçek API'den gelecek
            setSertifikalar([
                {
                    id: 1,
                    personelId: 1,
                    personelAdSoyad: 'Ahmet Yılmaz',
                    egitimId: 1,
                    egitimAdi: 'İleri Excel Eğitimi',
                    sertifikaNo: 'CERT-2024-001',
                    verilisTarihi: new Date('2024-01-15'),
                    gecerlilikTarihi: new Date('2026-01-15'),
                    kurum: 'Microsoft',
                    puan: 92,
                    durum: 'Geçerli'
                },
                {
                    id: 2,
                    personelId: 2,
                    personelAdSoyad: 'Ayşe Demir',
                    egitimId: 2,
                    egitimAdi: 'Proje Yönetimi',
                    sertifikaNo: 'CERT-2024-002',
                    verilisTarihi: new Date('2024-02-20'),
                    gecerlilikTarihi: new Date('2025-02-20'),
                    kurum: 'PMI',
                    puan: 88,
                    durum: 'Geçerli'
                },
                {
                    id: 3,
                    personelId: 3,
                    personelAdSoyad: 'Mehmet Kaya',
                    egitimId: 3,
                    egitimAdi: 'İş Güvenliği Uzmanı',
                    sertifikaNo: 'CERT-2023-045',
                    verilisTarihi: new Date('2023-06-10'),
                    gecerlilikTarihi: new Date('2024-06-10'),
                    kurum: 'ÇSGB',
                    puan: 75,
                    durum: 'Süresi Dolmuş'
                },
                {
                    id: 4,
                    personelId: 4,
                    personelAdSoyad: 'Fatma Öz',
                    egitimId: 4,
                    egitimAdi: 'ISO 9001 İç Denetçi',
                    sertifikaNo: 'CERT-2024-003',
                    verilisTarihi: new Date('2024-03-05'),
                    gecerlilikTarihi: new Date('2027-03-05'),
                    kurum: 'TÜV',
                    puan: 95,
                    durum: 'Geçerli'
                },
                {
                    id: 5,
                    personelId: 5,
                    personelAdSoyad: 'Ali Veli',
                    egitimId: 5,
                    egitimAdi: 'Python Programlama',
                    sertifikaNo: 'CERT-2024-004',
                    verilisTarihi: new Date('2024-04-12'),
                    gecerlilikTarihi: null,
                    kurum: 'Coursera',
                    puan: 86,
                    durum: 'Geçerli'
                }
            ]);
        } catch (error) {
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Hata', 
                detail: 'Sertifikalar yüklenirken hata oluştu' 
            });
        } finally {
            setLoading(false);
        }
    };

    const viewSertifika = (sertifika: Sertifika) => {
        setSelectedSertifika(sertifika);
        setSertifikaDialog(true);
    };

    const hideSertifikaDialog = () => {
        setSertifikaDialog(false);
        setSelectedSertifika(null);
    };

    const printSertifika = () => {
        window.print();
        toast.current?.show({ 
            severity: 'success', 
            summary: 'Başarılı', 
            detail: 'Sertifika yazdırılıyor...' 
        });
    };

    const downloadSertifika = () => {
        toast.current?.show({ 
            severity: 'info', 
            summary: 'İndiriliyor', 
            detail: 'Sertifika PDF olarak indiriliyor...' 
        });
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData: Sertifika) => {
        return (
            <React.Fragment>
                <Button 
                    icon="pi pi-eye" 
                    rounded 
                    outlined 
                    className="mr-2" 
                    onClick={() => viewSertifika(rowData)} 
                    tooltip="Görüntüle"
                />
                <Button 
                    icon="pi pi-download" 
                    rounded 
                    outlined 
                    severity="info" 
                    onClick={downloadSertifika}
                    tooltip="İndir"
                />
            </React.Fragment>
        );
    };

    const durumBodyTemplate = (rowData: Sertifika) => {
        const getSeverity = (durum: string) => {
            switch (durum) {
                case 'Geçerli': return 'success';
                case 'Süresi Dolmuş': return 'danger';
                case 'İptal': return 'warning';
                default: return null;
            }
        };
        return <Tag value={rowData.durum} severity={getSeverity(rowData.durum)} />;
    };

    const puanBodyTemplate = (rowData: Sertifika) => {
        const getSeverity = (puan: number) => {
            if (puan >= 85) return 'success';
            if (puan >= 60) return 'warning';
            return 'danger';
        };
        return <Tag value={`${rowData.puan}`} severity={getSeverity(rowData.puan)} />;
    };

    const dateBodyTemplate = (rowData: Sertifika, field: 'verilisTarihi' | 'gecerlilikTarihi') => {
        const date = rowData[field];
        if (!date) return '-';
        
        const dateObj = new Date(date);
        const formatted = dateObj.toLocaleDateString('tr-TR');
        
        // Geçerlilik tarihi kontrolü
        if (field === 'gecerlilikTarihi') {
            const today = new Date();
            const diffTime = dateObj.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                return <span className="text-red-500">{formatted} (Süresi dolmuş)</span>;
            } else if (diffDays < 30) {
                return <span className="text-orange-500">{formatted} ({diffDays} gün kaldı)</span>;
            }
        }
        
        return formatted;
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Sertifikalar</h4>
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
                    <Toolbar className="mb-4" right={rightToolbarTemplate} />

                    <DataTable 
                        ref={dt}
                        value={sertifikalar} 
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
                        <Column field="sertifikaNo" header="Sertifika No" sortable style={{ minWidth: '10rem' }} />
                        <Column field="personelAdSoyad" header="Personel" sortable style={{ minWidth: '12rem' }} />
                        <Column field="egitimAdi" header="Eğitim" sortable style={{ minWidth: '12rem' }} />
                        <Column field="kurum" header="Kurum" sortable style={{ minWidth: '10rem' }} />
                        <Column field="verilisTarihi" header="Veriliş Tarihi" body={(rowData) => dateBodyTemplate(rowData, 'verilisTarihi')} sortable style={{ minWidth: '10rem' }} />
                        <Column field="gecerlilikTarihi" header="Geçerlilik Tarihi" body={(rowData) => dateBodyTemplate(rowData, 'gecerlilikTarihi')} sortable style={{ minWidth: '12rem' }} />
                        <Column field="puan" header="Puan" body={puanBodyTemplate} sortable style={{ minWidth: '6rem' }} />
                        <Column field="durum" header="Durum" body={durumBodyTemplate} sortable style={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                    </DataTable>

                    <Dialog 
                        visible={sertifikaDialog} 
                        style={{ width: '600px' }} 
                        header="Sertifika Detayı" 
                        modal 
                        className="p-fluid" 
                        footer={
                            <div className="flex justify-content-end gap-2">
                                <Button label="Yazdır" icon="pi pi-print" onClick={printSertifika} />
                                <Button label="PDF İndir" icon="pi pi-download" severity="info" onClick={downloadSertifika} />
                                <Button label="Kapat" icon="pi pi-times" outlined onClick={hideSertifikaDialog} />
                            </div>
                        }
                        onHide={hideSertifikaDialog}
                    >
                        {selectedSertifika && (
                            <Card className="sertifika-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                                <div className="text-center mb-4">
                                    <h2 className="text-4xl font-bold mb-2">SERTİFİKA</h2>
                                    <p className="text-xl">{selectedSertifika.kurum}</p>
                                </div>
                                
                                <Divider />
                                
                                <div className="text-center mb-4">
                                    <p className="text-lg mb-2">Bu belge</p>
                                    <h3 className="text-2xl font-bold mb-2">{selectedSertifika.personelAdSoyad}</h3>
                                    <p className="text-lg">kişisinin</p>
                                </div>
                                
                                <div className="text-center mb-4">
                                    <h4 className="text-xl font-bold mb-2">{selectedSertifika.egitimAdi}</h4>
                                    <p className="text-lg">eğitimini başarıyla tamamladığını gösterir.</p>
                                </div>
                                
                                <Divider />
                                
                                <div className="grid">
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Sertifika No:</strong></p>
                                        <p>{selectedSertifika.sertifikaNo}</p>
                                    </div>
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Başarı Puanı:</strong></p>
                                        <p>{selectedSertifika.puan}/100</p>
                                    </div>
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Veriliş Tarihi:</strong></p>
                                        <p>{selectedSertifika.verilisTarihi ? new Date(selectedSertifika.verilisTarihi).toLocaleDateString('tr-TR') : '-'}</p>
                                    </div>
                                    <div className="col-6">
                                        <p className="mb-1"><strong>Geçerlilik Tarihi:</strong></p>
                                        <p>{selectedSertifika.gecerlilikTarihi ? new Date(selectedSertifika.gecerlilikTarihi).toLocaleDateString('tr-TR') : 'Süresiz'}</p>
                                    </div>
                                </div>
                                
                                <div className="text-center mt-4">
                                    <div className="flex justify-content-around">
                                        <div>
                                            <div style={{ borderTop: '2px solid white', width: '150px', marginTop: '50px' }}></div>
                                            <p className="mt-2">Eğitim Koordinatörü</p>
                                        </div>
                                        <div>
                                            <div style={{ borderTop: '2px solid white', width: '150px', marginTop: '50px' }}></div>
                                            <p className="mt-2">Genel Müdür</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default SertifikalarPage;