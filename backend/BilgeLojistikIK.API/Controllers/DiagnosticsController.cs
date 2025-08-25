using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BilgeLojistikIK.API.Data;

namespace BilgeLojistikIK.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DiagnosticsController : ControllerBase
    {
        private readonly BilgeLojistikIKContext _context;
        private readonly IConfiguration _configuration;

        public DiagnosticsController(BilgeLojistikIKContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpGet("status")]
        public async Task<IActionResult> GetStatus()
        {
            var diagnostics = new
            {
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"),
                database = new
                {
                    canConnect = false,
                    tables = new List<string>(),
                    userCount = 0,
                    error = ""
                },
                jwt = new
                {
                    hasSecretKey = !string.IsNullOrEmpty(_configuration["JwtSettings:SecretKey"] ?? 
                                                          Environment.GetEnvironmentVariable("JwtSettings__SecretKey")),
                    issuer = _configuration["JwtSettings:Issuer"] ?? 
                            Environment.GetEnvironmentVariable("JwtSettings__Issuer"),
                    audience = _configuration["JwtSettings:Audience"] ?? 
                              Environment.GetEnvironmentVariable("JwtSettings__Audience")
                }
            };

            try
            {
                // Test database connection
                diagnostics.database.canConnect = await _context.Database.CanConnectAsync();
                
                if (diagnostics.database.canConnect)
                {
                    // Get list of tables
                    var tables = await _context.Database.ExecuteSqlRawAsync(
                        "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
                    
                    // Count users
                    diagnostics.database.userCount = await _context.Kullanicilar.CountAsync();
                }
            }
            catch (Exception ex)
            {
                diagnostics.database.error = ex.Message;
            }

            return Ok(diagnostics);
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedTestData()
        {
            try
            {
                // Check if data already exists
                if (await _context.Kullanicilar.AnyAsync())
                {
                    return Ok(new { message = "Database already has data" });
                }

                // Create test kademe
                var kademe = new Kademe
                {
                    Ad = "Genel Müdür",
                    Seviye = 1,
                    Aktif = true
                };
                _context.Kademeler.Add(kademe);
                await _context.SaveChangesAsync();

                // Create test departman
                var departman = new Departman
                {
                    Ad = "Bilgi İşlem",
                    Kod = "IT",
                    Aktif = true
                };
                _context.Departmanlar.Add(departman);
                await _context.SaveChangesAsync();

                // Create test pozisyon
                var pozisyon = new Pozisyon
                {
                    Ad = "IT Müdürü",
                    Kod = "IT001",
                    DepartmanId = departman.Id,
                    KademeId = kademe.Id,
                    Aktif = true
                };
                _context.Pozisyonlar.Add(pozisyon);
                await _context.SaveChangesAsync();

                // Create test personel
                var personel = new Personel
                {
                    Ad = "Test",
                    Soyad = "Kullanıcı",
                    TcKimlikNo = "12345678901",
                    SicilNo = "TEST001",
                    Email = "test@bilgelojistik.com",
                    Telefon = "5551234567",
                    DogumTarihi = new DateTime(1990, 1, 1),
                    IseGirisTarihi = DateTime.Now,
                    PozisyonId = pozisyon.Id,
                    Cinsiyet = "E",
                    MedeniDurum = "Bekar",
                    Aktif = true
                };
                _context.Personeller.Add(personel);
                await _context.SaveChangesAsync();

                // Create test user with password "test123"
                var kullanici = new Kullanici
                {
                    KullaniciAdi = "test",
                    Sifre = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3", // SHA256 of "123"
                    Email = "test@bilgelojistik.com",
                    PersonelId = personel.Id,
                    Aktif = true,
                    IlkGiris = false,
                    SonGirisTarihi = DateTime.Now
                };
                _context.Kullanicilar.Add(kullanici);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Test data created successfully",
                    credentials = new { username = "test", password = "123" }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { error = ex.Message, innerError = ex.InnerException?.Message });
            }
        }
    }
}