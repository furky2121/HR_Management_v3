-- Sample data for PersonelGirisCikis table
INSERT INTO personel_giris_cikis (personel_id, giris_tarihi, cikis_tarihi, giris_tipi, aciklama, calisma_suresi_dakika, gec_kalma_dakika, erken_cikma_dakika, aktif, olusturma_tarihi)
VALUES 
(1, '2025-01-20 08:00:00+03', '2025-01-20 17:30:00+03', 'Normal', 'Normal mesai günü', 510, 0, 0, true, NOW()),
(1, '2025-01-21 08:15:00+03', '2025-01-21 17:30:00+03', 'Normal', 'Geç kalma', 495, 15, 0, true, NOW()),
(1, '2025-01-22 08:00:00+03', '2025-01-22 17:00:00+03', 'Normal', 'Erken çıkış', 480, 0, 30, true, NOW()),
(2, '2025-01-20 08:30:00+03', '2025-01-20 18:00:00+03', 'Normal', 'Normal mesai günü', 510, 30, 0, true, NOW()),
(2, '2025-01-21 08:00:00+03', '2025-01-21 19:00:00+03', 'Fazla Mesai', 'Proje teslimi', 600, 0, 0, true, NOW()),
(3, '2025-01-20 09:00:00+03', '2025-01-20 18:00:00+03', 'Normal', 'Normal mesai günü', 480, 60, 0, true, NOW()),
(3, '2025-01-21 08:45:00+03', '2025-01-21 17:30:00+03', 'Normal', 'Geç kalma', 465, 45, 0, true, NOW()),
(4, '2025-01-20 08:00:00+03', '2025-01-20 17:30:00+03', 'Normal', 'Normal mesai günü', 510, 0, 0, true, NOW()),
(4, '2025-01-22 10:00:00+03', '2025-01-22 16:00:00+03', 'Hafta Sonu', 'Hafta sonu çalışması', 360, 0, 0, true, NOW()),
(5, '2025-01-20 08:00:00+03', '2025-01-20 17:30:00+03', 'Normal', 'Normal mesai günü', 510, 0, 0, true, NOW());