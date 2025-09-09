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