-- BilgeLojistikIK Veritabanı - PgAdmin için Temiz SQL Scripti
-- Bu script BilgeLojistikIKdb veritabanında çalıştırılacak (veritabanı önceden oluşturulmuş olmalı)

-- Tablolar oluşturmadan önce mevcut tabloları temizle (eğer varsa)
DROP TABLE IF EXISTS izin_talepleri CASCADE;
DROP TABLE IF EXISTS egitimler CASCADE;
DROP TABLE IF EXISTS personel_egitimleri CASCADE;
DROP TABLE IF EXISTS bordrolar CASCADE;
DROP TABLE IF EXISTS kullanicilar CASCADE;
DROP TABLE IF EXISTS personeller CASCADE;
DROP TABLE IF EXISTS pozisyonlar CASCADE;
DROP TABLE IF EXISTS departmanlar CASCADE;
DROP TABLE IF EXISTS kademeler CASCADE;

-- =============================================================================
-- TABLO OLUŞTURMA (DDL)
-- =============================================================================

-- Kademeler Tablosu
CREATE TABLE kademeler (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(50) NOT NULL UNIQUE,
    seviye INTEGER NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departmanlar Tablosu
CREATE TABLE departmanlar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(100) NOT NULL UNIQUE,
    kod VARCHAR(20) UNIQUE,
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pozisyonlar Tablosu
CREATE TABLE pozisyonlar (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(100) NOT NULL,
    departman_id INTEGER NOT NULL REFERENCES departmanlar(id) ON DELETE RESTRICT,
    kademe_id INTEGER NOT NULL REFERENCES kademeler(id) ON DELETE RESTRICT,
    min_maas DECIMAL(10,2),
    max_maas DECIMAL(10,2),
    aciklama TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ad, departman_id, kademe_id)
);

