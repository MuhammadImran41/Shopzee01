using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using Shopzee.API.Data;
using Shopzee.API.Helpers;

var builder = WebApplication.CreateBuilder(args);

// ── Railway/EB: bind to PORT env variable ───────────────────────
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
Console.WriteLine($"[STARTUP] Listening on port: {port}");

// ── Services ──────────────────────────────────────────────────
builder.Services.AddControllers()
    .AddJsonOptions(opt =>
    {
        opt.JsonSerializerOptions.MaxDepth = 64;
    });

// Raise Kestrel body size limit to 50 MB for image uploads
builder.WebHost.ConfigureKestrel(k =>
{
    k.Limits.MaxRequestBodySize = 52_428_800;
});

// EF Core — PostgreSQL (Neon)
var rawConn = Environment.GetEnvironmentVariable("DATABASE_URL")
              ?? builder.Configuration.GetConnectionString("DefaultConnection")!;

builder.Services.AddDbContext<ShopzeeDbContext>(opt =>
    opt.UseNpgsql(rawConn, npgsqlOpt =>
    {
        npgsqlOpt.EnableRetryOnFailure(
            maxRetryCount: 6,
            maxRetryDelay: TimeSpan.FromSeconds(15),
            errorCodesToAdd: ["08P01", "08006", "08001", "08004", "57P03"]
        );
        npgsqlOpt.CommandTimeout(60);
    })
    .EnableServiceProviderCaching(false));

// JWT
var jwtKey    = builder.Configuration["Jwt:Key"]
                ?? Environment.GetEnvironmentVariable("JWT_KEY")
                ?? "ShopzeeSecretKey_Change_In_Production_2026!AbCdEfGhIjKlMnOpQrStUvWxYz";
