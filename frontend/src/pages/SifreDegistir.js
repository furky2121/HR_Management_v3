import React, { useState, useRef, useEffect } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Password } from 'primereact/password';
import { Divider } from 'primereact/divider';
import { Message } from 'primereact/message';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';

const SifreDegistir = ({ isFirstLogin = false, kullaniciAdi = '' }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        mevcutSifre: '',
        yeniSifre: '',
        yeniSifreTekrar: ''
    });
    const toast = useRef(null);
    const router = useRouter();

    const sifreKurallari = [
        'En az 8 karakter olmalıdır',
        'En az 1 büyük harf içermelidir (A-Z)',
        'En az 1 küçük harf içermelidir (a-z)', 
        'En az 1 rakam içermelidir (0-9)',
        'En az 1 özel karakter içermelidir (!@#$%^&*)',
        'Mevcut şifre ile aynı olamaz'
    ];

    const validatePassword = (password) => {
        const errors = [];
        
        if (password.length < 8) {
            errors.push('Şifre en az 8 karakter olmalıdır');
        }
        
        if (!/[A-Z]/.test(password)) {
            errors.push('En az 1 büyük harf içermelidir');
        }
        
        if (!/[a-z]/.test(password)) {
            errors.push('En az 1 küçük harf içermelidir');
        }
        
        if (!/[0-9]/.test(password)) {
            errors.push('En az 1 rakam içermelidir');
        }
        
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('En az 1 özel karakter içermelidir');
        }
        
        return errors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Validation
            if (!formData.mevcutSifre || !formData.yeniSifre || !formData.yeniSifreTekrar) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Tüm alanları doldurunuz',
                    life: 3000
                });
                return;
            }

            if (formData.yeniSifre !== formData.yeniSifreTekrar) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Hata',
                    detail: 'Yeni şifreler eşleşmiyor',
                    life: 3000
                });
                return;
            }

            // Password validation
            const passwordErrors = validatePassword(formData.yeniSifre);
            if (passwordErrors.length > 0) {
                toast.current.show({
                    severity: 'error',
                    summary: 'Şifre Kuralları',
                    detail: passwordErrors.join(', '),
                    life: 5000
                });
                return;
            }

            let response;
            if (isFirstLogin) {
                response = await authService.firstLoginChangePassword(
                    kullaniciAdi,
                    formData.mevcutSifre,
                    formData.yeniSifre
                );
            } else {
                const user = authService.getUser();
                response = await authService.changePassword(
                    user.id,
                    formData.mevcutSifre,
                    formData.yeniSifre
                );
            }

            if (response.success) {
                toast.current.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: response.message,
                    life: 3000
                });

                setTimeout(() => {
                    if (isFirstLogin) {
                        router.push('/auth/login');
                    } else {
                        router.push('/');
                    }
                }, 2000);
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message || 'Şifre değiştirilemedi',
                life: 3000
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e, field) => {
        setFormData({
            ...formData,
            [field]: e.target.value
        });
    };

    const passwordHeader = <div className="font-bold mb-3">Güçlü Şifre Seçin</div>;
    const passwordFooter = (
        <div className="mt-2">
            <Divider />
            <p className="text-sm text-gray-600 mb-2 font-semibold">Şifre Kuralları:</p>
            <ul className="text-xs text-gray-500 list-disc list-inside">
                {sifreKurallari.map((kural, index) => (
                    <li key={index} className="mb-1">{kural}</li>
                ))}
            </ul>
        </div>
    );

    const containerStyle = isFirstLogin ? 
        "flex align-items-center justify-content-center min-h-screen px-3 surface-50" :
        "flex align-items-center justify-content-center min-h-screen px-3";

    const cardStyle = isFirstLogin ?
        "w-full max-w-30rem shadow-4 border-round-2xl p-6" :
        "w-full max-w-md";

    return (
        <div className={containerStyle}>
            <Toast ref={toast} />
            
            {isFirstLogin && (
                <div className="fixed inset-0 bg-gradient-to-br from-primary-500 via-blue-600 to-purple-700 opacity-10 pointer-events-none"></div>
            )}
            
            <Card 
                className={cardStyle}
                style={isFirstLogin ? {
                    background: 'linear-gradient(135deg, var(--surface-0) 0%, var(--surface-50) 100%)',
                    border: '1px solid var(--primary-100)'
                } : {}}
            >
                {isFirstLogin && (
                    <div className="text-center mb-6">
                        <div className="inline-flex align-items-center justify-content-center bg-primary-100 border-round-2xl mb-4" 
                             style={{ width: '4rem', height: '4rem' }}>
                            <i className="pi pi-shield text-primary-500 text-3xl"></i>
                        </div>
                        <h2 className="text-2xl font-bold text-900 mb-2">Güvenlik Kontrolü</h2>
                        <p className="text-600 line-height-3 mb-4">
                            Hesabınızın güvenliği için şifrenizi değiştirmeniz gerekmektedir
                        </p>
                    </div>
                )}
                
                {!isFirstLogin && (
                    <div className="text-center mb-4">
                        <h2 className="text-2xl font-bold text-900 mb-2">Şifre Değiştir</h2>
                    </div>
                )}
                
                {isFirstLogin && (
                    <Message 
                        severity="info" 
                        text="İlk giriş yapıyorsunuz. Lütfen güçlü bir şifre belirleyin."
                        className="mb-4"
                    />
                )}

                <form onSubmit={handleSubmit} className="p-fluid">
                    <div className="field mb-4">
                        <label htmlFor="mevcutSifre" className="block text-900 font-semibold mb-3">
                            {isFirstLogin ? 'Geçici Şifre (TC Kimlik Son 4 Hane)' : 'Mevcut Şifre'}
                        </label>
                        <Password
                            id="mevcutSifre"
                            value={formData.mevcutSifre}
                            onChange={(e) => handleInputChange(e, 'mevcutSifre')}
                            placeholder={isFirstLogin ? 'TC Kimlik son 4 hane' : 'Mevcut şifreniz'}
                            className="w-full"
                            inputClassName="p-3 border-round-lg"
                            feedback={false}
                            toggleMask
                        />
                    </div>

                    <div className="field mb-4">
                        <label htmlFor="yeniSifre" className="block text-900 font-semibold mb-3">
                            Yeni Şifre
                        </label>
                        <Password
                            id="yeniSifre"
                            value={formData.yeniSifre}
                            onChange={(e) => handleInputChange(e, 'yeniSifre')}
                            placeholder="Güçlü bir şifre belirleyin"
                            className="w-full"
                            inputClassName="p-3 border-round-lg"
                            header={passwordHeader}
                            footer={isFirstLogin ? passwordFooter : null}
                            toggleMask
                            promptLabel="Şifre girin"
                            weakLabel="Zayıf"
                            mediumLabel="Orta"
                            strongLabel="Güçlü"
                        />
                    </div>

                    <div className="field mb-5">
                        <label htmlFor="yeniSifreTekrar" className="block text-900 font-semibold mb-3">
                            Yeni Şifre Tekrar
                        </label>
                        <Password
                            id="yeniSifreTekrar"
                            value={formData.yeniSifreTekrar}
                            onChange={(e) => handleInputChange(e, 'yeniSifreTekrar')}
                            placeholder="Şifrenizi tekrar girin"
                            className="w-full"
                            inputClassName="p-3 border-round-lg"
                            feedback={false}
                            toggleMask
                        />
                    </div>

                    <Button
                        type="submit"
                        label={isFirstLogin ? "Güvenli Şifre Oluştur" : "Şifre Değiştir"}
                        loading={loading}
                        className="w-full p-3 text-lg font-semibold border-round-lg"
                        style={isFirstLogin ? {
                            background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                            border: 'none'
                        } : {}}
                    />
                </form>

                {!isFirstLogin && (
                    <div className="text-center mt-4">
                        <Button
                            label="Ana Sayfaya Dön"
                            link
                            className="p-0"
                            onClick={() => router.push('/')}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SifreDegistir;