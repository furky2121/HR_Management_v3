using Microsoft.EntityFrameworkCore;
using BilgeLojistikIK.API.Models;

namespace BilgeLojistikIK.API.Data
{
    public class BilgeLojistikIKContext : DbContext
    {
        public BilgeLojistikIKContext(DbContextOptions<BilgeLojistikIKContext> options) : base(options)
        {
        }

        public DbSet<Kademe> Kademeler { get; set; }
        public DbSet<Departman> Departmanlar { get; set; }
        public DbSet<Pozisyon> Pozisyonlar { get; set; }
        public DbSet<Personel> Personeller { get; set; }
        public DbSet<Kullanici> Kullanicilar { get; set; }
        public DbSet<IzinTalebi> IzinTalepleri { get; set; }
        public DbSet<Egitim> Egitimler { get; set; }
        public DbSet<PersonelEgitimi> PersonelEgitimleri { get; set; }
        public DbSet<EkranYetkisi> EkranYetkileri { get; set; }
        public DbSet<KademeEkranYetkisi> KademeEkranYetkileri { get; set; }
        public DbSet<Zimmet> Zimmetler { get; set; }
        public DbSet<ZimmetStok> ZimmetStoklar { get; set; }
        public DbSet<ZimmetMalzeme> ZimmetMalzemeleri { get; set; }
        public DbSet<PersonelZimmet> PersonelZimmetler { get; set; }
        public DbSet<ZimmetStokDosya> ZimmetStokDosyalar { get; set; }
        public DbSet<AvansTalebi> AvansTalepleri { get; set; }
        public DbSet<MasrafTalebi> MasrafTalepleri { get; set; }
        public DbSet<IstifaTalebi> IstifaTalepleri { get; set; }
        
        // Video Eğitim Tabloları
        public DbSet<VideoKategori> VideoKategoriler { get; set; }
        public DbSet<VideoEgitim> VideoEgitimler { get; set; }
        public DbSet<VideoAtama> VideoAtamalar { get; set; }
        public DbSet<VideoIzleme> VideoIzlemeler { get; set; }
        public DbSet<VideoYorum> VideoYorumlar { get; set; }
        public DbSet<VideoSoru> VideoSorular { get; set; }
        public DbSet<VideoSoruCevap> VideoSoruCevaplar { get; set; }
        public DbSet<VideoSertifika> VideoSertifikalar { get; set; }
        public DbSet<PersonelGirisCikis> PersonelGirisCikislar { get; set; }

        // İşe Alım Tabloları
        public DbSet<IlanKategori> IlanKategoriler { get; set; }
        public DbSet<IsIlani> IsIlanlari { get; set; }
        public DbSet<Aday> Adaylar { get; set; }
        public DbSet<AdayDeneyim> AdayDeneyimleri { get; set; }
        public DbSet<AdayYetenek> AdayYetenekleri { get; set; }
        public DbSet<AdayCV> AdayCVleri { get; set; }
        public DbSet<AdayDurumGecmisi> AdayDurumGecmisleri { get; set; }
        public DbSet<AdayEgitim> AdayEgitimleri { get; set; }
        public DbSet<AdaySertifika> AdaySertifikalari { get; set; }
        public DbSet<AdayReferans> AdayReferanslari { get; set; }
        public DbSet<AdayDil> AdayDilleri { get; set; }
        public DbSet<AdayProje> AdayProjeleri { get; set; }
        public DbSet<AdayHobi> AdayHobileri { get; set; }
        public DbSet<Basvuru> Basvurular { get; set; }
        public DbSet<Mulakat> Mulakatlar { get; set; }
        public DbSet<TeklifMektubu> TeklifMektuplari { get; set; }

