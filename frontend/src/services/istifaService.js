import ApiService from './api';

class IstifaService {
    // Personelin istifa taleplerini getir
    async getIstifaTalepleri(personelId) {
        const response = await ApiService.get(`/Istifa?personelId=${personelId}`);
        return response;
    }

    // Onay bekleyen istifa taleplerini getir (yöneticiler için)
    async getOnayBekleyenIstifaTalepleri(yoneticiId) {
        const response = await ApiService.get(`/Istifa/Onay?yoneticiId=${yoneticiId}`);
        return response;
    }

    // İstifa dilekçesini indir
    async getIstifaDilekcesi(id) {
        const token = localStorage.getItem('token');
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api';
        
        const response = await fetch(`${API_BASE_URL}/Istifa/Dilekce/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Dilekçe indirilemedi');
        }
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1] || 'istifa_dilekcesi.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        return { success: true, message: 'Dilekçe başarıyla indirildi.' };
    }

    // Yeni istifa talebi oluştur
    async createIstifaTalebi(istifaData) {
        const response = await ApiService.post('/Istifa', istifaData);
        return response;
    }

    // İstifa talebini güncelle
    async updateIstifaTalebi(id, istifaData) {
        const response = await ApiService.put(`/Istifa/${id}`, istifaData);
        return response;
    }

    // İstifa talebini sil
    async deleteIstifaTalebi(id) {
        const response = await ApiService.delete(`/Istifa/${id}`);
        return response;
    }

    // İstifa talebini onayla
    async onaylaIstifaTalebi(id, onayData) {
        const response = await ApiService.post(`/Istifa/Onayla/${id}`, onayData);
        return response;
    }

    // İstifa talebini reddet
    async reddetIstifaTalebi(id, redData) {
        const response = await ApiService.post(`/Istifa/Reddet/${id}`, redData);
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

    // Çalışma yılı hesaplama
    hesaplaCalismaYili(iseBaslamaTarihi) {
        if (!iseBaslamaTarihi) return 0;
        const baslama = new Date(iseBaslamaTarihi);
        const simdi = new Date();
        const yilFark = Math.floor((simdi - baslama) / (365.25 * 24 * 60 * 60 * 1000));
        return yilFark;
    }
}

const istifaService = new IstifaService();
export default istifaService;