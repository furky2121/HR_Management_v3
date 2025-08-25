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
import { InputNumber } from 'primereact/inputnumber';
import { Tag } from 'primereact/tag';
import egitimService from '../../../src/services/egitimService';
import personelService from '../../../src/services/personelService';

interface PersonelEgitimi {
    id?: number;
    personelId: number;
    egitimId: number;
    katilimTarihi: Date | null;
    tamamlamaTarihi: Date | null;
    puan: number | null;
    sertifikaNo: string;
    durum: string;
    personelAdSoyad?: string;
    egitimAdi?: string;
}

const EgitimKatilimlariPage = () => {
    const [katilimlar, setKatilimlar] = useState<PersonelEgitimi[]>([]);
    const [loading, setLoading] = useState(true);
    const [katilimDialog, setKatilimDialog] = useState(false);
    const [deleteKatilimDialog, setDeleteKatilimDialog] = useState(false);
    const [katilim, setKatilim] = useState<PersonelEgitimi>({
        personelId: 0,
        egitimId: 0,
        katilimTarihi: null,
        tamamlamaTarihi: null,
        puan: null,
        sertifikaNo: '',
        durum: 'Planlandı'
    });
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [personeller, setPersoneller] = useState<any[]>([]);
    const [egitimler, setEgitimler] = useState<any[]>([]);
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<PersonelEgitimi[]>>(null);

    const durumOptions = [
        { label: 'Planlandı', value: 'Planlandı' },
        { label: 'Devam Ediyor', value: 'Devam Ediyor' },
        { label: 'Tamamlandı', value: 'Tamamlandı' },
        { label: 'İptal', value: 'İptal' }
    ];

    useEffect(() => {
        loadKatilimlar();
        loadPersoneller();
        loadEgitimler();
    }, []);

    const loadKatilimlar = async () => {
        try {
            setLoading(true);
            const response = await egitimService.getPersonelEgitimleri();
            if (response.data.success) {
                setKatilimlar(response.data.data);
            }
        } catch (error) {
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Hata', 
                detail: 'Katılımlar yüklenirken hata oluştu' 
            });
        } finally {
            setLoading(false);
        }
    };

    const loadPersoneller = async () => {
        try {
            const response = await personelService.getPersoneller();
            if (response.data.success) {
                setPersoneller(response.data.data.map((p: any) => ({
                    label: `${p.ad} ${p.soyad}`,
                    value: p.id
                })));
            }
        } catch (error) {
            console.error('Personeller yüklenirken hata:', error);
        }
    };

    const loadEgitimler = async () => {
        try {
            const response = await egitimService.getEgitimler();
            if (response.data.success) {
                setEgitimler(response.data.data.map((e: any) => ({
                    label: e.ad,
                    value: e.id
                })));
            }
        } catch (error) {
            console.error('Eğitimler yüklenirken hata:', error);
        }
    };

    const openNew = () => {
        setKatilim({
            personelId: 0,
            egitimId: 0,
            katilimTarihi: null,
            tamamlamaTarihi: null,
            puan: null,
            sertifikaNo: '',
            durum: 'Planlandı'
        });
        setSubmitted(false);
        setKatilimDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setKatilimDialog(false);
    };

    const hideDeleteKatilimDialog = () => {
        setDeleteKatilimDialog(false);
    };

    const saveKatilim = async () => {
        setSubmitted(true);

        if (katilim.personelId && katilim.egitimId) {
            try {
                let response;
                if (katilim.id) {
                    response = await egitimService.updatePersonelEgitimi(katilim.id, katilim);
                } else {
                    response = await egitimService.createPersonelEgitimi(katilim);
                }

                if (response.data.success) {
                    toast.current?.show({ 
                        severity: 'success', 
                        summary: 'Başarılı', 
                        detail: katilim.id ? 'Katılım güncellendi' : 'Katılım eklendi' 
                    });
                    loadKatilimlar();
                    setKatilimDialog(false);
                }
            } catch (error: any) {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Hata', 
                    detail: error.response?.data?.message || 'İşlem başarısız' 
                });
            }
        }
    };

    const editKatilim = (katilim: PersonelEgitimi) => {
        setKatilim({
            ...katilim,
            katilimTarihi: katilim.katilimTarihi ? new Date(katilim.katilimTarihi) : null,
            tamamlamaTarihi: katilim.tamamlamaTarihi ? new Date(katilim.tamamlamaTarihi) : null
        });
        setKatilimDialog(true);
    };

    const confirmDeleteKatilim = (katilim: PersonelEgitimi) => {
        setKatilim(katilim);
        setDeleteKatilimDialog(true);
    };

    const deleteKatilim = async () => {
        try {
            const response = await egitimService.deletePersonelEgitimi(katilim.id!);
            if (response.data.success) {
                toast.current?.show({ 
                    severity: 'success', 
                    summary: 'Başarılı', 
                    detail: 'Katılım silindi' 
                });
                loadKatilimlar();
                setDeleteKatilimDialog(false);
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

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button label="Yeni" icon="pi pi-plus" severity="success" onClick={openNew} />
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

    const actionBodyTemplate = (rowData: PersonelEgitimi) => {
        return (
            <React.Fragment>
                <Button icon="pi pi-pencil" rounded outlined className="mr-2" onClick={() => editKatilim(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDeleteKatilim(rowData)} />
            </React.Fragment>
        );
    };

    const durumBodyTemplate = (rowData: PersonelEgitimi) => {
        const getSeverity = (durum: string) => {
            switch (durum) {
                case 'Tamamlandı': return 'success';
                case 'Devam Ediyor': return 'info';
                case 'Planlandı': return 'warning';
                case 'İptal': return 'danger';
                default: return null;
            }
        };
        return <Tag value={rowData.durum} severity={getSeverity(rowData.durum)} />;
    };

    const puanBodyTemplate = (rowData: PersonelEgitimi) => {
        if (!rowData.puan) return '-';
        const getSeverity = (puan: number) => {
            if (puan >= 85) return 'success';
            if (puan >= 60) return 'warning';
            return 'danger';
        };
        return <Tag value={`${rowData.puan}`} severity={getSeverity(rowData.puan)} />;
    };

    const dateBodyTemplate = (rowData: PersonelEgitimi, field: 'katilimTarihi' | 'tamamlamaTarihi') => {
        const date = rowData[field];
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR');
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Eğitim Katılımları</h4>
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
                        value={katilimlar} 
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
                        <Column field="personelAdSoyad" header="Personel" sortable />
                        <Column field="egitimAdi" header="Eğitim" sortable />
                        <Column field="katilimTarihi" header="Başlangıç" body={(rowData) => dateBodyTemplate(rowData, 'katilimTarihi')} sortable />
                        <Column field="tamamlamaTarihi" header="Bitiş" body={(rowData) => dateBodyTemplate(rowData, 'tamamlamaTarihi')} sortable />
                        <Column field="durum" header="Durum" body={durumBodyTemplate} sortable />
                        <Column field="puan" header="Puan" body={puanBodyTemplate} sortable />
                        <Column field="sertifikaNo" header="Sertifika No" sortable />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                    </DataTable>

                    <Dialog 
                        visible={katilimDialog} 
                        style={{ width: '450px' }} 
                        header="Eğitim Katılımı" 
                        modal 
                        className="p-fluid" 
                        footer={
                            <>
                                <Button label="İptal" icon="pi pi-times" outlined onClick={hideDialog} />
                                <Button label="Kaydet" icon="pi pi-check" onClick={saveKatilim} />
                            </>
                        }
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="personel">Personel</label>
                            <Dropdown 
                                id="personel" 
                                value={katilim.personelId} 
                                options={personeller}
                                onChange={(e) => setKatilim({ ...katilim, personelId: e.value })}
                                placeholder="Personel Seçiniz"
                                className={submitted && !katilim.personelId ? 'p-invalid' : ''}
                            />
                            {submitted && !katilim.personelId && <small className="p-error">Personel gerekli.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="egitim">Eğitim</label>
                            <Dropdown 
                                id="egitim" 
                                value={katilim.egitimId} 
                                options={egitimler}
                                onChange={(e) => setKatilim({ ...katilim, egitimId: e.value })}
                                placeholder="Eğitim Seçiniz"
                                className={submitted && !katilim.egitimId ? 'p-invalid' : ''}
                            />
                            {submitted && !katilim.egitimId && <small className="p-error">Eğitim gerekli.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="katilimTarihi">Başlangıç Tarihi</label>
                            <Calendar 
                                id="katilimTarihi" 
                                value={katilim.katilimTarihi} 
                                onChange={(e) => setKatilim({ ...katilim, katilimTarihi: e.value })}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="tamamlamaTarihi">Bitiş Tarihi</label>
                            <Calendar 
                                id="tamamlamaTarihi" 
                                value={katilim.tamamlamaTarihi} 
                                onChange={(e) => setKatilim({ ...katilim, tamamlamaTarihi: e.value })}
                                dateFormat="dd/mm/yy"
                                showIcon
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="durum">Durum</label>
                            <Dropdown 
                                id="durum" 
                                value={katilim.durum} 
                                options={durumOptions}
                                onChange={(e) => setKatilim({ ...katilim, durum: e.value })}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="puan">Puan (0-100)</label>
                            <InputNumber 
                                id="puan" 
                                value={katilim.puan} 
                                onChange={(e) => setKatilim({ ...katilim, puan: e.value })}
                                min={0}
                                max={100}
                            />
                        </div>

                        <div className="field">
                            <label htmlFor="sertifikaNo">Sertifika No</label>
                            <InputText 
                                id="sertifikaNo" 
                                value={katilim.sertifikaNo} 
                                onChange={(e) => setKatilim({ ...katilim, sertifikaNo: e.target.value })}
                            />
                        </div>
                    </Dialog>

                    <Dialog 
                        visible={deleteKatilimDialog} 
                        style={{ width: '450px' }} 
                        header="Onayla" 
                        modal 
                        footer={
                            <>
                                <Button label="Hayır" icon="pi pi-times" outlined onClick={hideDeleteKatilimDialog} />
                                <Button label="Evet" icon="pi pi-check" severity="danger" onClick={deleteKatilim} />
                            </>
                        }
                        onHide={hideDeleteKatilimDialog}
                    >
                        <div className="confirmation-content">
                            <i className="pi pi-exclamation-triangle mr-3" style={{ fontSize: '2rem' }} />
                            <span>Bu katılım kaydını silmek istediğinizden emin misiniz?</span>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default EgitimKatilimlariPage;