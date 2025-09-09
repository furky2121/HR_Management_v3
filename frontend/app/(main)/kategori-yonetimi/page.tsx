'use client';
import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Checkbox } from 'primereact/checkbox';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { Badge } from 'primereact/badge';
import videoEgitimService from '../../../src/services/videoEgitimService';
import yetkiService from '../../../src/services/yetkiService';

interface Kategori {
    id?: number;
    ad: string;
    aciklama?: string;
    icon: string;
    renk: string;
    sira: number;
    aktif: boolean;
    videoSayisi?: number;
}

const KategoriYonetimiPage = () => {
    const [kategoriler, setKategoriler] = useState<Kategori[]>([]);
    const [loading, setLoading] = useState(true);
    const [kategoriDialog, setKategoriDialog] = useState(false);
    const [kategori, setKategori] = useState<Kategori>({
        ad: '',
        aciklama: '',
        icon: 'pi pi-play',
        renk: '#3B82F6',
        sira: 1,
        aktif: true
    });
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [permissions, setPermissions] = useState({
        read: false,
        write: false,
        delete: false,
        update: false
    });
    const toast = useRef<Toast>(null);
    const dt = useRef<DataTable<Kategori[]>>(null);

    const iconOptions = [
        { label: 'Video', value: 'pi pi-play' },
        { label: 'Kitap', value: 'pi pi-book' },
        { label: 'Sertifika', value: 'pi pi-verified' },
        { label: 'Bilgisayar', value: 'pi pi-desktop' },
        { label: 'Mobil', value: 'pi pi-mobile' },
        { label: 'Güvenlik', value: 'pi pi-shield' },
        { label: 'İş', value: 'pi pi-briefcase' },
        { label: 'Kalp', value: 'pi pi-heart' },
        { label: 'Ayarlar', value: 'pi pi-cog' },
        { label: 'Grafik', value: 'pi pi-chart-bar' }
    ];

    useEffect(() => {
        loadPermissions();
        loadKategoriler();
    }, []);

    const loadPermissions = async () => {
        try {
            await yetkiService.loadUserPermissions();
            setPermissions({
                read: yetkiService.hasScreenPermission('kategori-yonetimi', 'read'),
                write: yetkiService.hasScreenPermission('kategori-yonetimi', 'write'),
                delete: yetkiService.hasScreenPermission('kategori-yonetimi', 'delete'),
                update: yetkiService.hasScreenPermission('kategori-yonetimi', 'update')
            });
        } catch (error) {
            console.error('Permission loading error:', error);
            setPermissions({ read: true, write: true, delete: true, update: true });
        }
    };

    const loadKategoriler = async () => {
        try {
            setLoading(true);
            const response = await videoEgitimService.getKategoriler();
            if (response.success) {
                setKategoriler(response.data);
            }
        } catch (error) {
            console.error('Kategoriler yüklenirken hata:', error);
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Hata', 
                detail: 'Kategoriler yüklenemedi.' 
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setKategori({
            ad: '',
            aciklama: '',
            icon: 'pi pi-play',
            renk: '#3B82F6',
            sira: 1,
            aktif: true
        });
        setSubmitted(false);
        setKategoriDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setKategoriDialog(false);
    };

    const saveKategori = async () => {
        setSubmitted(true);

        if (kategori.ad.trim()) {
            try {
                const response = await videoEgitimService.saveKategori(kategori);
                if (response.success) {
                    toast.current?.show({ 
                        severity: 'success', 
                        summary: 'Başarılı', 
                        detail: kategori.id ? 'Kategori güncellendi' : 'Kategori eklendi' 
                    });
                    loadKategoriler();
                    hideDialog();
                } else {
                    toast.current?.show({ 
                        severity: 'error', 
                        summary: 'Hata', 
                        detail: response.message 
                    });
                }
            } catch (error: any) {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Hata', 
                    detail: error.response?.data?.message || 'Kategori kaydedilemedi.' 
                });
            }
        }
    };

    const editKategori = (kategori: Kategori) => {
        setKategori({ ...kategori });
        setKategoriDialog(true);
    };

    const confirmDeleteKategori = (kategori: Kategori) => {
        confirmDialog({
            message: `"${kategori.ad}" kategorisini silmek istediğinizden emin misiniz?`,
            header: 'Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteKategori(kategori),
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır'
        });
    };

    const deleteKategori = async (kategori: Kategori) => {
        try {
            const response = await videoEgitimService.deleteKategori(kategori.id!);
            if (response.success) {
                toast.current?.show({ 
                    severity: 'success', 
                    summary: 'Başarılı', 
                    detail: response.message || 'Kategori silindi' 
                });
                loadKategoriler();
            } else {
                toast.current?.show({ 
                    severity: 'error', 
                    summary: 'Hata', 
                    detail: response.message || 'Silme işlemi başarısız' 
                });
            }
        } catch (error: any) {
            toast.current?.show({ 
                severity: 'error', 
                summary: 'Hata', 
                detail: error.response?.data?.message || 'Silme işlemi başarısız' 
            });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                {permissions.write && (
                    <Button label="Yeni Kategori" icon="pi pi-plus" severity="success" onClick={openNew} />
                )}
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button label="Export" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
            </div>
        );
    };

    const iconBodyTemplate = (rowData: Kategori) => {
        return (
            <div className="flex align-items-center">
                <i className={`${rowData.icon} text-xl mr-2`} style={{ color: rowData.renk }}></i>
                <span>{rowData.icon}</span>
            </div>
        );
    };

    const colorBodyTemplate = (rowData: Kategori) => {
        return (
            <div className="flex align-items-center">
                <div 
                    className="border-round mr-2" 
                    style={{ 
                        width: '20px', 
                        height: '20px', 
                        backgroundColor: rowData.renk 
                    }}
                ></div>
                <span>{rowData.renk}</span>
            </div>
        );
    };

    const statusBodyTemplate = (rowData: Kategori) => {
        return (
            <Badge 
                value={rowData.aktif ? 'Aktif' : 'Pasif'} 
                severity={rowData.aktif ? 'success' : 'warning'}
            />
        );
    };

    const videoSayisiBodyTemplate = (rowData: Kategori) => {
        return (
            <Badge value={rowData.videoSayisi || 0} severity="info" />
        );
    };

    const actionBodyTemplate = (rowData: Kategori) => {
        return (
            <div className="flex gap-2">
                {permissions.update && (
                    <Button 
                        icon="pi pi-pencil" 
                        rounded 
                        outlined 
                        className="mr-2" 
                        onClick={() => editKategori(rowData)} 
                    />
                )}
                {permissions.delete && (
                    <Button 
                        icon="pi pi-trash" 
                        rounded 
                        outlined 
                        severity="danger" 
                        onClick={() => confirmDeleteKategori(rowData)} 
                    />
                )}
            </div>
        );
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = (e.target && e.target.value) || '';
        let _kategori = { ...kategori };
        // @ts-ignore
        _kategori[name] = val;
        setKategori(_kategori);
    };

    const onInputNumberChange = (e: any, name: string) => {
        const val = e.value || 0;
        let _kategori = { ...kategori };
        // @ts-ignore
        _kategori[name] = val;
        setKategori(_kategori);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Kategori Yönetimi</h4>
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
                    <ConfirmDialog />
                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                    <DataTable 
                        ref={dt}
                        value={kategoriler} 
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
                        <Column field="ad" header="Kategori Adı" sortable style={{ minWidth: '12rem' }} />
                        <Column field="aciklama" header="Açıklama" sortable style={{ minWidth: '16rem' }} />
                        <Column body={iconBodyTemplate} header="İkon" style={{ minWidth: '10rem' }} />
                        <Column body={colorBodyTemplate} header="Renk" style={{ minWidth: '8rem' }} />
                        <Column field="sira" header="Sıra" sortable style={{ minWidth: '6rem' }} />
                        <Column body={videoSayisiBodyTemplate} header="Video Sayısı" style={{ minWidth: '8rem' }} />
                        <Column body={statusBodyTemplate} header="Durum" sortable style={{ minWidth: '8rem' }} />
                        <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                    </DataTable>

                    <Dialog 
                        visible={kategoriDialog} 
                        style={{ width: '500px' }} 
                        header={kategori.id ? 'Kategori Düzenle' : 'Yeni Kategori'} 
                        modal 
                        className="p-fluid" 
                        footer={
                            <>
                                <Button label="İptal" icon="pi pi-times" outlined onClick={hideDialog} />
                                <Button label="Kaydet" icon="pi pi-check" onClick={saveKategori} />
                            </>
                        }
                        onHide={hideDialog}
                    >
                        <div className="field">
                            <label htmlFor="ad">Kategori Adı *</label>
                            <InputText 
                                id="ad" 
                                value={kategori.ad} 
                                onChange={(e) => onInputChange(e, 'ad')} 
                                required 
                                autoFocus 
                                className={submitted && !kategori.ad ? 'p-invalid' : ''}
                            />
                            {submitted && !kategori.ad && <small className="p-error">Kategori adı gerekli.</small>}
                        </div>

                        <div className="field">
                            <label htmlFor="aciklama">Açıklama</label>
                            <InputTextarea 
                                id="aciklama" 
                                value={kategori.aciklama} 
                                onChange={(e) => onInputChange(e, 'aciklama')} 
                                rows={3} 
                                cols={20} 
                            />
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="icon">İkon</label>
                                <Dropdown 
                                    id="icon" 
                                    value={kategori.icon} 
                                    options={iconOptions} 
                                    onChange={(e) => setKategori({...kategori, icon: e.value})} 
                                />
                            </div>
                            <div className="field col">
                                <label htmlFor="renk">Renk</label>
                                <InputText 
                                    id="renk" 
                                    value={kategori.renk} 
                                    onChange={(e) => onInputChange(e, 'renk')} 
                                    type="color"
                                />
                            </div>
                        </div>

                        <div className="formgrid grid">
                            <div className="field col">
                                <label htmlFor="sira">Sıra</label>
                                <InputNumber 
                                    id="sira" 
                                    value={kategori.sira} 
                                    onValueChange={(e) => onInputNumberChange(e, 'sira')} 
                                    min={1} 
                                />
                            </div>
                            <div className="field col">
                                <div className="field-checkbox mt-4">
                                    <Checkbox 
                                        inputId="aktif" 
                                        checked={kategori.aktif} 
                                        onChange={(e) => setKategori({...kategori, aktif: e.checked || false})} 
                                    />
                                    <label htmlFor="aktif">Aktif</label>
                                </div>
                            </div>
                        </div>
                    </Dialog>
                </div>
            </div>
        </div>
    );
};

export default KategoriYonetimiPage;