-- BilgeLojistikIK Veritabanı SQL Scripti
-- Bu script BilgeLojistikIKdb veritabanı için tablo yapıları ve örnek verileri oluşturur

-- Veritabanı oluştur (eğer mevcut değilse)
CREATE DATABASE "BilgeLojistikIKdb" WITH OWNER postgres ENCODING 'UTF8';

-- Veritabanına bağlan
\c "BilgeLojistikIKdb";

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
    baslik VARCHAR(200) NOT NULL,
    aciklama TEXT,
    baslangic_tarihi DATE NOT NULL,
    bitis_tarihi DATE NOT NULL,
    sure_saat INTEGER,
    egitmen VARCHAR(100),
    konum VARCHAR(200),
    kapasite INTEGER,
    durum VARCHAR(20) DEFAULT 'Planlandı' CHECK (durum IN ('Planlandı', 'Devam Ediyor', 'Tamamlandı', 'İptal Edildi')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Personel Eğitimleri İlişki Tablosu
CREATE TABLE personel_egitimleri (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
    egitim_id INTEGER NOT NULL REFERENCES egitimler(id) ON DELETE CASCADE,
    katilim_durumu VARCHAR(20) DEFAULT 'Atandı' CHECK (katilim_durumu IN ('Atandı', 'Katıldı', 'Katılmadı', 'Tamamladı')),
    puan INTEGER CHECK (puan >= 0 AND puan <= 100),
    sertifika_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(personel_id, egitim_id)
);

-- Bordrolar Tablosu
CREATE TABLE bordrolar (
    id SERIAL PRIMARY KEY,
    personel_id INTEGER NOT NULL REFERENCES personeller(id) ON DELETE CASCADE,
    donem_yil INTEGER NOT NULL,
    donem_ay INTEGER NOT NULL CHECK (donem_ay >= 1 AND donem_ay <= 12),
    brut_maas DECIMAL(10,2) NOT NULL,
    net_maas DECIMAL(10,2) NOT NULL,
    sgk_kesinti DECIMAL(10,2) DEFAULT 0,
    vergi_kesinti DECIMAL(10,2) DEFAULT 0,
    diger_kesintiler DECIMAL(10,2) DEFAULT 0,
    prim_odemeler DECIMAL(10,2) DEFAULT 0,
    mesai_odemeler DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(personel_id, donem_yil, donem_ay)
);

-- =============================================================================
-- İNDEXLER
-- =============================================================================

-- Performans için indexler
CREATE INDEX idx_personeller_pozisyon ON personeller(pozisyon_id);
CREATE INDEX idx_personeller_yonetici ON personeller(yonetici_id);
CREATE INDEX idx_personeller_aktif ON personeller(aktif);
CREATE INDEX idx_izin_talepleri_personel ON izin_talepleri(personel_id);
CREATE INDEX idx_izin_talepleri_durum ON izin_talepleri(durum);
CREATE INDEX idx_izin_talepleri_tarih ON izin_talepleri(baslangic_tarihi, bitis_tarihi);
CREATE INDEX idx_bordrolar_personel_donem ON bordrolar(personel_id, donem_yil, donem_ay);

-- =============================================================================
-- TRİGGERLER (Otomatik updated_at güncelleme)
-- =============================================================================

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları ekle
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
-- ÖRNEK VERİLER (DML)
-- =============================================================================

-- Kademeler
INSERT INTO kademeler (ad, seviye) VALUES 
('Genel Müdür', 1),
('Direktör', 2),
('Grup Müdürü', 3),
('Müdür', 4),
('Yönetici', 5),
('Sorumlu', 6),
('Kıdemli Uzman', 7),
('Uzman', 8),
('Uzman Yardımcısı', 9);

-- Departmanlar
INSERT INTO departmanlar (ad, kod, aciklama) VALUES 
('Genel Müdürlük', 'GM', 'Şirketin en üst yönetim birimi'),
('İnsan Kaynakları', 'IK', 'Personel işleri ve insan kaynakları yönetimi'),
('Bilgi İşlem', 'BIT', 'Bilgi teknolojileri ve sistem yönetimi'),
('Muhasebe ve Finans', 'MF', 'Mali işler ve muhasebe'),
('Operasyon', 'OP', 'Operasyon ve lojistik işlemleri'),
('Satış ve Pazarlama', 'SP', 'Satış ve pazarlama faaliyetleri'),
('Hukuk', 'HK', 'Hukuki işler ve danışmanlık');

-- Pozisyonlar
INSERT INTO pozisyonlar (ad, departman_id, kademe_id, min_maas, max_maas, aciklama) VALUES 
-- Genel Müdürlük
('Genel Müdür', 1, 1, 50000.00, 75000.00, 'Şirket genel müdürü'),
('Genel Müdür Yardımcısı', 1, 2, 35000.00, 50000.00, 'Genel müdür yardımcısı'),

-- İnsan Kaynakları
('İK Direktörü', 2, 2, 30000.00, 45000.00, 'İnsan kaynakları direktörü'),
('İK Müdürü', 2, 4, 20000.00, 30000.00, 'İnsan kaynakları müdürü'),
('İK Uzmanı', 2, 8, 12000.00, 18000.00, 'İnsan kaynakları uzmanı'),
('İK Uzman Yardımcısı', 2, 9, 8000.00, 12000.00, 'İnsan kaynakları uzman yardımcısı'),

-- Bilgi İşlem
('BIT Direktörü', 3, 2, 35000.00, 50000.00, 'Bilgi işlem direktörü'),
('Yazılım Geliştirme Müdürü', 3, 4, 25000.00, 35000.00, 'Yazılım geliştirme müdürü'),
('Sistem Yöneticisi', 3, 6, 15000.00, 25000.00, 'Sistem yöneticisi'),
('Yazılım Geliştiricisi', 3, 8, 12000.00, 20000.00, 'Yazılım geliştirici'),

-- Muhasebe ve Finans
('Mali İşler Direktörü', 4, 2, 30000.00, 45000.00, 'Mali işler direktörü'),
('Muhasebe Müdürü', 4, 4, 20000.00, 30000.00, 'Muhasebe müdürü'),
('Mali Müşavir', 4, 7, 15000.00, 25000.00, 'Mali müşavir'),
('Muhasebe Uzmanı', 4, 8, 10000.00, 16000.00, 'Muhasebe uzmanı'),

-- Operasyon
('Operasyon Direktörü', 5, 2, 30000.00, 45000.00, 'Operasyon direktörü'),
('Lojistik Müdürü', 5, 4, 18000.00, 28000.00, 'Lojistik müdürü'),
('Operasyon Uzmanı', 5, 8, 10000.00, 16000.00, 'Operasyon uzmanı'),

-- Satış ve Pazarlama
('Satış Direktörü', 6, 2, 25000.00, 40000.00, 'Satış direktörü'),
('Satış Müdürü', 6, 4, 18000.00, 28000.00, 'Satış müdürü'),
('Satış Uzmanı', 6, 8, 10000.00, 16000.00, 'Satış uzmanı'),

-- Hukuk
('Hukuk Müşaviri', 7, 7, 20000.00, 35000.00, 'Hukuk müşaviri');

-- Personeller (Hiyerarşik yapıda)
INSERT INTO personeller (tc_kimlik, ad, soyad, email, telefon, dogum_tarihi, ise_baslama_tarihi, pozisyon_id, yonetici_id, maas, aktif) VALUES 
-- Genel Müdür (En üst seviye - yöneticisi yok)
('12345678901', 'Ahmet', 'Yılmaz', 'ahmet.yilmaz@bilgelojistik.com', '0532-123-4567', '1975-05-15', '2010-01-01', 1, NULL, 60000.00, TRUE),

-- Direktörler (Genel Müdüre bağlı)
('12345678902', 'Mehmet', 'Kaya', 'mehmet.kaya@bilgelojistik.com', '0532-234-5678', '1980-03-20', '2012-03-01', 3, 1, 35000.00, TRUE), -- İK Direktörü
('12345678903', 'Ali', 'Demir', 'ali.demir@bilgelojistik.com', '0532-345-6789', '1978-08-10', '2011-06-01', 7, 1, 40000.00, TRUE), -- BIT Direktörü
('12345678904', 'Ayşe', 'Şahin', 'ayse.sahin@bilgelojistik.com', '0532-456-7890', '1982-12-05', '2013-02-01', 11, 1, 37000.00, TRUE), -- Mali İşler Direktörü
('12345678905', 'Fatma', 'Özkan', 'fatma.ozkan@bilgelojistik.com', '0532-567-8901', '1979-09-25', '2012-08-01', 15, 1, 35000.00, TRUE), -- Operasyon Direktörü
('12345678906', 'Mustafa', 'Çelik', 'mustafa.celik@bilgelojistik.com', '0532-678-9012', '1981-04-18', '2014-01-01', 18, 1, 32000.00, TRUE), -- Satış Direktörü

-- Müdürler (Direktörlere bağlı)
('12345678907', 'Zeynep', 'Arslan', 'zeynep.arslan@bilgelojistik.com', '0532-789-0123', '1985-07-12', '2015-05-01', 4, 2, 25000.00, TRUE), -- İK Müdürü
('12345678908', 'Emre', 'Güven', 'emre.guven@bilgelojistik.com', '0532-890-1234', '1983-11-30', '2016-03-01', 8, 3, 30000.00, TRUE), -- Yazılım Geliştirme Müdürü
('12345678909', 'Seda', 'Yıldız', 'seda.yildiz@bilgelojistik.com', '0532-901-2345', '1986-01-22', '2017-01-01', 12, 4, 25000.00, TRUE), -- Muhasebe Müdürü
('12345678910', 'Burak', 'Koç', 'burak.koc@bilgelojistik.com', '0532-012-3456', '1984-06-08', '2015-11-01', 16, 5, 23000.00, TRUE), -- Lojistik Müdürü
('12345678911', 'Elif', 'Aydın', 'elif.aydin@bilgelojistik.com', '0532-123-4568', '1987-02-14', '2018-04-01', 19, 6, 23000.00, TRUE), -- Satış Müdürü

-- Uzmanlar ve diğer personel
('12345678912', 'Özcan', 'Bulut', 'ozcan.bulut@bilgelojistik.com', '0532-234-5679', '1990-05-30', '2019-01-01', 5, 7, 15000.00, TRUE), -- İK Uzmanı
('12345678913', 'Deniz', 'Eren', 'deniz.eren@bilgelojistik.com', '0532-345-6780', '1992-03-25', '2020-06-01', 6, 7, 10000.00, TRUE), -- İK Uzman Yardımcısı
('12345678914', 'Caner', 'Yıldırım', 'caner.yildirim@bilgelojistik.com', '0532-456-7891', '1988-12-18', '2018-09-01', 9, 8, 18000.00, TRUE), -- Sistem Yöneticisi
('12345678915', 'Pelin', 'Karaca', 'pelin.karaca@bilgelojistik.com', '0532-567-8902', '1991-08-05', '2019-07-01', 10, 8, 16000.00, TRUE), -- Yazılım Geliştirici
('12345678916', 'Serkan', 'Doğan', 'serkan.dogan@bilgelojistik.com', '0532-678-9013', '1989-11-11', '2019-03-01', 13, 9, 18000.00, TRUE), -- Mali Müşavir
('12345678917', 'Gizem', 'Kurt', 'gizem.kurt@bilgelojistik.com', '0532-789-0124', '1993-04-07', '2020-02-01', 14, 9, 13000.00, TRUE), -- Muhasebe Uzmanı
('12345678918', 'Murat', 'Şen', 'murat.sen@bilgelojistik.com', '0532-890-1235', '1987-10-20', '2018-12-01', 17, 10, 14000.00, TRUE), -- Operasyon Uzmanı
('12345678919', 'Nalan', 'Öz', 'nalan.oz@bilgelojistik.com', '0532-901-2346', '1990-01-15', '2019-05-01', 20, 11, 13000.00, TRUE), -- Satış Uzmanı
('12345678920', 'Kemal', 'Taş', 'kemal.tas@bilgelojistik.com', '0532-012-3457', '1985-09-03', '2017-08-01', 21, 1, 27000.00, TRUE); -- Hukuk Müşaviri

-- Kullanıcılar (şifre: TC kimlik numarasının son 4 hanesi, SHA256 hash olarak saklanacak)
-- UserService SHA256 kullandığı için hash'ler SHA256 ile güncellendi
INSERT INTO kullanicilar (personel_id, kullanici_adi, sifre_hash, ilk_giris, aktif) VALUES 
(1, 'ahmet.yilmaz', '213fc33d8f2dbde3207734e3097ea72a69fb8b009f2878468cdd9e74b70a1e59', TRUE, TRUE), -- 8901 -> SHA256
(2, 'mehmet.kaya', 'ed209dafb3c690d3b9b2ed800b703da20648ffaa6b47883f4cf4a2474c853cc3', TRUE, TRUE), -- 8902 -> SHA256  
(3, 'ali.demir', 'd64fe06e31bcae668cd7dd2db726d60b8e80cc7e7b1445a9aa14f110a7d6f386', TRUE, TRUE), -- 8903 -> SHA256
(4, 'ayse.sahin', 'f522915c780209c12328f8119a2e113aee3eff298380cc4c89f07de2b8f20ade', TRUE, TRUE), -- 8904 -> SHA256
(5, 'fatma.ozkan', 'af0f1ad0d38267a27ddef9d5e307804e7f731c70db899b97081e32ed9d987edd', TRUE, TRUE), -- 8905 -> SHA256
(6, 'mustafa.celik', 'c09582dcf542022112f9c5313045c43910675434a4486e440369c9c33d29a171', TRUE, TRUE), -- 8906 -> SHA256
(7, 'zeynep.arslan', 'bff039ee06ba03e7857e091a05d9b0a648c85c8fd3425ff340cb9ee43fe22712', TRUE, TRUE), -- 8907 -> SHA256
(8, 'emre.guven', '165e75840c3993a19ef16c0235963ba9d3b278953c8114c06e4034d7d4836803', TRUE, TRUE), -- 8908 -> SHA256
(9, 'seda.yildiz', '2092dd52f8c243c4e59ca32a7de6b814ddd9d601632fd26165e7afc467242fe5', TRUE, TRUE), -- 8909 -> SHA256
(10, 'burak.koc', '90363681060467cef1c7ac85c946522ef3cb00b5fc386064de79faf5df57a547', TRUE, TRUE), -- 8910 -> SHA256
(11, 'elif.aydin', 'b759ee249f22ecb6e75c1148176ea28ad76a206b0cbb2d7c25155f03d8637810', TRUE, TRUE), -- 8911 -> SHA256
(12, 'ozcan.bulut', 'e781b2c55b7dd50d14e90f2b616af651c8ec1d8064db6491b7e0daeea4e4efe8', TRUE, TRUE), -- 8912 -> SHA256
(13, 'deniz.eren', '8301d2c253bbf4f957ac66f6cda74bec13ea534476711c7035f0173f0a77cac6', TRUE, TRUE), -- 8913 -> SHA256
(14, 'caner.yildirim', '4a1233956c391eb0dd080425cd24ae18091fd63c7994bd7a03488c13dd609116', TRUE, TRUE), -- 8914 -> SHA256
(15, 'pelin.karaca', '43662a57a9cdec8075ed633208898206ae86253722a91af808cd1e48fe9d8b6a', TRUE, TRUE), -- 8915 -> SHA256
(16, 'serkan.dogan', '54d3fd385463022fac44054d2005ab0c3dc7a5a878c5122cbc37a2aa26e66167', TRUE, TRUE), -- 8916 -> SHA256
(17, 'gizem.kurt', '599a18be4f4e47d3316b3cf1a7a17a5bf732f71ed68c3784e1cfed8655cace12', TRUE, TRUE), -- 8917 -> SHA256
(18, 'murat.sen', 'cbde8b191f382ad07fd13e00409eca805d3b7c88ad8fa8295eb9078f7e1819ef', TRUE, TRUE), -- 8918 -> SHA256
(19, 'nalan.oz', '44cdd65e10c632697df15a92442f9a07d3f1795ed32b3c845c368976a0ce3fc5', TRUE, TRUE), -- 8919 -> SHA256
(20, 'kemal.tas', 'd0b572559570f16709f8d796d0a066ba5cf496a3c1af6478c71c7f0e6b05d9a1', TRUE, TRUE); -- 8920 -> SHA256

-- Örnek Eğitimler
INSERT INTO egitimler (baslik, aciklama, baslangic_tarihi, bitis_tarihi, sure_saat, egitmen, konum, kapasite, durum) VALUES 
('İş Güvenliği Eğitimi', 'Temel iş güvenliği kuralları ve uygulamaları', '2024-09-01', '2024-09-02', 16, 'Dr. Mahmut Özdemir', 'Eğitim Salonu A', 20, 'Tamamlandı'),
('Dijital Pazarlama', 'Modern dijital pazarlama teknikleri', '2024-10-15', '2024-10-17', 24, 'Ahmet Gürbüz', 'Eğitim Salonu B', 15, 'Tamamlandı'),
('Liderlik ve Yönetim', 'Etkili liderlik becerileri geliştirme', '2024-11-01', '2024-11-03', 20, 'Prof. Dr. Ayşe Kılıç', 'Eğitim Salonu A', 12, 'Planlandı'),
('Yazılım Geliştirme', 'Modern yazılım geliştirme metodolojileri', '2024-12-01', '2024-12-05', 40, 'Mühendis Can Yılmaz', 'BIT Lab', 10, 'Planlandı');

-- Personel Eğitim Atamaları
INSERT INTO personel_egitimleri (personel_id, egitim_id, katilim_durumu, puan) VALUES 
-- İş Güvenliği Eğitimi (Tüm personel)
(1, 1, 'Tamamladı', 95),
(2, 1, 'Tamamladı', 88),
(3, 1, 'Tamamladı', 92),
(4, 1, 'Tamamladı', 90),
(5, 1, 'Tamamladı', 85),
-- Dijital Pazarlama (Satış ekibi)
(6, 2, 'Tamamladı', 87),
(11, 2, 'Tamamladı', 91),
(19, 2, 'Tamamladı', 89),
-- Liderlik Eğitimi (Yöneticiler)
(1, 3, 'Atandı', NULL),
(2, 3, 'Atandı', NULL),
(3, 3, 'Atandı', NULL),
(4, 3, 'Atandı', NULL),
(5, 3, 'Atandı', NULL),
-- Yazılım Geliştirme (BIT ekibi)
(3, 4, 'Atandı', NULL),
(8, 4, 'Atandı', NULL),
(14, 4, 'Atandı', NULL),
(15, 4, 'Atandı', NULL);

-- Örnek İzin Talepleri
INSERT INTO izin_talepleri (personel_id, baslangic_tarihi, bitis_tarihi, gun_sayisi, izin_tipi, aciklama, durum, onaylayan_id, onay_tarihi) VALUES 
-- Onaylanmış izinler
(12, '2024-08-15', '2024-08-20', 6, 'Yıllık İzin', 'Tatil için izin', 'Onaylandı', 7, '2024-08-10 14:30:00'),
(13, '2024-09-10', '2024-09-12', 3, 'Yıllık İzin', 'Kişisel işler', 'Onaylandı', 7, '2024-09-05 10:15:00'),
(15, '2024-07-22', '2024-07-26', 5, 'Yıllık İzin', 'Aile ziyareti', 'Onaylandı', 8, '2024-07-15 16:20:00'),
-- Bekleyen izin talepleri
(14, '2024-08-25', '2024-08-30', 6, 'Yıllık İzin', 'Uzun tatil planı', 'Beklemede', NULL, NULL),
(16, '2024-08-20', '2024-08-22', 3, 'Mazeret İzni', 'Sağlık kontrolü', 'Beklemede', NULL, NULL),
(17, '2024-09-01', '2024-09-05', 5, 'Yıllık İzin', 'Bayram tatili uzatma', 'Beklemede', NULL, NULL),
-- Reddedilen izin
(18, '2024-08-01', '2024-08-15', 15, 'Yıllık İzin', 'Uzun süreli tatil', 'Reddedildi', 10, '2024-07-25 09:00:00');

-- Örnek Bordrolar (Son 3 ay)
INSERT INTO bordrolar (personel_id, donem_yil, donem_ay, brut_maas, net_maas, sgk_kesinti, vergi_kesinti, diger_kesintiler, prim_odemeler, mesai_odemeler) VALUES 
-- 2024 Haziran bordrolar (seçili personel için)
(1, 2024, 6, 60000.00, 42500.00, 9600.00, 7200.00, 700.00, 0.00, 0.00),
(2, 2024, 6, 35000.00, 25200.00, 5600.00, 3800.00, 400.00, 0.00, 0.00),
(3, 2024, 6, 40000.00, 28800.00, 6400.00, 4400.00, 400.00, 0.00, 0.00),
(7, 2024, 6, 25000.00, 18500.00, 4000.00, 2300.00, 200.00, 0.00, 0.00),
(12, 2024, 6, 15000.00, 11800.00, 2400.00, 650.00, 150.00, 0.00, 0.00),

-- 2024 Temmuz bordrolar
(1, 2024, 7, 60000.00, 42500.00, 9600.00, 7200.00, 700.00, 0.00, 0.00),
(2, 2024, 7, 35000.00, 25200.00, 5600.00, 3800.00, 400.00, 0.00, 0.00),
(3, 2024, 7, 40000.00, 28800.00, 6400.00, 4400.00, 400.00, 0.00, 0.00),
(7, 2024, 7, 25000.00, 18500.00, 4000.00, 2300.00, 200.00, 0.00, 0.00),
(12, 2024, 7, 15000.00, 11800.00, 2400.00, 650.00, 150.00, 0.00, 0.00),

-- 2024 Ağustos bordrolar (mesai ödemeli örnekler)
(1, 2024, 8, 60000.00, 43200.00, 9600.00, 7200.00, 700.00, 500.00, 0.00),
(2, 2024, 8, 35000.00, 25800.00, 5600.00, 3800.00, 400.00, 300.00, 400.00),
(3, 2024, 8, 40000.00, 29200.00, 6400.00, 4400.00, 400.00, 200.00, 600.00),
(7, 2024, 8, 25000.00, 18800.00, 4000.00, 2300.00, 200.00, 0.00, 300.00),
(12, 2024, 8, 15000.00, 12000.00, 2400.00, 650.00, 150.00, 0.00, 200.00);

-- =============================================================================
-- VERİ DOĞRULAMA VE KONTROL SORGUSLARI
-- =============================================================================

-- Tablo sayılarını kontrol et
SELECT 'kademeler' as tablo, COUNT(*) as kayit_sayisi FROM kademeler
UNION ALL
SELECT 'departmanlar', COUNT(*) FROM departmanlar
UNION ALL
SELECT 'pozisyonlar', COUNT(*) FROM pozisyonlar
UNION ALL
SELECT 'personeller', COUNT(*) FROM personeller
UNION ALL
SELECT 'kullanicilar', COUNT(*) FROM kullanicilar
UNION ALL
SELECT 'izin_talepleri', COUNT(*) FROM izin_talepleri
UNION ALL
SELECT 'egitimler', COUNT(*) FROM egitimler
UNION ALL
SELECT 'personel_egitimleri', COUNT(*) FROM personel_egitimleri
UNION ALL
SELECT 'bordrolar', COUNT(*) FROM bordrolar
ORDER BY tablo;

-- Hiyerarşik yapıyı kontrol et
SELECT 
    p.ad || ' ' || p.soyad as personel,
    pos.ad as pozisyon,
    k.ad as kademe,
    d.ad as departman,
    COALESCE(y.ad || ' ' || y.soyad, 'YÖNETİCİ YOK') as yonetici
FROM personeller p
JOIN pozisyonlar pos ON p.pozisyon_id = pos.id
JOIN kademeler k ON pos.kademe_id = k.id
JOIN departmanlar d ON pos.departman_id = d.id
LEFT JOIN personeller y ON p.yonetici_id = y.id
ORDER BY k.seviye, d.ad, p.ad;

COMMIT;