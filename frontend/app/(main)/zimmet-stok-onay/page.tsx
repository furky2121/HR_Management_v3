'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Toast } from 'primereact/toast';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { confirmDialog } from 'primereact/confirmdialog';
import { Divider } from 'primereact/divider';
import zimmetStokService from '../../../src/services/zimmetStokService';
import yetkiService from '../../../src/services/yetkiService';

interface ZimmetStokData {
    id: number;
    malzemeAdi: string;
    kategori: string;
    marka: string;
    model: string;
    seriNo: string;
    miktar: number;
    birim: string;
    aciklama: string;
    onayDurumu: string;
    olusturanAdSoyad?: string;
    olusturmaTarihi: Date;
}

const ZimmetStokOnay = () => {
    const [bekleyenStoklar, setBekleyenStoklar] = useState<ZimmetStokData[]>([]);
    const [selectedStok, setSelectedStok] = useState<ZimmetStokData | null>(null);
    const [onayDialog, setOnayDialog] = useState(false);
    const [redDialog, setRedDialog] = useState(false);
    const [detayDialog, setDetayDialog] = useState(false);
    const [onayNotu, setOnayNotu] = useState('');
    const [loading, setLoading] = useState(true);
    const [globalFilter, setGlobalFilter] = useState('');
    const toast = useRef<Toast>(null);

    useEffect(() => {
        if (!yetkiService.hasScreenPermission('zimmet-stok-onay', 'read')) {
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
            const response = await zimmetStokService.getOnayBekleyenler();

            if (response.success) {
                setBekleyenStoklar(response.data);
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

    const showDetay = (stok: ZimmetStokData) => {
        setSelectedStok(stok);
        setDetayDialog(true);
    };

    const showOnayDialog = (stok: ZimmetStokData) => {
        setSelectedStok(stok);
        setOnayNotu('');
        setOnayDialog(true);
    };

    const showRedDialog = (stok: ZimmetStokData) => {
        setSelectedStok(stok);
        setOnayNotu('');
        setRedDialog(true);
    };

    const hideDialogs = () => {
        setOnayDialog(false);
        setRedDialog(false);
        setDetayDialog(false);
        setSelectedStok(null);
        setOnayNotu('');
    };

    const onaylaStok = async () => {
        if (!selectedStok) return;

        try {
            const onayData = {
                onaylayanId: 1, // TODO: Get from user context (General Manager ID)
                onayNotu: onayNotu || 'Onaylandı'
            };

            const response = await zimmetStokService.onayla(selectedStok.id, onayData);
            
            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Stok başarıyla onaylandı'
                });
                loadData();
                hideDialogs();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Onaylama işlemi sırasında hata oluştu'
            });
        }
    };

    const reddetStok = async () => {
        if (!selectedStok) return;

        if (!onayNotu.trim()) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Uyarı',
                detail: 'Red gerekçesi zorunludur'
            });
            return;
        }

        try {
            const redData = {
                onaylayanId: 1, // TODO: Get from user context (General Manager ID)
                onayNotu: onayNotu
            };

            const response = await zimmetStokService.reddet(selectedStok.id, redData);
            
            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Stok reddedildi'
                });
                loadData();
                hideDialogs();
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Red işlemi sırasında hata oluştu'
            });
        }
    };

    const topluOnayla = () => {
        confirmDialog({
            message: 'Tüm bekleyen stok taleplerini onaylamak istediğinize emin misiniz?',
            header: 'Toplu Onay',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    for (const stok of bekleyenStoklar) {
                        await zimmetStokService.onayla(stok.id, {
                            onaylayanId: 1, // TODO: Get from user context
                            onayNotu: 'Toplu onay'
                        });
                    }
                    
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: 'Tüm stoklar onaylandı'
                    });
                    loadData();
                } catch (error) {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Hata',
                        detail: 'Toplu onay işlemi sırasında hata oluştu'
                    });
                }
            }
        });
    };

    const header = (
        <div className="flex flex-wrap gap-2 align-items-center justify-content-between">
            <h4 className="m-0">Onay Bekleyen Zimmet Stokları</h4>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e: React.FormEvent<HTMLInputElement>) => setGlobalFilter(e.currentTarget.value)}
                        placeholder="Ara..."
                    />
                </span>
                {bekleyenStoklar.length > 0 && (
                    <Button
                        label="Hepsini Onayla"
                        icon="pi pi-check-circle"
                        className="p-button-success"
                        onClick={topluOnayla}
                    />
                )}
            </div>
        </div>
    );

    const actionBodyTemplate = (rowData: ZimmetStokData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-text"
                    onClick={() => showDetay(rowData)}
                    tooltip="Detay Görüntüle"
                />
                <Button
                    icon="pi pi-check"
                    className="p-button-rounded p-button-success p-button-text"
                    onClick={() => showOnayDialog(rowData)}
                    tooltip="Onayla"
                />
                <Button
                    icon="pi pi-times"
                    className="p-button-rounded p-button-danger p-button-text"
                    onClick={() => showRedDialog(rowData)}
                    tooltip="Reddet"
                />
            </div>
        );
    };

    const malzemeBodyTemplate = (rowData: ZimmetStokData) => {
        const fullName = rowData.malzemeAdi + 
                         (rowData.marka ? ` - ${rowData.marka}` : '') + 
                         (rowData.model ? ` ${rowData.model}` : '');
        return <span title={fullName}>{fullName}</span>;
    };

    const onayDialogFooter = (
        <div>
            <Button
                label="İptal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialogs}
            />
            <Button
                label="Onayla"
                icon="pi pi-check"
                className="p-button-success"
                onClick={onaylaStok}
            />
        </div>
    );

    const redDialogFooter = (
        <div>
            <Button
                label="İptal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialogs}
            />
            <Button
                label="Reddet"
                icon="pi pi-times"
                className="p-button-danger"
                onClick={reddetStok}
            />
        </div>
    );

    const detayDialogFooter = (
        <div>
            <Button
                label="Kapat"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialogs}
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
                        <h5 className="m-0">Zimmet Stok Onay Bekleyenler</h5>
                        {bekleyenStoklar.length > 0 && (
                            <Badge 
                                value={`${bekleyenStoklar.length} bekleyen talep`} 
                                severity="warning" 
                                size="large"
                            />
                        )}
                    </div>

                    {bekleyenStoklar.length === 0 && !loading && (
                        <div className="text-center p-4">
                            <i className="pi pi-check-circle text-6xl text-green-500 mb-3"></i>
                            <h6 className="text-xl mb-2">Onay Bekleyen Stok Bulunmuyor</h6>
                            <p className="text-600">Tüm stok talepleri işleme alınmış durumda.</p>
                        </div>
                    )}

                    {bekleyenStoklar.length > 0 && (
                        <DataTable
                            value={bekleyenStoklar}
                            paginator
                            rows={10}
                            dataKey="id"
                            loading={loading}
                            globalFilter={globalFilter}
                            header={header}
                            responsiveLayout="scroll"
                            emptyMessage="Onay bekleyen stok bulunamadı"
                            className="p-datatable-gridlines"
                        >
                            <Column field="id" header="ID" sortable style={{ width: '80px', textAlign: 'center' }} />
                            <Column header="Malzeme" body={malzemeBodyTemplate} sortable />
                            <Column field="kategori" header="Kategori" sortable />
                            <Column field="miktar" header="Miktar" sortable body={(data) => `${data.miktar} ${data.birim}`} />
                            <Column field="olusturanAdSoyad" header="Talep Eden" sortable />
                            <Column 
                                field="olusturmaTarihi" 
                                header="Talep Tarihi" 
                                sortable 
                                body={(rowData: ZimmetStokData) => new Date(rowData.olusturmaTarihi).toLocaleDateString('tr-TR')}
                            />
                            <Column header="İşlemler" body={actionBodyTemplate} style={{ width: '150px', textAlign: 'center' }} />
                        </DataTable>
                    )}

                    {/* Detay Dialog */}
                    <Dialog
                        visible={detayDialog}
                        style={{ width: '600px' }}
                        header="Stok Detayları"
                        modal
                        footer={detayDialogFooter}
                        onHide={hideDialogs}
                    >
                        {selectedStok && (
                            <div className="grid">
                                <div className="col-12">
                                    <h6 className="mb-3">Malzeme Bilgileri</h6>
                                </div>
                                <div className="col-6">
                                    <strong>Malzeme Adı:</strong><br />
                                    {selectedStok.malzemeAdi}
                                </div>
                                <div className="col-6">
                                    <strong>Kategori:</strong><br />
                                    {selectedStok.kategori || 'Belirtilmemiş'}
                                </div>
                                <div className="col-6">
                                    <strong>Marka:</strong><br />
                                    {selectedStok.marka || 'Belirtilmemiş'}
                                </div>
                                <div className="col-6">
                                    <strong>Model:</strong><br />
                                    {selectedStok.model || 'Belirtilmemiş'}
                                </div>
                                <div className="col-6">
                                    <strong>Seri No:</strong><br />
                                    {selectedStok.seriNo || 'Belirtilmemiş'}
                                </div>
                                <div className="col-6">
                                    <strong>Miktar:</strong><br />
                                    {selectedStok.miktar} {selectedStok.birim}
                                </div>
                                <div className="col-12">
                                    <Divider />
                                    <h6 className="mb-3">Talep Bilgileri</h6>
                                </div>
                                <div className="col-6">
                                    <strong>Talep Eden:</strong><br />
                                    {selectedStok.olusturanAdSoyad || 'Bilinmiyor'}
                                </div>
                                <div className="col-6">
                                    <strong>Talep Tarihi:</strong><br />
                                    {new Date(selectedStok.olusturmaTarihi).toLocaleDateString('tr-TR')}
                                </div>
                                {selectedStok.aciklama && (
                                    <div className="col-12">
                                        <strong>Açıklama:</strong><br />
                                        {selectedStok.aciklama}
                                    </div>
                                )}
                            </div>
                        )}
                    </Dialog>

                    {/* Onay Dialog */}
                    <Dialog
                        visible={onayDialog}
                        style={{ width: '500px' }}
                        header="Stok Onaylama"
                        modal
                        footer={onayDialogFooter}
                        onHide={hideDialogs}
                    >
                        {selectedStok && (
                            <div>
                                <p className="mb-3">
                                    <strong>{selectedStok.malzemeAdi}</strong> stok talebini onaylamak istediğinize emin misiniz?
                                </p>
                                <div className="field">
                                    <label htmlFor="onayNotu">Onay Notu (Opsiyonel)</label>
                                    <InputTextarea
                                        id="onayNotu"
                                        value={onayNotu}
                                        onChange={(e) => setOnayNotu(e.target.value)}
                                        rows={3}
                                        placeholder="Onay ile ilgili not ekleyebilirsiniz..."
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        )}
                    </Dialog>

                    {/* Red Dialog */}
                    <Dialog
                        visible={redDialog}
                        style={{ width: '500px' }}
                        header="Stok Reddetme"
                        modal
                        footer={redDialogFooter}
                        onHide={hideDialogs}
                    >
                        {selectedStok && (
                            <div>
                                <p className="mb-3">
                                    <strong>{selectedStok.malzemeAdi}</strong> stok talebini reddetmek istediğinize emin misiniz?
                                </p>
                                <div className="field">
                                    <label htmlFor="redNotu">Red Gerekçesi *</label>
                                    <InputTextarea
                                        id="redNotu"
                                        value={onayNotu}
                                        onChange={(e) => setOnayNotu(e.target.value)}
                                        rows={3}
                                        placeholder="Red gerekçesini belirtiniz..."
                                        className={`w-full ${!onayNotu.trim() ? 'p-invalid' : ''}`}
                                    />
                                    {!onayNotu.trim() && (
                                        <small className="p-error">Red gerekçesi zorunludur</small>
                                    )}
                                </div>
                            </div>
                        )}
                    </Dialog>
                </Card>
            </div>
        </div>
    );
};

export default ZimmetStokOnay;