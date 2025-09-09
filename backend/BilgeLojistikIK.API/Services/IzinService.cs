using Microsoft.EntityFrameworkCore;
using BilgeLojistikIK.API.Data;
using BilgeLojistikIK.API.Models;

namespace BilgeLojistikIK.API.Services
{
    public class IzinService : IIzinService
    {
        private readonly BilgeLojistikIKContext _context;

        public IzinService(BilgeLojistikIKContext context)
        {
            _context = context;
        }

        public async Task<int> CalculateYillikIzinHakki(int personelId)
        {
            var personel = await _context.Personeller.FindAsync(personelId);
            if (personel == null) return 0;

            // İşe başlama tarihinden itibaren geçen tam yıl sayısı
            var calismaYili = DateTime.Now.Year - personel.IseBaslamaTarihi.Year;
            
            // Eğer bu yıl henüz işe başlama ayı geçmediyse bir yıl eksilir
            if (DateTime.Now.Month < personel.IseBaslamaTarihi.Month || 
                (DateTime.Now.Month == personel.IseBaslamaTarihi.Month && DateTime.Now.Day < personel.IseBaslamaTarihi.Day))
            {
                calismaYili--;
            }

            // Her yıl 14 gün izin hakkı (minimum 0)
            return Math.Max(0, calismaYili * 14);
        }

        public async Task<int> CalculateKullanilmisIzin(int personelId, int yil)
        {
            // Ücretsiz İzin ve Dış Görev bakiyeden düşülmez
            var kullanilmisIzin = await _context.IzinTalepleri
                .Where(i => i.PersonelId == personelId 
                    && i.Durum == "Onaylandı" 
                    && i.IzinBaslamaTarihi.Year == yil
                    && i.IzinTipi != "Ücretsiz İzin"
                    && i.IzinTipi != "Dış Görev")
                .SumAsync(i => i.GunSayisi);

            return kullanilmisIzin;
        }

        public async Task<int> CalculateKalanIzin(int personelId)
        {
            var toplamHak = await CalculateYillikIzinHakki(personelId);
            var kullanilmis = await CalculateKullanilmisIzin(personelId, DateTime.Now.Year);
            
            // Bekleyen izinleri de hesaba kat (Ücretsiz İzin ve Dış Görev hariç)
            var bekleyenIzin = await _context.IzinTalepleri
                .Where(i => i.PersonelId == personelId 
                    && i.Durum == "Beklemede" 
                    && i.IzinBaslamaTarihi.Year == DateTime.Now.Year
                    && i.IzinTipi != "Ücretsiz İzin"
                    && i.IzinTipi != "Dış Görev")
                .SumAsync(i => i.GunSayisi);

            return Math.Max(0, toplamHak - kullanilmis - bekleyenIzin);
        }

        public async Task<bool> CheckIzinCakismasi(int personelId, DateTime baslangic, DateTime bitis, int? excludeIzinId = null)
        {
            var query = _context.IzinTalepleri
                .Where(i => i.PersonelId == personelId 
                    && i.Durum != "Reddedildi"
                    && ((i.IzinBaslamaTarihi <= bitis && i.IsbasiTarihi >= baslangic)));

            if (excludeIzinId.HasValue)
            {
                query = query.Where(i => i.Id != excludeIzinId.Value);
            }

            return await query.AnyAsync();
        }

        public async Task<List<Personel>> GetOnaylamaYetkilisiOlanPersoneller(int talepEdenPersonelId)
        {
            var talepEdenPersonel = await _context.Personeller
                .Include(p => p.Pozisyon)
                    .ThenInclude(pos => pos.Kademe)
                .Include(p => p.Pozisyon)
                    .ThenInclude(pos => pos.Departman)
                .FirstOrDefaultAsync(p => p.Id == talepEdenPersonelId);

            if (talepEdenPersonel == null) return new List<Personel>();

            // Onaylama yetkisi olan personelleri bul
            var onaylayanlar = new List<Personel>();

            // 1. Genel Müdür (Seviye 1) - Herkesi onaylayabilir
            var genelMudur = await _context.Personeller
                .Include(p => p.Pozisyon)
                    .ThenInclude(pos => pos.Kademe)
                .Where(p => p.Pozisyon.Kademe.Seviye == 1 && p.Aktif)
                .ToListAsync();
            onaylayanlar.AddRange(genelMudur);

            // 2. Kendi yöneticisini ve üst yöneticilerini bul
            var currentPersonel = talepEdenPersonel;
            while (currentPersonel.YoneticiId.HasValue)
            {
                var yonetici = await _context.Personeller
                    .Include(p => p.Pozisyon)
                        .ThenInclude(pos => pos.Kademe)
                    .FirstOrDefaultAsync(p => p.Id == currentPersonel.YoneticiId && p.Aktif);

                if (yonetici != null)
                {
                    onaylayanlar.Add(yonetici);
                    currentPersonel = yonetici;
                }
                else
                {
                    break;
                }
            }

            // 3. Aynı departmandaki üst kademeli yöneticiler
            var departmanYoneticileri = await _context.Personeller
                .Include(p => p.Pozisyon)
                    .ThenInclude(pos => pos.Kademe)
                .Include(p => p.Pozisyon)
                    .ThenInclude(pos => pos.Departman)
                .Where(p => p.Pozisyon.DepartmanId == talepEdenPersonel.Pozisyon.DepartmanId
                    && p.Pozisyon.Kademe.Seviye <= 4 // Müdür ve üstü
                    && p.Pozisyon.Kademe.Seviye < talepEdenPersonel.Pozisyon.Kademe.Seviye
                    && p.Aktif
                    && p.Id != talepEdenPersonelId)
                .ToListAsync();
            
            onaylayanlar.AddRange(departmanYoneticileri);

            // Tekrarlananları kaldır
            return onaylayanlar.GroupBy(p => p.Id).Select(g => g.First()).ToList();
        }

