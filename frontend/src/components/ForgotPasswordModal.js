import React, { useState, useRef } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import authService from '../services/authService';

const ForgotPasswordModal = ({ visible, onHide }) => {
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!kullaniciAdi.trim()) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı adı gereklidir'
            });
            return;
        }

        setLoading(true);

        try {
            const response = await authService.forgotPassword(kullaniciAdi.trim());
            
            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: response.message,
                    life: 5000
                });
                
                // Modal'ı kapat ve formu temizle
                setTimeout(() => {
                    setKullaniciAdi('');
                    onHide();
                }, 2000);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message || 'Şifre sıfırlanırken bir hata oluştu'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setKullaniciAdi('');
            onHide();
        }
    };

    const footerContent = (
        <div className="flex justify-content-end gap-2">
            <Button
                label="İptal"
                icon="pi pi-times"
                outlined
                onClick={handleClose}
                disabled={loading}
            />
            <Button
                label="Şifre Sıfırla"
                icon="pi pi-send"
                onClick={handleSubmit}
                loading={loading}
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                header="Şifremi Unuttum"
                visible={visible}
                onHide={handleClose}
                footer={footerContent}
                style={{ width: '450px' }}
                modal
                closable={!loading}
            >
                <div className="mb-4">
                    <p className="text-700 line-height-3 mb-4">
                        Kullanıcı adınızı girin. Eğer sistemde kayıtlıysanız, şifreniz TC kimlik numaranızın son 4 hanesi olarak sıfırlanacaktır.
                    </p>
                    
                    <form onSubmit={handleSubmit}>
                        <div className="field">
                            <label htmlFor="kullaniciAdi" className="block text-900 font-semibold mb-2">
                                Kullanıcı Adı
                            </label>
                            <InputText
                                id="kullaniciAdi"
                                value={kullaniciAdi}
                                onChange={(e) => setKullaniciAdi(e.target.value)}
                                placeholder="Kullanıcı adınızı girin"
                                className="w-full p-3"
                                disabled={loading}
                                autoFocus
                            />
                        </div>
                    </form>
                </div>
            </Dialog>
        </>
    );
};

export default ForgotPasswordModal;