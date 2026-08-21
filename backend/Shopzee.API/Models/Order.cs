namespace Shopzee.API.Models;

public class Order
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;  // SZ45930

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    // Shipping address snapshot
    public string ShippingName { get; set; } = string.Empty;
    public string ShippingLine1 { get; set; } = string.Empty;
    public string? ShippingLine2 { get; set; }
    public string ShippingCity { get; set; } = string.Empty;
    public string ShippingState { get; set; } = string.Empty;
    public string ShippingZip { get; set; } = string.Empty;
    public string ShippingPhone { get; set; } = string.Empty;

    public decimal SubTotal { get; set; }
    public decimal DiscountAmount { get; set; } = 0;
    public string? CouponCode { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Total { get; set; }

    public string PaymentMethod { get; set; } = "cod"; // cod | card | easypaisa
    public string PaymentStatus { get; set; } = "pending"; // pending | paid | refunded

    public string Status { get; set; } = "pending";
    // pending | processing | shipped | delivered | cancelled

    public string? TrackingNumber { get; set; }
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ICollection<OrderItem> Items { get; set; } = [];
}
