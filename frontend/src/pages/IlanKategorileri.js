import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Badge } from 'primereact/badge';
import { Toolbar } from 'primereact/toolbar';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
import { InputSwitch } from 'primereact/inputswitch';
import { FilterMatchMode } from 'primereact/api';
import iseAlimService from '../services/iseAlimService';

const IlanKategorileri = () => {
    const [kategoriler, setKategoriler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [kategoriDialog, setKategoriDialog] = useState(false);
    const [kategori, setKategori] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState('');
    const [selectedKategoriler, setSelectedKategoriler] = useState(null);
    const [filters, setFilters] = useState({
        'global': { value: null, matchMode: FilterMatchMode.CONTAINS },
        'ad': { value: null, matchMode: FilterMatchMode.STARTS_WITH },
        'aktif': { value: null, matchMode: FilterMatchMode.EQUALS }
    });
    const toast = useRef(null);
    const dt = useRef(null);

    useEffect(() => {
        loadKategoriler();
    }, []);

    const loadKategoriler = async () => {
        try {
            const response = await iseAlimService.getIlanKategorileri();
            if (response.success) {
                setKategoriler(response.data);
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Hata', detail: 'İlan kategorileri yüklenirken hata oluştu.' });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setKategori({
            ad: '',
            aciklama: '',
            aktif: true
        });
        setSubmitted(false);
        setKategoriDialog(true);
    };

    const editKategori = (kategori) => {
        setKategori({ ...kategori });
        setKategoriDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setKategoriDialog(false);
    };

    const saveKategori = async () => {
        setSubmitted(true);

        if (kategori.ad && kategori.ad.trim()) {
            try {
                let response;
                if (kategori.id) {
                    response = await iseAlimService.updateIlanKategori(kategori.id, kategori);
                } else {
                    response = await iseAlimService.createIlanKategori(kategori);
                }

                if (response.success) {
                    toast.current?.show({ severity: 'success', summary: 'Başarılı', detail: 'İlan kategorisi başarıyla kaydedildi.' });
                    loadKategoriler();
                    hideDialog();
                } else {
                    toast.current?.show({ severity: 'error', summary: 'Hata', detail: response.message });
                }
            } catch (error) {
                toast.current?.show({ severity: 'error', summary: 'Hata', detail: 'İlan kategorisi kaydedilirken hata oluştu.' });
            }
        }
    };

    const confirmDeleteKategori = (kategori) => {
        confirmDialog({
            message: `${kategori.ad} kategorisini silmek istediğinizden emin misiniz?`,
            header: 'Kategori Sil',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            accept: () => deleteKategori(kategori)
        });
    };

    const deleteKategori = async (kategori) => {
        try {
            const response = await iseAlimService.deleteIlanKategori(kategori.id);
            if (response.success) {
                setKategoriler(kategoriler.filter(val => val.id !== kategori.id));
                toast.current?.show({ severity: 'success', summary: 'Başarılı', detail: 'İlan kategorisi başarıyla silindi.' });
            } else {
                toast.current?.show({ severity: 'error', summary: 'Hata', detail: response.message });
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Hata', detail: 'İlan kategorisi silinirken hata oluştu.' });
        }
    };

    const confirmDeleteSelected = () => {
        confirmDialog({
            message: 'Seçilen kategorileri silmek istediğinizden emin misiniz?',
            header: 'Kategorileri Sil',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Evet',
            rejectLabel: 'Hayır',
            accept: deleteSelectedKategoriler
        });
    };

    const deleteSelectedKategoriler = async () => {
        try {
            const deletePromises = selectedKategoriler.map(kategori =>
                iseAlimService.deleteIlanKategori(kategori.id)
            );

            const responses = await Promise.all(deletePromises);
            const successCount = responses.filter(r => r.success).length;

            if (successCount > 0) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: `${successCount} kategori başarıyla silindi.`
                });
                loadKategoriler();
                setSelectedKategoriler(null);
            }
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Hata', detail: 'Kategoriler silinirken hata oluştu.' });
        }
    };

    const exportCSV = () => {
        dt.current?.exportCSV();
    };

    const aktifBodyTemplate = (rowData) => {
        return rowData.aktif ?
            <Badge value="Aktif" severity="success"></Badge> :
            <Badge value="Pasif" severity="warning"></Badge>;
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button icon="pi pi-pencil" className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => editKategori(rowData)} tooltip="Düzenle" />
                <Button icon="pi pi-trash" className="p-button-rounded p-button-danger p-button-sm"
                        onClick={() => confirmDeleteKategori(rowData)} tooltip="Sil" />
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex gap-2">
                <Button label="Yeni Kategori" icon="pi pi-plus" className="p-button-success" onClick={openNew} />
                <Button label="Sil" icon="pi pi-trash" className="p-button-danger"
                        onClick={confirmDeleteSelected} disabled={!selectedKategoriler || !selectedKategoriler.length} />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex gap-2">
                <Button label="Excel" icon="pi pi-upload" className="p-button-help" onClick={exportCSV} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} placeholder="Arama..." />
                </span>
            </div>
        );
    };

    const kategoriDialogFooter = (
        <div>
            <Button label="İptal" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Kaydet" icon="pi pi-check" className="p-button-text" onClick={saveKategori} />
        </div>
    );

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _kategori = { ...kategori };
        _kategori[`${name}`] = val;
        setKategori(_kategori);
    };

    const onInputSwitchChange = (e, name) => {
        const val = e.value;
        let _kategori = { ...kategori };
        _kategori[`${name}`] = val;
        setKategori(_kategori);
    };

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />

            <div className="card">
                <h3 className="mb-4">İlan Kategorileri</h3>

                <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate}></Toolbar>

                <DataTable
                    ref={dt}
                    value={kategoriler}
                    selection={selectedKategoriler}
                    onSelectionChange={(e) => setSelectedKategoriler(e.value)}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} - {last} / {totalRecords} kategori"
                    globalFilter={globalFilter}
                    emptyMessage="İlan kategorisi bulunamadı."
                    loading={loading}
                    filters={filters}
                    filterDisplay="menu"
                    responsiveLayout="scroll">

                    <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} exportable={false}></Column>
                    <Column field="ad" header="Kategori Adı" sortable filter filterPlaceholder="Kategori ara" style={{ minWidth: '12rem' }} />
                    <Column field="aciklama" header="Açıklama" sortable filter filterPlaceholder="Açıklama ara" style={{ minWidth: '16rem' }} />
                    <Column field="aktif" header="Durum" body={aktifBodyTemplate} sortable filter filterElement={
                        <div className="flex gap-2">
                            <Button label="Aktif" className="p-button-success p-button-sm"
                                    onClick={() => setFilters({...filters, aktif: {...filters['aktif'], value: true}})} />
                            <Button label="Pasif" className="p-button-warning p-button-sm"
                                    onClick={() => setFilters({...filters, aktif: {...filters['aktif'], value: false}})} />
                            <Button label="Tümü" className="p-button-secondary p-button-sm"
                                    onClick={() => setFilters({...filters, aktif: {...filters['aktif'], value: null}})} />
                        </div>
                    } style={{ minWidth: '8rem' }} />
                    <Column field="olusturulmaTarihi" header="Oluşturulma Tarihi" sortable
                            body={(rowData) => new Date(rowData.olusturulmaTarihi).toLocaleDateString('tr-TR')}
                            style={{ minWidth: '10rem' }} />
                    <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }}></Column>
                </DataTable>
            </div>

            <Dialog visible={kategoriDialog} style={{ width: '500px' }} header="İlan Kategorisi Detayları" modal className="p-fluid" footer={kategoriDialogFooter} onHide={hideDialog}>
                <div className="field">
                    <label htmlFor="ad">Kategori Adı <span className="text-red-500">*</span></label>
                    <InputText id="ad" value={kategori.ad} onChange={(e) => onInputChange(e, 'ad')}
                               required autoFocus className={submitted && !kategori.ad ? 'p-invalid' : ''} />
                    {submitted && !kategori.ad && <small className="p-error">Kategori adı gereklidir.</small>}
                </div>

                <div className="field">
                    <label htmlFor="aciklama">Açıklama</label>
                    <InputTextarea id="aciklama" value={kategori.aciklama} onChange={(e) => onInputChange(e, 'aciklama')}
                                   rows={5} cols={30} autoResize placeholder="Kategori açıklamasını yazın..." />
                </div>

                <div className="field">
                    <div className="flex align-items-center">
                        <label htmlFor="aktif" className="mr-3">Aktif Durum</label>
                        <InputSwitch id="aktif" checked={kategori.aktif} onChange={(e) => onInputSwitchChange(e, 'aktif')} />
                    </div>
                    <small className="text-500">Pasif kategoriler, yeni iş ilanlarında seçim listesinde görünmez.</small>
                </div>
            </Dialog>

            <ConfirmDialog />
        </div>
    );
};

export default IlanKategorileri;