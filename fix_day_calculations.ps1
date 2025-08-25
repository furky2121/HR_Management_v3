# PowerShell script to fix day calculations in PostgreSQL database
# This will recalculate all gun_sayisi values using the correct logic

$connectionString = "Host=localhost;Port=5432;Database=BilgeLojistikIKdb;Username=postgres"

# First, let's see what records need fixing
$query = @"
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
    ) as correct_days
FROM izin_talepleri
WHERE gun_sayisi != (
    SELECT COUNT(*)
    FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
    WHERE EXTRACT(dow FROM day) NOT IN (0, 6)
);
"@

Write-Host "Records that need fixing:"
Write-Host $query

# Update query
$updateQuery = @"
UPDATE izin_talepleri 
SET gun_sayisi = (
    SELECT COUNT(*)
    FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
    WHERE EXTRACT(dow FROM day) NOT IN (0, 6) -- Exclude weekends
),
updated_at = NOW()
WHERE gun_sayisi != (
    SELECT COUNT(*)
    FROM generate_series(izin_baslama_tarihi::date, isbasi_tarihi::date - INTERVAL '1 day', INTERVAL '1 day') AS day
    WHERE EXTRACT(dow FROM day) NOT IN (0, 6)
);
"@

Write-Host "Update query:"
Write-Host $updateQuery
Write-Host "Please run these queries manually in your PostgreSQL client."