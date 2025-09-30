-- Update existing adaylar records to have valid durum values
UPDATE adaylar SET durum = 1 WHERE durum = 0;