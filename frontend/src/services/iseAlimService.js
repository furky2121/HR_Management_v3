import api from './api';

class IseAlimService {

    // İş İlanları
    async getIsIlanlari() {
        return await api.get('/IsIlani');
    }

    async getAktifIsIlanlari() {
        return await api.get('/IsIlani/Aktif');
    }

    async getIsIlani(id) {
        return await api.get(`/IsIlani/${id}`);
    }

    async createIsIlani(ilanData) {
        return await api.post('/IsIlani', ilanData);
    }

    async updateIsIlani(id, ilanData) {
        return await api.put(`/IsIlani/${id}`, ilanData);
    }

    async deleteIsIlani(id) {
        return await api.delete(`/IsIlani/${id}`);
    }

    async yayinlaIsIlani(id) {
        return await api.put(`/IsIlani/${id}/yayin`);
    }

    async kapatIsIlani(id) {
        return await api.put(`/IsIlani/${id}/kapat`);
    }

    // İlan Kategorileri
    async getIlanKategorileri() {
        return await api.get('/IlanKategori');
    }

    async getAktifIlanKategorileri() {
        return await api.get('/IlanKategori/Aktif');
    }

    async getIlanKategori(id) {
        return await api.get(`/IlanKategori/${id}`);
    }

    async createIlanKategori(kategoriData) {
        return await api.post('/IlanKategori', kategoriData);
    }

    async updateIlanKategori(id, kategoriData) {
        return await api.put(`/IlanKategori/${id}`, kategoriData);
    }

    async deleteIlanKategori(id) {
        return await api.delete(`/IlanKategori/${id}`);
    }

    // Adaylar
    async getAdaylar() {
        return await api.get('/Aday');
    }

    async getAktifAdaylar() {
        return await api.get('/Aday/Aktif');
    }

    async getAday(id) {
        return await api.get(`/Aday/${id}`);
    }

    async createAday(adayData) {
        return await api.post('/Aday', adayData);
    }

    async updateAday(id, adayData) {
        return await api.put(`/Aday/${id}`, adayData);
    }

    async deleteAday(id) {
        return await api.delete(`/Aday/${id}`);
    }

    async karaListeyeEkle(id) {
        return await api.put(`/Aday/${id}/kara-liste`);
    }

    async karaListedenCikar(id) {
        return await api.delete(`/Aday/${id}/kara-liste`);
    }

    async adayArama(params) {
        const queryString = new URLSearchParams(params).toString();
        return await api.get(`/Aday/arama?${queryString}`);
    }

    // Başvurular
    async getBasvurular() {
        return await api.get('/Basvuru');
    }

    async getIlanBasvurulari(ilanId) {
        return await api.get(`/Basvuru/ilan/${ilanId}`);
    }

    async getBasvuru(id) {
        return await api.get(`/Basvuru/${id}`);
    }

    async createBasvuru(basvuruData) {
        return await api.post('/Basvuru', basvuruData);
    }

    async updateBasvuru(id, basvuruData) {
        return await api.put(`/Basvuru/${id}`, basvuruData);
    }

    async updateBasvuruDurum(id, durumData) {
        return await api.put(`/Basvuru/${id}/durum`, durumData);
    }

    async basvuruPuanVer(id, puanData) {
        return await api.put(`/Basvuru/${id}/puan`, puanData);
    }

    async deleteBasvuru(id) {
        return await api.delete(`/Basvuru/${id}`);
    }

    async getBasvuruIstatistikleri() {
        return await api.get('/Basvuru/istatistik');
    }

    // Utility methods
    getIlanDurumlari() {
        return [
            { value: 'Taslak', label: 'Taslak' },
            { value: 'Aktif', label: 'Aktif' },
            { value: 'Kapali', label: 'Kapalı' },
            { value: 'Arsivlendi', label: 'Arşivlendi' }
        ];
    }

