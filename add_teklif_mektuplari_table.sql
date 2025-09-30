-- Create TeklifMektubu (Offer Letters) table
CREATE TABLE IF NOT EXISTS teklif_mektuplari (
    id SERIAL PRIMARY KEY,
    basvuru_id INTEGER NOT NULL,
    pozisyon VARCHAR(255) NOT NULL DEFAULT '',
    maas DECIMAL(18,2) NOT NULL DEFAULT 0,
    ek_odemeler TEXT,
    izin_hakki INTEGER NOT NULL DEFAULT 0,
    ise_baslama_tarihi DATE,
    gecerlilik_tarihi DATE,
    durum VARCHAR(100) NOT NULL DEFAULT 'Beklemede',
    hazirlayan INTEGER,
    not TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    aktif BOOLEAN NOT NULL DEFAULT true,

    -- Foreign key constraint to reference basvuru table
    CONSTRAINT fk_teklif_basvuru FOREIGN KEY (basvuru_id) REFERENCES basvurular(id),

    -- Foreign key constraint for hazirlayan (prepared by) field
    CONSTRAINT fk_teklif_hazirlayan FOREIGN KEY (hazirlayan) REFERENCES personeller(id)
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teklif_mektuplari_basvuru_id ON teklif_mektuplari(basvuru_id);
CREATE INDEX IF NOT EXISTS idx_teklif_mektuplari_durum ON teklif_mektuplari(durum);
CREATE INDEX IF NOT EXISTS idx_teklif_mektuplari_aktif ON teklif_mektuplari(aktif);

-- Add some sample data for testing
INSERT INTO teklif_mektuplari (basvuru_id, pozisyon, maas, izin_hakki, ise_baslama_tarihi, gecerlilik_tarihi, durum, hazirlayan, not)
SELECT
    1,
    'IT Proje Sorumlusu',
    75000.00,
    14,
    '2025-01-01'::DATE,
    '2025-01-15'::DATE,
    'Beklemede',
    1,
    'İlk teklif mektubu'
WHERE EXISTS (SELECT 1 FROM basvurular WHERE id = 1)
AND NOT EXISTS (SELECT 1 FROM teklif_mektuplari WHERE basvuru_id = 1);

COMMIT;