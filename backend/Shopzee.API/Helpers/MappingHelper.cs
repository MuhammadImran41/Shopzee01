using Shopzee.API.DTOs;
using Shopzee.API.Models;

namespace Shopzee.API.Helpers;

public static class MappingHelper
{
    // Product → ProductDto
    public static ProductDto ToDto(this Product p) => new()
    {
        Id             = p.Id,
        Name           = p.Name,
        Slug           = p.Slug,
        Description    = p.Description,
        Price          = p.Price,
        OriginalPrice  = p.OriginalPrice,
        DiscountPercent= p.DiscountPercent,
        CategoryId     = p.CategoryId,
        CategoryName   = p.Category?.Name ?? "",
        SubCategory    = p.SubCategory,
        Sku            = p.Sku,
        Images         = Split(p.Images),
        Colors         = Split(p.Colors),
        Sizes          = Split(p.Sizes),
        Tags           = Split(p.Tags),
        Rating         = p.Rating,
        ReviewCount    = p.ReviewCount,
        Stock          = p.Stock,
        IsNew          = p.IsNew,
        IsFeatured     = p.IsFeatured,
        IsActive       = p.IsActive,
        IsInStock      = p.IsInStock,
        SeoTitle       = p.SeoTitle,
        SeoDescription = p.SeoDescription,
        SeoKeywords    = p.SeoKeywords,
        CreatedAt      = p.CreatedAt
    };

    // User → UserDto
    public static UserDto ToDto(this User u) => new(u.Id, u.Name, u.Email, u.Phone, u.Role);

    // Order → OrderDto
    public static OrderDto ToDto(this Order o) => new()
    {
        Id             = o.Id,
        OrderNumber    = o.OrderNumber,
        Status         = o.Status,
        PaymentMethod  = o.PaymentMethod,
        PaymentStatus  = o.PaymentStatus,
        SubTotal       = o.SubTotal,
        DiscountAmount = o.DiscountAmount,
        CouponCode     = o.CouponCode,
        ShippingCost   = o.ShippingCost,
        Total          = o.Total,
        ShippingName   = o.ShippingName,
        ShippingCity   = o.ShippingCity,
        ShippingPhone  = o.ShippingPhone,
        TrackingNumber = o.TrackingNumber,
        CreatedAt      = o.CreatedAt,
        Items          = o.Items.Select(i => new OrderItemDto
        {
            ProductId    = i.ProductId,
            ProductName  = i.ProductName,
            ProductImage = i.ProductImage,
            UnitPrice    = i.UnitPrice,
            Quantity     = i.Quantity,
            SelectedSize = i.SelectedSize,
            SelectedColor= i.SelectedColor,
            LineTotal    = i.UnitPrice * i.Quantity
        }).ToList()
    };

    // CartItem → CartItemDto
    public static CartItemDto ToDto(this CartItem ci) => new()
    {
        Id           = ci.Id,
        ProductId    = ci.ProductId,
        ProductName  = ci.Product?.Name ?? "",
        ProductImage = Split(ci.Product?.Images ?? "").FirstOrDefault() ?? "",
        Price        = ci.Product?.Price ?? 0,
        Quantity     = ci.Quantity,
        SelectedSize = ci.SelectedSize,
        SelectedColor= ci.SelectedColor,
        LineTotal    = (ci.Product?.Price ?? 0) * ci.Quantity,
        Stock        = ci.Product?.Stock ?? 0
    };

    // Slug generator
    public static string ToSlug(this string name) =>
        name.ToLower()
            .Replace(" ", "-")
            .Replace("'", "")
            .Replace("/", "-");

    /// <summary>
    /// Split a pipe-separated or comma-separated string into a list.
    /// Uses pipe (|) as primary separator to safely handle base64 data URLs
    /// which contain commas (e.g. "data:image/jpeg;base64,/9j/...").
    /// Falls back to comma splitting for legacy records that don't contain data: URLs.
    /// </summary>
    private static List<string> Split(string val)
    {
        if (string.IsNullOrWhiteSpace(val)) return [];

        // If value contains a pipe, it was stored with the new pipe separator
        if (val.Contains('|'))
            return [.. val.Split('|', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];

        // Legacy comma-separated (asset paths like "img1.png,img2.png" — no data: URLs)
        // Also handles the case where a single data: URL was stored with comma separator
        // by detecting "data:" prefix and returning the whole thing as one item
        if (val.StartsWith("data:"))
            return [val];

        return [.. val.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];
    }
}
