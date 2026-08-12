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

    private static List<string> Split(string val) =>
        string.IsNullOrWhiteSpace(val)
            ? []
            : [.. val.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)];
}
