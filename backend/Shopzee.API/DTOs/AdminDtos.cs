namespace Shopzee.API.DTOs;

public class DashboardStatsDto
{
    public decimal TotalRevenue { get; set; }
    public int TotalOrders { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalProducts { get; set; }
    public decimal AvgOrderValue { get; set; }
    public int PendingOrders { get; set; }
    public int LowStockProducts { get; set; }
    public List<RevenueChartDto> RevenueChart { get; set; } = [];
    public List<RecentOrderDto> RecentOrders { get; set; } = [];
    public List<TopProductDto> TopProducts { get; set; } = [];
}

public class RevenueChartDto
{
    public string Label { get; set; } = "";
    public decimal Value { get; set; }
    public int OrderCount { get; set; }
}

public class RecentOrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public string CustomerName { get; set; } = "";
    public string CustomerEmail { get; set; } = "";
    public decimal Total { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public class TopProductDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string ProductImage { get; set; } = "";
    public int TotalSold { get; set; }
    public decimal TotalRevenue { get; set; }
}

public class CustomerAdminDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public int TotalOrders { get; set; }
    public decimal TotalSpent { get; set; }
    public DateTime JoinedAt { get; set; }
    public bool IsActive { get; set; }
}

public class UpdateSeoDto
{
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }
}
