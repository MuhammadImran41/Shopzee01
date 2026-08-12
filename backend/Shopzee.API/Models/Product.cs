namespace Shopzee.API.Models;

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int? DiscountPercent { get; set; }

    // Category FK
    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;

    public string SubCategory { get; set; } = string.Empty; // Formal, Party, Bridal etc.
    public string Sku { get; set; } = string.Empty;

    // Stored as JSON strings (comma-separated)
    public string Images { get; set; } = string.Empty;    // "img1.png,img2.png"
    public string Colors { get; set; } = string.Empty;    // "#FFFFFF,#000000"
    public string Sizes { get; set; } = string.Empty;     // "S,M,L,XL"
    public string Tags { get; set; } = string.Empty;      // "formal,embroidered"

    public double Rating { get; set; } = 0;
    public int ReviewCount { get; set; } = 0;
    public int Stock { get; set; } = 0;

    public bool IsNew { get; set; } = false;
    public bool IsFeatured { get; set; } = false;
    public bool IsActive { get; set; } = true;

    // SEO
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<OrderItem> OrderItems { get; set; } = [];
    public ICollection<CartItem> CartItems { get; set; } = [];
    public ICollection<WishlistItem> WishlistItems { get; set; } = [];
    public ICollection<Review> Reviews { get; set; } = [];
}
