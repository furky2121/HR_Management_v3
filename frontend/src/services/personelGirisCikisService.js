import ApiService from './api';

class PersonelGirisCikisService {
    async getAll() {
        return ApiService.get('/personelgiriscikis');
    }

    async getById(id) {
        return ApiService.get(`/personelgiriscikis/${id}`);
    }

    async create(data) {
        return ApiService.post('/personelgiriscikis', data);
    }

    async update(id, data) {
        return ApiService.put(`/personelgiriscikis/${id}`, data);
    }

    async delete(id) {
        return ApiService.delete(`/personelgiriscikis/${id}`);
    }

    async getDashboardData() {
        return ApiService.get('/personelgiriscikis/dashboard');
    }

    async getByPersonel(personelId, baslangicTarihi = null, bitisTarihi = null) {
        let url = `/personelgiriscikis/bypersonel/${personelId}`;
        const params = [];
        
        if (baslangicTarihi) {
            params.push(`baslangicTarihi=${baslangicTarihi}`);
        }
        
        if (bitisTarihi) {
            params.push(`bitisTarihi=${bitisTarihi}`);
        }
        
        if (params.length > 0) {
            url += `?${params.join('&')}`;
        }
        
        return ApiService.get(url);
    }
}

export default new PersonelGirisCikisService();