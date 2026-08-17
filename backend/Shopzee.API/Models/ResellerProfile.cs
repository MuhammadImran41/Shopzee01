namespace Shopzee.API.Models;

public class ResellerProfile
{
    public int    Id          { get; set; }
    public int    UserId      { get; set; }
    public User   User        { get; set; } = null!;

    // Business info
    public string BusinessName  { get; set; } = string.Empty;
    public string WhatsApp      { get; set; } = string.Empty;
    public string City          { get; set; } = string.Empty;
    public string Address       { get; set; } = string.Empty;
    public string? CNIC         { get; set; }

    // Payment info
    public string PaymentMethod { get; set; } = "easypaisa"; // easypaisa | jazzcash | bank
    public string AccountTitle  { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string? BankName     { get; set; }

    // Status
    public string Status        { get; set; } = "pending"; // pending | approved | rejected
    public string? RejectionReason { get; set; }
    public DateTime AppliedAt   { get; set; } = DateTime.UtcNow;
    public DateTime? ApprovedAt { get; set; }

    // Earnings
    public decimal TotalEarnings    { get; set; } = 0;
    public decimal PendingEarnings  { get; set; } = 0;
    public decimal WithdrawnAmount  { get; set; } = 0;

    // Navigation
    public ICollection<ResellerOrder> Orders { get; set; } = [];
}

public class ResellerOrder
{
    public int    Id              { get; set; }
    public int    ResellerId      { get; set; }
    public ResellerProfile Reseller { get; set; } = null!;

    // Customer details (entered by reseller)
    public string CustomerName   { get; set; } = string.Empty;
    public string CustomerPhone  { get; set; } = string.Empty;
    public string CustomerCity   { get; set; } = string.Empty;
    public string CustomerAddress { get; set; } = string.Empty;

    // Payment
    public string PaymentMethod  { get; set; } = "cod";

    // Order items with reseller profit
    public decimal SubTotal      { get; set; }
    public decimal ShippingCost  { get; set; } = 300;
    public decimal ResellerProfit { get; set; }
    public decimal TotalAmount   { get; set; }

    // Status
    public string Status         { get; set; } = "pending";
    public string? TrackingNumber { get; set; }
    public string? Notes         { get; set; }

    public DateTime CreatedAt    { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt    { get; set; } = DateTime.UtcNow;

    // Items
    public ICollection<ResellerOrderItem> Items { get; set; } = [];
}

public class ResellerOrderItem
{
    public int    Id              { get; set; }
    public int    ResellerOrderId { get; set; }
    public ResellerOrder Order   { get; set; } = null!;

    public int    ProductId       { get; set; }
    public string ProductName     { get; set; } = string.Empty;
    public string ProductImage    { get; set; } = string.Empty;
    public decimal BasePrice      { get; set; }   // Our price
    public decimal ResellerPrice  { get; set; }   // Price reseller charges customer
    public decimal Profit         { get; set; }   // ResellerPrice - BasePrice
    public int    Quantity        { get; set; } = 1;
    public string SelectedSize    { get; set; } = string.Empty;
    public string SelectedColor   { get; set; } = string.Empty;
}
