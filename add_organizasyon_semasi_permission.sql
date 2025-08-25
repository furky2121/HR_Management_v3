-- Organizasyon Şeması ekran yetkisi ekle
INSERT INTO "EkranYetkileri" ("EkranAdi", "EkranKodu", "Aciklama", "Aktif", "CreatedAt", "UpdatedAt") 
VALUES ('Organizasyon Şeması', 'organizasyon-semasi', 'Şirketin organizasyon şemasını görüntüleme yetkisi', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("EkranKodu") DO NOTHING;

-- Yeni eklenen ekran yetkisinin ID'sini al
DO $$
DECLARE
    ekran_yetki_id INT;
    kademe_rec RECORD;
BEGIN
    -- Organizasyon şeması ekran yetkisinin ID'sini bul
    SELECT "Id" INTO ekran_yetki_id 
    FROM "EkranYetkileri" 
    WHERE "EkranKodu" = 'organizasyon-semasi';

    -- Her kademe için okuma yetkisi ver (herkes görebilir)
    FOR kademe_rec IN SELECT "Id", "Seviye" FROM "kademeler" WHERE "Aktif" = true
    LOOP
        INSERT INTO "KademeEkranYetkileri" (
            "KademeId", 
            "EkranYetkisiId", 
            "OkumaYetkisi", 
            "YazmaYetkisi", 
            "SilmeYetkisi", 
            "GuncellemeYetkisi", 
            "Aktif", 
            "CreatedAt", 
            "UpdatedAt"
        ) 
        VALUES (
            kademe_rec."Id", 
            ekran_yetki_id, 
            true,   -- Herkes okuyabilir
            false,  -- Kimse yazamaz
            false,  -- Kimse silemez  
            false,  -- Kimse güncelleyemez
            true, 
            CURRENT_TIMESTAMP, 
            CURRENT_TIMESTAMP
        )
        ON CONFLICT ("KademeId", "EkranYetkisiId") DO NOTHING;
    END LOOP;
    
    RAISE NOTICE 'Organizasyon şeması yetkileri başarıyla eklendi!';
END $$;