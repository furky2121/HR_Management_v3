import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Toast } from 'primereact/toast';
import { Toolbar } from 'primereact/toolbar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { confirmDialog } from 'primereact/confirmdialog';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { Panel } from 'primereact/panel';
import { Chip } from 'primereact/chip';
import izinService from '../services/izinService';
import fileUploadService from '../services/fileUploadService';
import authService from '../services/authService';
import yetkiService from '../services/yetkiService';

const IzinTalepleri = () => {
    const [izinTalepleri, setIzinTalepleri] = useState([]);
    const [izinDialog, setIzinDialog] = useState(false);
    const [onayDialog, setOnayDialog] = useState(false);
    const [izinTalebi, setIzinTalebi] = useState({
        id: null,
        personelId: null,
        izinBaslamaTarihi: null,
        isbasiTarihi: null,
        izinBaslamaSaati: '08:00',
        isbasiSaati: '08:00',
        gunSayisi: 0,
        izinTipi: 'Yıllık İzin',
        aciklama: ''
    });
    const [selectedIzin, setSelectedIzin] = useState(null);
    const [onayNotu, setOnayNotu] = useState('');
    const [onayTipi, setOnayTipi] = useState('onayla'); // 'onayla' veya 'reddet'
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [izinOzeti, setIzinOzeti] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    // Permission states
    const [permissions, setPermissions] = useState({
        read: false,
        write: false,
        delete: false,
        update: false
    });
    
    const toast = useRef(null);
    const dt = useRef(null);

    const izinTipleri = [
        { label: 'Yıllık İzin', value: 'Yıllık İzin' },
        { label: 'Mazeret İzni', value: 'Mazeret İzni' },
        { label: 'Hastalık İzni', value: 'Hastalık İzni' },
        { label: 'Doğum İzni', value: 'Doğum İzni' },
        { label: 'Diğer', value: 'Diğer' }
    ];

    useEffect(() => {
        const user = authService.getUser();
        setCurrentUser(user);
        loadData();
        loadPermissions();
    }, []);

    const loadPermissions = async () => {
        try {
            await yetkiService.loadUserPermissions();
            setPermissions({
                read: yetkiService.hasScreenPermission('izin-talepleri', 'read'),
                write: yetkiService.hasScreenPermission('izin-talepleri', 'write'),
                delete: yetkiService.hasScreenPermission('izin-talepleri', 'delete'),
                update: yetkiService.hasScreenPermission('izin-talepleri', 'update')
            });
        } catch (error) {
            console.error('Permission loading error:', error);
            // If permission loading fails, deny all permissions for safety
            setPermissions({
                read: false,
                write: false,
                delete: false,
                update: false
            });
        }
    };

    const loadData = async () => {
        const user = authService.getUser();
        if (!user) return;

        await Promise.all([
            loadIzinTalepleri(),
            loadIzinOzeti(user.personel.id)
        ]);
    };

    const loadIzinTalepleri = async () => {
        setLoading(true);
        try {
            const user = authService.getUser();
            if (!user || !user.personel) {
                throw new Error('Kullanıcı bilgileri bulunamadı');
            }

            // Sadece kullanıcının kendi izin taleplerini getir
            const response = await izinService.getAllIzinTalepleri(user.personel.id);

            if (response.success) {
                setIzinTalepleri(response.data);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message || 'İzin talepleri yüklenirken hata oluştu',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const loadIzinOzeti = async (personelId) => {
        try {
            const response = await izinService.getPersonelIzinOzeti(personelId);
            if (response.success) {
                setIzinOzeti(response.data);
            }
        } catch (error) {
            console.error('İzin özeti yüklenirken hata:', error);
        }
    };

    const openNew = () => {
        const user = authService.getUser();
        setIzinTalebi({
            id: null,
            personelId: user.personel.id,
            izinBaslamaTarihi: null,
            isbasiTarihi: null,
            izinBaslamaSaati: '08:00',
            isbasiSaati: '08:00',
            gunSayisi: 0,
            izinTipi: 'Yıllık İzin',
            aciklama: ''
        });
        setSubmitted(false);
        setIzinDialog(true);
    };

    const hideDialog = () => {
        setSubmitted(false);
        setIzinDialog(false);
    };

    const hideOnayDialog = () => {
        setOnayDialog(false);
        setOnayNotu('');
        setSelectedIzin(null);
    };

    const saveIzinTalebi = async () => {
        setSubmitted(true);

        if (izinTalebi.izinBaslamaTarihi && izinTalebi.isbasiTarihi && 
            izinTalebi.izinBaslamaTarihi < izinTalebi.isbasiTarihi) {
            
            try {
                let response;
                if (izinTalebi.id) {
                    response = await izinService.updateIzinTalebi(izinTalebi.id, izinTalebi);
                } else {
                    response = await izinService.createIzinTalebi(izinTalebi);
                }

                if (response.success) {
                    toast.current.show({
                        severity: 'success',
                        summary: 'Başarılı',
                        detail: response.message,
                        life: 3000
                    });
                    loadData();
                    setIzinDialog(false);
                }
            } catch (error) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: error.message,
                    life: 3000
                });
            }
        }
    };

    const editIzinTalebi = (izin) => {
        setIzinTalebi({
            ...izin,
            izinBaslamaTarihi: new Date(izin.izinBaslamaTarihi || izin.baslangicTarihi),
            isbasiTarihi: new Date(izin.isbasiTarihi || izin.bitisTarihi),
            izinBaslamaSaati: '08:00',
            isbasiSaati: '08:00'
        });
        setIzinDialog(true);
    };

    const confirmDeleteIzin = (izin) => {
        confirmDialog({
            message: 'Bu izin talebini silmek istediğinizden emin misiniz?',
            header: 'Silme Onayı',
            icon: 'pi pi-exclamation-triangle',
            accept: () => deleteIzinTalebi(izin.id)
        });
    };

    const deleteIzinTalebi = async (id) => {
        try {
            const response = await izinService.deleteIzinTalebi(id);
            if (response.success) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: response.message,
                    life: 3000
                });
                loadData();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message,
                life: 3000
            });
        }
    };

    const openOnayDialog = (izin, tip) => {
        setSelectedIzin(izin);
        setOnayTipi(tip);
        setOnayDialog(true);
    };

    const processOnayReddet = async () => {
        if (!selectedIzin) return;

        try {
            const user = authService.getUser();
            let response;

            if (onayTipi === 'onayla') {
                response = await izinService.onaylaIzinTalebi(selectedIzin.id, user.personel.id, onayNotu);
            } else {
                response = await izinService.reddetIzinTalebi(selectedIzin.id, user.personel.id, onayNotu);
            }

            if (response.success) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: response.message,
                    life: 3000
                });
                loadData();
                hideOnayDialog();
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message,
                life: 3000
            });
        }
    };

    const calculateGunSayisi = () => {
        if (izinTalebi.izinBaslamaTarihi && izinTalebi.isbasiTarihi) {
            const start = new Date(izinTalebi.izinBaslamaTarihi);
            const end = new Date(izinTalebi.isbasiTarihi);
            let gunSayisi = 0;
            
            // İzin başlama ve işbaşı tarihleri arasındaki tüm günleri hesapla (işbaşı günü hariç)
            const current = new Date(start);
            while (current < end) { // İşbaşı tarihi dahil değil
                if (current.getDay() !== 0 && current.getDay() !== 6) { // Hafta sonu hariç
                    // Bu gün tam izin günü mü yoksa yarım mı?
                    if (current.getTime() === start.getTime()) {
                        // İzin başlama günü
                        const izinSaat = parseInt(izinTalebi.izinBaslamaSaati.split(':')[0]);
                        gunSayisi += izinSaat >= 13 ? 0.5 : 1;
                    } else {
                        // Ara günler tam gün izin
                        gunSayisi += 1;
                    }
                }
                current.setDate(current.getDate() + 1);
            }
            
            setIzinTalebi({ ...izinTalebi, gunSayisi });
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _izinTalebi = { ...izinTalebi };
        _izinTalebi[`${name}`] = val;
        setIzinTalebi(_izinTalebi);
    };

    const onDateChange = (e, name) => {
        const val = e.value;
        let _izinTalebi = { ...izinTalebi };
        _izinTalebi[`${name}`] = val;
        setIzinTalebi(_izinTalebi);
        
        // Tarih değiştiğinde gün sayısını hesapla
        setTimeout(() => calculateGunSayisi(), 100);
    };

    const leftToolbarTemplate = () => {
        return (
            <React.Fragment>
                {permissions.write && (
                    <Button
                        label="Yeni İzin Talebi"
                        icon="pi pi-plus"
                        className="p-button-success p-mr-2"
                        onClick={openNew}
                    />
                )}
            </React.Fragment>
        );
    };

    const rightToolbarTemplate = () => {
        return (
            <React.Fragment>
                <Button
                    label="Dışa Aktar"
                    icon="pi pi-upload"
                    className="p-button-help"
                    onClick={() => dt.current.exportCSV()}
                />
            </React.Fragment>
        );
    };

    const actionBodyTemplate = (rowData) => {
        const user = authService.getUser();
        const isOwner = rowData.personelId === user.personel.id;
        const canEdit = rowData.durum === 'Beklemede' && isOwner && permissions.update;
        const canDelete = rowData.durum === 'Beklemede' && isOwner && permissions.delete;

        return (
            <React.Fragment>
                {canEdit && (
                    <Button
                        icon="pi pi-pencil"
                        className="p-button-rounded p-button-success p-button-sm p-mr-1"
                        onClick={() => editIzinTalebi(rowData)}
                        tooltip="Düzenle"
                    />
                )}
                {canDelete && (
                    <Button
                        icon="pi pi-trash"
                        className="p-button-rounded p-button-warning p-button-sm p-mr-1"
                        onClick={() => confirmDeleteIzin(rowData)}
                        tooltip="Sil"
                    />
                )}
                {!canEdit && !canDelete && (
                    <span className="text-500">-</span>
                )}
            </React.Fragment>
        );
    };

    const avatarBodyTemplate = (rowData) => {
        if (rowData.personelFotograf) {
            return (
                <Avatar
                    image={fileUploadService.getAvatarUrl(rowData.personelFotograf)}
                    size="normal"
                    shape="circle"
                />
            );
        } else {
            const names = rowData.personelAd.split(' ');
            return (
                <Avatar
                    label={names[0].charAt(0) + (names[1] ? names[1].charAt(0) : '')}
                    size="normal"
                    shape="circle"
                    style={{ backgroundColor: '#2196F3', color: '#ffffff' }}
                />
            );
        }
    };

    const durumBodyTemplate = (rowData) => {
        return (
            <Badge
                value={rowData.durum}
                severity={izinService.getDurumRengi(rowData.durum)}
            />
        );
    };

    const izinTipiBodyTemplate = (rowData) => {
        return (
            <Badge
                value={rowData.izinTipi}
                severity={izinService.getIzinTipiRengi(rowData.izinTipi)}
            />
        );
    };

    const tarihBodyTemplate = (field) => (rowData) => {
        // Hem yeni hem eski alan adlarını destekle
        let tarihDegeri = rowData[field];
        if (!tarihDegeri) {
            // Fallback eski alan adları
            if (field === 'izinBaslamaTarihi') {
                tarihDegeri = rowData.baslangicTarihi;
            } else if (field === 'isbasiTarihi') {
                tarihDegeri = rowData.bitisTarihi;
            }
        }
        return izinService.formatTarih(tarihDegeri);
    };

    const header = (
        <div className="table-header">
            <h5 className="p-m-0">İzin Taleplerim</h5>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    onInput={(e) => setGlobalFilter(e.target.value)}
                    placeholder="Arama yapın..."
                />
            </span>
        </div>
    );

    const izinDialogFooter = (
        <React.Fragment>
            <Button
                label="İptal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideDialog}
            />
            <Button
                label="Yönetici Onayına Gönder"
                icon="pi pi-send"
                className="p-button-success"
                onClick={saveIzinTalebi}
            />
        </React.Fragment>
    );

    const onayDialogFooter = (
        <React.Fragment>
            <Button
                label="İptal"
                icon="pi pi-times"
                className="p-button-text"
                onClick={hideOnayDialog}
            />
            <Button
                label={onayTipi === 'onayla' ? 'Onayla' : 'Reddet'}
                icon={onayTipi === 'onayla' ? 'pi pi-check' : 'pi pi-times'}
                className={onayTipi === 'onayla' ? 'p-button-success' : 'p-button-danger'}
                onClick={processOnayReddet}
            />
        </React.Fragment>
    );

    return (
        <div className="datatable-crud-demo">
            <Toast ref={toast} />

            {/* İzin Özeti Kartı */}
            {izinOzeti && (
                <Card className="p-mb-4">
                    <div className="p-d-flex p-jc-between p-ai-center">
                        <h6>İzin Haklarınız ({izinOzeti.yil})</h6>
                        <div className="p-d-flex p-ai-center">
                            <Chip label={`Toplam: ${izinOzeti.toplamHak} gün`} className="p-mr-2" />
                            <Chip label={`Kullanılan: ${izinOzeti.kullanilmis} gün`} className="p-mr-2 p-chip-warning" />
                            <Chip label={`Bekleyen: ${izinOzeti.bekleyen} gün`} className="p-mr-2 p-chip-info" />
                            <Chip label={`Kalan: ${izinOzeti.kalan} gün`} className="p-chip-success" />
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                <Toolbar
                    className="p-mb-4"
                    left={leftToolbarTemplate}
                    right={rightToolbarTemplate}
                ></Toolbar>

                <DataTable
                    ref={dt}
                    value={izinTalepleri}
                    dataKey="id"
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="{first} - {last} arası, toplam {totalRecords} kayıt"
                    globalFilter={globalFilter}
                    header={header}
                    responsiveLayout="scroll"
                    loading={loading}
                    emptyMessage="İzin talebi bulunamadı."
                >
                    <Column
                        field="id"
                        header="ID"
                        sortable
                        style={{ minWidth: '4rem', width: '4rem' }}
                    ></Column>
                    <Column
                        field="personelAd"
                        header="Ad Soyad"
                        body={(rowData) => (
                            <div className="p-d-flex p-ai-center">
                                {avatarBodyTemplate(rowData)}
                                <span className="p-ml-2">{rowData.personelAd}</span>
                            </div>
                        )}
                        sortable
                        style={{ minWidth: '14rem' }}
                    ></Column>
                    <Column
                        field="personelDepartman"
                        header="Departman"
                        sortable
                        style={{ minWidth: '10rem' }}
                    ></Column>
                    <Column
                        field="personelPozisyon"
                        header="Pozisyon"
                        sortable
                        style={{ minWidth: '10rem' }}
                    ></Column>
                    <Column
                        field="izinTipi"
                        header="İzin Tipi"
                        body={izinTipiBodyTemplate}
                        sortable
                        style={{ minWidth: '10rem' }}
                    ></Column>
                    <Column
                        field="izinBaslamaTarihi"
                        header="İzin Başlama"
                        body={tarihBodyTemplate('izinBaslamaTarihi')}
                        sortable
                        style={{ minWidth: '12rem' }}
                    ></Column>
                    <Column
                        field="isbasiTarihi"
                        header="İşbaşı"
                        body={tarihBodyTemplate('isbasiTarihi')}
                        sortable
                        style={{ minWidth: '12rem' }}
                    ></Column>
                    <Column
                        field="gunSayisi"
                        header="Gün"
                        sortable
                        style={{ minWidth: '6rem' }}
                    ></Column>
                    <Column
                        field="durum"
                        header="Durum"
                        body={durumBodyTemplate}
                        sortable
                        style={{ minWidth: '8rem' }}
                    ></Column>
                    <Column
                        field="onaylayanAd"
                        header="Onaylayan"
                        sortable
                        style={{ minWidth: '12rem' }}
                    ></Column>
                    <Column
                        field="reddedenAd"
                        header="Reddeden"
                        sortable
                        style={{ minWidth: '12rem' }}
                    ></Column>
                    <Column
                        body={actionBodyTemplate}
                        header="İşlemler"
                        style={{ minWidth: '8rem' }}
                    ></Column>
                </DataTable>
            </Card>

            {/* İzin Talebi Dialog */}
            <Dialog
                visible={izinDialog}
                style={{ width: '600px' }}
                header="İzin Talebi Detayları"
                modal
                className="p-fluid"
                footer={izinDialogFooter}
                onHide={hideDialog}
            >
                <div className="p-field">
                    <label htmlFor="izinTipi">İzin Tipi *</label>
                    <Dropdown
                        id="izinTipi"
                        value={izinTalebi.izinTipi}
                        options={izinTipleri}
                        onChange={(e) => onInputChange(e, 'izinTipi')}
                        placeholder="İzin tipi seçiniz"
                    />
                </div>

                <div className="p-formgrid p-grid">
                    <div className="p-field p-col-6">
                        <label htmlFor="izinBaslamaTarihi">İzin Başlama Tarihi *</label>
                        <Calendar
                            id="izinBaslamaTarihi"
                            value={izinTalebi.izinBaslamaTarihi}
                            onChange={(e) => onDateChange(e, 'izinBaslamaTarihi')}
                            dateFormat="dd/mm/yy"
                            locale="tr"
                            placeholder="dd/mm/yyyy"
                            showIcon
                            minDate={new Date()}
                            className={submitted && !izinTalebi.izinBaslamaTarihi ? 'p-invalid' : ''}
                        />
                        {submitted && !izinTalebi.izinBaslamaTarihi && (
                            <small className="p-error">İzin başlama tarihi gereklidir.</small>
                        )}
                    </div>

                    <div className="p-field p-col-6">
                        <label htmlFor="izinBaslamaSaati">İzin Başlama Saati *</label>
                        <Dropdown
                            id="izinBaslamaSaati"
                            value={izinTalebi.izinBaslamaSaati}
                            options={[
                                {label: '08:00', value: '08:00'},
                                {label: '09:00', value: '09:00'},
                                {label: '10:00', value: '10:00'},
                                {label: '11:00', value: '11:00'},
                                {label: '12:00', value: '12:00'},
                                {label: '13:00', value: '13:00'},
                                {label: '14:00', value: '14:00'},
                                {label: '15:00', value: '15:00'},
                                {label: '16:00', value: '16:00'},
                                {label: '17:00', value: '17:00'},
                                {label: '18:00', value: '18:00'}
                            ]}
                            onChange={(e) => { onInputChange(e, 'izinBaslamaSaati'); setTimeout(() => calculateGunSayisi(), 100); }}
                            placeholder="Saat seçiniz"
                        />
                    </div>
                </div>

                <div className="p-formgrid p-grid">
                    <div className="p-field p-col-6">
                        <label htmlFor="isbasiTarihi">İşbaşı Tarihi *</label>
                        <Calendar
                            id="isbasiTarihi"
                            value={izinTalebi.isbasiTarihi}
                            onChange={(e) => onDateChange(e, 'isbasiTarihi')}
                            dateFormat="dd/mm/yy"
                            locale="tr"
                            placeholder="dd/mm/yyyy"
                            showIcon
                            minDate={izinTalebi.izinBaslamaTarihi || new Date()}
                            className={submitted && !izinTalebi.isbasiTarihi ? 'p-invalid' : ''}
                        />
                        {submitted && !izinTalebi.isbasiTarihi && (
                            <small className="p-error">İşbaşı tarihi gereklidir.</small>
                        )}
                    </div>

                    <div className="p-field p-col-6">
                        <label htmlFor="isbasiSaati">İşbaşı Saati *</label>
                        <Dropdown
                            id="isbasiSaati"
                            value={izinTalebi.isbasiSaati}
                            options={[
                                {label: '08:00', value: '08:00'},
                                {label: '09:00', value: '09:00'},
                                {label: '10:00', value: '10:00'},
                                {label: '11:00', value: '11:00'},
                                {label: '12:00', value: '12:00'},
                                {label: '13:00', value: '13:00'},
                                {label: '14:00', value: '14:00'},
                                {label: '15:00', value: '15:00'},
                                {label: '16:00', value: '16:00'},
                                {label: '17:00', value: '17:00'},
                                {label: '18:00', value: '18:00'}
                            ]}
                            onChange={(e) => { onInputChange(e, 'isbasiSaati'); setTimeout(() => calculateGunSayisi(), 100); }}
                            placeholder="Saat seçiniz"
                        />
                    </div>
                </div>

                {izinTalebi.gunSayisi > 0 && (
                    <div className="p-field">
                        <Message
                            severity="info"
                            text={`Hesaplanan Toplam İzin Sayısı: ${izinTalebi.gunSayisi} Gün`}
                        />
                    </div>
                )}

                <div className="p-field">
                    <label htmlFor="aciklama">İzin Açıklama</label>
                    <InputTextarea
                        id="aciklama"
                        value={izinTalebi.aciklama}
                        onChange={(e) => onInputChange(e, 'aciklama')}
                        rows={3}
                        cols={20}
                    />
                </div>
            </Dialog>

            {/* Onay/Reddet Dialog */}
            <Dialog
                visible={onayDialog}
                style={{ width: '500px' }}
                header={`İzin Talebi ${onayTipi === 'onayla' ? 'Onaylama' : 'Reddetme'}`}
                modal
                className="p-fluid"
                footer={onayDialogFooter}
                onHide={hideOnayDialog}
            >
                {selectedIzin && (
                    <>
                        <Panel header="İzin Talebi Bilgileri" className="p-mb-3">
                            <div className="p-d-flex p-ai-center p-mb-2">
                                {avatarBodyTemplate(selectedIzin)}
                                <div className="p-ml-2">
                                    <div><strong>{selectedIzin.personelAd}</strong></div>
                                    <div className="p-text-secondary">{selectedIzin.personelDepartman}</div>
                                </div>
                            </div>
                            <div className="p-mb-2">
                                <strong>İzin Tipi:</strong> {selectedIzin.izinTipi}
                            </div>
                            <div className="p-mb-2">
                                <strong>Tarih:</strong> {izinService.formatTarih(selectedIzin.izinBaslamaTarihi || selectedIzin.baslangicTarihi)} - {izinService.formatTarih(selectedIzin.isbasiTarihi || selectedIzin.bitisTarihi)}
                            </div>
                            <div className="p-mb-2">
                                <strong>Gün Sayısı:</strong> {selectedIzin.gunSayisi} gün
                            </div>
                            {selectedIzin.aciklama && (
                                <div>
                                    <strong>Açıklama:</strong> {selectedIzin.aciklama}
                                </div>
                            )}
                        </Panel>

                        <div className="p-field">
                            <label htmlFor="onayNotu">
                                {onayTipi === 'onayla' ? 'Onay Notu' : 'Reddet Notu'}
                            </label>
                            <InputTextarea
                                id="onayNotu"
                                value={onayNotu}
                                onChange={(e) => setOnayNotu(e.target.value)}
                                rows={3}
                                placeholder={onayTipi === 'onayla' ? 'Onay nedeninizi yazabilirsiniz...' : 'Reddet nedeninizi yazın...'}
                            />
                        </div>
                    </>
                )}
            </Dialog>
        </div>
    );
};

export default IzinTalepleri;