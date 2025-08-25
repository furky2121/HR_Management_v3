import ApiService from './api';

class AuthService {
    async login(kullaniciAdi, sifre) {
        console.log('🔑 AuthService.login called:', { kullaniciAdi, sifre });
        try {
            const result = await ApiService.post('/auth/login', {
                kullaniciAdi,
                sifre
            });
            console.log('✅ AuthService.login success:', result);
            return result;
        } catch (error) {
            console.error('❌ AuthService.login error:', error);
            throw error;
        }
    }

    async changePassword(kullaniciId, mevcutSifre, yeniSifre) {
        return ApiService.post('/auth/change-password', {
            kullaniciId,
            mevcutSifre,
            yeniSifre
        });
    }

    async firstLoginChangePassword(kullaniciAdi, mevcutSifre, yeniSifre) {
        return ApiService.post('/auth/first-login-change-password', {
            kullaniciAdi,
            mevcutSifre,
            yeniSifre
        });
    }

    async forgotPassword(kullaniciAdi) {
        return ApiService.post('/auth/forgot-password', {
            kullaniciAdi
        });
    }

    // Token yönetimi
    setToken(token) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('token', token);
        }
    }

    getToken() {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('token');
        }
        return null;
    }

    removeToken() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }

    // Kullanıcı bilgileri
    setUser(user) {
        if (typeof window !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    getUser() {
        if (typeof window !== 'undefined') {
            const user = localStorage.getItem('user');
            const parsedUser = user ? JSON.parse(user) : null;
            console.log('AuthService - getUser returning:', parsedUser);
            if (parsedUser) {
                console.log('AuthService - User has personel?', !!parsedUser.personel);
                console.log('AuthService - personel fotografUrl:', parsedUser.personel?.fotografUrl);
            }
            return parsedUser;
        }
        return null;
    }

    // Login durumu kontrolü
    isLoggedIn() {
        return !!this.getToken();
    }

    // Çıkış
    logout() {
        this.removeToken();
        window.location.href = '/login';
    }

    // LocalStorage temizleme (debug amaçlı)
    clearAllCache() {
        localStorage.clear();
        sessionStorage.clear();
        console.log('Tüm cache temizlendi');
    }

    // Token geçerlilik kontrolü
    isTokenValid() {
        const token = this.getToken();
        if (!token) return false;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch (error) {
            return false;
        }
    }
}

export default new AuthService();