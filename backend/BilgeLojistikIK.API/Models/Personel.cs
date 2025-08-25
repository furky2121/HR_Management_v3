using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace BilgeLojistikIK.API.Models
{
    [Table("personeller")]
    public class Personel
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Required]
        [MaxLength(11)]
        [Column("tc_kimlik")]
        public string TcKimlik { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("ad")]
        public string Ad { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        [Column("soyad")]
        public string Soyad { get; set; } = string.Empty;

        [MaxLength(100)]
        [Column("email")]
        public string? Email { get; set; }

        [MaxLength(20)]
        [Column("telefon")]
        public string? Telefon { get; set; }

        [Column("dogum_tarihi")]
        public DateTime? DogumTarihi { get; set; }

        [Required]
        [Column("ise_baslama_tarihi")]
        public DateTime IseBaslamaTarihi { get; set; }

        [Column("cikis_tarihi")]
        public DateTime? CikisTarihi { get; set; }

        [Column("pozisyon_id")]
        public int PozisyonId { get; set; }

        [Column("yonetici_id")]
        public int? YoneticiId { get; set; }

        [Column("maas", TypeName = "decimal(10,2)")]
        public decimal? Maas { get; set; }

        [MaxLength(255)]
        [Column("fotograf_url")]
        public string? FotografUrl { get; set; }

        [Column("adres")]
        public string? Adres { get; set; }

        [Column("aktif")]
        public bool Aktif { get; set; } = true;

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Column("updated_at")]
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        [ForeignKey("PozisyonId")]
        public virtual Pozisyon Pozisyon { get; set; } = null!;

        [ForeignKey("YoneticiId")]
        public virtual Personel? Yonetici { get; set; }

        public virtual ICollection<Personel> AltCalisanlar { get; set; } = new List<Personel>();
        
        public virtual Kullanici? Kullanici { get; set; }

        public virtual ICollection<IzinTalebi> IzinTalepleri { get; set; } = new List<IzinTalebi>();
        
        public virtual ICollection<IzinTalebi> OnayladigiIzinler { get; set; } = new List<IzinTalebi>();

        public virtual ICollection<PersonelEgitimi> PersonelEgitimleri { get; set; } = new List<PersonelEgitimi>();
    }
}