var jwtIssuer = builder.Configuration["Jwt:Issuer"]   ?? "shopzee-api";
var jwtAud    = builder.Configuration["Jwt:Audience"] ?? "shopzee-client";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opt =>
    {
        opt.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidateAudience         = true,
            ValidateLifetime         = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer              = jwtIssuer,
            ValidAudience            = jwtAud,
            IssuerSigningKey         = new SymmetricSecurityKey(
                                         Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddSingleton<JwtHelper>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddHostedService<DbKeepAliveService>();

// CORS — allow all origins in production
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("ShopzeeCors", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",
                "https://stylemaker.store",
                "https://www.stylemaker.store",
                "https://shopzee01-production.up.railway.app",
                "https://main.d2xyz.amplifyapp.com"
              )
              .SetIsOriginAllowedToAllowWildcardSubdomains()
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Shopzee API",
        Version     = "v1",
        Description = "Shopzee E-Commerce REST API — .NET 9"
    });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {token}",
        Name        = "Authorization",
        In          = ParameterLocation.Header,
        Type        = SecuritySchemeType.ApiKey,
        Scheme      = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                    { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// ── Build ──────────────────────────────────────────────────────
var app = builder.Build();

// ── Middleware ─────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Shopzee API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("ShopzeeCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Health check endpoint (Railway ping) ──────────────────────
app.MapGet("/", () => Results.Ok(new { status = "ok", app = "Shopzee API", version = "1.0" }));

// ── Auto migrate + seed on startup ────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopzeeDbContext>();
    try
    {
        db.Database.EnsureCreated();

        // If products exist but all are inactive, reactivate them
        // Otherwise seed fresh products
        var totalProducts = db.Products.Count();
        var activeProducts = db.Products.Count(p => p.IsActive);

        Console.WriteLine($"[STARTUP] DB has {totalProducts} total, {activeProducts} active products.");

        if (totalProducts > 0 && activeProducts == 0)
        {
            // Reactivate all soft-deleted products
            var inactive = db.Products.Where(p => !p.IsActive).ToList();
            inactive.ForEach(p => { p.IsActive = true; p.UpdatedAt = DateTime.UtcNow; });
            db.SaveChanges();
            Console.WriteLine($"[STARTUP] Reactivated {inactive.Count} products.");
        }
        else if (totalProducts == 0)
        {
            Console.WriteLine("[STARTUP] No products found — seeding demo products...");
            db.Products.AddRange(
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Sage Embroidered Net Suit",
                    Slug = "sage-embroidered-net-suit", SubCategory = "Formal",
                    Price = 12500, OriginalPrice = 16000, DiscountPercent = 22,
                    Images = "assets/images/women/women-1.png",
                    Colors = "#8FAF8F,#C9A84C,#F5F0E8", Sizes = "XS,S,M,L,XL",
                    Tags = "formal,embroidered,net", Rating = 4.8, ReviewCount = 124,
                    Stock = 15, IsNew = true, IsFeatured = true, Sku = "WF-001",
                    Description = "Exquisitely crafted sage green net suit with intricate gold embroidery.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Lavender Chiffon Ensemble",
                    Slug = "lavender-chiffon-ensemble", SubCategory = "Semi-Formal",
                    Price = 9800, OriginalPrice = 12500, DiscountPercent = 22,
                    Images = "assets/images/women/women-2.png",
                    Colors = "#B8A9C9,#F5F0E8,#C9A84C", Sizes = "XS,S,M,L,XL",
                    Tags = "semi-formal,chiffon,floral", Rating = 4.7, ReviewCount = 98,
                    Stock = 12, IsFeatured = true, Sku = "WF-002",
                    Description = "Delicate lavender chiffon suit with floral embroidery.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Ivory Gold Bridal Luxury",
                    Slug = "ivory-gold-bridal-luxury", SubCategory = "Bridal",
                    Price = 28000, Images = "assets/images/women/women-3.png",
                    Colors = "#F5F0E8,#C9A84C", Sizes = "XS,S,M,L",
                    Tags = "bridal,luxury,embroidered", Rating = 5.0, ReviewCount = 56,
                    Stock = 8, IsNew = true, IsFeatured = true, Sku = "WB-001",
                    Description = "Regal ivory and gold bridal ensemble with heavy embroidery.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Mint Organza Party Wear",
                    Slug = "mint-organza-party-wear", SubCategory = "Party Wear",
                    Price = 8500, OriginalPrice = 10500, DiscountPercent = 19,
                    Images = "assets/images/women/women-4.png",
                    Colors = "#98D4C8,#F5F0E8", Sizes = "S,M,L,XL",
                    Tags = "party,organza,mint", Rating = 4.6, ReviewCount = 83,
                    Stock = 20, IsFeatured = true, Sku = "WP-001",
                    Description = "Stunning mint organza party wear with delicate floral motifs.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Cream Pearl Embroidered Suit",
                    Slug = "cream-pearl-embroidered-suit", SubCategory = "Formal",
                    Price = 15000, Images = "assets/images/women/women-5.png",
                    Colors = "#F5F0E8,#E8DCC8", Sizes = "XS,S,M,L,XL",
                    Tags = "formal,pearl,cream", Rating = 4.9, ReviewCount = 142,
                    Stock = 10, IsNew = true, Sku = "WF-003",
                    Description = "Classic cream suit adorned with pearl and crystal embroidery.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Rose Gold Evening Gown",
                    Slug = "rose-gold-evening-gown", SubCategory = "Evening Wear",
                    Price = 22000, OriginalPrice = 28000, DiscountPercent = 21,
                    Images = "assets/images/women/women-6.png",
                    Colors = "#E8B4A0,#C9A84C", Sizes = "XS,S,M,L",
                    Tags = "evening,gown,luxury", Rating = 4.8, ReviewCount = 67,
                    Stock = 6, Sku = "WE-001",
                    Description = "Breathtaking rose gold evening gown with hand-stitched embellishments.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 1, Name = "Turquoise Festive Collection",
                    Slug = "turquoise-festive-collection", SubCategory = "Festive",
                    Price = 11500, Images = "assets/images/women/women-7.png",
                    Colors = "#40B8C4,#C9A84C,#F5F0E8", Sizes = "S,M,L,XL,XXL",
                    Tags = "festive,turquoise,eid", Rating = 4.7, ReviewCount = 91,
                    Stock = 18, IsNew = true, Sku = "WF-004",
                    Description = "Vibrant turquoise festive suit with golden thread work.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 2, Name = "Classic Cream Shalwar Kameez",
                    Slug = "classic-cream-shalwar-kameez", SubCategory = "Formal",
                    Price = 6500, OriginalPrice = 8000, DiscountPercent = 19,
                    Images = "assets/images/men/men-1.png",
                    Colors = "#F5F0E8,#E8DCC8", Sizes = "S,M,L,XL,XXL",
                    Tags = "formal,cotton,cream", Rating = 4.7, ReviewCount = 108,
                    Stock = 25, IsFeatured = true, IsNew = true, Sku = "MF-001",
                    Description = "Elegant cream shalwar kameez in premium cotton.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 2, Name = "Midnight Black Kurta Set",
                    Slug = "midnight-black-kurta-set", SubCategory = "Party Wear",
                    Price = 7800, Images = "assets/images/men/men-2.png",
                    Colors = "#1A1A1A,#2C2C2C", Sizes = "S,M,L,XL,XXL",
                    Tags = "party,black,gold-embroidery", Rating = 4.9, ReviewCount = 87,
                    Stock = 15, IsFeatured = true, Sku = "MP-001",
                    Description = "Sophisticated midnight black kurta set with gold thread embroidery.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 2, Name = "Charcoal Grey Embroidered Kurta",
                    Slug = "charcoal-grey-embroidered-kurta", SubCategory = "Semi-Formal",
                    Price = 5500, OriginalPrice = 7000, DiscountPercent = 21,
                    Images = "assets/images/men/men-3.png",
                    Colors = "#4A4A4A,#6B6560", Sizes = "S,M,L,XL,XXL",
                    Tags = "semi-formal,grey,contemporary", Rating = 4.6, ReviewCount = 72,
                    Stock = 20, Sku = "MS-001",
                    Description = "Contemporary charcoal grey kurta with modern cut.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                },
                new Shopzee.API.Models.Product
                {
                    CategoryId = 2, Name = "Navy Blue Luxury Suit",
                    Slug = "navy-blue-luxury-suit", SubCategory = "Bridal / Sherwani",
                    Price = 18500, Images = "assets/images/men/men-4.png",
                    Colors = "#1B3A6B,#C9A84C", Sizes = "S,M,L,XL",
                    Tags = "bridal,sherwani,luxury", Rating = 5.0, ReviewCount = 43,
                    Stock = 8, IsNew = true, IsFeatured = true, Sku = "MB-001",
                    Description = "Majestic navy blue luxury suit with gold zari work.",
                    CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow
                }
            );
            db.SaveChanges();
            Console.WriteLine("[STARTUP] Seeded 11 demo products.");
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[STARTUP] DB init warning: {ex.Message}");
    }
}

app.Run();

// ── Keep-alive: ping DB every 4 min to prevent Neon cold start ────────
public class DbKeepAliveService(IServiceScopeFactory scopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ShopzeeDbContext>();
                await db.Database.ExecuteSqlRawAsync("SELECT 1", stoppingToken);
                Console.WriteLine($"[KEEPALIVE] DB ping OK at {DateTime.UtcNow:HH:mm:ss}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[KEEPALIVE] DB ping failed: {ex.Message}");
            }
            await Task.Delay(TimeSpan.FromMinutes(4), stoppingToken);
        }
    }
}
