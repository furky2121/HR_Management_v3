import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { Card } from 'primereact/card';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { Chip } from 'primereact/chip';
import { Message } from 'primereact/message';
import { Panel } from 'primereact/panel';
import { Divider } from 'primereact/divider';
import notificationService from '../services/notificationService';
import authService from '../services/authService';

const Bildirimler = () => {
    const [notifications, setNotifications] = useState([]);
    const [selectedNotifications, setSelectedNotifications] = useState([]);
    const [notificationDialog, setNotificationDialog] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loading, setLoading] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [filters, setFilters] = useState({
        kategori: null,
        tip: null,
        okundu: null,
        tarihBaslangic: null,
        tarihBitis: null
    });
    const [currentUser, setCurrentUser] = useState(null);
    const [isServiceReady, setIsServiceReady] = useState(false);

    const toast = useRef(null);
    const dt = useRef(null);

    // Service hazır olduğunda seçenekleri oluştur
    const getKategoriOptions = () => {
        if (!isServiceReady || !notificationService.CATEGORIES) {
            return [{ label: 'Tümü', value: null }];
        }
        return [
            { label: 'Tümü', value: null },
            { label: 'İzin', value: notificationService.CATEGORIES.IZIN },
            { label: 'Eğitim', value: notificationService.CATEGORIES.EGITIM },
            { label: 'Doğum Günü', value: notificationService.CATEGORIES.DOGUM_GUNU },
            { label: 'Sistem', value: notificationService.CATEGORIES.SISTEM },
            { label: 'Avans', value: notificationService.CATEGORIES.AVANS },
            { label: 'İstifa', value: notificationService.CATEGORIES.ISTIFA },
            { label: 'Masraf', value: notificationService.CATEGORIES.MASRAF },
            { label: 'Duyuru', value: notificationService.CATEGORIES.DUYURU }
        ];
    };

    const getTipOptions = () => {
        if (!isServiceReady || !notificationService.TYPES) {
            return [{ label: 'Tümü', value: null }];
        }
        return [
            { label: 'Tümü', value: null },
            { label: 'Bilgi', value: notificationService.TYPES.INFO },
            { label: 'Başarılı', value: notificationService.TYPES.SUCCESS },
            { label: 'Uyarı', value: notificationService.TYPES.WARNING },
            { label: 'Hata', value: notificationService.TYPES.ERROR }
        ];
    };

    const okunduOptions = [
        { label: 'Tümü', value: null },
        { label: 'Okundu', value: true },
        { label: 'Okunmadı', value: false }
    ];

    useEffect(() => {
        // Client-side kontrolü
        if (typeof window !== 'undefined') {
            // Service'in hazır olduğunu kontrol et
            const checkService = () => {
                if (notificationService && notificationService.CATEGORIES && notificationService.TYPES) {
                    setIsServiceReady(true);
                    const user = authService.getUser();
                    if (user) {
                        const personel = user.Personel || user.personel;
                        setCurrentUser({
                            personelId: personel?.id || personel?.Id || 1
                        });
                        loadNotifications(personel?.id || personel?.Id || 1);
                    }
                } else {
                    // Service henüz hazır değilse kısa bir süre sonra tekrar dene
                    setTimeout(checkService, 100);
                }
            };

            checkService();
        }
    }, []);

    const loadNotifications = async (personelId) => {
        setLoading(true);
        try {
            const result = await notificationService.getAllNotifications(personelId);
            if (result.success) {
                setNotifications(result.data);
            } else {
                toast.current?.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Bildirimler yüklenirken hata oluştu'
                });
            }
        } catch (error) {
            console.error('Load notifications error:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Bildirimler yüklenirken hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...notifications];

        if (filters.kategori) {
            filtered = filtered.filter(n => n.kategori === filters.kategori);
        }

        if (filters.tip) {
            filtered = filtered.filter(n => n.tip === filters.tip);
        }

        if (filters.okundu !== null) {
            filtered = filtered.filter(n => n.okundu === filters.okundu);
        }

        if (filters.tarihBaslangic) {
            filtered = filtered.filter(n => new Date(n.olusturulmaTarihi) >= filters.tarihBaslangic);
        }

        if (filters.tarihBitis) {
            filtered = filtered.filter(n => new Date(n.olusturulmaTarihi) <= filters.tarihBitis);
        }

        return filtered;
    };

    const clearFilters = () => {
        setFilters({
            kategori: null,
            tip: null,
            okundu: null,
            tarihBaslangic: null,
            tarihBitis: null
        });
        setGlobalFilter(null);
    };

    const markAsRead = async (notification) => {
        if (!notification.okundu) {
            const result = await notificationService.markAsRead(notification.id);
            if (result.success) {
                await loadNotifications(currentUser.personelId);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Bildirim okundu olarak işaretlendi'
                });
            }
        }
    };

    const markAllAsRead = async () => {
        const result = await notificationService.markAllAsRead(currentUser.personelId);
        if (result.success) {
            await loadNotifications(currentUser.personelId);
            toast.current?.show({
                severity: 'success',
                summary: 'Başarılı',
                detail: 'Tüm bildirimler okundu olarak işaretlendi'
            });
        }
    };

    const deleteSelected = () => {
        if (selectedNotifications.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Uyarı',
                detail: 'Lütfen silmek istediğiniz bildirimleri seçin'
            });
            return;
        }

        confirmDialog({
            message: `${selectedNotifications.length} bildirimi silmek istediğinizden emin misiniz?`,
            header: 'Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                for (const notification of selectedNotifications) {
                    await notificationService.deleteNotification(notification.id);
                }
                await loadNotifications(currentUser.personelId);
                setSelectedNotifications([]);
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Seçili bildirimler silindi'
                });
            }
        });
    };

    const viewNotification = (notification) => {
        setSelectedNotification(notification);
        setNotificationDialog(true);
        markAsRead(notification);
    };

    const hideDialog = () => {
        setNotificationDialog(false);
        setSelectedNotification(null);
    };

    const navigateToAction = (actionUrl) => {
        if (actionUrl) {
            hideDialog();
            window.location.href = actionUrl;
        }
    };

    // Template functions
    const categoryBodyTemplate = (rowData) => {
        if (!isServiceReady || !notificationService.getCategoryConfig) {
            return <span>{rowData.kategori}</span>;
        }
        const config = notificationService.getCategoryConfig(rowData.kategori);
        return (
            <Chip
                label={config.label}
                icon={`pi ${config.icon}`}
                style={{ backgroundColor: config.color, color: 'white' }}
            />
        );
    };

    const statusBodyTemplate = (rowData) => {
        return (
            <Badge
                value={rowData.okundu ? 'Okundu' : 'Okunmadı'}
                severity={rowData.okundu ? 'success' : 'warning'}
            />
        );
    };

    const dateBodyTemplate = (rowData) => {
        const date = new Date(rowData.olusturulmaTarihi);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-eye"
                    className="p-button-rounded p-button-info p-button-sm"
                    onClick={() => viewNotification(rowData)}
                    tooltip="Görüntüle"
                />
                {!rowData.okundu && (
                    <Button
                        icon="pi pi-check"
                        className="p-button-rounded p-button-success p-button-sm"
                        onClick={() => markAsRead(rowData)}
                        tooltip="Okundu İşaretle"
                    />
                )}
            </div>
        );
    };

    const leftToolbarTemplate = () => {
        return (
            <div className="flex flex-wrap gap-2">
                <Button
                    label="Tümünü Okundu İşaretle"
                    icon="pi pi-check-circle"
                    className="p-button-success"
                    onClick={markAllAsRead}
                />
                <Button
                    label="Seçilileri Sil"
                    icon="pi pi-trash"
                    className="p-button-danger"
                    onClick={deleteSelected}
                    disabled={!selectedNotifications || selectedNotifications.length === 0}
                />
            </div>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <div className="flex align-items-center gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Ara..."
                        value={globalFilter || ''}
                    />
                </span>
                <Button
                    icon="pi pi-filter-slash"
                    className="p-button-outlined"
                    onClick={clearFilters}
                    tooltip="Filtreleri Temizle"
                />
            </div>
        );
    };

    const dialogFooter = (
        <div>
            <Button
                label="Kapat"
                icon="pi pi-times"
                onClick={hideDialog}
                className="p-button-text"
            />
            {selectedNotification?.actionUrl && (
                <Button
                    label="Sayfaya Git"
                    icon="pi pi-external-link"
                    onClick={() => navigateToAction(selectedNotification.actionUrl)}
                    autoFocus
                />
            )}
        </div>
    );

    const filteredNotifications = applyFilters();

    return (
        <div className="grid">
            <Toast ref={toast} />
            <ConfirmDialog />

            <div className="col-12">
                <Card title="Bildirimler" className="shadow-3">

                    {/* Filtreler */}
                    <Panel header="Filtreler" toggleable collapsed className="mb-4">
                        <div className="grid">
                            <div className="col-12 md:col-3">
                                <label htmlFor="kategori" className="block text-900 font-medium mb-2">Kategori</label>
                                <Dropdown
                                    id="kategori"
                                    value={filters.kategori}
                                    options={getKategoriOptions()}
                                    onChange={(e) => setFilters({...filters, kategori: e.value})}
                                    placeholder="Kategori seçin"
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-3">
                                <label htmlFor="tip" className="block text-900 font-medium mb-2">Tip</label>
                                <Dropdown
                                    id="tip"
                                    value={filters.tip}
                                    options={getTipOptions()}
                                    onChange={(e) => setFilters({...filters, tip: e.value})}
                                    placeholder="Tip seçin"
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-3">
                                <label htmlFor="okundu" className="block text-900 font-medium mb-2">Durum</label>
                                <Dropdown
                                    id="okundu"
                                    value={filters.okundu}
                                    options={okunduOptions}
                                    onChange={(e) => setFilters({...filters, okundu: e.value})}
                                    placeholder="Durum seçin"
                                    className="w-full"
                                />
                            </div>
                            <div className="col-12 md:col-3">
                                <label htmlFor="tarih" className="block text-900 font-medium mb-2">Tarih Aralığı</label>
                                <div className="flex gap-2">
                                    <Calendar
                                        value={filters.tarihBaslangic}
                                        onChange={(e) => setFilters({...filters, tarihBaslangic: e.value})}
                                        placeholder="Başlangıç"
                                        dateFormat="dd.mm.yy"
                                        className="w-full"
                                    />
                                    <Calendar
                                        value={filters.tarihBitis}
                                        onChange={(e) => setFilters({...filters, tarihBitis: e.value})}
                                        placeholder="Bitiş"
                                        dateFormat="dd.mm.yy"
                                        className="w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </Panel>

                    <Toolbar className="mb-4" left={leftToolbarTemplate} right={rightToolbarTemplate} />

                    <DataTable
                        ref={dt}
                        value={filteredNotifications}
                        selection={selectedNotifications}
                        onSelectionChange={(e) => setSelectedNotifications(e.value)}
                        dataKey="id"
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        className="datatable-responsive"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                        currentPageReportTemplate="{first} - {last} arası, toplam {totalRecords} bildirim"
                        globalFilter={globalFilter}
                        emptyMessage="Bildirim bulunamadı."
                        loading={loading}
                        sortMode="multiple"
                        removableSort
                    >
                        <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
                        <Column field="baslik" header="Başlık" sortable style={{ minWidth: '200px' }} />
                        <Column field="kategori" header="Kategori" body={categoryBodyTemplate} sortable />
                        <Column field="gonderenAd" header="Gönderen" sortable />
                        <Column field="olusturulmaTarihi" header="Tarih" body={dateBodyTemplate} sortable />
                        <Column field="okundu" header="Durum" body={statusBodyTemplate} sortable />
                        <Column header="İşlemler" body={actionBodyTemplate} exportable={false} style={{ minWidth: '100px' }} />
                    </DataTable>
                </Card>
            </div>

            {/* Bildirim Detay Dialog */}
            <Dialog
                visible={notificationDialog}
                style={{ width: '600px' }}
                header="Bildirim Detayı"
                modal
                footer={dialogFooter}
                onHide={hideDialog}
            >
                {selectedNotification && (
                    <div>
                        <div className="flex align-items-start gap-3 mb-4">
                            {isServiceReady && notificationService.getCategoryConfig ? (
                                <Avatar
                                    icon={`pi ${notificationService.getCategoryConfig(selectedNotification.kategori).icon}`}
                                    style={{
                                        backgroundColor: notificationService.getCategoryConfig(selectedNotification.kategori).color,
                                        color: 'white'
                                    }}
                                    size="large"
                                    shape="circle"
                                />
                            ) : (
                                <Avatar
                                    icon="pi pi-info-circle"
                                    style={{ backgroundColor: '#9E9E9E', color: 'white' }}
                                    size="large"
                                    shape="circle"
                                />
                            )}
                            <div className="flex-1">
                                <h5 className="m-0 mb-2">{selectedNotification.baslik}</h5>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {isServiceReady && notificationService.getCategoryConfig ? (
                                        <Chip
                                            label={notificationService.getCategoryConfig(selectedNotification.kategori).label}
                                            icon={`pi ${notificationService.getCategoryConfig(selectedNotification.kategori).icon}`}
                                            style={{
                                                backgroundColor: notificationService.getCategoryConfig(selectedNotification.kategori).color,
                                                color: 'white'
                                            }}
                                        />
                                    ) : (
                                        <Chip
                                            label={selectedNotification.kategori}
                                            icon="pi pi-info-circle"
                                            style={{ backgroundColor: '#9E9E9E', color: 'white' }}
                                        />
                                    )}
                                    <Badge
                                        value={selectedNotification.okundu ? 'Okundu' : 'Okunmadı'}
                                        severity={selectedNotification.okundu ? 'success' : 'warning'}
                                    />
                                </div>
                            </div>
                        </div>

                        <Divider />

                        <div className="mb-4">
                            <h6 className="text-900 font-medium mb-2">Mesaj</h6>
                            <p className="m-0 line-height-3 text-600">
                                {selectedNotification.mesaj}
                            </p>
                        </div>

                        <div className="grid">
                            <div className="col-6">
                                <h6 className="text-900 font-medium mb-2">Gönderen</h6>
                                <p className="m-0 text-600">{selectedNotification.gonderenAd}</p>
                            </div>
                            <div className="col-6">
                                <h6 className="text-900 font-medium mb-2">Tarih</h6>
                                <p className="m-0 text-600">
                                    {new Date(selectedNotification.olusturulmaTarihi).toLocaleDateString('tr-TR', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                            {selectedNotification.okundu && selectedNotification.okunmaTarihi && (
                                <div className="col-6">
                                    <h6 className="text-900 font-medium mb-2">Okunma Tarihi</h6>
                                    <p className="m-0 text-600">
                                        {new Date(selectedNotification.okunmaTarihi).toLocaleDateString('tr-TR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>

                        {selectedNotification.actionUrl && (
                            <>
                                <Divider />
                                <Message
                                    severity="info"
                                    text="Bu bildirimle ilgili işlem yapmak için 'Sayfaya Git' butonuna tıklayabilirsiniz."
                                />
                            </>
                        )}
                    </div>
                )}
            </Dialog>
        </div>
    );
};

export default Bildirimler;