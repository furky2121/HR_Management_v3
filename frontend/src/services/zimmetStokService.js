import apiService from './api';

class ZimmetStokService {
    async getAll() {
        return apiService.get('/zimmetstok');
    }

    async getOnayBekleyenler() {
        return apiService.get('/zimmetstok/OnayBekleyenler');
    }

    async getOnaylananStoklar() {
        return apiService.get('/zimmetstok/OnaylananStoklar');
    }

    async getById(id) {
        return apiService.get(`/zimmetstok/${id}`);
    }

    async create(stokData) {
        return apiService.post('/zimmetstok', stokData);
    }

    async update(id, stokData) {
        return apiService.put(`/zimmetstok/${id}`, stokData);
    }

    async onayla(id, onayData) {
        return apiService.post(`/zimmetstok/${id}/Onayla`, onayData);
    }

    async reddet(id, redData) {
        return apiService.post(`/zimmetstok/${id}/Reddet`, redData);
    }

    async toggleAktiflik(id) {
        return apiService.post(`/zimmetstok/${id}/ToggleAktiflik`);
    }

    async delete(id) {
        return apiService.delete(`/zimmetstok/${id}`);
    }

    async consumeStock(stockConsumptions) {
        return apiService.post('/zimmetstok/ConsumeStock', { stockConsumptions });
    }

    async uploadFiles(id, files) {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        
        return apiService.postFormData(`/zimmetstok/${id}/UploadFiles`, formData);
    }

    async getFiles(id) {
        return apiService.get(`/zimmetstok/${id}/Files`);
    }

    async deleteFile(dosyaId) {
        return apiService.delete(`/zimmetstok/Files/${dosyaId}`);
    }
}

export default new ZimmetStokService();