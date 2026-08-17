using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Shopzee.API.Data;
using Shopzee.API.Helpers;

var builder = WebApplication.CreateBuilder(args);

// ── Railway: bind to PORT env variable ───────────────────────
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ── Services ──────────────────────────────────────────────────
builder.Services.AddControllers();

// EF Core — SQLite (production path writable on Railway)
var dbPath = Environment.GetEnvironmentVariable("DATABASE_PATH")
             ?? "Data Source=shopzee.db";
builder.Services.AddDbContext<ShopzeeDbContext>(opt =>
    opt.UseSqlite(dbPath));

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

// CORS — allow all origins in production (Railway + Vercel + custom domain)
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("ShopzeeCors", policy =>
    {
        policy.SetIsOriginAllowed(_ => true)  // allow any frontend URL
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
    db.Database.Migrate();
}

app.Run();
