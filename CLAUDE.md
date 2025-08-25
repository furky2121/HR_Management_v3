# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BilgeLojistik İK Yönetim Sistemi v1.0 - Enterprise HR management system with:
- **Backend**: ASP.NET Core 8.0 Web API with Entity Framework Core and PostgreSQL
- **Frontend**: Next.js 13.4 with React 18 and PrimeReact UI components (Sakai Theme v10.1.0)
- **Database**: PostgreSQL with relational data model and sample data
- **Authentication**: JWT-based security with SHA256 password hashing

## Development Commands

### Backend (.NET Core API)
```bash
cd backend/BilgeLojistikIK.API
dotnet restore
dotnet build
dotnet run              # Runs on http://localhost:5146

# Entity Framework operations
dotnet ef migrations add [MigrationName]
dotnet ef database update

# Run tests (if available)
dotnet test
```

### Frontend (Next.js/React)
```bash
cd frontend
npm install
npm run dev            # Runs on http://localhost:3000
npm run build          # Production build
npm run lint           # ESLint check
npm run format         # Prettier formatting
```

### Database Setup
```bash
# Create database
psql -U postgres
CREATE DATABASE "BilgeLojistikIKdb";
\q

# Apply schema and sample data
psql -d BilgeLojistikIKdb -f backend/BilgeLojistikIK.API/SQL/BilgeLojistikIKdb_Setup.sql
```

## System Architecture

### Active/Passive Record Management Pattern
The system implements a dual-state record management approach:
- **Active/Passive Toggle**: Records can be marked as active or passive via `Aktif` field
- **Hard Delete**: Delete operations permanently remove records from database
- **Dual Endpoints**: 
  - Main endpoints (`/api/[entity]`) return all records for management pages
  - `/Aktif` endpoints (`/api/[entity]/Aktif`) return only active records for dropdowns
- **UI Pattern**: Management pages show both active and passive records with status indicators

### Entity Relationships
```
Kademe (1) → (N) Pozisyon
Departman (1) → (N) Pozisyon  
Pozisyon (1) → (N) Personel
Personel (1) → (1) Kullanici
Personel (1) → (N) IzinTalebi
Personel (N) → (M) Egitim (via PersonelEgitimi)
Personel (1) → (N) Bordro
```

### Backend Service Architecture

**Controllers with Raw JSON Parsing**:
- `PozisyonController`: Uses `System.Text.Json.JsonElement` for PUT/POST to handle extra display fields
- All controllers implement consistent response format: `{ success: bool, data: T, message: string }`

**Business Logic Services**:
- `UserService`: Handles authentication, Turkish character conversion for usernames
- `IzinService`: Multi-level leave approval workflow, working days calculation

**PostgreSQL Exception Handling**:
- Unique constraint violations (23505) are caught and handled with user-friendly messages
- Controllers check related records before allowing deletion

### Frontend Service Layer

All API calls go through service classes in `src/services/`:
- Base `ApiService` class handles authentication headers and error responses
- Each entity has its own service (e.g., `departmanService`, `kademeService`)
- Services now include both standard and `/Aktif` endpoint methods

### Authentication Flow
1. User logs in with username/password
2. Backend validates against SHA256 hashed password
3. JWT token generated with 8-hour expiration
4. Frontend stores token and includes in all API requests
5. Username generation: "Özcan Gülüş" → "ozcan.gulus"


## Critical Business Rules

### Leave Management
- Annual allocation: `(CurrentYear - StartYear) × 14 days`
- Weekends excluded from leave day calculations
- Multi-level approval: Employee → Manager → Director → General Manager
- Database constraints prevent overlapping leave dates

### Payroll Calculations
- SGK deduction: 14% of gross salary
- Tax calculation: Progressive brackets (15%-35%)
- Net salary: `GrossSalary - SGK - Tax`
- Unique constraint on (PersonelId, Year, Month)

### Training Management
- Capacity enforcement via `MaxKatilimci` field
- Score range: 1-100 points
- Status workflow: Planned → Active → Completed

## Recent System Changes

### Aktif/Pasif Kayıt Yönetimi (Güncel Durum)
- **Departman**: ✅ Aktif/pasif geçiş ile tam CRUD işlemleri
- **Kademe**: ✅ Aktif/pasif geçiş ile tam CRUD işlemleri tamamlandı
- **Pozisyon**: ⏳ Aktif/pasif implementasyonu bekliyor
- Tüm dropdown'lar sadece aktif kayıtları göstermek için `/Aktif` endpoint'lerini kullanmalı

### Yetki Yönetim Sistemi (YENİ EKLENEN)
- **EkranYetkisi**: Benzersiz kodlarla ekran yetki tanımları (dashboard, personeller, vb.)
- **KademeEkranYetkisi**: Her kademe için her ekranda CRUD yetkilerini içeren rol bazlı yetki matrisi
- **YetkiController**: Ekran yetkileri ve kademe-ekran atamalarını için tam CRUD API
- **Ayarlar Sayfası**: Yetki yönetimi için sekmeli arayüz ile ayarlar sayfası
- **Varsayılan Yetkiler**: Kademe hiyerarşisine göre otomatik yetki matrisi oluşturma
- **Migration**: `20250809171251_AddScreenPermissions` yetki tablolarını ekledi

### JSON Model Binding Düzeltmesi
Controller'lar artık frontend görüntü alanlarını (örn. `departmanAd`, `kademeAd`) doğrudan model binding yerine raw JSON ayrıştırma kullanarak işliyor.

## Configuration

### Backend Settings
- Connection string in `appsettings.json`: PostgreSQL on localhost:5432
- JWT settings: 8-hour token expiration
- CORS enabled for `http://localhost:3000`

### Frontend Configuration
- API base URL: `http://localhost:5146/api` (configured in `src/services/api.js`)
- PrimeReact Sakai theme v10.1.0
- Next.js 13.4 with app directory structure

## Demo Hesapları
- **Genel Müdür**: `ahmet.yilmaz` / `8901` (Tüm yetkilere sahip)
- **İK Direktörü**: `mehmet.kaya` / `8902` (İK modüllerine tam erişim)
- **BIT Direktörü**: `ali.demir` / `8903` (BIT departmanı yönetimi)
- **İK Uzmanı**: `ozcan.bulut` / `8912` (Kısıtlı İK işlemleri)

## Dosya Yükleme Yolları
- Personel fotoğrafları: `wwwroot/uploads/avatars/`
- Statik dosya servisi `Program.cs` içinde yapılandırıldı
- 10MB dosya boyutu sınırı

## Test Yaklaşımı
CRUD işlemlerini test ederken:
1. Yönetim sayfalarında hem aktif hem pasif kayıtların göründüğünü doğrula
2. Dropdown'larda sadece aktif kayıtların göründüğünü kontrol et
3. Kalıcı silme işleminin kayıtları tamamen kaldırdığını test et
4. Benzersiz kısıtlamaları doğrula (departman kodu, kademe seviyesi, vb.)
5. Cascade silme kısıtlamalarını kontrol et

## Yeni Eklenen Özellikler

### Yetki Yönetim Sistemi
- Ekran bazlı yetki tanımları (EkranYetkisi tablosu)
- Kademe bazlı CRUD yetkileri (KademeEkranYetkisi tablosu)
- Ayarlar sayfasında yetki matrisi yönetimi
- Varsayılan yetki ataması: Üst kademeler daha fazla yetkiye sahip
- Soft delete ile yetki durumu yönetimi