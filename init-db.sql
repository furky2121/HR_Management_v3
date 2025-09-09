-- Initial database setup script for Render deployment
-- This creates the initial admin user and sample data

-- Note: Tables will be created by Entity Framework migrations
-- This script only inserts initial data after migrations are run

-- Wait for tables to be created
DO $$ 
BEGIN
    -- Check if tables exist before inserting data
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'kademe') THEN
        -- Insert initial Kademe data if not exists
        INSERT INTO kademe (kademe_adi, kademe_numarasi, aktif, created_at, updated_at)
        SELECT 'Genel Müdür', 1, true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM kademe WHERE kademe_numarasi = 1);
        
        INSERT INTO kademe (kademe_adi, kademe_numarasi, aktif, created_at, updated_at)
        SELECT 'Direktör', 2, true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM kademe WHERE kademe_numarasi = 2);
        
        INSERT INTO kademe (kademe_adi, kademe_numarasi, aktif, created_at, updated_at)
        SELECT 'Müdür', 3, true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM kademe WHERE kademe_numarasi = 3);
        
        INSERT INTO kademe (kademe_adi, kademe_numarasi, aktif, created_at, updated_at)
        SELECT 'Uzman', 4, true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM kademe WHERE kademe_numarasi = 4);
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'departman') THEN
        -- Insert initial Departman data if not exists
        INSERT INTO departman (departman_adi, departman_kodu, aktif, created_at, updated_at)
        SELECT 'İnsan Kaynakları', 'IK', true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM departman WHERE departman_kodu = 'IK');
        
        INSERT INTO departman (departman_adi, departman_kodu, aktif, created_at, updated_at)
        SELECT 'Bilgi İşlem', 'BIT', true, NOW(), NOW()
        WHERE NOT EXISTS (SELECT 1 FROM departman WHERE departman_kodu = 'BIT');
    END IF;
END $$;