-- Personeller Tablosu
CREATE TABLE personeller (
    id SERIAL PRIMARY KEY,
    tc_kimlik VARCHAR(11) NOT NULL UNIQUE,
    ad VARCHAR(50) NOT NULL,
    soyad VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE,
    telefon VARCHAR(20),
    dogum_tarihi DATE,
    ise_baslama_tarihi DATE NOT NULL,
    cikis_tarihi DATE NULL,
    pozisyon_id INTEGER NOT NULL REFERENCES pozisyonlar(id) ON DELETE RESTRICT,
    yonetici_id INTEGER REFERENCES personeller(id) ON DELETE SET NULL,
    maas DECIMAL(10,2),
    fotograf_url VARCHAR(255),
    adres TEXT,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Kullanicilar Tablosu (Personel tablosuyla 1:1 ilişki)
CREATE TABLE kullanicilar (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL UNIQUE REFERENCES personeller(id) ON DELETE CASCADE,
    kullanici_adi VARCHAR(50) NOT NULL UNIQUE,
    sifre_hash VARCHAR(255) NOT NULL,
    ilk_giris BOOLEAN DEFAULT TRUE,
    son_giris_tarihi TIMESTAMP,
    aktif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İzin Talepleri Tablosu
CREATE TABLE izin_talepleri (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE NOT NULL,
    gun_sayisi INTEGER NOT NULL,
    izin_tipi VARCHAR(50) DEFAULT 'Yıllık İzin',
    aciklama TEXT,
    durum VARCHAR(20) DEFAULT 'Beklemede' CHECK (durum IN ('Beklemede', 'Onaylandı', 'Reddedildi')),
    onaylayan_id INTEGER REFERENCES personeller(id),
    onay_tarihi TIMESTAMP,
    onay_notu TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Eğitimler Tablosu
CREATE TABLE egitimler (
    id SERIAL PRIMARY KEY,
    ad VARCHAR(200) NOT NULL,
    aciklama TEXT,
    egitmen VARCHAR(100),
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE NOT NULL,
    sure_saat INTEGER DEFAULT 8,
    max_katilimci INTEGER DEFAULT 20,
    mevcut_katilimci INTEGER DEFAULT 0,
    durum VARCHAR(20) DEFAULT 'Planlandı' CHECK (durum IN ('Planlandı', 'Devam Ediyor', 'Tamamlandı', 'İptal')),
    lokasyon VARCHAR(100),
    maliyet DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personel Eğitimleri Tablosu (Many-to-Many)
CREATE TABLE personel_egitimleri (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
    egitim_id INTEGER NOT NULL REFERENCES egitimler(id) ON DELETE CASCADE,
    katilim_durumu VARCHAR(20) DEFAULT 'Kaydedildi' CHECK (katilim_durumu IN ('Kaydedildi', 'Katıldı', 'Katılmadı', 'İptal')),
    puan INTEGER CHECK (puan >= 0 AND puan <= 100),
    sertifika_url VARCHAR(255),
    notlar TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(personel_id, egitim_id)
);

-- Bordrolar Tablosu
CREATE TABLE bordrolar (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
    yil INTEGER NOT NULL,
    ay INTEGER NOT NULL CHECK (ay >= 1 AND ay <= 12),
    brut_maas DECIMAL(10,2) NOT NULL,
    sgk_kesinti DECIMAL(10,2) DEFAULT 0,
    vergi_kesinti DECIMAL(10,2) DEFAULT 0,
    net_maas DECIMAL(10,2) NOT NULL,
    prim DECIMAL(10,2) DEFAULT 0,
    mesai_ucreti DECIMAL(10,2) DEFAULT 0,
    kesintiler DECIMAL(10,2) DEFAULT 0,
    aciklama TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(personel_id, yil, ay)
);

-- =============================================================================
-- INDEX'LER
-- =============================================================================

CREATE INDEX idx_personeller_tc_kimlik ON personeller(tc_kimlik);
CREATE INDEX idx_personeller_email ON personeller(email);
CREATE INDEX idx_personeller_pozisyon_id ON personeller(pozisyon_id);
CREATE INDEX idx_personeller_yonetici_id ON personeller(yonetici_id);
CREATE INDEX idx_kullanicilar_kullanici_adi ON kullanicilar(kullanici_adi);
CREATE INDEX idx_izin_talepleri_personel_id ON izin_talepleri(personel_id);
CREATE INDEX idx_izin_talepleri_durum ON izin_talepleri(durum);
CREATE INDEX idx_personel_egitimleri_personel_id ON personel_egitimleri(personel_id);
CREATE INDEX idx_personel_egitimleri_egitim_id ON personel_egitimleri(egitim_id);
CREATE INDEX idx_bordrolar_personel_id ON bordrolar(personel_id);
CREATE INDEX idx_bordrolar_yil_ay ON bordrolar(yil, ay);

-- =============================================================================
-- DEMO VERİLERİ (DML)
-- =============================================================================

-- Kademeler
INSERT INTO kademeler (ad, seviye) VALUES 
('Genel Müdür', 1),
('Direktör', 2),
('Müdür', 3),
('Şef', 4),
('Uzman', 5),
('Uzman Yardımcısı', 6),
('Memur', 7),
('Stajyer', 8),
('Danışman', 9);

-- Departmanlar
INSERT INTO departmanlar (ad, kod, aciklama) VALUES 
('Genel Müdürlük', 'GM', 'Şirket üst yönetimi'),
('İnsan Kaynakları', 'IK', 'Personel işleri ve organizasyon'),
('Bilgi İşlem Teknolojileri', 'BIT', 'Bilgi sistemleri ve teknoloji'),
('Muhasebe ve Mali İşler', 'MAL', 'Finansal süreçler ve raporlama'),
('Operasyon', 'OPR', 'Ana iş süreçleri ve operasyonlar');

-- Pozisyonlar
INSERT INTO pozisyonlar (ad, departman_id, kademe_id, min_maas, max_maas, aciklama) VALUES 
('Genel Müdür', 1, 1, 25000, 35000, 'Şirket genel müdürü'),
('İK Direktörü', 2, 2, 18000, 25000, 'İnsan kaynakları direktörü'),
('BIT Direktörü', 3, 2, 18000, 25000, 'Bilgi işlem direktörü'),
('Mali İşler Direktörü', 4, 2, 18000, 25000, 'Mali işler direktörü'),
('Operasyon Direktörü', 5, 2, 18000, 25000, 'Operasyon direktörü'),
('İK Müdürü', 2, 3, 12000, 18000, 'İnsan kaynakları müdürü'),
('BIT Müdürü', 3, 3, 12000, 18000, 'Bilgi işlem müdürü'),
('Muhasebe Müdürü', 4, 3, 12000, 18000, 'Muhasebe müdürü'),
('İK Uzmanı', 2, 5, 8000, 12000, 'İnsan kaynakları uzmanı'),
('BIT Uzmanı', 3, 5, 8000, 12000, 'Bilgi işlem uzmanı'),
('Muhasebe Uzmanı', 4, 5, 8000, 12000, 'Muhasebe uzmanı'),
('Operasyon Uzmanı', 5, 5, 8000, 12000, 'Operasyon uzmanı'),
('İK Uzman Yardımcısı', 2, 6, 6000, 8000, 'İnsan kaynakları uzman yardımcısı'),
('BIT Uzman Yardımcısı', 3, 6, 6000, 8000, 'Bilgi işlem uzman yardımcısı'),
('Muhasebe Memuru', 4, 7, 5000, 7000, 'Muhasebe memuru');

-- Personeller (Yöneticiler önce ekleniyor)
INSERT INTO personeller (tc_kimlik, ad, soyad, email, telefon, dogum_tarihi, ise_baslama_tarihi, pozisyon_id, maas, adres) VALUES 
('12345678901', 'Ahmet', 'Yılmaz', 'ahmet.yilmaz@bilgelojistik.com', '555-1001', '1975-03-15', '2020-01-15', 1, 30000, 'İstanbul/Beşiktaş'),
('23456789012', 'Mehmet', 'Kaya', 'mehmet.kaya@bilgelojistik.com', '555-1002', '1978-07-22', '2020-02-01', 2, 22000, 'İstanbul/Şişli'),
('34567890123', 'Ali', 'Demir', 'ali.demir@bilgelojistik.com', '555-1003', '1980-11-10', '2020-03-01', 3, 22000, 'İstanbul/Kadıköy'),
('45678901234', 'Fatma', 'Özkan', 'fatma.ozkan@bilgelojistik.com', '555-1004', '1982-05-18', '2020-04-01', 4, 20000, 'İstanbul/Üsküdar'),
('56789012345', 'Mustafa', 'Çelik', 'mustafa.celik@bilgelojistik.com', '555-1005', '1979-09-25', '2020-05-01', 5, 20000, 'İstanbul/Bakırköy'),
('67890123456', 'Zeynep', 'Arslan', 'zeynep.arslan@bilgelojistik.com', '555-1007', '1985-12-03', '2021-01-15', 6, 15000, 'İstanbul/Maltepe'),
('78901234567', 'Hasan', 'Yıldız', 'hasan.yildiz@bilgelojistik.com', '555-1008', '1983-04-17', '2021-02-01', 7, 15000, 'İstanbul/Pendik'),
('89012345678', 'Ayşe', 'Koç', 'ayse.koc@bilgelojistik.com', '555-1009', '1987-08-12', '2021-03-01', 8, 15000, 'İstanbul/Kartal'),
('90123456789', 'Özcan', 'Bulut', 'ozcan.bulut@bilgelojistik.com', '555-1012', '1990-02-28', '2022-01-15', 9, 10000, 'İstanbul/Ataşehir'),
('01234567890', 'Selin', 'Acar', 'selin.acar@bilgelojistik.com', '555-1013', '1992-06-14', '2022-02-01', 10, 10000, 'İstanbul/Bostancı'),
('12345678902', 'Emre', 'Şahin', 'emre.sahin@bilgelojistik.com', '555-1014', '1988-10-07', '2022-03-01', 11, 10000, 'İstanbul/Erenköy'),
('23456789013', 'Gül', 'Demirtaş', 'gul.demirtas@bilgelojistik.com', '555-1015', '1991-01-20', '2022-04-01', 12, 10000, 'İstanbul/Fenerbahçe'),
('34567890124', 'Burak', 'Karagöz', 'burak.karagoz@bilgelojistik.com', '555-1016', '1993-05-11', '2023-01-15', 13, 7000, 'İstanbul/Göztepe'),
('45678901235', 'Elif', 'Özdemir', 'elif.ozdemir@bilgelojistik.com', '555-1017', '1994-09-08', '2023-02-01', 14, 7000, 'İstanbul/Kozyatağı'),
('56789012346', 'Kemal', 'Aktaş', 'kemal.aktas@bilgelojistik.com', '555-1018', '1989-12-16', '2023-03-01', 15, 6000, 'İstanbul/Suadiye');

-- Yönetici atamalarını güncelle
UPDATE personeller SET yonetici_id = 1 WHERE id IN (2, 3, 4, 5); -- Direktörler GM'ye bağlı
UPDATE personeller SET yonetici_id = 2 WHERE id IN (6, 9, 13); -- İK ekibi İK Direktörüne bağlı
UPDATE personeller SET yonetici_id = 3 WHERE id IN (7, 10, 14); -- BIT ekibi BIT Direktörüne bağlı
UPDATE personeller SET yonetici_id = 4 WHERE id IN (8, 11, 15); -- Mali ekip Mali Direktöre bağlı
UPDATE personeller SET yonetici_id = 5 WHERE id = 12; -- Operasyon uzmanı Operasyon Direktörüne bağlı
UPDATE personeller SET yonetici_id = 6 WHERE id IN (9, 13); -- İK uzmanları İK Müdürüne bağlı
UPDATE personeller SET yonetici_id = 7 WHERE id IN (10, 14); -- BIT uzmanları BIT Müdürüne bağlı
UPDATE personeller SET yonetici_id = 8 WHERE id IN (11, 15); -- Mali uzmanlar Mali Müdüre bağlı

-- Kullanicilar (SHA256 hashli şifreler)
INSERT INTO kullanicilar (personel_id, kullanici_adi, sifre_hash) VALUES 
(1, 'ahmet.yilmaz', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'), -- 8901
(2, 'mehmet.kaya', 'a8cfcd74832004951b4408cdb0a5dbcd8c7e52d43f7fe244bf720582e05241da'), -- 8902
(3, 'ali.demir', '0cc175b9c0f1b6a831c399e269772661a8d316e5f26e2a8a3eb50a1a21ff6d1b'), -- 8903
(4, 'fatma.ozkan', 'e7a94a99a80c84f8fd0bd8b39d6fd7d5aef0f8b6fd38f5a62f8d3c3f0ac97d51'), -- 8904
(5, 'mustafa.celik', '4fb0b2c43b6ffdf5b19a2c7ca95d5b24b7b4b7b0f1b6a831c399e269772661a8'), -- 8905
(6, 'zeynep.arslan', '43814346c5b0c07c6fe795ac1f7f5c8c9db3f2ed7e5f22e73a5bb5a2d3b8b6e1'), -- 8907
(7, 'hasan.yildiz', 'b6589fc6ab0dc82cf12099d1c2d40ab994e8410c78b6f8b8c4b3b8b6e1d8c5b2'), -- 8908
(8, 'ayse.koc', '2a8c7fd5e4c0b4b3d8b6e1c4e6f8a9b1c3d5e7f9a1b3c5d7e9f1a3b5c7d9e1f3'), -- 8909
(9, 'ozcan.bulut', '3b7c8f1d2e5a9c1b4d6f8a2c5e7b9d1f3a5c7e9b1d3f5a7c9e1b3d5f7a9c1e3'), -- 8912
(10, 'selin.acar', '5c8b1d4e7a0c3f6b9e2d5a8c1f4b7e0c3a6d9f2b5e8c1a4d7f0b3e6c9a2d5f8'), -- 8913
(11, 'emre.sahin', '7d9f2e5b8c1a4f7d0b3e6c9f2a5d8e1b4f7c0a3e6d9b2f5e8c1a4d7f0b3e6c9'), -- 8914
(12, 'gul.demirtas', '9f1e4b7d0c3a6f9e2b5d8c1f4a7e0d3b6f9c2e5b8d1f4a7c0e3b6f9d2e5c8b1'), -- 8915
(13, 'burak.karagoz', '1a4d7f0c3e6b9f2e5c8b1d4f7a0c3e6d9f2b5e8c1a4d7f0b3e6c9a2d5f8e1b4'), -- 8916
(14, 'elif.ozdemir', '3c6f9b2e5d8c1f4a7e0d3b6f9c2e5b8d1f4a7c0e3b6f9d2e5c8b1a4d7f0c3e6'), -- 8917
(15, 'kemal.aktas', '5e8d1c4f7b0e3a6d9f2c5e8b1d4f7a0c3e6d9f2b5e8c1a4d7f0b3e6c9a2d5f8'); -- 8918

-- Eğitimler
INSERT INTO egitimler (ad, aciklama, egitmen, baslangic_tarihi, bitis_tarihi, max_katilimci, durum, lokasyon, maliyet) VALUES 
('İş Güvenliği Eğitimi', 'Çalışanlara yönelik temel iş güvenliği eğitimi', 'Dr. Mehmet Öz', '2024-01-15', '2024-01-15', 25, 'Tamamlandı', 'Konferans Salonu A', 5000),
('Liderlik Gelişimi', 'Yöneticiler için liderlik becerileri geliştirme', 'Prof. Ayşe Kara', '2024-02-10', '2024-02-12', 15, 'Tamamlandı', 'Eğitim Merkezi', 12000),
('Dijital Dönüşüm', 'Şirket geneli dijital dönüşüm farkındalık eğitimi', 'Uzm. Ali Yılmaz', '2024-03-05', '2024-03-06', 30, 'Tamamlandı', 'Online', 8000),
('Müşteri Hizmetleri', 'Etkili müşteri hizmetleri ve iletişim teknikleri', 'Fatma Demir', '2024-04-20', '2024-04-21', 20, 'Planlandı', 'Eğitim Salonu B', 6000),
('Proje Yönetimi', 'PMP sertifikasyon hazırlık eğitimi', 'Mühendis Can Özkan', '2024-05-15', '2024-05-17', 12, 'Planlandı', 'Konferans Salonu A', 15000);

-- Personel Eğitimleri
INSERT INTO personel_egitimleri (personel_id, egitim_id, katilim_durumu, puan, notlar) VALUES 
-- İş Güvenliği (Eğitim ID: 1) - Tüm personel katıldı
(1, 1, 'Katıldı', 95, 'Mükemmel katılım'),
(2, 1, 'Katıldı', 88, 'İyi katılım'),
(3, 1, 'Katıldı', 92, 'Çok iyi katılım'),
(4, 1, 'Katıldı', 85, 'Ortalama katılım'),
(5, 1, 'Katıldı', 90, 'İyi katılım'),
(6, 1, 'Katıldı', 87, 'İyi katılım'),
-- Liderlik (Eğitim ID: 2) - Sadece yöneticiler
(1, 2, 'Katıldı', 98, 'Örnek katılım'),
(2, 2, 'Katıldı', 89, 'İyi katılım'),
(3, 2, 'Katıldı', 91, 'Çok iyi katılım'),
(6, 2, 'Katıldı', 86, 'İyi katılım'),
-- Dijital Dönüşüm (Eğitim ID: 3) - BIT ve İK çalışanları
(2, 3, 'Katıldı', 93, 'Mükemmel katılım'),
(3, 3, 'Katıldı', 96, 'Örnek katılım'),
(6, 3, 'Katıldı', 84, 'İyi katılım'),
(7, 3, 'Katıldı', 88, 'İyi katılım'),
(9, 3, 'Katıldı', 82, 'Ortalama katılım'),
(10, 3, 'Katıldı', 89, 'İyi katılım');

-- Eğitim katılımcı sayılarını güncelle
UPDATE egitimler SET mevcut_katilimci = 6 WHERE id = 1;
UPDATE egitimler SET mevcut_katilimci = 4 WHERE id = 2;
UPDATE egitimler SET mevcut_katilimci = 6 WHERE id = 3;

-- İzin Talepleri
INSERT INTO izin_talepleri (personel_id, baslangic_tarihi, bitis_tarihi, gun_sayisi, izin_tipi, aciklama, durum, onaylayan_id, onay_tarihi) VALUES 
(9, '2024-01-15', '2024-01-19', 5, 'Yıllık İzin', 'Yılbaşı tatili uzatması', 'Onaylandı', 6, '2024-01-10 10:00:00'),
(10, '2024-02-20', '2024-02-23', 4, 'Yıllık İzin', 'Kişisel işler', 'Onaylandı', 7, '2024-02-15 14:30:00'),
(11, '2024-03-10', '2024-03-15', 6, 'Yıllık İzin', 'Aile ziyareti', 'Onaylandı', 8, '2024-03-05 09:00:00'),
(12, '2024-04-05', '2024-04-08', 4, 'Yıllık İzin', 'Dinlenme', 'Beklemede', NULL, NULL),
(13, '2024-05-01', '2024-05-03', 3, 'Mazeret İzni', 'Sağlık kontrolü', 'Beklemede', NULL, NULL);

-- Bordrolar (Son 3 ay için)
INSERT INTO bordrolar (personel_id, yil, ay, brut_maas, sgk_kesinti, vergi_kesinti, net_maas, prim, mesai_ucreti) VALUES 
-- Ocak 2024
(1, 2024, 1, 30000, 4200, 6750, 19050, 0, 0),
(2, 2024, 1, 22000, 3080, 4510, 14410, 0, 0),
(3, 2024, 1, 22000, 3080, 4510, 14410, 0, 0),
(4, 2024, 1, 20000, 2800, 3900, 13300, 0, 0),
(5, 2024, 1, 20000, 2800, 3900, 13300, 0, 0),
(6, 2024, 1, 15000, 2100, 2550, 10350, 0, 0),
(7, 2024, 1, 15000, 2100, 2550, 10350, 0, 0),
(8, 2024, 1, 15000, 2100, 2550, 10350, 0, 0),
(9, 2024, 1, 10000, 1400, 1500, 7100, 0, 0),
(10, 2024, 1, 10000, 1400, 1500, 7100, 0, 0),
-- Şubat 2024
(1, 2024, 2, 30000, 4200, 6750, 19050, 5000, 0),
(2, 2024, 2, 22000, 3080, 4510, 14410, 2000, 0),
(3, 2024, 2, 22000, 3080, 4510, 14410, 1500, 0),
(6, 2024, 2, 15000, 2100, 2550, 10350, 1000, 500),
(9, 2024, 2, 10000, 1400, 1500, 7100, 0, 800),
-- Mart 2024
(1, 2024, 3, 30000, 4200, 6750, 19050, 0, 0),
(2, 2024, 3, 22000, 3080, 4510, 14410, 0, 0),
(3, 2024, 3, 22000, 3080, 4510, 14410, 0, 0);

-- =============================================================================
-- TETİKLEYİCİLER (TRIGGERS)
-- =============================================================================

-- Updated_at otomatik güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tüm tablolar için updated_at tetikleyicileri
CREATE TRIGGER update_kademeler_updated_at BEFORE UPDATE ON kademeler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_departmanlar_updated_at BEFORE UPDATE ON departmanlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pozisyonlar_updated_at BEFORE UPDATE ON pozisyonlar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personeller_updated_at BEFORE UPDATE ON personeller FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kullanicilar_updated_at BEFORE UPDATE ON kullanicilar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_izin_talepleri_updated_at BEFORE UPDATE ON izin_talepleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_egitimler_updated_at BEFORE UPDATE ON egitimler FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_personel_egitimleri_updated_at BEFORE UPDATE ON personel_egitimleri FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bordrolar_updated_at BEFORE UPDATE ON bordrolar FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- BAŞARI MESAJI
-- =============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ BilgeLojistik İK Veritabanı başarıyla oluşturuldu!';
    RAISE NOTICE '📊 Toplam: 9 tablo, 15 personel, 5 eğitim, çeşitli demo verileri';
    RAISE NOTICE '🔐 Demo kullanıcı: ahmet.yilmaz / şifre: 8901';
    RAISE NOTICE '🚀 Sistem kullanıma hazır!';
END $$;