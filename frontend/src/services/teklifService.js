import ApiService from './api';

class TeklifService {
    async getAll() {
        return await ApiService.get('/teklifmektubu');
    }

    async getAktif() {
        return await ApiService.get('/teklifmektubu/aktif');
    }

    async getById(id) {
        return await ApiService.get(`/teklifmektubu/${id}`);
    }

    async create(teklifData) {
        return await ApiService.post('/teklifmektubu', teklifData);
    }

    async update(id, teklifData) {
        return await ApiService.put(`/teklifmektubu/${id}`, teklifData);
    }

    async delete(id) {
        return await ApiService.delete(`/teklifmektubu/${id}`);
    }

    async gonderTeklif(id) {
        return await ApiService.put(`/teklifmektubu/${id}/gonder`, {});
    }

    async adayYanitiGuncelle(id, yanitData) {
        return await ApiService.put(`/teklifmektubu/${id}/aday-yaniti`, yanitData);
    }

    async getBasvuruTeklifi(basvuruId) {
        return await ApiService.get(`/teklifmektubu/basvuru/${basvuruId}`);
    }

    async getIstatistikler() {
        return await ApiService.get('/teklifmektubu/istatistik');
    }

    getDurumSeviyesi(durum) {
        switch (durum) {
            case 'Beklemede':
                return 'warning';
            case 'Gönderildi':
                return 'info';
            case 'Kabul Edildi':
                return 'success';
            case 'Reddedildi':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    getDurumIcon(durum) {
        switch (durum) {
            case 'Beklemede':
                return 'pi pi-clock';
            case 'Gönderildi':
                return 'pi pi-send';
            case 'Kabul Edildi':
                return 'pi pi-check-circle';
            case 'Reddedildi':
                return 'pi pi-times-circle';
            default:
                return 'pi pi-question-circle';
        }
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY',
            minimumFractionDigits: 2
        }).format(amount);
    }

    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR');
    }

    formatDateTime(date) {
        if (!date) return '-';
        return new Date(date).toLocaleString('tr-TR');
    }
}

export default new TeklifService();