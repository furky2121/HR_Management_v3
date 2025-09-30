import ApiService from './api';

class NotificationService {

    // Notification kategorileri
    static CATEGORIES = {
        IZIN: 'izin',
        EGITIM: 'egitim',
        DOGUM_GUNU: 'dogum_gunu',
        SISTEM: 'sistem',
        AVANS: 'avans',
        ISTIFA: 'istifa',
        MASRAF: 'masraf',
        DUYURU: 'duyuru'
    };

    // Notification tipleri
    static TYPES = {
        INFO: 'info',
        SUCCESS: 'success',
        WARNING: 'warning',
        ERROR: 'error'
    };

    constructor() {
        this.notifications = [];
        this.loadFromStorage();
        this.setupMockData();
    }

    // LocalStorage'dan bildirimleri yükle
    loadFromStorage() {
        try {
            // Client-side kontrolü
            if (typeof window !== 'undefined' && window.localStorage) {
                const stored = localStorage.getItem('notifications');
                if (stored) {
                    this.notifications = JSON.parse(stored);
                }
            }
        } catch (error) {
            console.error('Notification storage load error:', error);
            this.notifications = [];
        }
    }

    // LocalStorage'a kaydet
    saveToStorage() {
        try {
            // Client-side kontrolü
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem('notifications', JSON.stringify(this.notifications));
            }
        } catch (error) {
            console.error('Notification storage save error:', error);
        }
    }

    // Tüm bildirimleri getir
    async getAllNotifications(personelId) {
        try {
            // API hazır olana kadar mock data kullan
            return this.getMockNotifications(personelId);
        } catch (error) {
            console.error('Get notifications error:', error);
            return { success: false, data: [], message: error.message };
        }
    }

    // Okunmamış bildirimleri getir
    async getUnreadNotifications(personelId) {
        try {
            const all = await this.getAllNotifications(personelId);
            const unread = all.data.filter(n => !n.okundu);
            return { ...all, data: unread };
        } catch (error) {
            console.error('Get unread notifications error:', error);
            return { success: false, data: [], message: error.message };
        }
    }

    // Okunmamış bildirim sayısını getir
    async getUnreadCount(personelId) {
        try {
            const unread = await this.getUnreadNotifications(personelId);
            return unread.data.length;
        } catch (error) {
            console.error('Get unread count error:', error);
            return 0;
        }
    }

    // Bildirimi okundu olarak işaretle
    async markAsRead(notificationId) {
        try {
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                this.notifications[index].okundu = true;
                this.notifications[index].okunmaTarihi = new Date().toISOString();
                this.saveToStorage();
                return { success: true };
            }
            return { success: false, message: 'Bildirim bulunamadı' };
        } catch (error) {
            console.error('Mark as read error:', error);
            return { success: false, message: error.message };
        }
    }

    // Tüm bildirimleri okundu işaretle
    async markAllAsRead(personelId) {
        try {
            this.notifications.forEach(n => {
                if (n.aliciId === personelId && !n.okundu) {
                    n.okundu = true;
                    n.okunmaTarihi = new Date().toISOString();
                }
            });
            this.saveToStorage();
            return { success: true };
        } catch (error) {
            console.error('Mark all as read error:', error);
            return { success: false, message: error.message };
        }
    }

    // Bildirimi sil
    async deleteNotification(notificationId) {
        try {
            const index = this.notifications.findIndex(n => n.id === notificationId);
            if (index !== -1) {
                this.notifications.splice(index, 1);
                this.saveToStorage();
                return { success: true };
            }
            return { success: false, message: 'Bildirim bulunamadı' };
        } catch (error) {
            console.error('Delete notification error:', error);
            return { success: false, message: error.message };
        }
    }

    // Yeni bildirim ekle
    async addNotification(notification) {
        try {
            const newNotification = {
                id: this.generateId(),
                ...notification,
                olusturulmaTarihi: new Date().toISOString(),
                okundu: false,
                okunmaTarihi: null
            };

            this.notifications.unshift(newNotification);
            this.saveToStorage();

            return { success: true, data: newNotification };
        } catch (error) {
            console.error('Add notification error:', error);
            return { success: false, message: error.message };
        }
    }

    // Kategori bazlı filtreleme
    async getNotificationsByCategory(personelId, category) {
        try {
            const all = await this.getAllNotifications(personelId);
            const filtered = all.data.filter(n => n.kategori === category);
            return { ...all, data: filtered };
        } catch (error) {
            console.error('Get notifications by category error:', error);
            return { success: false, data: [], message: error.message };
        }
    }

    // Zaman formatı helper
    formatTimeAgo(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) {
            return 'Az önce';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} dakika önce`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} saat önce`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} gün önce`;
        }
    }

    // Kategori ikon ve renk mappingi
    getCategoryConfig(category) {
        const configs = {
            [NotificationService.CATEGORIES.IZIN]: {
                icon: 'pi-calendar',
                color: '#2196F3',
                label: 'İzin'
            },
            [NotificationService.CATEGORIES.EGITIM]: {
                icon: 'pi-book',
                color: '#FF9800',
                label: 'Eğitim'
            },
            [NotificationService.CATEGORIES.DOGUM_GUNU]: {
                icon: 'pi-heart',
                color: '#E91E63',
                label: 'Doğum Günü'
            },
            [NotificationService.CATEGORIES.SISTEM]: {
                icon: 'pi-cog',
                color: '#607D8B',
                label: 'Sistem'
            },
            [NotificationService.CATEGORIES.AVANS]: {
                icon: 'pi-dollar',
                color: '#4CAF50',
                label: 'Avans'
            },
            [NotificationService.CATEGORIES.ISTIFA]: {
                icon: 'pi-sign-out',
                color: '#F44336',
                label: 'İstifa'
            },
            [NotificationService.CATEGORIES.MASRAF]: {
                icon: 'pi-credit-card',
                color: '#9C27B0',
                label: 'Masraf'
            },
            [NotificationService.CATEGORIES.DUYURU]: {
                icon: 'pi-megaphone',
                color: '#FF5722',
                label: 'Duyuru'
            }
        };

        return configs[category] || {
            icon: 'pi-info-circle',
            color: '#9E9E9E',
            label: 'Bilgi'
        };
    }

    // ID generator
    generateId() {
        return 'notif_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }

    // Mock data setup
    setupMockData() {
        if (this.notifications.length === 0) {
            this.generateMockNotifications();
        }
    }

    // Mock bildirimleri oluştur
    generateMockNotifications() {
        let currentUser = {};
        let personelId = 1;

        // Client-side kontrolü
        if (typeof window !== 'undefined' && window.localStorage) {
            try {
                currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                personelId = currentUser?.personel?.id || 1;
            } catch (error) {
                console.error('Error parsing user from localStorage:', error);
            }
        }

        const mockNotifications = [
            {
                id: 'notif_1',
                aliciId: personelId,
                baslik: 'Yıllık İzin Talebiniz Onaylandı',
                mesaj: '15-20 Ocak tarihleri arasındaki yıllık izin talebiniz yöneticiniz tarafından onaylandı.',
                kategori: NotificationService.CATEGORIES.IZIN,
                tip: NotificationService.TYPES.SUCCESS,
                olusturulmaTarihi: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 saat önce
                okundu: false,
                okunmaTarihi: null,
                gonderenAd: 'Mehmet Kaya',
                actionUrl: '/izin-talepleri'
            },
            {
                id: 'notif_2',
                aliciId: personelId,
                baslik: 'Yeni Eğitim Atandı',
                mesaj: 'Size "İş Güvenliği Temel Eğitimi" atanmıştır. Eğitimi 7 gün içinde tamamlamanız gerekmektedir.',
                kategori: NotificationService.CATEGORIES.EGITIM,
                tip: NotificationService.TYPES.INFO,
                olusturulmaTarihi: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 saat önce
                okundu: false,
                okunmaTarihi: null,
                gonderenAd: 'Sistem',
                actionUrl: '/bana-atanan-egitimler'
            },
            {
                id: 'notif_3',
                aliciId: personelId,
                baslik: 'Bugün Doğum Günü Var! 🎂',
                mesaj: 'Özcan Bulut\'un bugün doğum günü. Ona tebriklerinizi iletmeyi unutmayın!',
                kategori: NotificationService.CATEGORIES.DOGUM_GUNU,
                tip: NotificationService.TYPES.INFO,
                olusturulmaTarihi: new Date().toISOString(), // Şimdi
                okundu: false,
                okunmaTarihi: null,
                gonderenAd: 'Sistem',
                actionUrl: null
            },
            {
                id: 'notif_4',
                aliciId: personelId,
                baslik: 'Maaş Bordronuz Hazır',
                mesaj: 'Ocak 2024 maaş bordronuz hazırlanmıştır. Bordronuzu görüntüleyebilirsiniz.',
                kategori: NotificationService.CATEGORIES.SISTEM,
                tip: NotificationService.TYPES.SUCCESS,
                olusturulmaTarihi: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 gün önce
                okundu: true,
                okunmaTarihi: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 saat önce okundu
                gonderenAd: 'İK Departmanı',
                actionUrl: '/bordro'
            },
            {
                id: 'notif_5',
                aliciId: personelId,
                baslik: 'Avans Talebiniz Onaylandı',
                mesaj: '5.000 TL avans talebiniz onaylanmıştır. Ödeme 2 iş günü içinde hesabınıza yapılacaktır.',
                kategori: NotificationService.CATEGORIES.AVANS,
                tip: NotificationService.TYPES.SUCCESS,
                olusturulmaTarihi: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 saat önce
                okundu: false,
                okunmaTarihi: null,
                gonderenAd: 'Muhasebe',
                actionUrl: '/avans-talepleri'
            },
            {
                id: 'notif_6',
                aliciId: personelId,
                baslik: 'Yeni Duyuru: Şirket Yıl Sonu Etkinliği',
                mesaj: '31 Ocak\'ta düzenlenecek şirket yıl sonu etkinliği için kayıtlar başlamıştır.',
                kategori: NotificationService.CATEGORIES.DUYURU,
                tip: NotificationService.TYPES.INFO,
                olusturulmaTarihi: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün önce
                okundu: true,
                okunmaTarihi: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 gün önce okundu
                gonderenAd: 'İK Departmanı',
                actionUrl: null
            }
        ];

        this.notifications = mockNotifications;
        this.saveToStorage();
    }

    // Mock notification getter
    getMockNotifications(personelId) {
        const userNotifications = this.notifications.filter(n => n.aliciId === personelId);
        return {
            success: true,
            data: userNotifications.sort((a, b) => new Date(b.olusturulmaTarihi) - new Date(a.olusturulmaTarihi))
        };
    }

    // Yeni bildirim simülasyonu (demo amaçlı)
    simulateNewNotification(personelId) {
        const randomNotifications = [
            {
                aliciId: personelId,
                baslik: 'Yeni Eğitim Daveti',
                mesaj: 'Liderlik Gelişim Programı\'na davet edildiniz.',
                kategori: NotificationService.CATEGORIES.EGITIM,
                tip: NotificationService.TYPES.INFO,
                gonderenAd: 'İK Departmanı',
                actionUrl: '/bana-atanan-egitimler'
            },
            {
                aliciId: personelId,
                baslik: 'İzin Talebi Hatırlatması',
                mesaj: 'Bekleyen izin talebiniz bulunmaktadır.',
                kategori: NotificationService.CATEGORIES.IZIN,
                tip: NotificationService.TYPES.WARNING,
                gonderenAd: 'Sistem',
                actionUrl: '/izin-talepleri'
            },
            {
                aliciId: personelId,
                baslik: 'Masraf Talebiniz İnceleniyor',
                mesaj: '850 TL masraf talebiniz muhasebe departmanında incelenmektedir.',
                kategori: NotificationService.CATEGORIES.MASRAF,
                tip: NotificationService.TYPES.INFO,
                gonderenAd: 'Muhasebe',
                actionUrl: '/masraf-talepleri'
            }
        ];

        const randomNotification = randomNotifications[Math.floor(Math.random() * randomNotifications.length)];
        this.addNotification(randomNotification);

        return randomNotification;
    }

    // API metodları (backend hazır olduğunda kullanılacak)
    async getNotificationsFromAPI(personelId) {
        return await ApiService.get(`/notifications?personelId=${personelId}`);
    }

    async markAsReadAPI(notificationId) {
        return await ApiService.put(`/notifications/${notificationId}/read`);
    }

    async deleteNotificationAPI(notificationId) {
        return await ApiService.delete(`/notifications/${notificationId}`);
    }
}

export default new NotificationService();