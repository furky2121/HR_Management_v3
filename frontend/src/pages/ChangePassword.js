import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Password } from 'primereact/password';
import { Dialog } from 'primereact/dialog';
import { Toast } from 'primereact/toast';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import authService from '../services/authService';

const ChangePassword = ({ visible, onHide, isFirstLogin = false, onSuccess }) => {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        if (!visible) {
            resetForm();
        }
    }, [visible]);

    const resetForm = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSubmitted(false);
    };

    const handleSubmit = async () => {
        setSubmitted(true);

        // Validations
        if (!currentPassword || !newPassword || !confirmPassword) {
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Yeni şifreler eşleşmiyor.',
                life: 3000
            });
            return;
        }

        if (newPassword.length < 6) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Yeni şifre en az 6 karakter olmalıdır.',
                life: 3000
            });
            return;
        }

        if (newPassword === currentPassword) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Yeni şifre mevcut şifre ile aynı olamaz.',
                life: 3000
            });
            return;
        }

        setLoading(true);
        try {
            const response = await authService.changePassword({
                currentPassword,
                newPassword
            });

            if (response.success) {
                toast.current?.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: 'Şifreniz başarıyla değiştirildi.',
                    life: 3000
                });

                setTimeout(() => {
                    onSuccess && onSuccess();
                    onHide();
                }, 1500);
            }
        } catch (error) {
            toast.current?.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message || 'Şifre değiştirme işleminde hata oluştu.',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const passwordHeader = <div className="font-bold mb-3">Şifre Gereksinimleri</div>;
    const passwordFooter = (
        <>
            <Divider />
            <p className="mt-2">Şifre kuralları:</p>
            <ul className="pl-2 ml-2 mt-0 line-height-3">
                <li>En az 6 karakter</li>
                <li>Büyük ve küçük harf</li>
                <li>En az bir sayı</li>
                <li>Özel karakter önerilir</li>
            </ul>
        </>
    );

    const dialogFooter = (
        <div>
            {!isFirstLogin && (
                <Button
                    label="İptal"
                    icon="pi pi-times"
                    onClick={onHide}
                    className="p-button-text"
                    disabled={loading}
                />
            )}
            <Button
                label={loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                icon={loading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                onClick={handleSubmit}
                disabled={loading}
                className="p-button-primary"
            />
        </div>
    );

    return (
        <>
            <Toast ref={toast} />
            <Dialog
                visible={visible}
                style={{ width: '450px' }}
                header={isFirstLogin ? 'İlk Giriş - Şifrenizi Değiştirin' : 'Şifre Değiştir'}
                modal
                footer={dialogFooter}
                onHide={!isFirstLogin ? onHide : undefined}
                closable={!isFirstLogin}
                className="p-fluid"
            >
                {isFirstLogin && (
                    <div className="p-field">
                        <Message
                            severity="info"
                            text="Bu ilk girişiniz. Güvenliğiniz için lütfen şifrenizi değiştirin."
                            className="mb-4"
                        />
                    </div>
                )}

                <div className="p-field">
                    <label htmlFor="currentPassword">
                        {isFirstLogin ? 'Mevcut Şifreniz (TC Kimlik Son 4 Hane)' : 'Mevcut Şifre'}
                    </label>
                    <Password
                        id="currentPassword"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder={isFirstLogin ? "TC kimliğinizin son 4 hanesi" : "Mevcut şifrenizi girin"}
                        className={submitted && !currentPassword ? 'p-invalid' : ''}
                        feedback={false}
                        toggleMask
                    />
                    {submitted && !currentPassword && (
                        <small className="p-error">Mevcut şifre gereklidir.</small>
                    )}
                </div>

                <div className="p-field">
                    <label htmlFor="newPassword">Yeni Şifre</label>
                    <Password
                        id="newPassword"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={submitted && !newPassword ? 'p-invalid' : ''}
                        header={passwordHeader}
                        footer={passwordFooter}
                        promptLabel="Şifre girin"
                        weakLabel="Zayıf"
                        mediumLabel="Orta"
                        strongLabel="Güçlü"
                        toggleMask
                    />
                    {submitted && !newPassword && (
                        <small className="p-error">Yeni şifre gereklidir.</small>
                    )}
                </div>

                <div className="p-field">
                    <label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</label>
                    <Password
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={submitted && (!confirmPassword || newPassword !== confirmPassword) ? 'p-invalid' : ''}
                        feedback={false}
                        toggleMask
                        placeholder="Yeni şifrenizi tekrar girin"
                    />
                    {submitted && !confirmPassword && (
                        <small className="p-error">Şifre tekrarı gereklidir.</small>
                    )}
                    {submitted && confirmPassword && newPassword !== confirmPassword && (
                        <small className="p-error">Şifreler eşleşmiyor.</small>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default ChangePassword;