        public async Task<bool> CanPersonelApproveIzin(int onaylayanPersonelId, int talepEdenPersonelId)
        {
            var onaylayanlar = await GetOnaylamaYetkilisiOlanPersoneller(talepEdenPersonelId);
            return onaylayanlar.Any(p => p.Id == onaylayanPersonelId);
        }

        public int CalculateGunSayisi(DateTime baslangic, DateTime bitis)
        {
            // Türkiye saat diliminde hesaplama yap (UTC+3)
            // Windows: "Turkey Standard Time", Linux: "Europe/Istanbul"  
            TimeZoneInfo turkeyTimeZone;
            try
            {
                turkeyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Turkey Standard Time");
            }
            catch
            {
                // Linux için fallback
                turkeyTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Europe/Istanbul");
            }
            
            // UTC tarihlerini Türkiye saatine çevir
            var baslangicTurkey = TimeZoneInfo.ConvertTimeFromUtc(baslangic, turkeyTimeZone);
            var bitisTurkey = TimeZoneInfo.ConvertTimeFromUtc(bitis, turkeyTimeZone);
            
            Console.WriteLine($"DEBUG CalculateGunSayisi: UTC Başlangıç={baslangic:yyyy-MM-dd HH:mm}, Türkiye={baslangicTurkey:yyyy-MM-dd HH:mm}");
            Console.WriteLine($"DEBUG CalculateGunSayisi: UTC Bitiş={bitis:yyyy-MM-dd HH:mm}, Türkiye={bitisTurkey:yyyy-MM-dd HH:mm}");
            
            // Türkiye saatindeki tarih kısımlarını kullan
            int gunSayisi = 0;
            var current = baslangicTurkey.Date;
            var bitisDate = bitisTurkey.Date;
            
            Console.WriteLine($"DEBUG CalculateGunSayisi: current.Date={current:yyyy-MM-dd}, bitis.Date={bitisDate:yyyy-MM-dd}");
            
            // Eğer başlangıç ve bitiş aynı günse (00:00 problemi için)
            if (current == bitisDate)
            {
                Console.WriteLine($"DEBUG CalculateGunSayisi: Aynı gün tespit edildi, minimum 1 gün atanıyor");
                // Hafta içi ise 1 gün, hafta sonu ise 0 gün
                if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
                {
                    return 1;
                }
                else
                {
                    return 0;
                }
            }
            
            while (current < bitisDate) // İşbaşı günü dahil değil
            {
                Console.WriteLine($"DEBUG CalculateGunSayisi: İşleniyor: {current:yyyy-MM-dd} ({current.DayOfWeek})");
                
                // Cumartesi (6) ve Pazar (0) hariç
                if (current.DayOfWeek != DayOfWeek.Saturday && current.DayOfWeek != DayOfWeek.Sunday)
                {
                    gunSayisi++;
                    Console.WriteLine($"DEBUG CalculateGunSayisi: İş günü eklendi, toplam: {gunSayisi}");
                }
                current = current.AddDays(1);
            }

            Console.WriteLine($"DEBUG CalculateGunSayisi: Sonuç: {gunSayisi} gün");
            return gunSayisi;
        }

        public async Task<Dictionary<string, object>> GetPersonelIzinOzeti(int personelId)
        {
            var toplamHak = await CalculateYillikIzinHakki(personelId);
            var kullanilmis = await CalculateKullanilmisIzin(personelId, DateTime.Now.Year);
            var bekleyen = await _context.IzinTalepleri
                .Where(i => i.PersonelId == personelId 
                    && i.Durum == "Beklemede" 
                    && i.IzinBaslamaTarihi.Year == DateTime.Now.Year)
                .SumAsync(i => i.GunSayisi);
            
            var kalan = Math.Max(0, toplamHak - kullanilmis - bekleyen);

            return new Dictionary<string, object>
            {
                {"toplamHak", toplamHak},
                {"kullanilmis", kullanilmis},
                {"bekleyen", bekleyen},
                {"kalan", kalan},
                {"yil", DateTime.Now.Year}
            };
        }
    }
}