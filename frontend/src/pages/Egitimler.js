import React, { useState, useEffect, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { Chip } from 'primereact/chip';
import { Badge } from 'primereact/badge';
import { TabView, TabPanel } from 'primereact/tabview';
import { MultiSelect } from 'primereact/multiselect';
import { Toast } from 'primereact/toast';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Rating } from 'primereact/rating';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import { Panel } from 'primereact/panel';
import axios from 'axios';
import yetkiService from '../services/yetkiService';
import './Egitimler.css';

const Egitimler = () => {
    const [egitimler, setEgitimler] = useState([]);
    const [personeller, setPersoneller] = useState([]);
    const [loading, setLoading] = useState(false);
    const [egitimDialog, setEgitimDialog] = useState(false);
    const [personelAtamaDialog, setPersonelAtamaDialog] = useState(false);
    const [katilimGuncelleDialog, setKatilimGuncelleDialog] = useState(false);
    const [selectedEgitim, setSelectedEgitim] = useState(null);
    const [selectedPersonelEgitimi, setSelectedPersonelEgitimi] = useState(null);
    const [selectedPersoneller, setSelectedPersoneller] = useState([]);
    const [globalFilter, setGlobalFilter] = useState('');
    const [activeIndex, setActiveIndex] = useState(0);
    // Permission states
    const [permissions, setPermissions] = useState({
        read: false,
        write: false,
        delete: false,
        update: false
    });
    const toast = useRef(null);

    const durumOptions = [
        { label: 'Planlandı', value: 'Planlandı' },
        { label: 'Devam Ediyor', value: 'Devam Ediyor' },
        { label: 'Tamamlandı', value: 'Tamamlandı' },
        { label: 'İptal', value: 'İptal' }
    ];

    const katilimDurumuOptions = [
        { label: 'Atandı', value: 'Atandı' },
        { label: 'Katılıyor', value: 'Katılıyor' },
        { label: 'Tamamladı', value: 'Tamamladı' },
        { label: 'Katılmadı', value: 'Katılmadı' }
    ];

    const emptyEgitim = {
        id: null,
        baslik: '',
        aciklama: '',
        baslangicTarihi: new Date(),
        bitisTarihi: new Date(),
        sureSaat: null,
        egitmen: '',
        konum: '',
        kapasite: null,
        durum: 'Planlandı'
    };

    const [egitim, setEgitim] = useState(emptyEgitim);
    const [katilimGuncelleme, setKatilimGuncelleme] = useState({
        katilimDurumu: '',
        puan: null,
        sertifikaUrl: ''
    });

    const loadPermissions = async () => {
        try {
            await yetkiService.loadUserPermissions();
            setPermissions({
                read: yetkiService.hasScreenPermission('egitimler', 'read'),
                write: yetkiService.hasScreenPermission('egitimler', 'write'),
                delete: yetkiService.hasScreenPermission('egitimler', 'delete'),
                update: yetkiService.hasScreenPermission('egitimler', 'update')
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

    useEffect(() => {
        loadEgitimler();
        loadPersoneller();
        loadPermissions();
    }, []);

    const loadEgitimler = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5194/api/Egitim');
            if (response.data.success) {
                setEgitimler(response.data.data);
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Eğitimler yüklenemedi.' });
        } finally {
            setLoading(false);
        }
    };

    const loadPersoneller = async () => {
        try {
            const response = await axios.get('http://localhost:5194/api/Personel');
            if (response.data.success) {
                const personelOptions = response.data.data.map(p => ({
                    label: `${p.ad} ${p.soyad} (${p.departmanAd})`,
                    value: p.id,
                    departman: p.departmanAd,
                    pozisyon: p.pozisyonAd
                }));
                setPersoneller(personelOptions);
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Personeller yüklenemedi.' });
        }
    };

    const openNew = () => {
        setEgitim({ ...emptyEgitim });
        setEgitimDialog(true);
    };

    const hideDialog = () => {
        setEgitimDialog(false);
        setPersonelAtamaDialog(false);
        setKatilimGuncelleDialog(false);
        setSelectedEgitim(null);
        setSelectedPersonelEgitimi(null);
        setSelectedPersoneller([]);
    };

    const saveEgitim = async () => {
        try {
            let response;
            if (egitim.id) {
                response = await axios.put(`http://localhost:5194/api/Egitim/${egitim.id}`, egitim);
            } else {
                response = await axios.post('http://localhost:5194/api/Egitim', egitim);
            }

            if (response.data.success) {
                toast.current.show({ severity: 'success', summary: 'Başarılı', detail: response.data.message });
                loadEgitimler();
                hideDialog();
            } else {
                toast.current.show({ severity: 'error', summary: 'Hata', detail: response.data.message });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Eğitim kaydedilemedi.' });
        }
    };

    const editEgitim = (egitim) => {
        setEgitim({
            ...egitim,
            baslangicTarihi: new Date(egitim.baslangicTarihi),
            bitisTarihi: new Date(egitim.bitisTarihi)
        });
        setEgitimDialog(true);
    };

    const deleteEgitim = async (egitim) => {
        try {
            const response = await axios.delete(`http://localhost:5194/api/Egitim/${egitim.id}`);
            if (response.data.success) {
                toast.current.show({ severity: 'success', summary: 'Başarılı', detail: response.data.message });
                loadEgitimler();
            } else {
                toast.current.show({ severity: 'error', summary: 'Hata', detail: response.data.message });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Eğitim silinemedi.' });
        }
    };

    const personelAta = (egitim) => {
        setSelectedEgitim(egitim);
        setSelectedPersoneller([]);
        setPersonelAtamaDialog(true);
    };

    const savePersonelAtama = async () => {
        try {
            const personelIdler = selectedPersoneller.map(p => p.value);
            const response = await axios.post(`http://localhost:5194/api/Egitim/PersonelAta/${selectedEgitim.id}`, {
                personelIdler
            });

            if (response.data.success) {
                toast.current.show({ severity: 'success', summary: 'Başarılı', detail: response.data.message });
                loadEgitimler();
                hideDialog();
            } else {
                toast.current.show({ severity: 'error', summary: 'Hata', detail: response.data.message });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Personel ataması yapılamadı.' });
        }
    };

    const katilimGuncelle = (personelEgitimi) => {
        setSelectedPersonelEgitimi(personelEgitimi);
        setKatilimGuncelleme({
            katilimDurumu: personelEgitimi.katilimDurumu || '',
            puan: personelEgitimi.puan || null,
            sertifikaUrl: personelEgitimi.sertifikaUrl || ''
        });
        setKatilimGuncelleDialog(true);
    };

    const saveKatilimGuncelleme = async () => {
        try {
            const response = await axios.put(`http://localhost:5194/api/Egitim/KatilimGuncelle/${selectedPersonelEgitimi.id}`, katilimGuncelleme);

            if (response.data.success) {
                toast.current.show({ severity: 'success', summary: 'Başarılı', detail: response.data.message });
                loadEgitimler();
                hideDialog();
            } else {
                toast.current.show({ severity: 'error', summary: 'Hata', detail: response.data.message });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Katılım durumu güncellenemedi.' });
        }
    };

    const personelCikar = async (personelEgitimiId) => {
        try {
            const response = await axios.delete(`http://localhost:5194/api/Egitim/PersonelCikar/${personelEgitimiId}`);
            if (response.data.success) {
                toast.current.show({ severity: 'success', summary: 'Başarılı', detail: response.data.message });
                loadEgitimler();
            } else {
                toast.current.show({ severity: 'error', summary: 'Hata', detail: response.data.message });
            }
        } catch (error) {
            toast.current.show({ severity: 'error', summary: 'Hata', detail: 'Personel çıkarılamadı.' });
        }
    };

    const onInputChange = (e, name) => {
        const val = (e.target && e.target.value) || '';
        let _egitim = { ...egitim };
        _egitim[`${name}`] = val;
        setEgitim(_egitim);
    };

    const onInputNumberChange = (e, name) => {
        const val = e.value || null;
        let _egitim = { ...egitim };
        _egitim[`${name}`] = val;
        setEgitim(_egitim);
    };

    const actionBodyTemplate = (rowData) => {
        return (
            <div className="flex gap-2">
                {permissions.update && (
                    <Button 
                        icon="pi pi-pencil" 
                        className="p-button-rounded p-button-success p-button-text"
                        onClick={() => editEgitim(rowData)} 
                        tooltip="Düzenle"
                    />
                )}
                {permissions.update && (
                    <Button 
                        icon="pi pi-users" 
                        className="p-button-rounded p-button-info p-button-text"
                        onClick={() => personelAta(rowData)}
                        tooltip="Personel Ata"
                    />
                )}
                {permissions.delete && (
                    <Button 
                        icon="pi pi-trash" 
                        className="p-button-rounded p-button-danger p-button-text"
                        onClick={() => deleteEgitim(rowData)} 
                        tooltip="Sil"
                    />
                )}
                {!permissions.update && !permissions.delete && (
                    <span className="text-500">Yetki yok</span>
                )}
            </div>
        );
    };

    const durumBodyTemplate = (rowData) => {
        const getDurumSeverity = (durum) => {
            switch (durum) {
                case 'Planlandı': return 'info';
                case 'Devam Ediyor': return 'warning';
                case 'Tamamlandı': return 'success';
                case 'İptal': return 'danger';
                default: return 'info';
            }
        };

        return <Badge value={rowData.durum} severity={getDurumSeverity(rowData.durum)} />;
    };

    const tarihBodyTemplate = (rowData) => {
        return new Date(rowData.baslangicTarihi).toLocaleDateString('tr-TR');
    };

    const katilimciBodyTemplate = (rowData) => {
        const dolulukOrani = rowData.kapasite ? (rowData.katilimciSayisi / rowData.kapasite * 100) : 0;
        return (
            <div>
                <div className="flex align-items-center gap-2">
                    <span>{rowData.katilimciSayisi}</span>
                    {rowData.kapasite && <span>/ {rowData.kapasite}</span>}
                </div>
                {rowData.kapasite && (
                    <ProgressBar value={dolulukOrani} className="mt-1" style={{ height: '4px' }} />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-column md:flex-row md:align-items-center md:justify-content-between gap-2">
            <h2 className="m-0">Eğitimler</h2>
            <div className="flex gap-2">
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText 
                        type="search" 
                        onInput={(e) => setGlobalFilter(e.target.value)} 
                        placeholder="Arama..." 
                    />
                </span>
                {permissions.write && (
                    <Button label="Yeni Eğitim" icon="pi pi-plus" onClick={openNew} />
                )}
            </div>
        </div>
    );

    const egitimDialogFooter = (
        <React.Fragment>
            <Button label="İptal" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Kaydet" icon="pi pi-check" onClick={saveEgitim} />
        </React.Fragment>
    );

    const personelAtamaDialogFooter = (
        <React.Fragment>
            <Button label="İptal" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Ata" icon="pi pi-check" onClick={savePersonelAtama} disabled={selectedPersoneller.length === 0} />
        </React.Fragment>
    );

    const katilimGuncelleDialogFooter = (
        <React.Fragment>
            <Button label="İptal" icon="pi pi-times" className="p-button-text" onClick={hideDialog} />
            <Button label="Güncelle" icon="pi pi-check" onClick={saveKatilimGuncelleme} />
        </React.Fragment>
    );

    const expandedRowTemplate = (data) => {
        return (
            <div className="p-3">
                <h5>Katılımcılar ({data.katilimciSayisi})</h5>
                {data.katilimcilar && data.katilimcilar.length > 0 ? (
                    <div className="grid">
                        {data.katilimcilar.map((katilimci) => (
                            <div key={katilimci.personelId} className="col-12 md:col-6 lg:col-4">
                                <Card className="mb-2">
                                    <div className="flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="m-0 mb-1">{katilimci.personelAd}</h6>
                                            <Badge 
                                                value={katilimci.katilimDurumu} 
                                                severity={katilimci.katilimDurumu === 'Tamamladı' ? 'success' : 
                                                         katilimci.katilimDurumu === 'Katılıyor' ? 'warning' : 'info'} 
                                                className="mb-2"
                                            />
                                            {katilimci.puan && (
                                                <div className="flex align-items-center gap-1">
                                                    <Rating value={katilimci.puan} readOnly cancel={false} stars={5} />
                                                    <span>({katilimci.puan}/5)</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex gap-1">
                                            {permissions.update && (
                                                <Button 
                                                    icon="pi pi-pencil" 
                                                    className="p-button-rounded p-button-text p-button-sm"
                                                    onClick={() => katilimGuncelle(katilimci)}
                                                    tooltip="Katılım Güncelle"
                                                />
                                            )}
                                            {permissions.delete && (
                                                <Button 
                                                    icon="pi pi-times" 
                                                    className="p-button-rounded p-button-text p-button-sm p-button-danger"
                                                    onClick={() => personelCikar(katilimci.id)}
                                                    tooltip="Eğitimden Çıkar"
                                                />
                                            )}
                                            {!permissions.update && !permissions.delete && (
                                                <span className="text-500 text-sm">Yetki yok</span>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>Henüz katılımcı atanmamış.</p>
                )}
            </div>
        );
    };

    return (
        <div className="egitimler-container">
            <Toast ref={toast} />
            <ConfirmDialog />
            
            <div className="card">
                <TabView activeIndex={activeIndex} onTabChange={(e) => setActiveIndex(e.index)}>
                    <TabPanel header="Eğitimler" leftIcon="pi pi-book">
                        <DataTable
                            value={egitimler}
                            loading={loading}
                            dataKey="id"
                            paginator
                            rows={10}
                            rowsPerPageOptions={[5, 10, 25]}
                            globalFilter={globalFilter}
                            header={header}
                            expandedRows={selectedEgitim ? [selectedEgitim] : []}
                            onRowToggle={(e) => setSelectedEgitim(e.data)}
                            rowExpansionTemplate={expandedRowTemplate}
                            className="datatable-responsive"
                            emptyMessage="Eğitim bulunamadı."
                        >
                            <Column expander={true} style={{ width: '3rem' }} />
                            <Column
                                field="id"
                                header="ID"
                                sortable
                                style={{ minWidth: '4rem', width: '4rem' }}
                            />
                            <Column field="baslik" header="Eğitim Başlığı" sortable />
                            <Column field="baslangicTarihi" header="Başlangıç Tarihi" body={tarihBodyTemplate} sortable />
                            <Column field="sureSaat" header="Süre (Saat)" sortable />
                            <Column field="egitmen" header="Eğitmen" sortable />
                            <Column field="konum" header="Konum" />
                            <Column field="katilimciSayisi" header="Katılımcılar" body={katilimciBodyTemplate} />
                            <Column field="durum" header="Durum" body={durumBodyTemplate} sortable />
                            <Column body={actionBodyTemplate} exportable={false} style={{ minWidth: '8rem' }} />
                        </DataTable>
                    </TabPanel>
                </TabView>
            </div>

            {/* Eğitim Dialog */}
            <Dialog 
                visible={egitimDialog} 
                style={{ width: '600px' }} 
                header={egitim.id ? 'Eğitim Düzenle' : 'Yeni Eğitim'} 
                modal 
                className="p-fluid"
                footer={egitimDialogFooter} 
                onHide={hideDialog}
            >
                <div className="grid">
                    <div className="col-12">
                        <label htmlFor="baslik">Eğitim Başlığı *</label>
                        <InputText 
                            id="baslik" 
                            value={egitim.baslik} 
                            onChange={(e) => onInputChange(e, 'baslik')} 
                            required 
                            autoFocus 
                        />
                    </div>
                    
                    <div className="col-12">
                        <label htmlFor="aciklama">Açıklama</label>
                        <InputTextarea 
                            id="aciklama" 
                            value={egitim.aciklama} 
                            onChange={(e) => onInputChange(e, 'aciklama')} 
                            rows={3} 
                        />
                    </div>
                    
                    <div className="col-6">
                        <label htmlFor="baslangicTarihi">Başlangıç Tarihi *</label>
                        <Calendar 
                            id="baslangicTarihi" 
                            value={egitim.baslangicTarihi} 
                            onChange={(e) => onInputChange(e, 'baslangicTarihi')} 
                            showTime 
                            hourFormat="24"
                        />
                    </div>
                    
                    <div className="col-6">
                        <label htmlFor="bitisTarihi">Bitiş Tarihi *</label>
                        <Calendar 
                            id="bitisTarihi" 
                            value={egitim.bitisTarihi} 
                            onChange={(e) => onInputChange(e, 'bitisTarihi')} 
                            showTime 
                            hourFormat="24"
                        />
                    </div>
                    
                    <div className="col-6">
                        <label htmlFor="sureSaat">Süre (Saat)</label>
                        <InputNumber 
                            id="sureSaat" 
                            value={egitim.sureSaat} 
                            onValueChange={(e) => onInputNumberChange(e, 'sureSaat')} 
                            min={0} 
                        />
                    </div>
                    
                    <div className="col-6">
                        <label htmlFor="kapasite">Kapasite</label>
                        <InputNumber 
                            id="kapasite" 
                            value={egitim.kapasite} 
                            onValueChange={(e) => onInputNumberChange(e, 'kapasite')} 
                            min={0} 
                        />
                    </div>
                    
                    <div className="col-6">
                        <label htmlFor="egitmen">Eğitmen</label>
                        <InputText 
                            id="egitmen" 
                            value={egitim.egitmen} 
                            onChange={(e) => onInputChange(e, 'egitmen')} 
                        />
                    </div>
                    
                    <div className="col-6">
                        <label htmlFor="konum">Konum</label>
                        <InputText 
                            id="konum" 
                            value={egitim.konum} 
                            onChange={(e) => onInputChange(e, 'konum')} 
                        />
                    </div>
                    
                    <div className="col-12">
                        <label htmlFor="durum">Durum</label>
                        <Dropdown 
                            id="durum" 
                            value={egitim.durum} 
                            options={durumOptions} 
                            onChange={(e) => onInputChange(e, 'durum')} 
                        />
                    </div>
                </div>
            </Dialog>

            {/* Personel Atama Dialog */}
            <Dialog 
                visible={personelAtamaDialog} 
                style={{ width: '500px' }} 
                header="Personel Atama" 
                modal 
                className="p-fluid"
                footer={personelAtamaDialogFooter} 
                onHide={hideDialog}
            >
                <div className="grid">
                    <div className="col-12">
                        <label htmlFor="personeller">Personel Seç</label>
                        <MultiSelect 
                            id="personeller"
                            value={selectedPersoneller} 
                            options={personeller} 
                            onChange={(e) => setSelectedPersoneller(e.value)} 
                            placeholder="Personel seçin..."
                            filter
                            showClear
                            display="chip"
                        />
                    </div>
                </div>
            </Dialog>

            {/* Katılım Güncelleme Dialog */}
            <Dialog 
                visible={katilimGuncelleDialog} 
                style={{ width: '400px' }} 
                header="Katılım Durumu Güncelle" 
                modal 
                className="p-fluid"
                footer={katilimGuncelleDialogFooter} 
                onHide={hideDialog}
            >
                <div className="grid">
                    <div className="col-12">
                        <label htmlFor="katilimDurumu">Katılım Durumu</label>
                        <Dropdown 
                            id="katilimDurumu" 
                            value={katilimGuncelleme.katilimDurumu} 
                            options={katilimDurumuOptions} 
                            onChange={(e) => setKatilimGuncelleme({...katilimGuncelleme, katilimDurumu: e.value})} 
                        />
                    </div>
                    
                    <div className="col-12">
                        <label htmlFor="puan">Puan (1-5)</label>
                        <Rating 
                            id="puan"
                            value={katilimGuncelleme.puan} 
                            onChange={(e) => setKatilimGuncelleme({...katilimGuncelleme, puan: e.value})}
                            cancel={false}
                        />
                    </div>
                    
                    <div className="col-12">
                        <label htmlFor="sertifikaUrl">Sertifika URL</label>
                        <InputText 
                            id="sertifikaUrl" 
                            value={katilimGuncelleme.sertifikaUrl} 
                            onChange={(e) => setKatilimGuncelleme({...katilimGuncelleme, sertifikaUrl: e.target.value})} 
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    );
};

export default Egitimler;