import ApiService from './api';

class DepartmanService {
    async getAllDepartmanlar() {
        return ApiService.get('/departman');
    }

    async getAktifDepartmanlar() {
        return ApiService.get('/departman/aktif');
    }

    async getDepartmanById(id) {
        return ApiService.get(`/departman/${id}`);
    }

    async createDepartman(departman) {
        return ApiService.post('/departman', departman);
    }

    async updateDepartman(id, departman) {
        return ApiService.put(`/departman/${id}`, departman);
    }

    async deleteDepartman(id) {
        return ApiService.delete(`/departman/${id}`);
    }
}

export default new DepartmanService();