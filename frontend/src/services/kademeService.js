import ApiService from './api';

class KademeService {
    async getAllKademeler() {
        return ApiService.get('/kademe');
    }

    async getAktifKademeler() {
        return ApiService.get('/kademe/aktif');
    }

    async getKademeById(id) {
        return ApiService.get(`/kademe/${id}`);
    }

    async createKademe(kademe) {
        return ApiService.post('/kademe', kademe);
    }

    async updateKademe(id, kademe) {
        return ApiService.put(`/kademe/${id}`, kademe);
    }

    async deleteKademe(id) {
        return ApiService.delete(`/kademe/${id}`);
    }
}

export default new KademeService();