import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Toast } from 'primereact/toast';
import { Checkbox } from 'primereact/checkbox';
import { Divider } from 'primereact/divider';
import { useRouter } from 'next/navigation';
import authService from '../services/authService';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import './Login.css';

const Login = ({ onLogin }) => {
    const [kullaniciAdi, setKullaniciAdi] = useState('');
    const [sifre, setSifre] = useState('');
    const [hatirla, setHatirla] = useState(false);
    const [loading, setLoading] = useState(false);
    const [redirecting, setRedirecting] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const toast = useRef(null);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!kullaniciAdi || !sifre) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: 'Kullanıcı adı ve şifre gereklidir'
            });
            return;
        }

        setLoading(true);

        try {
            // Önceki oturum verilerini temizle
            authService.removeToken();
            
            console.log('=== LOGIN DEBUG ===');
            console.log('Kullanıcı Adı:', kullaniciAdi);
            console.log('Şifre:', sifre);
            console.log('API çağrısı başlatılıyor...');
            
            const response = await authService.login(kullaniciAdi, sifre);
            
            console.log('API Response:', response);
            console.log('Response Data:', response?.data);
            console.log('Response Kullanici:', response?.data?.kullanici);
            
            if (response.success) {
                // Debug login response
                console.log('Login - Full response:', JSON.stringify(response, null, 2));
                console.log('Login - Kullanici data:', JSON.stringify(response.data.kullanici, null, 2));
                console.log('Login - Personel data:', JSON.stringify(response.data.kullanici.personel, null, 2));
                console.log('Login - FotografUrl:', response.data.kullanici.personel?.fotografUrl);
                
                // Token ve kullanıcı bilgilerini kaydet
                authService.setToken(response.data.token);
                authService.setUser(response.data.kullanici);

                toast.current.show({
                    severity: 'success',
                    summary: 'Başarılı',
                    detail: response.message
                });

                // İlk giriş kontrolü
                if (response.data.kullanici.ilkGiris) {
                    toast.current.show({
                        severity: 'info',
                        summary: 'İlk Giriş',
                        detail: 'Güvenlik nedeniyle şifrenizi değiştirmeniz gerekmektedir',
                        life: 3000
                    });
                    
                    setRedirecting(true);
                    setTimeout(() => {
                        router.push(`/ilk-giris-sifre-degistir?kullaniciAdi=${kullaniciAdi}`);
                    }, 2000);
                } else {
                    console.log('Normal giriş, yönlendiriliyor...');
                    console.log('onLogin callback var mı?', !!onLogin);
                    setRedirecting(true);
                    setTimeout(() => {
                        if (onLogin) {
                            console.log('onLogin callback çağırılıyor');
                            onLogin();
                        } else {
                            console.log('router.push("/") çağırılıyor');
                            router.push('/');
                        }
                    }, 1000);
                }
            }
        } catch (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Hata',
                detail: error.message || 'Giriş yapılamadı'
            });
        } finally {
            if (!redirecting) {
                setLoading(false);
            }
        }
    };


    return (
        <div className="login-container">
            <Toast ref={toast} />
            
            <div className="login-wrapper">
                <div className="login-left">
                    <div className="login-branding">
                        <div className="login-logo">
                            <img
                                src="/layout/images/bilge_lojistik.png"
                                alt="BilgeLojistik Logo"
                                style={{
                                    width: '150px',
                                    height: '112px',
                                    objectFit: 'contain',
                                    marginBottom: '1.5rem',
                                    filter: 'brightness(0) invert(1)'
                                }}
                            />
                            <p className="text-white text-xl opacity-90">İnsan Kaynakları Yönetim Sistemi</p>
                        </div>
                        
                        <div className="login-features mt-6">
                            <div className="feature-item">
                                <i className="pi pi-users text-2xl mr-3"></i>
                                <span>İşe Alım & İK Süreçleri</span>
                            </div>
                            <div className="feature-item">
                                <i className="pi pi-video text-2xl mr-3"></i>
                                <span>Video Eğitim Sistemi</span>
                            </div>
                            <div className="feature-item">
                                <i className="pi pi-credit-card text-2xl mr-3"></i>
                                <span>Avans & Masraf Yönetimi</span>
                            </div>
                            <div className="feature-item">
                                <i className="pi pi-briefcase text-2xl mr-3"></i>
                                <span>Zimmet & Varlık Takibi</span>
                            </div>
                            <div className="feature-item">
                                <i className="pi pi-clock text-2xl mr-3"></i>
                                <span>Mesai & İzin Takibi</span>
                            </div>
                            <div className="feature-item">
                                <i className="pi pi-chart-line text-2xl mr-3"></i>
                                <span>Dashboard & Analitik</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="login-right">
                    <Card className="login-card">
                        <div className="login-header text-center mb-4">
                            <h2 className="text-3xl font-bold text-900 mb-2">Hoş Geldiniz</h2>
                            <p className="text-600">Hesabınıza giriş yapın</p>
                        </div>

                        <form onSubmit={handleLogin} className="p-fluid">
                            <div className="field mb-4">
                                <label htmlFor="kullaniciAdi" className="block text-900 font-medium mb-2">
                                    Kullanıcı Adı veya Sicil No
                                </label>
                                <InputText 
                                    id="kullaniciAdi"
                                    value={kullaniciAdi}
                                    onChange={(e) => setKullaniciAdi(e.target.value)}
                                    placeholder="Kullanıcı adınızı veya Sicil Numaranızı girin"
                                    className="w-full"
                                    required
                                />
                            </div>

                            <div className="field mb-4">
                                <label htmlFor="sifre" className="block text-900 font-medium mb-2">
                                    Şifre
                                </label>
                                <Password 
                                    id="sifre"
                                    value={sifre}
                                    onChange={(e) => setSifre(e.target.value)}
                                    placeholder="Şifrenizi girin"
                                    feedback={false}
                                    className="w-full"
                                    inputClassName="w-full"
                                    required
                                />
                            </div>

                            <div className="field-checkbox mb-4">
                                <Checkbox 
                                    inputId="hatirla"
                                    checked={hatirla}
                                    onChange={(e) => setHatirla(e.checked)}
                                />
                                <label htmlFor="hatirla" className="ml-2">Beni Hatırla</label>
                            </div>

                            <div className="flex justify-content-end align-items-center mb-4">
                                <a 
                                    className="font-medium no-underline cursor-pointer text-primary-500 hover:text-primary-600 transition-colors text-sm"
                                    onClick={() => setShowForgotPassword(true)}
                                >
                                    Şifremi Unuttum?
                                </a>
                            </div>

                            <Button 
                                type="submit"
                                label={redirecting ? "Yönlendiriliyor..." : "Giriş Yap"}
                                loading={loading || redirecting}
                                className="w-full p-3 text-xl"
                                disabled={redirecting}
                            />
                        </form>
                    </Card>
                </div>
            </div>
            
            <ForgotPasswordModal
                visible={showForgotPassword}
                onHide={() => setShowForgotPassword(false)}
            />

            {/* Login Footer */}
            <div className="login-footer">
                <div className="footer-content">
                    <span>
                        © {new Date().getFullYear()}, All rights reserved.
                    </span>
                    <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>|</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>Powered by</span>
                        <img
                            src="/lionsoft.png"
                            alt="Lionsoft Technology"
                            height="24"
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;