import apiService from './api';

class PersonelZimmetService {
    async getAll() {
        return apiService.get('/personelzimmet');
    }

    async getByPersonelId(personelId) {
        return apiService.get(`/personelzimmet/Personel/${personelId}`);
    }

    async getById(id) {
        return apiService.get(`/personelzimmet/${id}`);
    }

    async getZimmetFormu(id) {
        return apiService.get(`/personelzimmet/${id}/ZimmetFormu`);
    }

    async create(zimmetData) {
        return apiService.post('/personelzimmet/Create', zimmetData);
    }

    async createBulk(zimmetData) {
        return apiService.post('/personelzimmet/Bulk', zimmetData);
    }

    async update(id, zimmetData) {
        return apiService.put(`/personelzimmet/${id}`, zimmetData);
    }

    async iadeEt(id, iadeData) {
        return apiService.post(`/personelzimmet/${id}/IadeEt`, iadeData);
    }

    async toggleAktiflik(id) {
        return apiService.post(`/personelzimmet/${id}/ToggleAktiflik`);
    }

    async delete(id) {
        return apiService.delete(`/personelzimmet/${id}`);
    }
}

export default new PersonelZimmetService();