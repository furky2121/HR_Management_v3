import api from './api';

class MasrafService {
    
    // Personelin masraf taleplerini getir
    async getMasrafTalepleri(personelId) {
        return await api.get(`/Masraf?personelId=${personelId}`);
    }

    // Onay bekleyen masraf taleplerini getir
    async getOnayBekleyenMasrafTalepleri(yoneticiId) {
        return await api.get(`/Masraf/Onay?yoneticiId=${yoneticiId}`);
    }

    // Masraf talebi detayını getir
    async getMasrafTalebi(id) {
        return await api.get(`/Masraf/${id}`);
    }

    // Masraf limiti getir
    async getMasrafLimit(personelId, masrafTipi) {
        return await api.get(`/Masraf/Limit/${personelId}/${masrafTipi}`);
    }

    // Masraf talebi oluştur
    async createMasrafTalebi(masrafData) {
        return await api.post('/Masraf', masrafData);
    }

    // Masraf talebini güncelle
    async updateMasrafTalebi(id, masrafData) {
        return await api.put(`/Masraf/${id}`, masrafData);
    }

    // Masraf talebini onayla/reddet
    async onaylaMasrafTalebi(id, onayData) {
        return await api.put(`/Masraf/Onayla/${id}`, onayData);
    }

    // Masraf talebini sil
    async deleteMasrafTalebi(id) {
        return await api.delete(`/Masraf/${id}`);
    }

    // Masraf türleri
    getMasrafTurleri() {
        return [
            { value: 1, label: 'Yemek' },
            { value: 2, label: 'Ulaşım' },
            { value: 3, label: 'Konaklama' },
            { value: 4, label: 'Eğitim' },
            { value: 5, label: 'Diğer' }
        ];
    }

    // Masraf türü adını getir
    getMasrafTuruAdi(masrafTipi) {
        const turler = this.getMasrafTurleri();
        const tur = turler.find(t => t.value === masrafTipi);
        return tur ? tur.label : 'Bilinmiyor';
    }

    // Onay durumu badge severity'si
    getOnayDurumuSeverity(onayDurumu) {
        switch (onayDurumu) {
            case 'Beklemede':
                return 'warning';
            case 'Onaylandı':
                return 'success';
            case 'Reddedildi':
                return 'danger';
            default:
                return 'info';
        }
    }

    // Para formatı
    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount || 0);
    }

    // Masraf türü ikonu
    getMasrafTuruIcon(masrafTipi) {
        switch (masrafTipi) {
            case 1: // Yemek
                return 'pi pi-fw pi-shopping-cart';
            case 2: // Ulaşım
                return 'pi pi-fw pi-car';
            case 3: // Konaklama
                return 'pi pi-fw pi-home';
            case 4: // Eğitim
                return 'pi pi-fw pi-book';
            case 5: // Diğer
                return 'pi pi-fw pi-file';
            default:
                return 'pi pi-fw pi-question';
        }
    }

    // Masraf türü rengi
    getMasrafTuruColor(masrafTipi) {
        switch (masrafTipi) {
            case 1: // Yemek
                return '#FF6B6B';
            case 2: // Ulaşım
                return '#4ECDC4';
            case 3: // Konaklama
                return '#45B7D1';
            case 4: // Eğitim
                return '#96CEB4';
            case 5: // Diğer
                return '#FFEAA7';
            default:
                return '#74B9FF';
        }
    }

    // Tarih formatla
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Kısa tarih formatla
    formatDateShort(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('tr-TR');
    }
}

const masrafService = new MasrafService();
export default masrafService;