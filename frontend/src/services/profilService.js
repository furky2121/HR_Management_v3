import ApiService from './api';

class ProfilService {
    async getKullaniciProfil(kullaniciId) {
        return ApiService.get(`/profil/${kullaniciId}`);
    }

    async getPersonelOzet(kullaniciId) {
        return ApiService.get(`/profil/PersonelOzet/${kullaniciId}`);
    }

    async getIzinDetay(kullaniciId) {
        return ApiService.get(`/profil/IzinDetay/${kullaniciId}`);
    }

    async updateProfil(kullaniciId, profilData) {
        return ApiService.put(`/profil/${kullaniciId}`, profilData);
    }

    async changePassword(kullaniciId, passwordData) {
        return ApiService.post(`/profil/SifreDegistir/${kullaniciId}`, passwordData);
    }

    async updateFotograf(kullaniciId, fotografUrl) {
        return ApiService.put(`/profil/FotografGuncelle/${kullaniciId}`, { fotografUrl });
    }
}

export default new ProfilService();