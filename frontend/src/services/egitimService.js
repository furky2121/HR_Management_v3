import ApiService from './api';

class EgitimService {
    // Eğitim CRUD İşlemleri
    async getEgitimler() {
        return ApiService.get('/egitim');
    }

    async getAllEgitimler() {
        return ApiService.get('/egitim');
    }

    async getEgitimById(id) {
        return ApiService.get(`/egitim/${id}`);
    }

    async createEgitim(egitim) {
        return ApiService.post('/egitim', egitim);
    }

    async updateEgitim(id, egitim) {
        return ApiService.put(`/egitim/${id}`, egitim);
    }

    async deleteEgitim(id) {
        return ApiService.delete(`/egitim/${id}`);
    }

    // Personel Eğitimi İşlemleri
    async getPersonelEgitimleri() {
        return ApiService.get('/personelegitimi');
    }

    async getPersonelEgitimiById(id) {
        return ApiService.get(`/personelegitimi/${id}`);
    }

    async createPersonelEgitimi(personelEgitimi) {
        return ApiService.post('/personelegitimi', personelEgitimi);
    }

    async updatePersonelEgitimi(id, personelEgitimi) {
        return ApiService.put(`/personelegitimi/${id}`, personelEgitimi);
    }

    async deletePersonelEgitimi(id) {
        return ApiService.delete(`/personelegitimi/${id}`);
    }

    async personelAta(egitimId, personelIds) {
        return ApiService.post(`/egitim/PersonelAta/${egitimId}`, { personelIds });
    }

    async katilimGuncelle(egitimId, personelId, katilimData) {
        return ApiService.put(`/egitim/KatilimGuncelle/${egitimId}/${personelId}`, katilimData);
    }

    // Raporlama İşlemleri
    async getEgitimRapor(egitimId) {
        return ApiService.get(`/egitim/Rapor/${egitimId}`);
    }

    async getEgitimIstatistikleri(yil, ay) {
        const params = { yil };
        if (ay) params.ay = ay;
        return ApiService.get('/egitim/istatistikler', { params });
    }

    async getPersonelEgitimOzeti(yil) {
        return ApiService.get('/egitim/personel-ozeti', { params: { yil } });
    }

    async getDepartmanBazliEgitimler(yil) {
        return ApiService.get('/egitim/departman-rapor', { params: { yil } });
    }

    // Sertifika İşlemleri
    async getSertifikalar() {
        return ApiService.get('/sertifika');
    }

    async getSertifikaById(id) {
        return ApiService.get(`/sertifika/${id}`);
    }

    async createSertifika(sertifika) {
        return ApiService.post('/sertifika', sertifika);
    }

    async updateSertifika(id, sertifika) {
        return ApiService.put(`/sertifika/${id}`, sertifika);
    }

    async deleteSertifika(id) {
        return ApiService.delete(`/sertifika/${id}`);
    }
}

export default new EgitimService();