    getBasvuruDurumlari() {
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

    getCalismaSekilleri() {
        return [
            { value: 'Tam Zamanlı', label: 'Tam Zamanlı' },
            { value: 'Yarı Zamanlı', label: 'Yarı Zamanlı' },
            { value: 'Uzaktan', label: 'Uzaktan Çalışma' },
            { value: 'Hibrit', label: 'Hibrit' },
            { value: 'Proje Bazlı', label: 'Proje Bazlı' }
        ];
    }

    getEgitimSeviyeleri() {
        return [
            { value: 'Lise', label: 'Lise' },
            { value: 'Ön Lisans', label: 'Ön Lisans' },
            { value: 'Lisans', label: 'Lisans' },
            { value: 'Yüksek Lisans', label: 'Yüksek Lisans' },
            { value: 'Doktora', label: 'Doktora' }
        ];
    }

    getCinsiyetler() {
        return [
            { value: 'Erkek', label: 'Erkek' },
            { value: 'Kadın', label: 'Kadın' }
        ];
    }

    getMedeniDurumlar() {
        return [
            { value: 'Bekar', label: 'Bekar' },
            { value: 'Evli', label: 'Evli' }
        ];
    }

    getAskerlikDurumlari() {
        return [
            { value: 'Yapıldı', label: 'Yapıldı' },
            { value: 'Tecilli', label: 'Tecilli' },
            { value: 'Muaf', label: 'Muaf' },
            { value: 'Yapılmadı', label: 'Yapılmadı' }
        ];
    }

    // Para formatı
    formatCurrency(amount) {
        return new Intl.NumberFormat('tr-TR', {
            style: 'currency',
            currency: 'TRY'
        }).format(amount || 0);
    }

    // Tarih formatla
    formatDate(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // Kısa tarih formatla
    formatDateShort(date) {
        if (!date) return '';
        return new Date(date).toLocaleDateString('tr-TR');
    }

    // Durum badge severity
    getIlanDurumSeverity(durum) {
        switch (durum) {
            case 'Taslak':
                return 'secondary';
            case 'Aktif':
                return 'success';
            case 'Kapali':
                return 'warning';
            case 'Arsivlendi':
                return 'info';
            default:
                return 'info';
        }
    }

    getBasvuruDurumSeverity(durum) {
        switch (durum) {
            case 'YeniBasvuru':
                return 'info';
            case 'Degerlendiriliyor':
                return 'warning';
            case 'MulakatBekleniyor':
                return 'help';
            case 'MulakatTamamlandi':
                return 'secondary';
            case 'TeklifVerildi':
                return 'contrast';
            case 'IseAlindi':
                return 'success';
            case 'Reddedildi':
                return 'danger';
            case 'AdayVazgecti':
                return 'secondary';
            default:
                return 'info';
        }
    }

    // Puan rengi
    getPuanColor(puan) {
        if (puan >= 80) return '#22c55e'; // yeşil
        if (puan >= 60) return '#eab308'; // sarı
        if (puan >= 40) return '#f97316'; // turuncu
        return '#ef4444'; // kırmızı
    }

    // Deneyim formatla (toplam ay cinsinden)
    formatDeneyim(toplamAy) {
        if (toplamAy === 0) return 'Yeni mezun';

        const yil = Math.floor(toplamAy / 12);
        const ay = toplamAy % 12;

        if (yil === 0) {
            return `${ay} Ay`;
        } else if (ay === 0) {
            return yil === 1 ? '1 Yıl' : `${yil} Yıl`;
        } else {
            return `${yil} Yıl, ${ay} Ay`;
        }
    }

    // Mülakatlar
    async getMulakatlar() {
        return await api.get('/Mulakat');
    }

    async getMulakat(id) {
        return await api.get(`/Mulakat/${id}`);
    }

    async createMulakat(mulakatData) {
        return await api.post('/Mulakat', mulakatData);
    }

    async updateMulakat(id, mulakatData) {
        return await api.put(`/Mulakat/${id}`, mulakatData);
    }

    async deleteMulakat(id) {
        return await api.delete(`/Mulakat/${id}`);
    }

    async tamamlaMulakat(id, sonucData) {
        return await api.put(`/Mulakat/${id}/tamamla`, sonucData);
    }

    // CV İşlemleri
    async otomatikCVOlustur(adayId) {
        return await api.post(`/Aday/${adayId}/otomatik-cv-olustur`);
    }

    async cvYukle(adayId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await api.post(`/Aday/${adayId}/cv-yukle`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    }

    async getCVListesi(adayId) {
        return await api.get(`/Aday/${adayId}/cv-listesi`);
    }

    async getCVGoruntule(adayId, cvTipi = 'Otomatik') {
        return await api.get(`/Aday/${adayId}/cv-goruntule`, {
            params: { cvTipi }
        });
    }

    async cvSil(cvId) {
        return await api.delete(`/Aday/cv/${cvId}`);
    }

    async fotografYukle(adayId, file) {
        const formData = new FormData();
        formData.append('file', file);
        // Content-Type'ı manuel olarak ayarlama - FormData otomatik olarak ayarlar
        return await api.post(`/Aday/${adayId}/fotograf-yukle`, formData);
    }

    // Fotoğraf URL'i için yardımcı metod
    getImageUrl(imagePath) {
        if (!imagePath) return null;
        // File base URL kullan (Next.js config'den)
        const fileBaseUrl = process.env.NEXT_PUBLIC_FILE_BASE_URL || 'http://localhost:5000';
        return `${fileBaseUrl}/${imagePath}`;
    }

    // Aday durum yönetimi
    async adayDurumDegistir(adayId, durumData) {
        return await api.post(`/Aday/${adayId}/durum-degistir`, durumData);
    }

    async getAdayDurumGecmisi(adayId) {
        return await api.get(`/Aday/${adayId}/durum-gecmisi`);
    }

    // Aday durum seçenekleri
    getAdayDurumlari() {
        return [
            { value: 1, label: 'CV Havuzunda' },
            { value: 2, label: 'Başvuru Yapıldı' },
            { value: 3, label: 'CV İnceleniyor' },
            { value: 4, label: 'Mülakat Planlandı' },
            { value: 5, label: 'Mülakat Tamamlandı' },
            { value: 6, label: 'Referans Kontrolü' },
            { value: 7, label: 'Teklif Hazırlanıyor' },
            { value: 8, label: 'Teklif Gönderildi' },
            { value: 9, label: 'Teklif Onayı Bekleniyor' },
            { value: 10, label: 'İşe Başladı' },
            { value: 11, label: 'Reddedildi' },
            { value: 12, label: 'Aday Vazgeçti' },
            { value: 13, label: 'Kara Liste' }
        ];
    }

    // Aday Eğitim İşlemleri
    async createAdayEgitim(adayId, egitimData) {
        return await api.post(`/Aday/${adayId}/egitim`, egitimData);
    }

    async updateAdayEgitim(adayId, egitimId, egitimData) {
        return await api.put(`/Aday/${adayId}/egitim/${egitimId}`, egitimData);
    }

    async deleteAdayEgitim(adayId, egitimId) {
        return await api.delete(`/Aday/${adayId}/egitim/${egitimId}`);
    }

    // Aday Sertifika İşlemleri
    async createAdaySertifika(adayId, sertifikaData) {
        return await api.post(`/Aday/${adayId}/sertifika`, sertifikaData);
    }

    async updateAdaySertifika(adayId, sertifikaId, sertifikaData) {
        return await api.put(`/Aday/${adayId}/sertifika/${sertifikaId}`, sertifikaData);
    }

    async deleteAdaySertifika(adayId, sertifikaId) {
        return await api.delete(`/Aday/${adayId}/sertifika/${sertifikaId}`);
    }

    // Aday Referans İşlemleri
    async createAdayReferans(adayId, referansData) {
        return await api.post(`/Aday/${adayId}/referans`, referansData);
    }

    async updateAdayReferans(adayId, referansId, referansData) {
        return await api.put(`/Aday/${adayId}/referans/${referansId}`, referansData);
    }

    async deleteAdayReferans(adayId, referansId) {
        return await api.delete(`/Aday/${adayId}/referans/${referansId}`);
    }

    // Aday Dil İşlemleri
    async createAdayDil(adayId, dilData) {
        return await api.post(`/Aday/${adayId}/dil`, dilData);
    }

    async updateAdayDil(adayId, dilId, dilData) {
        return await api.put(`/Aday/${adayId}/dil/${dilId}`, dilData);
    }

    async deleteAdayDil(adayId, dilId) {
        return await api.delete(`/Aday/${adayId}/dil/${dilId}`);
    }

    // Aday Proje İşlemleri
    async createAdayProje(adayId, projeData) {
        return await api.post(`/Aday/${adayId}/proje`, projeData);
    }

    async updateAdayProje(adayId, projeId, projeData) {
        return await api.put(`/Aday/${adayId}/proje/${projeId}`, projeData);
    }

    async deleteAdayProje(adayId, projeId) {
        return await api.delete(`/Aday/${adayId}/proje/${projeId}`);
    }

    // Aday Hobi İşlemleri
    async createAdayHobi(adayId, hobiData) {
        return await api.post(`/Aday/${adayId}/hobi`, hobiData);
    }

    async updateAdayHobi(adayId, hobiId, hobiData) {
        return await api.put(`/Aday/${adayId}/hobi/${hobiId}`, hobiData);
    }

    async deleteAdayHobi(adayId, hobiId) {
        return await api.delete(`/Aday/${adayId}/hobi/${hobiId}`);
    }

    // Yardımcı metodlar
    getDereceSeviyeleri() {
        return [
            { value: 'Lise', label: 'Lise' },
            { value: 'Ön Lisans', label: 'Ön Lisans' },
            { value: 'Lisans', label: 'Lisans' },
            { value: 'Yüksek Lisans', label: 'Yüksek Lisans' },
            { value: 'Doktora', label: 'Doktora' }
        ];
    }

    getDilSeviyeleri() {
        return [
            { value: 1, label: 'Başlangıç' },
            { value: 2, label: 'Temel' },
            { value: 3, label: 'Orta' },
            { value: 4, label: 'İyi' },
            { value: 5, label: 'İleri' }
        ];
    }

    getIliskiTurleri() {
        return [
            { value: 'Eski Yönetici', label: 'Eski Yönetici' },
            { value: 'İş Arkadaşı', label: 'İş Arkadaşı' },
            { value: 'Müşteri', label: 'Müşteri' },
            { value: 'Tedarikçi', label: 'Tedarikçi' },
            { value: 'Akademik', label: 'Akademik' },
            { value: 'Diğer', label: 'Diğer' }
        ];
    }

    getHobiKategorileri() {
        return [
            { value: 'Spor', label: 'Spor' },
            { value: 'Sanat', label: 'Sanat' },
            { value: 'Müzik', label: 'Müzik' },
            { value: 'Teknoloji', label: 'Teknoloji' },
            { value: 'Okuma', label: 'Okuma' },
            { value: 'Yazılım', label: 'Yazılım' },
            { value: 'Oyun', label: 'Oyun' },
            { value: 'Seyahat', label: 'Seyahat' },
            { value: 'Yemek', label: 'Yemek' },
            { value: 'Sosyal', label: 'Sosyal' },
            { value: 'Diğer', label: 'Diğer' }
        ];
    }

    getAdayDurumSeverity(durum) {
        const durumMap = {
            1: 'info',      // CV Havuzunda
            2: 'warning',   // Başvuru Yapıldı
            3: 'warning',   // CV İnceleniyor
            4: 'help',      // Mülakat Planlandı
            5: 'secondary', // Mülakat Tamamlandı
            6: 'contrast',  // Referans Kontrolü
            7: 'info',      // Teklif Hazırlanıyor
            8: 'warning',   // Teklif Gönderildi
            9: 'help',      // Teklif Onayı Bekleniyor
            10: 'success',  // İşe Başladı
            11: 'danger',   // Reddedildi
            12: 'secondary',// Aday Vazgeçti
            13: 'danger'    // Kara Liste
        };
        return durumMap[durum] || 'info';
    }
}

const iseAlimService = new IseAlimService();
export default iseAlimService;