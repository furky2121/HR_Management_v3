import ApiService from './api';

class PozisyonService {
    async getAllPozisyonlar() {
        return ApiService.get('/pozisyon');
    }

    async getAktifPozisyonlar() {
        return ApiService.get('/pozisyon/aktif');
    }

    async getPozisyonlarAktif() {
        return ApiService.get('/pozisyon/Aktif');
    }

    async getPozisyonById(id) {
        return ApiService.get(`/pozisyon/${id}`);
    }

    async getPozisyonlarByDepartman(departmanId) {
        return ApiService.get(`/pozisyon/ByDepartman/${departmanId}`);
    }

    async getPozisyonMaasBilgi(pozisyonId) {
        return ApiService.get(`/pozisyon/MaasBilgi/${pozisyonId}`);
    }

    async createPozisyon(pozisyon) {
        return ApiService.post('/pozisyon', pozisyon);
    }

    async updatePozisyon(id, pozisyon) {
        return ApiService.put(`/pozisyon/${id}`, pozisyon);
    }

    async deletePozisyon(id) {
        return ApiService.delete(`/pozisyon/${id}`);
    }
}

export default new PozisyonService();