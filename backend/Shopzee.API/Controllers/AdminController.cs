using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.DTOs;
using Shopzee.API.Helpers;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "admin")]
public class AdminController(ShopzeeDbContext db) : ControllerBase
{
    // GET api/admin/dashboard
    [HttpGet("dashboard")]
    public async Task<IActionResult> Dashboard()
    {
        var totalRevenue  = await db.Orders
            .Where(o => o.Status != "cancelled")
            .SumAsync(o => (decimal?)o.Total) ?? 0;

        var totalOrders   = await db.Orders.CountAsync();
        var totalCustomers= await db.Users.CountAsync(u => u.Role == "customer");
        var totalProducts = await db.Products.CountAsync(p => p.IsActive);
        var pendingOrders = await db.Orders.CountAsync(o => o.Status == "pending" || o.Status == "processing");
        var lowStock      = await db.Products.CountAsync(p => p.IsActive && p.Stock <= 5);
        var avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Revenue chart — last 8 months
        var now        = DateTime.UtcNow;
        var chartData  = new List<RevenueChartDto>();
        for (int i = 7; i >= 0; i--)
        {
            var month  = now.AddMonths(-i);
            var mStart = new DateTime(month.Year, month.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var mEnd   = mStart.AddMonths(1);
            var rev    = await db.Orders
                .Where(o => o.CreatedAt >= mStart && o.CreatedAt < mEnd && o.Status != "cancelled")
                .SumAsync(o => (decimal?)o.Total) ?? 0;
            var cnt    = await db.Orders
                .CountAsync(o => o.CreatedAt >= mStart && o.CreatedAt < mEnd);
            chartData.Add(new RevenueChartDto
            {
                Label      = month.ToString("MMM"),
                Value      = rev,
                OrderCount = cnt
            });
        }

        // Recent orders
        var recentOrders = await db.Orders
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(5)
            .Select(o => new RecentOrderDto
            {
                Id            = o.Id,
                OrderNumber   = o.OrderNumber,
                CustomerName  = o.User.Name,
                CustomerEmail = o.User.Email,
                Total         = o.Total,
                Status        = o.Status,
                CreatedAt     = o.CreatedAt
            }).ToListAsync();

        // Top products by units sold
        var topProducts = await db.OrderItems
            .Include(oi => oi.Product)
            .GroupBy(oi => new { oi.ProductId, oi.ProductName, oi.ProductImage })
            .Select(g => new TopProductDto
            {
                ProductId    = g.Key.ProductId,
                ProductName  = g.Key.ProductName,
                ProductImage = g.Key.ProductImage,
                TotalSold    = g.Sum(x => x.Quantity),
                TotalRevenue = g.Sum(x => x.UnitPrice * x.Quantity)
            })
            .OrderByDescending(x => x.TotalSold)
            .Take(5)
            .ToListAsync();

        return Ok(new DashboardStatsDto
        {
            TotalRevenue   = totalRevenue,
            TotalOrders    = totalOrders,
            TotalCustomers = totalCustomers,
            TotalProducts  = totalProducts,
            AvgOrderValue  = avgOrderValue,
            PendingOrders  = pendingOrders,
            LowStockProducts = lowStock,
            RevenueChart   = chartData,
            RecentOrders   = recentOrders,
            TopProducts    = topProducts
        });
    }

    // GET api/admin/customers
    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var q = db.Users.Where(u => u.Role == "customer").AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.ToLower();
            q = q.Where(u => u.Name.ToLower().Contains(s) || u.Email.ToLower().Contains(s));
        }

        var total = await q.CountAsync();
        var users = await q
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = new List<CustomerAdminDto>();
        foreach (var u in users)
        {
            var orders = await db.Orders.Where(o => o.UserId == u.Id).ToListAsync();
            result.Add(new CustomerAdminDto
            {
                Id          = u.Id,
                Name        = u.Name,
                Email       = u.Email,
                Phone       = u.Phone,
                TotalOrders = orders.Count,
                TotalSpent  = orders.Where(o => o.Status != "cancelled").Sum(o => o.Total),
                JoinedAt    = u.CreatedAt,
                IsActive    = u.IsActive
            });
        }

        return Ok(new { items = result, totalCount = total, page, pageSize });
    }

    // PUT api/admin/customers/{id}/toggle
    [HttpPut("customers/{id:int}/toggle")]
    public async Task<IActionResult> ToggleCustomer(int id)
    {
        var user = await db.Users.FindAsync(id);
        if (user is null || user.Role == "admin") return NotFound();
        user.IsActive = !user.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { user.Id, user.IsActive });
    }

    // GET api/admin/analytics
    [HttpGet("analytics")]
    public async Task<IActionResult> Analytics([FromQuery] string range = "30d")
    {
        var days = range switch { "7d" => 7, "90d" => 90, "1y" => 365, _ => 30 };
        var since = DateTime.UtcNow.AddDays(-days);

        var revenue = await db.Orders
            .Where(o => o.CreatedAt >= since && o.Status != "cancelled")
            .SumAsync(o => (decimal?)o.Total) ?? 0;

        var orderCount = await db.Orders
            .CountAsync(o => o.CreatedAt >= since);

        var newCustomers = await db.Users
            .CountAsync(u => u.Role == "customer" && u.CreatedAt >= since);

        // Category breakdown
        var catBreakdown = await db.OrderItems
            .Include(oi => oi.Product).ThenInclude(p => p.Category)
            .Where(oi => oi.Order.CreatedAt >= since)
            .GroupBy(oi => oi.Product.Category.Name)
            .Select(g => new
            {
                category = g.Key,
                revenue  = g.Sum(x => x.UnitPrice * x.Quantity),
                units    = g.Sum(x => x.Quantity)
            })
            .ToListAsync();

        return Ok(new
        {
            revenue, orderCount, newCustomers,
            avgOrder     = orderCount > 0 ? revenue / orderCount : 0,
            categoryBreakdown = catBreakdown
        });
    }
}
