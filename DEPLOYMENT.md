# 🚀 Ücretsiz Deployment Kılavuzu

Bu proje ücretsiz olarak Render (backend + database) ve Vercel (frontend) üzerinde host edilebilir.

## 📋 Ön Hazırlıklar

### Gerekli Hesaplar:
- [GitHub](https://github.com) hesabı (proje için)
- [Render](https://render.com) hesabı (backend + database)
- [Vercel](https://vercel.com) hesabı (frontend)

## 🗄️ 1. Database Setup (Render PostgreSQL)

1. [Render Dashboard](https://dashboard.render.com)'a gidin
2. **New +** → **PostgreSQL** seçin
3. Ayarlar:
   - Name: `bilgelojistik-db`
   - Database: `bilgelojistikdb`
   - User: `bilgelojistik`
   - Region: Frankfurt (EU)
   - Plan: **Free**
4. **Create Database** tıklayın
5. Connection string'i kopyalayın (backend için gerekli)

## 🔧 2. Backend Deployment (Render)

### GitHub'a Push:
```bash
git add .
git commit -m "Setup for free Render deployment"
git push origin main
```

### Render'da Deploy:
1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Web Service**
2. GitHub repo'nuzu bağlayın
3. Ayarlar:
   - Name: `bilgelojistik-api`
   - Region: Frankfurt (EU)
   - Branch: `main`
   - Root Directory: `backend/BilgeLojistikIK.API`
   - Runtime: **Docker**
   - Plan: **Free**

4. **Environment Variables** ekleyin:
   ```
   ASPNETCORE_ENVIRONMENT=Production
   ASPNETCORE_URLS=http://+:80
   ConnectionStrings__DefaultConnection=[Database connection string]
   JWT_SECRET_KEY=[32+ karakter güvenli key]
   JwtSettings__Issuer=BilgeLojistikIK
   JwtSettings__Audience=BilgeLojistikIK
   JwtSettings__ExpireHours=8
   FRONTEND_URL=https://[vercel-app-name].vercel.app
   ```

5. **Create Web Service** tıklayın
6. Deploy tamamlandığında URL'i kopyalayın (örn: `https://bilgelojistik-api.onrender.com`)

## 🎨 3. Frontend Deployment (Vercel)

### Vercel'de Deploy:
1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New** → **Project**
2. GitHub repo'nuzu import edin
3. Ayarlar:
   - Framework Preset: **Next.js**
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Install Command: `npm install`

4. **Environment Variables** ekleyin:
   ```
   NEXT_PUBLIC_API_URL=https://bilgelojistik-api.onrender.com/api
   ```

5. **Deploy** tıklayın
6. Deploy URL'i kopyalayın (örn: `https://bilgelojistik-hr.vercel.app`)

## 🔄 4. Backend CORS Güncelleme

Backend deploy edildikten sonra, frontend URL'ini CORS'a ekleyin:

1. Render Dashboard → Web Service → Environment
2. `FRONTEND_URL` değerini Vercel URL'i ile güncelleyin
3. Service otomatik yeniden başlayacak

## 📊 5. Database Initialization

### SQL Script ile (Önerilen):
1. Render Dashboard → Database → Connect → External Connection
2. PostgreSQL client ile bağlanın:
```bash
psql [connection-string]
```
3. SQL script'i çalıştırın:
```sql
\i backend/BilgeLojistikIK.API/SQL/BilgeLojistikIKdb_Setup.sql
```

### Migration ile (Alternatif):
Backend otomatik olarak migration'ları uygular (Program.cs'de yapılandırılmış).

## 🔐 6. Demo Hesapları

Sistem hazır! Demo hesapları ile giriş yapabilirsiniz:

| Rol | Kullanıcı Adı | Şifre |
|-----|---------------|-------|
| Genel Müdür | ahmet.yilmaz | 8901 |
| İK Direktörü | mehmet.kaya | 8902 |
| BIT Direktörü | ali.demir | 8903 |
| İK Uzmanı | ozcan.bulut | 8912 |

## ⚠️ Önemli Notlar

### Render Free Tier Limitleri:
- ✅ 750 saat/ay ücretsiz kullanım
- ⚠️ 15 dakika inaktivite sonrası uyku moduna geçer
- ⚠️ İlk istekte 30-50 saniye cold start süresi
- ⚠️ PostgreSQL 90 gün sonra silinir (yedekleme yapın)

### Vercel Free Tier:
- ✅ Sınırsız deployment
- ✅ 100GB bandwidth/ay
- ✅ Otomatik HTTPS
- ✅ Global CDN

### Performans İpuçları:
1. **Keep-Alive**: Frontend'de periyodik ping atarak backend'i uyanık tutun
2. **Loading States**: Cold start için loading spinner kullanın
3. **Database Backup**: 90 günde bir veritabanını yedekleyin

## 🆘 Sorun Giderme

### Backend başlamıyor:
- Dockerfile'ın doğru path'de olduğunu kontrol edin
- Environment variable'ların doğru olduğunu kontrol edin
- Render logs'ları kontrol edin

### Database bağlantı hatası:
- Connection string'in doğru olduğunu kontrol edin
- Database'in aktif olduğunu kontrol edin
- SSL mode ayarlarını kontrol edin

### CORS hatası:
- Backend'deki FRONTEND_URL'in doğru olduğunu kontrol edin
- Vercel deployment URL'inin tam olduğunu kontrol edin (https dahil)

### Frontend API bağlantı hatası:
- NEXT_PUBLIC_API_URL'in doğru olduğunu kontrol edin
- Backend'in çalıştığını kontrol edin
- Network tab'da hataları kontrol edin

## 📱 Canlı Demo

Deploy tamamlandıktan sonra:
- Frontend: `https://[your-app].vercel.app`
- Backend API: `https://[your-api].onrender.com/api`
- Swagger: `https://[your-api].onrender.com/swagger` (Development mode'da)

## 🔄 Güncelleme

Kod güncellemeleri için:
```bash
git add .
git commit -m "Update message"
git push origin main
```

Hem Render hem Vercel otomatik olarak yeni deployment başlatacak.

## 💡 Alternatif Hosting Seçenekleri

### Backend Alternatifleri:
- **Railway**: Daha hızlı cold start, 500 saat/ay ücretsiz
- **Fly.io**: Global deployment, 3 küçük VM ücretsiz
- **Azure App Service**: F1 tier ücretsiz (60 CPU dakika/gün)

### Database Alternatifleri:
- **Supabase**: 500MB ücretsiz, kalıcı
- **Neon**: 3GB ücretsiz PostgreSQL
- **ElephantSQL**: 20MB ücretsiz (demo için yeterli)

### Frontend Alternatifleri:
- **Netlify**: Vercel benzeri, 100GB bandwidth
- **GitHub Pages**: Static export gerekir
- **Cloudflare Pages**: Sınırsız bandwidth