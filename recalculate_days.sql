-- SQL script to recalculate gun_sayisi for all records
-- This will fix the incorrect day calculations in existing records

-- PROBLEM IDENTIFIED: 
-- Existing records in database have pre-calculated gun_sayisi values that include the work return day
-- Examples from your data:
-- 28.08.2025 08:00 to 29.08.2025 08:00 shows 2 days (should be 1)
-- 18.08.2025 08:00 to 20.08.2025 08:00 shows 3 days (should be 2)
-- 14.08.2025 00:00 to 15.08.2025 00:00 shows 2 days (should be 1)

-- Step 1: Check current incorrect values
SELECT 
    id,
    izin_baslama_tarihi::date as start_date,
    isbasi_tarihi::date as end_date,
    gun_sayisi as current_days,
    -- Calculate correct days: count weekdays between start and end (excluding end date)
    (
        SELECT COUNT(*)
        FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
        WHERE EXTRACT(dow FROM day) NOT IN (0, 6) -- Exclude Sunday (0) and Saturday (6)
    ) as correct_days,
    CASE 
        WHEN gun_sayisi != (
            SELECT COUNT(*)
            FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
            WHERE EXTRACT(dow FROM day) NOT IN (0, 6)
        ) THEN 'NEEDS FIX'
        ELSE 'OK'
    END as status
FROM izin_talepleri
ORDER BY id;

-- Step 2: Update all records with correct day calculations
-- This will recalculate gun_sayisi using the corrected logic (excluding work return day)
UPDATE izin_talepleri 
SET gun_sayisi = (
    SELECT COUNT(*)
    FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
    WHERE EXTRACT(dow FROM day) NOT IN (0, 6) -- Exclude weekends and work return day
),
updated_at = NOW()
WHERE gun_sayisi != (
    SELECT COUNT(*)
    FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
    WHERE EXTRACT(dow FROM day) NOT IN (0, 6)
);

-- Step 3: Verify the fix
SELECT 
    'After Update' as phase,
    COUNT(*) as total_records,
    COUNT(CASE WHEN gun_sayisi != (
        SELECT COUNT(*)
        FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
        WHERE EXTRACT(dow FROM day) NOT IN (0, 6)
    ) THEN 1 END) as incorrect_records
FROM izin_talepleri;