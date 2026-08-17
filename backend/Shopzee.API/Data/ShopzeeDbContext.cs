using Microsoft.EntityFrameworkCore;
using Shopzee.API.Models;

namespace Shopzee.API.Data;

public class ShopzeeDbContext(DbContextOptions<ShopzeeDbContext> options) : DbContext(options)
{
    public DbSet<User>            Users           { get; set; }
    public DbSet<Category>        Categories      { get; set; }
    public DbSet<Product>         Products        { get; set; }
    public DbSet<Address>         Addresses       { get; set; }
    public DbSet<Order>           Orders          { get; set; }
    public DbSet<OrderItem>       OrderItems      { get; set; }
    public DbSet<Cart>            Carts           { get; set; }
    public DbSet<CartItem>        CartItems       { get; set; }
    public DbSet<WishlistItem>    WishlistItems   { get; set; }
    public DbSet<Review>          Reviews         { get; set; }
    public DbSet<ResellerProfile> ResellerProfiles { get; set; }
    public DbSet<ResellerOrder>   ResellerOrders  { get; set; }
    public DbSet<ResellerOrderItem> ResellerOrderItems { get; set; }

    protected override void OnModelCreating(ModelBuilder mb)
    {
        base.OnModelCreating(mb);

        // ── Indexes ──────────────────────────────────────────
        mb.Entity<User>().HasIndex(u => u.Email).IsUnique();
        mb.Entity<Product>().HasIndex(p => p.Slug).IsUnique();
        mb.Entity<Category>().HasIndex(c => c.Slug).IsUnique();

        mb.Entity<WishlistItem>()
          .HasIndex(w => new { w.UserId, w.ProductId })
          .IsUnique();

        // ── Decimal precision ─────────────────────────────────
        mb.Entity<Product>()
          .Property(p => p.Price)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Product>()
          .Property(p => p.OriginalPrice)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Order>()
          .Property(o => o.SubTotal)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Order>()
          .Property(o => o.ShippingCost)
          .HasColumnType("decimal(18,2)");

        mb.Entity<Order>()
          .Property(o => o.Total)
          .HasColumnType("decimal(18,2)");

        mb.Entity<OrderItem>()
          .Property(oi => oi.UnitPrice)
          .HasColumnType("decimal(18,2)");

        // LineTotal is computed — ignore in DB
        mb.Entity<OrderItem>()
          .Ignore(oi => oi.LineTotal);

        // ── Reseller decimal precision ─────────────────────────
        mb.Entity<ResellerProfile>()
          .Property(r => r.TotalEarnings).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerProfile>()
          .Property(r => r.PendingEarnings).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerProfile>()
          .Property(r => r.WithdrawnAmount).HasColumnType("decimal(18,2)");

        mb.Entity<ResellerOrder>()
          .Property(r => r.SubTotal).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerOrder>()
          .Property(r => r.ShippingCost).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerOrder>()
          .Property(r => r.ResellerProfit).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerOrder>()
          .Property(r => r.TotalAmount).HasColumnType("decimal(18,2)");

        mb.Entity<ResellerOrderItem>()
          .Property(r => r.BasePrice).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerOrderItem>()
          .Property(r => r.ResellerPrice).HasColumnType("decimal(18,2)");
        mb.Entity<ResellerOrderItem>()
          .Property(r => r.Profit).HasColumnType("decimal(18,2)");

        // ── Seed Data ─────────────────────────────────────────
        SeedData(mb);
    }

    private static void SeedData(ModelBuilder mb)
    {
        // Categories
        mb.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Women",  Slug = "women", Description = "Women's Pakistani fashion", SortOrder = 1 },
            new Category { Id = 2, Name = "Men",    Slug = "men",   Description = "Men's Pakistani fashion",   SortOrder = 2 }
        );

        // Admin user  (password: Admin@123)
        mb.Entity<User>().HasData(new User
        {
            Id           = 1,
            Name         = "Admin",
            Email        = "admin@shopzee.pk",
            // BCrypt hash of "Admin@123" — pre-computed for stable migrations
            PasswordHash = "$2a$11$ASyI7/scyHplswETufdIkOKSiOsxIMOuQTKwnJFbTEY6.GHeGJ1Nm",
            Phone        = "+92 300 0000000",
            Role         = "admin",
            CreatedAt    = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            IsActive     = true
        });

