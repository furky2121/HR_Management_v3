import ApiService from './api';

class IseAlimSureciService {
    async getDashboard() {
        return ApiService.get('/IseAlimSureci/dashboard');
    }

    async getIstatistikler() {
        return ApiService.get('/IseAlimSureci/istatistikler');
    }

    async getAktifSurecler() {
        return ApiService.get('/IseAlimSureci/surecler');
    }
}

export default new IseAlimSureciService();