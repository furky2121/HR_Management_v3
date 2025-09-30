-- Video Atama Test Verisi Ekleme
-- Bu script farklı durumlarda video atamaları ekler

-- Önce mevcut video eğitim ve personel ID'lerini kontrol et
SELECT 'Video Eğitimler:' as info;
SELECT "Id", "Baslik" FROM "VideoEgitimler" WHERE "Aktif" = true LIMIT 5;

SELECT 'Personeller:' as info;
SELECT id, ad, soyad FROM personeller WHERE aktif = true LIMIT 5;

-- Test ataması ekle - farklı durumlar için
DO $$
DECLARE
    video_id INTEGER;
    personel_id INTEGER;
BEGIN
    -- İlk aktif video eğitimi al
    SELECT "Id" INTO video_id FROM "VideoEgitimler" WHERE "Aktif" = true LIMIT 1;

    -- İlk aktif personeli al
    SELECT id INTO personel_id FROM personeller WHERE aktif = true LIMIT 1;

    IF video_id IS NOT NULL AND personel_id IS NOT NULL THEN
        -- Atandı durumunda atama ekle
        INSERT INTO "VideoAtamalar" ("VideoEgitimId", "PersonelId", "AtamaTarihi", "Durum", "AtayanPersonelId")
        VALUES (video_id, personel_id, NOW(), 'Atandı', personel_id);

        -- Devam Ediyor durumunda atama ekle
        INSERT INTO "VideoAtamalar" ("VideoEgitimId", "PersonelId", "AtamaTarihi", "Durum", "AtayanPersonelId")
        VALUES (video_id, personel_id + 1, NOW(), 'Devam Ediyor', personel_id);

        -- Süresi Geçti durumunda atama ekle
        INSERT INTO "VideoAtamalar" ("VideoEgitimId", "PersonelId", "AtamaTarihi", "Durum", "AtayanPersonelId")
        VALUES (video_id, personel_id + 2, NOW() - INTERVAL '30 days', 'Süresi Geçti', personel_id);

        -- Tamamlandı durumunda atama ekle
        INSERT INTO "VideoAtamalar" ("VideoEgitimId", "PersonelId", "AtamaTarihi", "TamamlanmaTarihi", "Durum", "AtayanPersonelId")
        VALUES (video_id, personel_id + 3, NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', 'Tamamlandı', personel_id);

        RAISE NOTICE 'Test atamaları başarıyla eklendi!';
    ELSE
        RAISE NOTICE 'Video eğitim veya personel bulunamadı!';
    END IF;
END $$;

-- Sonuçları kontrol et
SELECT 'Atama Durumları:' as info;
SELECT "Durum", COUNT(*) as "Sayi"
FROM "VideoAtamalar"
GROUP BY "Durum"
ORDER BY "Sayi" DESC;