        // Şehirler tablosu
        public DbSet<Sehir> Sehirler { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Unique constraints
            modelBuilder.Entity<Kademe>()
                .HasIndex(k => k.Ad)
                .IsUnique();

            modelBuilder.Entity<Kademe>()
                .HasIndex(k => k.Seviye)
                .IsUnique();

            modelBuilder.Entity<Departman>()
                .HasIndex(d => d.Ad)
                .IsUnique();

            modelBuilder.Entity<Departman>()
                .HasIndex(d => d.Kod)
                .IsUnique();

            modelBuilder.Entity<Pozisyon>()
                .HasIndex(p => new { p.Ad, p.DepartmanId, p.KademeId })
                .IsUnique();

            modelBuilder.Entity<Personel>()
                .HasIndex(p => p.TcKimlik)
                .IsUnique();

            modelBuilder.Entity<Personel>()
                .HasIndex(p => p.Email)
                .IsUnique();

            modelBuilder.Entity<Kullanici>()
                .HasIndex(k => k.PersonelId)
                .IsUnique();

            modelBuilder.Entity<Kullanici>()
                .HasIndex(k => k.KullaniciAdi)
                .IsUnique();

            // Relationships
            modelBuilder.Entity<Pozisyon>()
                .HasOne(p => p.Departman)
                .WithMany(d => d.Pozisyonlar)
                .HasForeignKey(p => p.DepartmanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Pozisyon>()
                .HasOne(p => p.Kademe)
                .WithMany(k => k.Pozisyonlar)
                .HasForeignKey(p => p.KademeId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Personel>()
                .HasOne(p => p.Pozisyon)
                .WithMany(pos => pos.Personeller)
                .HasForeignKey(p => p.PozisyonId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Personel>()
                .HasOne(p => p.Yonetici)
                .WithMany(y => y.AltCalisanlar)
                .HasForeignKey(p => p.YoneticiId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Kullanici>()
                .HasOne(k => k.Personel)
                .WithOne(p => p.Kullanici)
                .HasForeignKey<Kullanici>(k => k.PersonelId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<IzinTalebi>()
                .HasOne(i => i.Personel)
                .WithMany(p => p.IzinTalepleri)
                .HasForeignKey(i => i.PersonelId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<IzinTalebi>()
                .HasOne(i => i.Onaylayan)
                .WithMany(p => p.OnayladigiIzinler)
                .HasForeignKey(i => i.OnaylayanId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PersonelEgitimi>()
                .HasOne(pe => pe.Personel)
                .WithMany(p => p.PersonelEgitimleri)
                .HasForeignKey(pe => pe.PersonelId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PersonelEgitimi>()
                .HasOne(pe => pe.Egitim)
                .WithMany(e => e.PersonelEgitimleri)
                .HasForeignKey(pe => pe.EgitimId)
                .OnDelete(DeleteBehavior.Cascade);


            // Permission model constraints
            modelBuilder.Entity<EkranYetkisi>()
                .HasIndex(e => e.EkranKodu)
                .IsUnique();

            modelBuilder.Entity<KademeEkranYetkisi>()
                .HasIndex(k => new { k.KademeId, k.EkranYetkisiId })
                .IsUnique();

            // Permission model relationships
            modelBuilder.Entity<KademeEkranYetkisi>()
                .HasOne(k => k.Kademe)
                .WithMany()
                .HasForeignKey(k => k.KademeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<KademeEkranYetkisi>()
                .HasOne(k => k.EkranYetkisi)
                .WithMany(e => e.KademeYetkileri)
                .HasForeignKey(k => k.EkranYetkisiId)
                .OnDelete(DeleteBehavior.Cascade);

            // Zimmet relationships
            modelBuilder.Entity<Zimmet>()
                .HasOne(z => z.Personel)
                .WithMany()
                .HasForeignKey(z => z.PersonelId)
                .OnDelete(DeleteBehavior.Restrict);

            // ZimmetStok relationships
            modelBuilder.Entity<ZimmetStok>()
                .HasOne(zs => zs.Onaylayan)
                .WithMany()
                .HasForeignKey(zs => zs.OnaylayanId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<ZimmetStok>()
                .HasOne(zs => zs.Olusturan)
                .WithMany()
                .HasForeignKey(zs => zs.OlusturanId)
                .OnDelete(DeleteBehavior.SetNull);

            // ZimmetMalzeme relationships
            modelBuilder.Entity<ZimmetMalzeme>()
                .HasOne(zm => zm.Zimmet)
                .WithMany()
                .HasForeignKey(zm => zm.ZimmetId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ZimmetMalzeme>()
                .HasOne(zm => zm.ZimmetStok)
                .WithMany()
                .HasForeignKey(zm => zm.ZimmetStokId)
                .OnDelete(DeleteBehavior.Restrict);

            // PersonelZimmet relationships
            modelBuilder.Entity<PersonelZimmet>()
                .HasOne(pz => pz.Personel)
                .WithMany()
                .HasForeignKey(pz => pz.PersonelId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PersonelZimmet>()
                .HasOne(pz => pz.ZimmetStok)
                .WithMany()
                .HasForeignKey(pz => pz.ZimmetStokId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PersonelZimmet>()
                .HasOne(pz => pz.ZimmetVeren)
                .WithMany()
                .HasForeignKey(pz => pz.ZimmetVerenId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<PersonelZimmet>()
                .HasOne(pz => pz.IadeAlan)
                .WithMany()
                .HasForeignKey(pz => pz.IadeAlanId)
                .OnDelete(DeleteBehavior.SetNull);

            // Check constraints (PostgreSQL specific)
            modelBuilder.Entity<IzinTalebi>()
                .ToTable(t => t.HasCheckConstraint("CK_IzinTalebi_Durum", "durum IN ('Beklemede', 'Onaylandı', 'Reddedildi')"));

            modelBuilder.Entity<ZimmetStok>()
                .ToTable(t => t.HasCheckConstraint("CK_ZimmetStok_OnayDurumu", "onay_durumu IN ('Bekliyor', 'Onaylandi', 'Reddedildi')"));

            modelBuilder.Entity<PersonelZimmet>()
                .ToTable(t => t.HasCheckConstraint("CK_PersonelZimmet_Durum", "durum IN ('Zimmetli', 'Iade Edildi')"));

            // PersonelGirisCikis relationships
            modelBuilder.Entity<PersonelGirisCikis>()
                .HasOne(pgc => pgc.Personel)
                .WithMany()
                .HasForeignKey(pgc => pgc.PersonelId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PersonelGirisCikis>()
                .HasIndex(pgc => pgc.PersonelId);

            modelBuilder.Entity<PersonelGirisCikis>()
                .ToTable(t => t.HasCheckConstraint("CK_PersonelGirisCikis_GirisTipi", "giris_tipi IN ('Normal', 'Fazla Mesai', 'Hafta Sonu')"));

            // İşe Alım relationships
            modelBuilder.Entity<IlanKategori>()
                .HasIndex(ik => ik.Ad)
                .IsUnique();

            modelBuilder.Entity<Aday>()
                .HasIndex(a => a.TcKimlik)
                .IsUnique();

            modelBuilder.Entity<Aday>()
                .HasIndex(a => a.Email)
                .IsUnique();

            modelBuilder.Entity<IsIlani>()
                .HasOne(i => i.Kategori)
                .WithMany(k => k.IsIlanlari)
                .HasForeignKey(i => i.KategoriId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<IsIlani>()
                .HasOne(i => i.Pozisyon)
                .WithMany()
                .HasForeignKey(i => i.PozisyonId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<IsIlani>()
                .HasOne(i => i.Departman)
                .WithMany()
                .HasForeignKey(i => i.DepartmanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<IsIlani>()
                .HasOne(i => i.Olusturan)
                .WithMany()
                .HasForeignKey(i => i.OlusturanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<AdayDeneyim>()
                .HasOne(ad => ad.Aday)
                .WithMany(a => a.Deneyimler)
                .HasForeignKey(ad => ad.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayYetenek>()
                .HasOne(ay => ay.Aday)
                .WithMany(a => a.Yetenekler)
                .HasForeignKey(ay => ay.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayCV>()
                .HasOne(ac => ac.Aday)
                .WithMany(a => a.CVler)
                .HasForeignKey(ac => ac.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayDurumGecmisi>()
                .HasOne(adg => adg.Aday)
                .WithMany(a => a.DurumGecmisi)
                .HasForeignKey(adg => adg.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayDurumGecmisi>()
                .HasOne(adg => adg.DegistirenPersonel)
                .WithMany()
                .HasForeignKey(adg => adg.DegistirenPersonelId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AdayDurumGecmisi>()
                .HasOne(adg => adg.IlgiliBasvuru)
                .WithMany()
                .HasForeignKey(adg => adg.IlgiliBasvuruId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AdayDurumGecmisi>()
                .HasOne(adg => adg.IlgiliMulakat)
                .WithMany()
                .HasForeignKey(adg => adg.IlgiliMulakatId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Basvuru>()
                .HasOne(b => b.Ilan)
                .WithMany(i => i.Basvurular)
                .HasForeignKey(b => b.IlanId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Basvuru>()
                .HasOne(b => b.Aday)
                .WithMany(a => a.Basvurular)
                .HasForeignKey(b => b.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Basvuru>()
                .HasOne(b => b.Degerlendiren)
                .WithMany()
                .HasForeignKey(b => b.DegerlendirenId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Mulakat>()
                .HasOne(m => m.Basvuru)
                .WithMany(b => b.Mulakatlar)
                .HasForeignKey(m => m.BasvuruId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Mulakat>()
                .HasOne(m => m.MulakatYapan)
                .WithMany()
                .HasForeignKey(m => m.MulakatYapanId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<TeklifMektubu>()
                .HasOne(t => t.Basvuru)
                .WithMany()
                .HasForeignKey(t => t.BasvuruId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TeklifMektubu>()
                .HasOne(t => t.Hazirlayan)
                .WithMany()
                .HasForeignKey(t => t.HazirlayanId)
                .OnDelete(DeleteBehavior.Restrict);

            // İşe Alım check constraints
            modelBuilder.Entity<IsIlani>()
                .ToTable(t => t.HasCheckConstraint("CK_IsIlani_Durum", "durum IN (1, 2, 3, 4)"));

            modelBuilder.Entity<Aday>()
                .ToTable(t => t.HasCheckConstraint("CK_Aday_Durum", "durum IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13)"));

            modelBuilder.Entity<Basvuru>()
                .ToTable(t => t.HasCheckConstraint("CK_Basvuru_Durum", "durum IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)"));

            modelBuilder.Entity<Mulakat>()
                .ToTable(t => t.HasCheckConstraint("CK_Mulakat_Tur", "tur IN (1, 2, 3, 4, 5)"));

            modelBuilder.Entity<AdayCV>()
                .ToTable(t => t.HasCheckConstraint("CK_AdayCV_CVTipi", "cv_tipi IN ('Otomatik', 'Yuklenmiş')"));

            // Yeni Aday Entity Relationships
            modelBuilder.Entity<AdayEgitim>()
                .HasOne(ae => ae.Aday)
                .WithMany(a => a.Egitimler)
                .HasForeignKey(ae => ae.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdaySertifika>()
                .HasOne(s => s.Aday)
                .WithMany(a => a.Sertifikalar)
                .HasForeignKey(s => s.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayReferans>()
                .HasOne(ar => ar.Aday)
                .WithMany(a => a.Referanslar)
                .HasForeignKey(ar => ar.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayDil>()
                .HasOne(ad => ad.Aday)
                .WithMany(a => a.Diller)
                .HasForeignKey(ad => ad.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayProje>()
                .HasOne(ap => ap.Aday)
                .WithMany(a => a.Projeler)
                .HasForeignKey(ap => ap.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<AdayHobi>()
                .HasOne(ah => ah.Aday)
                .WithMany(a => a.Hobiler)
                .HasForeignKey(ah => ah.AdayId)
                .OnDelete(DeleteBehavior.Cascade);

            // Yeni validation constraints
            modelBuilder.Entity<AdayDil>()
                .ToTable(t => t.HasCheckConstraint("CK_AdayDil_Seviyeler", "okuma_seviyesi BETWEEN 1 AND 5 AND yazma_seviyesi BETWEEN 1 AND 5 AND konusma_seviyesi BETWEEN 1 AND 5"));

            // Şehir constraints
            modelBuilder.Entity<Sehir>()
                .HasIndex(s => s.SehirAd)
                .IsUnique();

            modelBuilder.Entity<Sehir>()
                .HasIndex(s => s.PlakaKodu)
                .IsUnique();

            // Aday DogumTarihi field - explicitly map as date type to prevent timezone issues
            modelBuilder.Entity<Aday>()
                .Property(a => a.DogumTarihi)
                .HasColumnType("date");
        }

        public override int SaveChanges()
        {
            UpdateTimestamps();
            return base.SaveChanges();
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateTimestamps();
            return base.SaveChangesAsync(cancellationToken);
        }

        private void UpdateTimestamps()
        {
            var entries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Added || e.State == EntityState.Modified);

            foreach (var entry in entries)
            {
                if (entry.Entity.GetType().GetProperty("UpdatedAt") != null)
                {
                    entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Added && entry.Entity.GetType().GetProperty("CreatedAt") != null)
                {
                    entry.Property("CreatedAt").CurrentValue = DateTime.UtcNow;
                }

                // Zimmet-specific timestamp handling
                if (entry.Entity.GetType().GetProperty("GuncellemeTarihi") != null)
                {
                    if (entry.State == EntityState.Modified)
                    {
                        entry.Property("GuncellemeTarihi").CurrentValue = DateTime.UtcNow;
                    }
                }

                if (entry.State == EntityState.Added && entry.Entity.GetType().GetProperty("OlusturmaTarihi") != null)
                {
                    entry.Property("OlusturmaTarihi").CurrentValue = DateTime.UtcNow;
                }

                if (entry.State == EntityState.Added && entry.Entity.GetType().GetProperty("ZimmetTarihi") != null)
                {
                    var currentValue = entry.Property("ZimmetTarihi").CurrentValue;
                    if (currentValue is DateTime dt && dt.Kind != DateTimeKind.Utc)
                    {
                        entry.Property("ZimmetTarihi").CurrentValue = DateTime.SpecifyKind(dt, DateTimeKind.Utc);
                    }
                }
            }
        }
    }
}