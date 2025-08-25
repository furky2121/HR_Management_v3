'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { FileUpload } from 'primereact/fileupload';
import { Badge } from 'primereact/badge';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import zimmetStokService from '../../../src/services/zimmetStokService';
import yetkiService from '../../../src/services/yetkiService';

interface ZimmetStokData {
    id: number | null;
    malzemeAdi: string;
    kategori: string;
    marka: string;
    model: string;
    seriNo: string;
    miktar: number;
    kalanMiktar: number;
    birim: string;
    aciklama: string;
    onayDurumu: string;
    onayTarihi: Date | null;
    onayNotu: string;
    onaylayanAdSoyad?: string;
    olusturanAdSoyad?: string;
    aktif: boolean;
    olusturmaTarihi: Date;
    guncellemeTarihi?: Date;
}

const ZimmetStok = () => {
    const [stoklar, setStoklar] = useState<ZimmetStokData[]>([]);
    const [selectedStok, setSelectedStok] = useState<ZimmetStokData | null>(null);
    const [stokDialog, setStokDialog] = useState(false);
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [filesDialog, setFilesDialog] = useState(false);
    const [selectedStokFiles, setSelectedStokFiles] = useState<any[]>([]);
    const [selectedStokForFiles, setSelectedStokForFiles] = useState<ZimmetStokData | null>(null);
    const toast = useRef<Toast>(null);

    const emptyStok: ZimmetStokData = {
        id: null,
        malzemeAdi: '',
        kategori: '',
        marka: '',
        model: '',
        seriNo: '',
        miktar: 1,
        kalanMiktar: 1,
        birim: 'Adet',
        aciklama: '',
        onayDurumu: 'Bekliyor',
        onayTarihi: null,
        onayNotu: '',
        aktif: true,
        olusturmaTarihi: new Date()
    };

    const kategoriOptions = [
        { label: 'Bilgisayar Donanımı', value: 'Bilgisayar Donanımı' },
        { label: 'Telefon ve İletişim', value: 'Telefon ve İletişim' },
        { label: 'Ofis Malzemeleri', value: 'Ofis Malzemeleri' },
        { label: 'Yazılım', value: 'Yazılım' },
        { label: 'Aksesuar', value: 'Aksesuar' },
        { label: 'Diğer', value: 'Diğer' }
    ];

    const birimOptions = [
        { label: 'Adet', value: 'Adet' },
        { label: 'Set', value: 'Set' },
        { label: 'Kutu', value: 'Kutu' },
        { label: 'Paket', value: 'Paket' }
    ];

    useEffect(() => {
        if (!yetkiService.hasScreenPermission('zimmet-stok', 'read')) {
            toast.current?.show({
                severity: 'error',
                summary: 'Yetkisiz Erişim',
                detail: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
                life: 5000
            });
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const response = await zimmetStokService.getAll();

            if (response.success) {
                setStoklar(response.data);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Veriler yüklenirken hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setSelectedStok({ ...emptyStok });
        setUploadedFiles([]);
        setStokDialog(true);
    };

    const editStok = (stok: ZimmetStokData) => {
        setSelectedStok({ ...stok });
        setStokDialog(true);
    };

    const hideDialog = () => {
        setStokDialog(false);
        setSelectedStok(null);
        setUploadedFiles([]);
    };

    const onFileSelect = (event: any) => {
        const files = event.files as File[];
        if (files && files.length > 0) {
            setUploadedFiles(prev => [...prev, ...files]);
            toast.current?.show({
                severity: 'success',
                summary: 'Başarılı',
                detail: `${files.length} dosya seçildi`,
                life: 2000
            });
        }
    };

    const onFileRemove = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const downloadFile = (file: File) => {
        const url = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const previewFile = (file: File) => {
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
    };

    const openFilesDialog = async (stok: ZimmetStokData) => {
        if (!stok.id) return;
        
        try {
            setSelectedStokForFiles(stok);
            const response = await zimmetStokService.getFiles(stok.id);
            if (response.success) {
                setSelectedStokFiles(response.data);
                setFilesDialog(true);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Dosyalar yüklenemedi'
            });
        }
    };

    const closeFilesDialog = () => {
        setFilesDialog(false);
        setSelectedStokForFiles(null);
        setSelectedStokFiles([]);
    };

    const downloadServerFile = (file: any) => {
        const link = document.createElement('a');
        link.href = `http://localhost:5000${file.dosyaYolu}`;
        link.download = file.orijinalAdi;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const previewServerFile = (file: any) => {
        window.open(`http://localhost:5000${file.dosyaYolu}`, '_blank');
    };

    const deleteServerFile = async (file: any) => {
        try {
            const response = await zimmetStokService.deleteFile(file.id);
            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Dosya silindi'
                });
                // Refresh files
                if (selectedStokForFiles?.id) {
                    const filesResponse = await zimmetStokService.getFiles(selectedStokForFiles.id);
                    if (filesResponse.success) {
                        setSelectedStokFiles(filesResponse.data);
                    }
                }
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Dosya silinemedi'
            });
        }
    };

    const formatServerFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const saveStok = async () => {
        if (!selectedStok) return;

        if (!selectedStok.malzemeAdi.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Uyarı',
                detail: 'Malzeme adı zorunludur'
            });
            return;
        }

        try {
            let response;
            const stokData = {
                ...selectedStok,
                olusturanId: 1 // TODO: Get from user context
            };

            if (selectedStok.id) {
                response = await zimmetStokService.update(selectedStok.id, stokData);
            } else {
                response = await zimmetStokService.create(stokData);
            }

            if (response.success) {
                // Upload files if any
                if (uploadedFiles.length > 0 && response.data?.id) {
                    try {
                        const fileUploadResponse = await zimmetStokService.uploadFiles(response.data.id, uploadedFiles);
                        if (fileUploadResponse.success) {
                            toast.current?.show({
                                severity: 'success',
                                summary: 'Başarılı',
                                detail: `Stok ve ${uploadedFiles.length} dosya kaydedildi`
                            });
                        }
                    } catch (fileError) {
                        console.error('File upload error:', fileError);
                        toast.current?.show({
                            severity: 'warn',
                            summary: 'Uyarı',
                            detail: 'Stok kaydedildi ancak dosyalar yüklenemedi'
                        });
                    }
                } else {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: response.message
                    });
                }
                
                loadData();
                hideDialog();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'İşlem sırasında hata oluştu'
            });
        }
    };

    const confirmDeleteStok = (stok: ZimmetStokData) => {
        confirmDialog({
            message: `${stok.malzemeAdi} stok kaydını silmek istediğinize emin misiniz?`,
            header: 'Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            accept: () => stok.id && deleteStok(stok.id)
        });
    };

    const deleteStok = async (id: number) => {
        try {
            const response = await zimmetStokService.delete(id);
            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Stok kaydı silindi'
                });
                loadData();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Silme işlemi sırasında hata oluştu'
            });
        }
    };

    const toggleAktiflik = async (stok: ZimmetStokData) => {
        if (!stok.id) return;
        
        try {
            const response = await zimmetStokService.toggleAktiflik(stok.id);
            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: response.message
                });
                loadData();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Durum değiştirme işlemi sırasında hata oluştu'
            });
        }
    };

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, name: string) => {
        const val = e.target.value || '';
        setSelectedStok(prev => prev ? { ...prev, [name]: val } : null);
    };

    const onDropdownChange = (e: any, name: string) => {
        setSelectedStok(prev => prev ? { ...prev, [name]: e.value } : null);
    };

    const onNumberChange = (e: any, name: string) => {
        setSelectedStok(prev => prev ? { ...prev, [name]: e.value || 0 } : null);
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Zimmet Stok Yönetimi</h4>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter(e.currentTarget.value)}
                    placeholder="Ara..."
                />
            </span>
        </div>
    );

    const actionBodyTemplate = (rowData: ZimmetStokData) => {
        return (
            <div className="flex gap-2">
                {yetkiService.hasScreenPermission('zimmet-stok', 'update') && (
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-success p-button-text"
                        onClick={() => editStok(rowData)}
                        tooltip="Düzenle"
                        disabled={rowData.onayDurumu === 'Onaylandi'}
                    />
                )}
                <Button
                    icon="pi pi-file"
                    className="p-button-rounded p-button-info p-button-text"
                    onClick={() => openFilesDialog(rowData)}
                    tooltip="Dosyalar"
                />
                {yetkiService.hasScreenPermission('zimmet-stok', 'update') && (
                    <Button
                        icon={rowData.aktif ? "pi pi-eye-slash" : "pi pi-eye"}
                        className={`p-button-rounded p-button-text ${
                            rowData.aktif ? 'p-button-warning' : 'p-button-info'
                        }`}
                        onClick={() => toggleAktiflik(rowData)}
                        tooltip={rowData.aktif ? 'Pasif Yap' : 'Aktif Yap'}
                    />
                )}
                {yetkiService.hasScreenPermission('zimmet-stok', 'delete') && (
                    <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-danger p-button-text"
                        onClick={() => confirmDeleteStok(rowData)}
                        tooltip="Sil"
                        disabled={rowData.onayDurumu === 'Onaylandi'}
                    />
                )}
            </div>
        );
    };

    const statusBodyTemplate = (rowData: ZimmetStokData) => {
        return (
            <Badge
                value={rowData.aktif ? 'Aktif' : 'Pasif'}
                severity={rowData.aktif ? 'success' : 'warning'}
            />
        );
    };

    const onayDurumuBodyTemplate = (rowData: ZimmetStokData) => {
        let severity: 'success' | 'warning' | 'danger' | 'info' | 'secondary' | null = 'warning';
        let text = rowData.onayDurumu;

        switch (rowData.onayDurumu) {
            case 'Onaylandi':
                severity = 'success';
                text = 'Onaylandı';
                break;
            case 'Reddedildi':
                severity = 'danger';
                text = 'Reddedildi';
                break;
            case 'Bekliyor':
                severity = 'warning';
                text = 'Onay Bekliyor';
                break;
        }

        return (
            <Badge
                value={text}
                severity={severity}
            />
        );
    };

    const stokDialogFooter = (
        <div>
            <Button
                label="İptal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Kaydet"
                icon="pi pi-check"
                onClick={saveStok}
            />
        </div>
    );

    return (
        <div className="grid">
            <div className="col-12">
                <Card>
                    <Toast ref={toast} />
                    <ConfirmDialog />

                    <div className="flex justify-content-between align-items-center mb-4">
                        <h5 className="m-0">Zimmet Stok Listesi</h5>
                        {yetkiService.hasScreenPermission('zimmet-stok', 'write') && (
                            <Button
                                label="Yeni Stok"
                                icon="pi pi-plus"
                                className="p-button-primary"
                                onClick={openNew}
                            />
                        )}
                    </div>

                    <DataTable
                        value={stoklar}
                        paginator
                        rows={10}
                        dataKey="id"
                        loading={loading}
                        globalFilter={globalFilter}
                        header={header}
                        responsiveLayout="scroll"
                        emptyMessage="Stok kaydı bulunamadı"
                        className="p-datatable-gridlines"
                    >
                        <Column field="id" header="ID" sortable style={{ width: '80px', textAlign: 'center' }} />
                        <Column field="malzemeAdi" header="Malzeme Adı" sortable />
                        <Column field="kategori" header="Kategori" sortable />
                        <Column field="marka" header="Marka" sortable />
                        <Column field="model" header="Model" sortable />
                        <Column field="miktar" header="Toplam Miktar" sortable body={(data) => `${data.miktar} ${data.birim}`} />
                        <Column field="kalanMiktar" header="Kalan Miktar" sortable body={(data) => `${data.kalanMiktar} ${data.birim}`} />
                        <Column header="Onay Durumu" body={onayDurumuBodyTemplate} />
                        <Column 
                            field="olusturmaTarihi" 
                            header="Oluşturma Tarihi" 
                            sortable 
                            body={(rowData: ZimmetStokData) => new Date(rowData.olusturmaTarihi).toLocaleDateString('tr-TR')}
                        />
                        <Column header="Durum" body={statusBodyTemplate} />
                        <Column header="İşlemler" body={actionBodyTemplate} />
                    </DataTable>

                    <Dialog
                        visible={stokDialog}
                        style={{ width: '800px' }}
                        header={selectedStok?.id ? 'Stok Düzenle' : 'Yeni Stok'}
                        modal
                        className="p-fluid"
                        footer={stokDialogFooter}
                        onHide={hideDialog}
                    >
                        <TabView>
                            <TabPanel header="Stok Bilgileri">
                                <div className="grid">
                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="malzemeAdi">Malzeme Adı *</label>
                                    <InputText
                                        id="malzemeAdi"
                                        value={selectedStok?.malzemeAdi || ''}
                                        onChange={(e) => onInputChange(e, 'malzemeAdi')}
                                        placeholder="Malzeme adını girin"
                                        className={!selectedStok?.malzemeAdi?.trim() ? 'p-invalid' : ''}
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="kategori">Kategori</label>
                                    <Dropdown
                                        id="kategori"
                                        value={selectedStok?.kategori}
                                        onChange={(e) => onDropdownChange(e, 'kategori')}
                                        options={kategoriOptions}
                                        placeholder="Kategori seçin"
                                        showClear
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="marka">Marka</label>
                                    <InputText
                                        id="marka"
                                        value={selectedStok?.marka || ''}
                                        onChange={(e) => onInputChange(e, 'marka')}
                                        placeholder="Marka adını girin"
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="model">Model</label>
                                    <InputText
                                        id="model"
                                        value={selectedStok?.model || ''}
                                        onChange={(e) => onInputChange(e, 'model')}
                                        placeholder="Model adını girin"
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-6">
                                <div className="field">
                                    <label htmlFor="seriNo">Seri No</label>
                                    <InputText
                                        id="seriNo"
                                        value={selectedStok?.seriNo || ''}
                                        onChange={(e) => onInputChange(e, 'seriNo')}
                                        placeholder="Seri numarasını girin"
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-3">
                                <div className="field">
                                    <label htmlFor="miktar">Miktar</label>
                                    <InputNumber
                                        id="miktar"
                                        value={selectedStok?.miktar}
                                        onValueChange={(e) => onNumberChange(e, 'miktar')}
                                        min={1}
                                        showButtons
                                    />
                                </div>
                            </div>

                            <div className="col-12 md:col-3">
                                <div className="field">
                                    <label htmlFor="birim">Birim</label>
                                    <Dropdown
                                        id="birim"
                                        value={selectedStok?.birim}
                                        onChange={(e) => onDropdownChange(e, 'birim')}
                                        options={birimOptions}
                                        placeholder="Birim seçin"
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <div className="field">
                                    <label htmlFor="aciklama">Açıklama</label>
                                    <InputTextarea
                                        id="aciklama"
                                        value={selectedStok?.aciklama || ''}
                                        onChange={(e) => onInputChange(e, 'aciklama')}
                                        rows={3}
                                        placeholder="Ek açıklama girin"
                                    />
                                </div>
                            </div>
                                </div>
                            </TabPanel>
                            
                            <TabPanel header="Dosyalar">
                                <div className="field">
                                    <label htmlFor="fileUpload">Belgeler (PDF, Resim)</label>
                                    <FileUpload 
                                        name="files"
                                        multiple 
                                        accept="image/*,application/pdf"
                                        maxFileSize={10000000}
                                        mode="basic"
                                        chooseLabel="Dosya Seç"
                                        className="w-full"
                                        onSelect={onFileSelect}
                                    />
                                </div>
                                
                                {uploadedFiles.length > 0 && (
                                    <div className="field">
                                        <label className="font-bold">Seçilen Dosyalar ({uploadedFiles.length})</label>
                                        <div className="mt-3">
                                            {uploadedFiles.map((file, index) => (
                                                <div key={index} className="surface-card border-round p-3 mb-3 shadow-1">
                                                    <div className="flex align-items-center justify-content-between">
                                                        <div className="flex align-items-center flex-1">
                                                            <div className="mr-3">
                                                                <i className={`pi ${
                                                                    file.type.includes('pdf') ? 'pi-file-pdf text-red-500' : 
                                                                    file.type.includes('image') ? 'pi-image text-blue-500' : 
                                                                    'pi-file text-gray-500'
                                                                } text-3xl`}></i>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="font-medium text-900 mb-1">{file.name}</div>
                                                                <div className="text-sm text-600 mb-2">
                                                                    {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                                                                </div>
                                                                {file.type.includes('image') && (
                                                                    <div className="text-xs text-500">Önizleme için görüntüle butonuna tıklayın</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button 
                                                                icon="pi pi-eye" 
                                                                className="p-button-rounded p-button-text p-button-info p-button-sm"
                                                                onClick={() => previewFile(file)}
                                                                tooltip="Önizle"
                                                            />
                                                            <Button 
                                                                icon="pi pi-download" 
                                                                className="p-button-rounded p-button-text p-button-success p-button-sm"
                                                                onClick={() => downloadFile(file)}
                                                                tooltip="İndir"
                                                            />
                                                            <Button 
                                                                icon="pi pi-times" 
                                                                className="p-button-rounded p-button-text p-button-danger p-button-sm"
                                                                onClick={() => onFileRemove(index)}
                                                                tooltip="Kaldır"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                <div className="field">
                                    <small className="text-600">
                                        • Maksimum dosya boyutu: 10MB<br/>
                                        • Desteklenen formatlar: PDF, JPG, PNG, GIF<br/>
                                        • Birden fazla dosya seçebilirsiniz
                                    </small>
                                </div>
                            </TabPanel>
                        </TabView>
                    </Dialog>

                    {/* Files Dialog */}
                    <Dialog
                        visible={filesDialog}
                        style={{ width: '800px' }}
                        header={`Dosyalar - ${selectedStokForFiles?.malzemeAdi}`}
                        modal
                        onHide={closeFilesDialog}
                    >
                        {selectedStokFiles.length > 0 ? (
                            <div>
                                {selectedStokFiles.map((file, index) => (
                                    <div key={index} className="surface-card border-round p-3 mb-3 shadow-1">
                                        <div className="flex align-items-center justify-content-between">
                                            <div className="flex align-items-center flex-1">
                                                <div className="mr-3">
                                                    <i className={`pi ${
                                                        file.mimeTipi?.includes('pdf') ? 'pi-file-pdf text-red-500' : 
                                                        file.mimeTipi?.includes('image') ? 'pi-image text-blue-500' : 
                                                        'pi-file text-gray-500'
                                                    } text-3xl`}></i>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-900 mb-1">{file.orijinalAdi}</div>
                                                    <div className="text-sm text-600 mb-2">
                                                        {formatServerFileSize(file.dosyaBoyutu)} • {file.mimeTipi || 'Unknown type'}
                                                    </div>
                                                    <div className="text-xs text-500">
                                                        Yükleme: {new Date(file.olusturmaTarihi).toLocaleDateString('tr-TR')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button 
                                                    icon="pi pi-eye" 
                                                    className="p-button-rounded p-button-text p-button-info p-button-sm"
                                                    onClick={() => previewServerFile(file)}
                                                    tooltip="Önizle"
                                                />
                                                <Button 
                                                    icon="pi pi-download" 
                                                    className="p-button-rounded p-button-text p-button-success p-button-sm"
                                                    onClick={() => downloadServerFile(file)}
                                                    tooltip="İndir"
                                                />
                                                {yetkiService.hasScreenPermission('zimmet-stok', 'delete') && (
                                                    <Button 
                                                        icon="pi pi-times" 
                                                        className="p-button-rounded p-button-text p-button-danger p-button-sm"
                                                        onClick={() => deleteServerFile(file)}
                                                        tooltip="Sil"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-5">
                                <i className="pi pi-file text-6xl text-400 mb-3"></i>
                                <p className="text-600">Bu stok için henüz dosya bulunmuyor.</p>
                            </div>
                        )}
                    </Dialog>
                </Card>
            </div>
        </div>
    );
};

export default ZimmetStok;