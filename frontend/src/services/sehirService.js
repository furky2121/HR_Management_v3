import ApiService from './api.js';

class SehirService {
    constructor() {
        this.baseURL = '/sehir';
    }

    async getAll() {
        return await ApiService.get(this.baseURL);
    }

    async getAktif() {
        return await ApiService.get(`${this.baseURL}/aktif`);
    }

    async getById(id) {
        return await ApiService.get(`${this.baseURL}/${id}`);
    }

    async create(sehir) {
        return await ApiService.post(this.baseURL, sehir);
    }

    async update(id, sehir) {
        return await ApiService.put(`${this.baseURL}/${id}`, sehir);
    }

    async delete(id) {
        return await ApiService.delete(`${this.baseURL}/${id}`);
    }
}

export const sehirService = new SehirService();