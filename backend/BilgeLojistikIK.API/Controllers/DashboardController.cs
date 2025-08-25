using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BilgeLojistikIK.API.Data;

namespace BilgeLojistikIK.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        private readonly BilgeLojistikIKContext _context;

        public DashboardController(BilgeLojistikIKContext context)
        {
            _context = context;
        }

        // GET: api/Dashboard/Genel
        [HttpGet("Genel")]
        public async Task<ActionResult<object>> GetGenelIstatistikler()
        {
            try
            {
                var bugun = DateTime.UtcNow.Date;
                var buAy = bugun.Month;
                var buYil = bugun.Year;

                // Personel İstatistikleri
                var personelSayilari = await _context.Personeller
                    .GroupBy(p => p.Aktif)
                    .Select(g => new { Aktif = g.Key, Sayi = g.Count() })
                    .ToListAsync();

                var toplamPersonel = personelSayilari.Sum(p => p.Sayi);
                var aktifPersonel = personelSayilari.Where(p => p.Aktif).Sum(p => p.Sayi);
                var pasifPersonel = personelSayilari.Where(p => !p.Aktif).Sum(p => p.Sayi);

                // Departman Dağılımı
                var departmanDagilimi = await _context.Personeller
                    .Include(p => p.Pozisyon)
                        .ThenInclude(pos => pos.Departman)
                    .Where(p => p.Aktif)
                    .GroupBy(p => p.Pozisyon.Departman.Ad)
                    .Select(g => new { Departman = g.Key, PersonelSayisi = g.Count() })
                    .OrderByDescending(d => d.PersonelSayisi)
                    .ToListAsync();

                // Kademe Dağılımı
                var kademeDagilimi = await _context.Personeller
                    .Include(p => p.Pozisyon)
                        .ThenInclude(pos => pos.Kademe)
                    .Where(p => p.Aktif)
                    .GroupBy(p => p.Pozisyon.Kademe.Ad)
                    .Select(g => new { Kademe = g.Key, PersonelSayisi = g.Count() })
                    .OrderByDescending(k => k.PersonelSayisi)
                    .ToListAsync();

                // Bu Ay İzin İstatistikleri
                var izinIstatistikleri = await _context.IzinTalepleri
                    .Where(i => i.IzinBaslamaTarihi.Month == buAy && i.IzinBaslamaTarihi.Year == buYil)
                    .GroupBy(i => i.Durum)
                    .Select(g => new { Durum = g.Key, Sayi = g.Count() })
                    .ToListAsync();

                var toplamIzin = izinIstatistikleri.Sum(i => i.Sayi);
                var bekleyenIzin = izinIstatistikleri.Where(i => i.Durum == "Beklemede").Sum(i => i.Sayi);
                var onaylananIzin = izinIstatistikleri.Where(i => i.Durum == "Onaylandı").Sum(i => i.Sayi);

                // Eğitim İstatistikleri
                var egitimIstatistikleri = await _context.Egitimler
                    .Where(e => e.BaslangicTarihi.Month == buAy && e.BaslangicTarihi.Year == buYil)
                    .GroupBy(e => e.Durum)
                    .Select(g => new { Durum = g.Key, Sayi = g.Count() })
                    .ToListAsync();

                var toplamEgitim = egitimIstatistikleri.Sum(e => e.Sayi);
                var devamEdenEgitim = egitimIstatistikleri.Where(e => e.Durum == "Devam Ediyor").Sum(e => e.Sayi);

                // Bu Ay Bordro İstatistikleri - Bordro modülü kaldırıldı
                var bordroIstatistikleri = new
                {
                    ToplamBordro = 0,
                    ToplamBrutMaas = 0m,
                    ToplamNetMaas = 0m,
                    OrtalamaMaas = 0m
                };

                // Yeni Başlayan Personeller (Son 30 gün)
                var son30Gun = bugun.AddDays(-30);
                var yeniPersoneller = await _context.Personeller
                    .Where(p => p.IseBaslamaTarihi >= son30Gun && p.Aktif)
                    .CountAsync();

                // Çıkan Personeller (Son 30 gün)
                var cikanPersoneller = await _context.Personeller
                    .Where(p => p.CikisTarihi >= son30Gun && p.CikisTarihi <= bugun)
                    .CountAsync();

                var genelIstatistikler = new
                {
                    PersonelIstatistikleri = new
                    {
                        ToplamPersonel = toplamPersonel,
                        AktifPersonel = aktifPersonel,
                        PasifPersonel = pasifPersonel,
                        YeniPersonel = yeniPersoneller,
                        CikanPersonel = cikanPersoneller
                    },
                    IzinIstatistikleri = new
                    {
                        ToplamIzinTalebi = toplamIzin,
                        BekleyenIzin = bekleyenIzin,
                        OnaylananIzin = onaylananIzin,
                        ReddedilenIzin = izinIstatistikleri.Where(i => i.Durum == "Reddedildi").Sum(i => i.Sayi)
                    },
                    EgitimIstatistikleri = new
                    {
                        BuAyToplamEgitim = toplamEgitim,
                        DevamEdenEgitim = devamEdenEgitim,
                        PlanlananEgitim = egitimIstatistikleri.Where(e => e.Durum == "Planlandı").Sum(e => e.Sayi),
                        TamamlananEgitim = egitimIstatistikleri.Where(e => e.Durum == "Tamamlandı").Sum(e => e.Sayi)
                    },
                    MaasIstatistikleri = new
                    {
                        BuAyBordroSayisi = bordroIstatistikleri?.ToplamBordro ?? 0,
                        ToplamBrutMaas = bordroIstatistikleri?.ToplamBrutMaas ?? 0,
                        ToplamNetMaas = bordroIstatistikleri?.ToplamNetMaas ?? 0,
                        OrtalamaMaas = bordroIstatistikleri?.OrtalamaMaas ?? 0
                    },
                    DepartmanDagilimi = departmanDagilimi,
                    KademeDagilimi = kademeDagilimi
                };

                return Ok(new { success = true, data = genelIstatistikler, message = "Genel istatistikler başarıyla getirildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Genel istatistikler getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        // GET: api/Dashboard/PersonelTrend
        [HttpGet("PersonelTrend")]
        public async Task<ActionResult<object>> GetPersonelTrend([FromQuery] int aylikMi = 12)
        {
            try
            {
                var bugun = DateTime.UtcNow.Date;
                var baslangicTarihi = aylikMi == 12 ? bugun.AddMonths(-11) : bugun.AddDays(-aylikMi + 1);
                
                List<object> trendData;
                
                if (aylikMi == 12)
                {
                    // Aylık trend
                    var rawData = await _context.Personeller
                        .Where(p => p.IseBaslamaTarihi >= baslangicTarihi)
                        .GroupBy(p => new { Yil = p.IseBaslamaTarihi.Year, Ay = p.IseBaslamaTarihi.Month })
                        .Select(g => new
                        {
                            Yil = g.Key.Yil,
                            Ay = g.Key.Ay,
                            YeniPersonel = g.Count()
                        })
                        .ToListAsync();

                    trendData = new List<object>();
                    foreach (var item in rawData.OrderBy(x => x.Yil).ThenBy(x => x.Ay))
                    {
                        var cikanPersonel = await _context.Personeller
                            .Where(cp => cp.CikisTarihi.HasValue && 
                                       cp.CikisTarihi.Value.Year == item.Yil && 
                                       cp.CikisTarihi.Value.Month == item.Ay)
                            .CountAsync();

                        trendData.Add(new
                        {
                            Donem = $"{item.Yil}-{item.Ay:D2}",
                            YeniPersonel = item.YeniPersonel,
                            CikanPersonel = cikanPersonel
                        });
                    }
                }
                else
                {
                    // Günlük trend
                    var gunlukData = new List<object>();
                    for (int i = 0; i < aylikMi; i++)
                    {
                        var tarih = bugun.AddDays(-aylikMi + 1 + i);
                        var yeniPersonel = await _context.Personeller
                            .Where(p => p.IseBaslamaTarihi.Date == tarih)
                            .CountAsync();
                        var cikanPersonel = await _context.Personeller
                            .Where(p => p.CikisTarihi.HasValue && p.CikisTarihi.Value.Date == tarih)
                            .CountAsync();

                        gunlukData.Add(new
                        {
                            Donem = tarih.ToString("yyyy-MM-dd"),
                            YeniPersonel = yeniPersonel,
                            CikanPersonel = cikanPersonel
                        });
                    }
                    trendData = gunlukData;
                }

                return Ok(new { success = true, data = trendData, message = "Personel trend verileri başarıyla getirildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Personel trend verileri getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        // GET: api/Dashboard/IzinTrend
        [HttpGet("IzinTrend")]
        public async Task<ActionResult<object>> GetIzinTrend([FromQuery] int aylikMi = 6)
        {
            try
            {
                var bugun = DateTime.UtcNow.Date;
                var baslangicTarihi = bugun.AddMonths(-aylikMi + 1);

                var rawIzinData = await _context.IzinTalepleri
                    .Where(i => i.CreatedAt >= baslangicTarihi)
                    .GroupBy(i => new { Yil = i.CreatedAt.Year, Ay = i.CreatedAt.Month })
                    .Select(g => new
                    {
                        Yil = g.Key.Yil,
                        Ay = g.Key.Ay,
                        ToplamTalepSayisi = g.Count(),
                        OnaylananSayisi = g.Where(i => i.Durum == "Onaylandı").Count(),
                        ReddedilenSayisi = g.Where(i => i.Durum == "Reddedildi").Count(),
                        BekleyenSayisi = g.Where(i => i.Durum == "Beklemede").Count(),
                        ToplamGunSayisi = g.Where(i => i.Durum == "Onaylandı").Sum(i => i.GunSayisi)
                    })
                    .ToListAsync();

                var izinTrend = rawIzinData
                    .OrderBy(x => x.Yil).ThenBy(x => x.Ay)
                    .Select(x => new
                    {
                        Donem = $"{GetAyAdi(x.Ay)} {x.Yil}",
                        ToplamTalepSayisi = x.ToplamTalepSayisi,
                        OnaylananSayisi = x.OnaylananSayisi,
                        ReddedilenSayisi = x.ReddedilenSayisi,
                        BekleyenSayisi = x.BekleyenSayisi,
                        ToplamGunSayisi = x.ToplamGunSayisi,
                        OnayOrani = x.ToplamTalepSayisi > 0 ? (double)x.OnaylananSayisi / x.ToplamTalepSayisi * 100 : 0
                    })
                    .ToList();

                return Ok(new { success = true, data = izinTrend, message = "İzin trend verileri başarıyla getirildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "İzin trend verileri getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        // GET: api/Dashboard/EgitimAnaliz
        [HttpGet("EgitimAnaliz")]
        public async Task<ActionResult<object>> GetEgitimAnaliz()
        {
            try
            {
                var bugun = DateTime.UtcNow.Date;
                var buYil = bugun.Year;

                // Bu yılın eğitim analizi
                var egitimAnalizi = await _context.Egitimler
                    .Where(e => e.BaslangicTarihi.Year == buYil)
                    .GroupBy(e => 1)
                    .Select(g => new
                    {
                        ToplamEgitimSayisi = g.Count(),
                        TamamlananEgitimSayisi = g.Where(e => e.Durum == "Tamamlandı").Count(),
                        DevamEdenEgitimSayisi = g.Where(e => e.Durum == "Devam Ediyor").Count(),
                        PlanlananEgitimSayisi = g.Where(e => e.Durum == "Planlandı").Count(),
                        ToplamKatilimciSayisi = g.SelectMany(e => e.PersonelEgitimleri).Count(),
                        BasariliKatilimciSayisi = g.SelectMany(e => e.PersonelEgitimleri)
                                                   .Where(pe => pe.KatilimDurumu == "Tamamladı").Count(),
                        OrtalamaPuan = g.SelectMany(e => e.PersonelEgitimleri)
                                       .Where(pe => pe.Puan.HasValue)
                                       .Average(pe => (double?)pe.Puan) ?? 0
                    })
                    .FirstOrDefaultAsync();

                // Departmana göre eğitim katılımı
                var departmanKatilimi = await _context.PersonelEgitimleri
                    .Include(pe => pe.Personel)
                        .ThenInclude(p => p.Pozisyon)
                            .ThenInclude(pos => pos.Departman)
                    .Include(pe => pe.Egitim)
                    .Where(pe => pe.Egitim.BaslangicTarihi.Year == buYil)
                    .GroupBy(pe => pe.Personel.Pozisyon.Departman.Ad)
                    .Select(g => new
                    {
                        Departman = g.Key,
                        ToplamKatilim = g.Count(),
                        BasariliKatilim = g.Where(pe => pe.KatilimDurumu == "Tamamladı").Count(),
                        OrtalamaPuan = g.Where(pe => pe.Puan.HasValue).Average(pe => (double?)pe.Puan) ?? 0,
                        BasariOrani = g.Count() > 0 ? (double)g.Where(pe => pe.KatilimDurumu == "Tamamladı").Count() / g.Count() * 100 : 0
                    })
                    .OrderByDescending(d => d.ToplamKatilim)
                    .ToListAsync();

                // En popüler eğitimler
                var populerEgitimler = await _context.Egitimler
                    .Include(e => e.PersonelEgitimleri)
                    .Where(e => e.BaslangicTarihi.Year == buYil)
                    .Select(e => new
                    {
                        e.Baslik,
                        KatilimciSayisi = e.PersonelEgitimleri.Count(),
                        BasariliKatilimci = e.PersonelEgitimleri.Where(pe => pe.KatilimDurumu == "Tamamladı").Count(),
                        OrtalamaPuan = e.PersonelEgitimleri.Where(pe => pe.Puan.HasValue).Average(pe => (double?)pe.Puan) ?? 0,
                        e.Durum
                    })
                    .OrderByDescending(e => e.KatilimciSayisi)
                    .Take(10)
                    .ToListAsync();

                var egitimRaporu = new
                {
                    GenelAnaliz = egitimAnalizi ?? new
                    {
                        ToplamEgitimSayisi = 0,
                        TamamlananEgitimSayisi = 0,
                        DevamEdenEgitimSayisi = 0,
                        PlanlananEgitimSayisi = 0,
                        ToplamKatilimciSayisi = 0,
                        BasariliKatilimciSayisi = 0,
                        OrtalamaPuan = 0.0
                    },
                    DepartmanKatilimi = departmanKatilimi,
                    PopulerEgitimler = populerEgitimler,
                    BasariOrani = egitimAnalizi != null && egitimAnalizi.ToplamKatilimciSayisi > 0 
                        ? (double)egitimAnalizi.BasariliKatilimciSayisi / egitimAnalizi.ToplamKatilimciSayisi * 100 
                        : 0
                };

                return Ok(new { success = true, data = egitimRaporu, message = "Eğitim analiz verileri başarıyla getirildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Eğitim analiz verileri getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        // GET: api/Dashboard/MaasAnaliz
        [HttpGet("MaasAnaliz")]
        public async Task<ActionResult<object>> GetMaasAnaliz()
        {
            try
            {
                var bugun = DateTime.UtcNow.Date;
                var buYil = bugun.Year;

                // Departmana göre maaş analizi
                var departmanMaasAnalizi = await _context.Personeller
                    .Include(p => p.Pozisyon)
                        .ThenInclude(pos => pos.Departman)
                    .Where(p => p.Aktif && p.Maas.HasValue)
                    .GroupBy(p => p.Pozisyon.Departman.Ad)
                    .Select(g => new
                    {
                        Departman = g.Key,
                        PersonelSayisi = g.Count(),
                        OrtalamaMaas = g.Average(p => p.Maas!.Value),
                        MinMaas = g.Min(p => p.Maas!.Value),
                        MaxMaas = g.Max(p => p.Maas!.Value),
                        ToplamMaas = g.Sum(p => p.Maas!.Value)
                    })
                    .OrderByDescending(d => d.OrtalamaMaas)
                    .ToListAsync();

                // Kademeye göre maaş analizi
                var kademeMaasAnalizi = await _context.Personeller
                    .Include(p => p.Pozisyon)
                        .ThenInclude(pos => pos.Kademe)
                    .Where(p => p.Aktif && p.Maas.HasValue)
                    .GroupBy(p => new { p.Pozisyon.Kademe.Ad, p.Pozisyon.Kademe.Seviye })
                    .Select(g => new
                    {
                        Kademe = g.Key.Ad,
                        Seviye = g.Key.Seviye,
                        PersonelSayisi = g.Count(),
                        OrtalamaMaas = g.Average(p => p.Maas!.Value),
                        MinMaas = g.Min(p => p.Maas!.Value),
                        MaxMaas = g.Max(p => p.Maas!.Value)
                    })
                    .OrderBy(k => k.Seviye)
                    .ToListAsync();

                // Son 6 ayın maaş trend analizi (bordro verisi olmadığı için personel maaşlarından simüle ediyoruz)
                var son6AyBordroTrend = new List<object>();
                var aktifPersonelMaaslari = await _context.Personeller
                    .Where(p => p.Aktif && p.Maas.HasValue)
                    .ToListAsync();
                
                for (int i = 5; i >= 0; i--)
                {
                    var tarih = bugun.AddMonths(-i);
                    var ay = tarih.Month;
                    var yil = tarih.Year;

                    // Bordro modülü kaldırıldı - personel maaşlarından simüle et
                    {
                        var toplamBrut = aktifPersonelMaaslari.Sum(p => p.Maas!.Value);
                        var sgkKesinti = toplamBrut * 0.14m; // %14 SGK
                        var vergiKesinti = toplamBrut * 0.15m; // %15 ortalama vergi
                        var toplamNet = toplamBrut - sgkKesinti - vergiKesinti;
                        
                        son6AyBordroTrend.Add(new
                        {
                            Donem = $"{GetAyAdi(ay)} {yil}",
                            PersonelSayisi = aktifPersonelMaaslari.Count,
                            ToplamBrutMaas = toplamBrut,
                            ToplamNetMaas = toplamNet,
                            ToplamKesinti = sgkKesinti + vergiKesinti,
                            OrtalamaMaas = aktifPersonelMaaslari.Count > 0 ? toplamNet / aktifPersonelMaaslari.Count : 0m
                        });
                    }
                }

                var maasAnalizi = new
                {
                    DepartmanMaasAnalizi = departmanMaasAnalizi,
                    KademeMaasAnalizi = kademeMaasAnalizi,
                    BordroTrendAnalizi = son6AyBordroTrend,
                    GenelIstatistikler = new
                    {
                        ToplamAktifPersonel = await _context.Personeller.Where(p => p.Aktif).CountAsync(),
                        MaasiBelliPersonel = await _context.Personeller.Where(p => p.Aktif && p.Maas.HasValue).CountAsync(),
                        OrtalamaMaas = await _context.Personeller
                            .Where(p => p.Aktif && p.Maas.HasValue)
                            .AverageAsync(p => p.Maas!.Value),
                        EnYuksekMaas = await _context.Personeller
                            .Where(p => p.Aktif && p.Maas.HasValue)
                            .MaxAsync(p => p.Maas!.Value),
                        EnDusukMaas = await _context.Personeller
                            .Where(p => p.Aktif && p.Maas.HasValue)
                            .MinAsync(p => p.Maas!.Value)
                    }
                };

                return Ok(new { success = true, data = maasAnalizi, message = "Maaş analiz verileri başarıyla getirildi." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = "Maaş analiz verileri getirilirken bir hata oluştu.", error = ex.Message });
            }
        }

        private static string GetAyAdi(int ay)
        {
            var ayAdlari = new string[] { "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                                         "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık" };
            return ayAdlari[ay - 1];
        }
    }
}