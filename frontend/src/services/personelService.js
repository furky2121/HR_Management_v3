import ApiService from './api';

class PersonelService {
    async getAllPersoneller() {
        return ApiService.get('/personel');
    }

    async getAktif() {
        return ApiService.get('/personel/AktifListesi');
    }

    async getPersonellerAktif() {
        return ApiService.get('/personel/Aktif');
    }

    async getPersonelById(id) {
        return ApiService.get(`/personel/${id}`);
    }

    async getYoneticiler() {
        return ApiService.get('/personel/yoneticiler');
    }

    async getMaasKontroluBilgi(pozisyonId) {
        return ApiService.get(`/personel/MaasKontrolu/${pozisyonId}`);
    }

    async createPersonel(personel) {
        return ApiService.post('/personel', personel);
    }

    async updatePersonel(id, personel) {
        return ApiService.put(`/personel/${id}`, personel);
    }

    async deletePersonel(id) {
        return ApiService.delete(`/personel/${id}`);
    }
}

export default new PersonelService();