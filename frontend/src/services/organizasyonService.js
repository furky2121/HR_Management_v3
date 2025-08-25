import ApiService from './api';

class OrganizasyonService {
    async getOrganizasyonSemasi() {
        return ApiService.get('/organizasyon/Sema');
    }
}

export default new OrganizasyonService();