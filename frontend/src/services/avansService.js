import ApiService from './api';

class AvansService {
    // Personelin avans taleplerini getir
    async getAvansTalepleri(personelId) {
        const response = await ApiService.get(`/Avans?personelId=${personelId}`);
        return response;
    }

    // Onay bekleyen avans taleplerini getir (yöneticiler için)
    async getOnayBekleyenAvansTalepleri(yoneticiId) {
        const response = await ApiService.get(`/Avans/Onay?yoneticiId=${yoneticiId}`);
        return response;
    }

    // Avans limiti getir
    async getAvansLimit(personelId) {
        const response = await ApiService.get(`/Avans/Limit/${personelId}`);
        return response;
    }

    // Yeni avans talebi oluştur
    async createAvansTalebi(avansData) {
        const response = await ApiService.post('/Avans', avansData);
        return response;
    }

    // Avans talebini güncelle
    async updateAvansTalebi(id, avansData) {
        const response = await ApiService.put(`/Avans/${id}`, avansData);
        return response;
    }

    // Avans talebini sil
    async deleteAvansTalebi(id) {
        const response = await ApiService.delete(`/Avans/${id}`);
        return response;
    }

    // Avans talebini onayla
    async onaylaAvansTalebi(id, onayData) {
        const response = await ApiService.post(`/Avans/Onayla/${id}`, onayData);
        return response;
    }

    // Avans talebini reddet
    async reddetAvansTalebi(id, redData) {
        const response = await ApiService.post(`/Avans/Reddet/${id}`, redData);
        return response;
    }

    // Tarih formatlama yardımcı fonksiyonu
    formatTarih(tarih) {
        if (!tarih) return '';
        const date = new Date(tarih);
        return date.toLocaleDateString('tr-TR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    // Para formatı
    formatPara(tutar) {
        if (!tutar) return '0,00 ₺';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(tutar);
    }
}

const avansService = new AvansService();
export default avansService;