        // Demo customer  (password: User@123)
        mb.Entity<User>().HasData(new User
        {
            Id           = 2,
            Name         = "Ayesha Khan",
            Email        = "ayesha@shopzee.pk",
            // BCrypt hash of "User@123" — pre-computed for stable migrations
            PasswordHash = "$2a$11$GnP8YUXSF2K0zPVYMPwQBu4u/1TE5bnoor3OU9oHxDvU3cf1jV.UG",
            Phone        = "+92 300 1234567",
            Role         = "customer",
            CreatedAt    = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            IsActive     = true
        });

        // ── Women's Products ──────────────────────────────────
        mb.Entity<Product>().HasData(
            new Product
            {
                Id = 1, CategoryId = 1,
                Name = "Sage Embroidered Net Suit",
                Slug = "sage-embroidered-net-suit",
                SubCategory = "Formal",
                Price = 12500, OriginalPrice = 16000, DiscountPercent = 22,
                Images = "assets/images/women/women-1.png",
                Colors = "#8FAF8F,#C9A84C,#F5F0E8",
                Sizes  = "XS,S,M,L,XL",
                Tags   = "formal,embroidered,net",
                Rating = 4.8, ReviewCount = 124, Stock = 15,
                IsNew = true, IsFeatured = true, Sku = "WF-001",
                Description = "Exquisitely crafted sage green net suit with intricate gold embroidery. Perfect for formal occasions.",
                SeoTitle = "Sage Green Embroidered Net Suit | Shopzee",
                SeoDescription = "Beautiful sage green embroidered net suit for formal occasions.",
                SeoKeywords = "women suit,embroidered,formal wear",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 2, CategoryId = 1,
                Name = "Lavender Chiffon Ensemble",
                Slug = "lavender-chiffon-ensemble",
                SubCategory = "Semi-Formal",
                Price = 9800, OriginalPrice = 12500, DiscountPercent = 22,
                Images = "assets/images/women/women-2.png",
                Colors = "#B8A9C9,#F5F0E8,#C9A84C",
                Sizes  = "XS,S,M,L,XL",
                Tags   = "semi-formal,chiffon,floral",
                Rating = 4.7, ReviewCount = 98, Stock = 12,
                IsFeatured = true, Sku = "WF-002",
                Description = "Delicate lavender chiffon suit with floral embroidery.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 3, CategoryId = 1,
                Name = "Ivory Gold Bridal Luxury",
                Slug = "ivory-gold-bridal-luxury",
                SubCategory = "Bridal",
                Price = 28000,
                Images = "assets/images/women/women-3.png",
                Colors = "#F5F0E8,#C9A84C",
                Sizes  = "XS,S,M,L",
                Tags   = "bridal,luxury,embroidered",
                Rating = 5.0, ReviewCount = 56, Stock = 8,
                IsNew = true, IsFeatured = true, Sku = "WB-001",
                Description = "Regal ivory and gold bridal ensemble with heavy embroidery.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 4, CategoryId = 1,
                Name = "Mint Organza Party Wear",
                Slug = "mint-organza-party-wear",
                SubCategory = "Party Wear",
                Price = 8500, OriginalPrice = 10500, DiscountPercent = 19,
                Images = "assets/images/women/women-4.png",
                Colors = "#98D4C8,#F5F0E8",
                Sizes  = "S,M,L,XL",
                Tags   = "party,organza,mint",
                Rating = 4.6, ReviewCount = 83, Stock = 20,
                IsFeatured = true, Sku = "WP-001",
                Description = "Stunning mint organza party wear with delicate floral motifs.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 5, CategoryId = 1,
                Name = "Cream Pearl Embroidered Suit",
                Slug = "cream-pearl-embroidered-suit",
                SubCategory = "Formal",
                Price = 15000,
                Images = "assets/images/women/women-5.png",
                Colors = "#F5F0E8,#E8DCC8",
                Sizes  = "XS,S,M,L,XL",
                Tags   = "formal,pearl,cream",
                Rating = 4.9, ReviewCount = 142, Stock = 10,
                IsNew = true, Sku = "WF-003",
                Description = "Classic cream suit adorned with pearl and crystal embroidery.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 6, CategoryId = 1,
                Name = "Rose Gold Evening Gown",
                Slug = "rose-gold-evening-gown",
                SubCategory = "Evening Wear",
                Price = 22000, OriginalPrice = 28000, DiscountPercent = 21,
                Images = "assets/images/women/women-6.png",
                Colors = "#E8B4A0,#C9A84C",
                Sizes  = "XS,S,M,L",
                Tags   = "evening,gown,luxury",
                Rating = 4.8, ReviewCount = 67, Stock = 6,
                Sku = "WE-001",
                Description = "Breathtaking rose gold evening gown with hand-stitched embellishments.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 7, CategoryId = 1,
                Name = "Turquoise Festive Collection",
                Slug = "turquoise-festive-collection",
                SubCategory = "Festive",
                Price = 11500,
                Images = "assets/images/women/women-7.png",
                Colors = "#40B8C4,#C9A84C,#F5F0E8",
                Sizes  = "S,M,L,XL,XXL",
                Tags   = "festive,turquoise,eid",
                Rating = 4.7, ReviewCount = 91, Stock = 18,
                IsNew = true, Sku = "WF-004",
                Description = "Vibrant turquoise festive suit with golden thread work.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            // ── Men's Products ────────────────────────────────
            new Product
            {
                Id = 8, CategoryId = 2,
                Name = "Classic Cream Shalwar Kameez",
                Slug = "classic-cream-shalwar-kameez",
                SubCategory = "Formal",
                Price = 6500, OriginalPrice = 8000, DiscountPercent = 19,
                Images = "assets/images/men/men-1.png",
                Colors = "#F5F0E8,#E8DCC8",
                Sizes  = "S,M,L,XL,XXL",
                Tags   = "formal,cotton,cream",
                Rating = 4.7, ReviewCount = 108, Stock = 25,
                IsFeatured = true, IsNew = true, Sku = "MF-001",
                Description = "Elegant cream shalwar kameez in premium cotton.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 9, CategoryId = 2,
                Name = "Midnight Black Kurta Set",
                Slug = "midnight-black-kurta-set",
                SubCategory = "Party Wear",
                Price = 7800,
                Images = "assets/images/men/men-2.png",
                Colors = "#1A1A1A,#2C2C2C",
                Sizes  = "S,M,L,XL,XXL",
                Tags   = "party,black,gold-embroidery",
                Rating = 4.9, ReviewCount = 87, Stock = 15,
                IsFeatured = true, Sku = "MP-001",
                Description = "Sophisticated midnight black kurta set with gold thread embroidery.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 10, CategoryId = 2,
                Name = "Charcoal Grey Embroidered Kurta",
                Slug = "charcoal-grey-embroidered-kurta",
                SubCategory = "Semi-Formal",
                Price = 5500, OriginalPrice = 7000, DiscountPercent = 21,
                Images = "assets/images/men/men-3.png",
                Colors = "#4A4A4A,#6B6560",
                Sizes  = "S,M,L,XL,XXL",
                Tags   = "semi-formal,grey,contemporary",
                Rating = 4.6, ReviewCount = 72, Stock = 20,
                Sku = "MS-001",
                Description = "Contemporary charcoal grey kurta with modern cut.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            },
            new Product
            {
                Id = 11, CategoryId = 2,
                Name = "Navy Blue Luxury Suit",
                Slug = "navy-blue-luxury-suit",
                SubCategory = "Bridal / Sherwani",
                Price = 18500,
                Images = "assets/images/men/men-4.png",
                Colors = "#1B3A6B,#C9A84C",
                Sizes  = "S,M,L,XL",
                Tags   = "bridal,sherwani,luxury",
                Rating = 5.0, ReviewCount = 43, Stock = 8,
                IsNew = true, IsFeatured = true, Sku = "MB-001",
                Description = "Majestic navy blue luxury suit with gold zari work.",
                CreatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc),
                UpdatedAt = new DateTime(2026,1,1,0,0,0,DateTimeKind.Utc)
            }
        );
    }
}
