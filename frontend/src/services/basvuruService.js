import ApiService from './api';

class BasvuruService {
    async getAll() {
        return await ApiService.get('/Basvuru');
    }

    async getAktif() {
        return await ApiService.get('/Basvuru/aktif');
    }

    async getById(id) {
        return await ApiService.get(`/Basvuru/${id}`);
    }

    async create(basvuruData) {
        return await ApiService.post('/Basvuru', basvuruData);
    }

    async update(id, basvuruData) {
        return await ApiService.put(`/Basvuru/${id}`, basvuruData);
    }

    async updateDurum(id, durumData) {
        return await ApiService.put(`/Basvuru/${id}/durum`, durumData);
    }

    async puanVer(id, puanData) {
        return await ApiService.put(`/Basvuru/${id}/puan`, puanData);
    }

    async delete(id) {
        return await ApiService.delete(`/Basvuru/${id}`);
    }

    async getIstatistikler(filters = {}) {
        const params = new URLSearchParams();

        if (filters.baslangicTarihi) {
            params.append('baslangicTarihi', filters.baslangicTarihi.toISOString());
        }
        if (filters.bitisTarihi) {
            params.append('bitisTarihi', filters.bitisTarihi.toISOString());
        }
        if (filters.departmanId) {
            params.append('departmanId', filters.departmanId);
        }
        if (filters.pozisyonId) {
            params.append('pozisyonId', filters.pozisyonId);
        }

        const url = `/Basvuru/istatistik${params.toString() ? `?${params.toString()}` : ''}`;
        return await ApiService.get(url);
    }

    async exportIstatistikler(filters = {}, format = 'excel') {
        // Bu method daha sonra implement edilebilir
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: `${format.toUpperCase()} export işlemi başlatıldı` });
            }, 1000);
        });
    }

    getDurumListesi() {
        return [
            { value: 'YeniBasvuru', label: 'Yeni Başvuru' },
            { value: 'Degerlendiriliyor', label: 'Değerlendiriliyor' },
            { value: 'MulakatBekleniyor', label: 'Mülakat Bekliyor' },
            { value: 'MulakatTamamlandi', label: 'Mülakat Tamamlandı' },
            { value: 'TeklifVerildi', label: 'Teklif Verildi' },
            { value: 'IseAlindi', label: 'İşe Alındı' },
            { value: 'Reddedildi', label: 'Reddedildi' },
            { value: 'AdayVazgecti', label: 'Aday Vazgeçti' }
        ];
    }

    getDurumAdi(durum) {
        switch (durum) {
            case 1:
            case 'YeniBasvuru':
                return 'Yeni Başvuru';
            case 2:
            case 'Degerlendiriliyor':
                return 'Değerlendiriliyor';
            case 3:
            case 'MulakatBekleniyor':
                return 'Mülakat Bekleniyor';
            case 4:
            case 'MulakatTamamlandi':
                return 'Mülakat Tamamlandı';
            case 5:
            case 'TeklifVerildi':
                return 'Teklif Verildi';
            case 6:
            case 'IseAlindi':
                return 'İşe Alındı';
            case 7:
            case 'Reddedildi':
                return 'Reddedildi';
            case 8:
            case 'AdayVazgecti':
                return 'Aday Vazgeçti';
            default:
                return 'Bilinmiyor';
        }
    }

    getDurumSeviyesi(durum) {
        switch (durum) {
            case 1:
            case 'YeniBasvuru':
                return 'info';
            case 2:
            case 'Degerlendiriliyor':
                return 'warning';
            case 3:
            case 'MulakatBekleniyor':
                return 'warning';
            case 4:
            case 'MulakatTamamlandi':
                return 'success';
            case 5:
            case 'TeklifVerildi':
                return 'success';
            case 6:
            case 'IseAlindi':
                return 'success';
            case 7:
            case 'Reddedildi':
                return 'danger';
            case 8:
            case 'AdayVazgecti':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('tr-TR');
    }

    formatDateTime(date) {
        if (!date) return '-';
        return new Date(date).toLocaleString('tr-TR');
    }

    // Additional methods needed by BasvuruYonetimi component
    async getAktifIsIlanlari() {
        // This should call the is-ilanlari service for active job postings
        return await ApiService.get('/IsIlani/Aktif');
    }

    async getAktifAdaylar() {
        // This should call the aday service for active candidates
        return await ApiService.get('/Aday/Aktif');
    }

    getPuanColor(puan) {
        if (!puan) return '#6c757d';
        if (puan >= 80) return '#28a745';
        if (puan >= 60) return '#ffc107';
        if (puan >= 40) return '#fd7e14';
        return '#dc3545';
    }

    formatCurrency(amount) {
        if (!amount) return '-';
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount);
    }
}

export default new BasvuruService();