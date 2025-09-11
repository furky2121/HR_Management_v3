using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using BilgeLojistikIK.API.Data;
using BilgeLojistikIK.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Circular reference handling
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.MaxDepth = 64;
        options.JsonSerializerOptions.DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            // Navigation property hatalarını filtrele
            var filteredErrors = context.ModelState
                .Where(x => !x.Key.Equals("Kademe", StringComparison.OrdinalIgnoreCase) && 
                           !x.Key.Equals("Departman", StringComparison.OrdinalIgnoreCase) &&
                           !x.Key.Equals("Pozisyonlar", StringComparison.OrdinalIgnoreCase) &&
                           !x.Key.Equals("Personeller", StringComparison.OrdinalIgnoreCase))
                .SelectMany(x => x.Value.Errors.Select(e => e.ErrorMessage))
                .ToList();
            
            var response = new
            {
                success = false,
                message = "Validation hatası",
                errors = filteredErrors
            };
            
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(response);
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add Entity Framework
builder.Services.AddDbContext<BilgeLojistikIKContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"),
        o => o.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery)));

// Add Services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IIzinService, IzinService>();
builder.Services.AddScoped<IVideoEgitimService, VideoEgitimService>();
builder.Services.AddScoped<IAvansService, AvansService>();

// Add JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") ?? jwtSettings["SecretKey"];

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(secretKey!))
        };
    });

// CORS - Production için dinamik origin ayarı
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowedOrigins",
        corsBuilder =>
        {
            var allowedOrigins = new List<string> { 
                "http://localhost:3000",
                "http://localhost:3001",
                "http://localhost:3002", 
                "https://hr-management-murex.vercel.app",
                "https://hr-management.vercel.app",
                "https://hr-management-v1.vercel.app",
                "https://bilgelojistik-hr.vercel.app",
                // Additional Vercel deployment URLs
                "https://bilge-ik-yonetim-v1-calisan-yedek-v-final.vercel.app",
                "https://bilge-ik-yonetim.vercel.app",
                "https://hr-management-git-main-furky2121.vercel.app"
            };
            
            // Production ortamında environment variable'dan ekstra origin ekle
            if (builder.Environment.IsProduction())
            {
                var frontendUrl = Environment.GetEnvironmentVariable("FRONTEND_URL");
                if (!string.IsNullOrEmpty(frontendUrl) && !allowedOrigins.Contains(frontendUrl))
                {
                    allowedOrigins.Add(frontendUrl);
                }
            }
            
            corsBuilder.WithOrigins(allowedOrigins.ToArray())
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
        });
});

// Static files support for file uploads
builder.Services.Configure<Microsoft.AspNetCore.Http.Features.FormOptions>(options =>
{
    options.MultipartBodyLengthLimit = 10 * 1024 * 1024; // 10MB
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// HTTPS Redirection - Production'da aktif
if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
    app.UseHsts(); // HTTP Strict Transport Security
}

// Static files
app.UseStaticFiles();

app.UseCors("AllowedOrigins");

// Request logging middleware - Development ve Production'da
app.Use(async (context, next) =>
{
    Console.WriteLine($"=== REQUEST: {context.Request.Method} {context.Request.Path} from {context.Request.Headers.Origin} ===");
    await next.Invoke();
    Console.WriteLine($"=== RESPONSE: {context.Response.StatusCode} ===");
});

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply migrations automatically in production
using (var scope = app.Services.CreateScope())
{
    try
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<BilgeLojistikIKContext>();
        dbContext.Database.Migrate();
        Console.WriteLine("Database migrations applied successfully.");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Database migration error: {ex.Message}");
        // Log but don't fail startup
    }
}

app.Run();
