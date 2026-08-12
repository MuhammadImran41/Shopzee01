using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Shopzee.API.Data;
using Shopzee.API.Helpers;

var builder = WebApplication.CreateBuilder(args);

// ── Services ─────────────────────────────────────────────────

builder.Services.AddControllers();

// EF Core — SQLite
builder.Services.AddDbContext<ShopzeeDbContext>(opt =>
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")
                  ?? "Data Source=shopzee.db"));

// JWT
var jwtKey    = builder.Configuration["Jwt:Key"]      ?? "ShopzeeSecretKey_Change_In_Production_2026!";
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
            IssuerSigningKey         = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };
    });

builder.Services.AddAuthorization();

// JWT Helper
builder.Services.AddSingleton<JwtHelper>();

// CORS — allow Angular dev server + production
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("ShopzeeCors", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",   // Angular dev
                "http://localhost:4201",   // Angular prod preview
                "https://shopzee.pk"       // Production
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Swagger with JWT support
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title       = "Shopzee API",
        Version     = "v1",
        Description = "Shopzee E-Commerce REST API — .NET 9",
        Contact     = new OpenApiContact { Name = "Shopzee Team", Email = "dev@shopzee.pk" }
    });

    // JWT auth in Swagger UI
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter: Bearer {your JWT token}",
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
                {
                    Type = ReferenceType.SecurityScheme,
                    Id   = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// ── Build ─────────────────────────────────────────────────────
var app = builder.Build();

// ── Middleware ────────────────────────────────────────────────
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "Shopzee API v1");
    c.RoutePrefix = "swagger";
    c.DocumentTitle = "Shopzee API";
});

// Only redirect to HTTPS in production
if (!app.Environment.IsDevelopment())
    app.UseHttpsRedirection();

app.UseCors("ShopzeeCors");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ── Auto migrate + seed on startup ───────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ShopzeeDbContext>();
    db.Database.Migrate();
}

app.Run();
