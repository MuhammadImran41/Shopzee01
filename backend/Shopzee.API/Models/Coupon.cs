namespace Shopzee.API.Models;

public class Coupon
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Type { get; set; } = "percent";  // percent | fixed
    public decimal Value { get; set; }              // 10 = 10% or PKR 500
    public decimal? MinOrderAmount { get; set; }
    public int? MaxUses { get; set; }               // null = unlimited
    public int UsedCount { get; set; } = 0;
    public DateTime? ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
