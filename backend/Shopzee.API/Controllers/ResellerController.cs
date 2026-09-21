using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.DTOs;
using Shopzee.API.Helpers;
using Shopzee.API.Models;
using System.Security.Claims;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/reseller")]
public class ResellerController(ShopzeeDbContext db, JwtHelper jwt, ILogger<ResellerController> logger) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── POST api/reseller/signup — Public ─────────────────────
    [HttpPost("signup")]
    public async Task<IActionResult> Signup(ResellerSignupDto dto)
    {
        // Check email
        if (await db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            return BadRequest(new { message = "Email already registered." });

        // Validate password
        if (dto.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters." });

        // Create user with reseller role (pending)
        var user = new User
        {
            Name         = dto.Name,
            Email        = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone        = dto.Phone,
            Role         = "reseller_pending" // pending until admin approves
        };
        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Create reseller profile
        var profile = new ResellerProfile
        {
            UserId        = user.Id,
            BusinessName  = dto.BusinessName,
            WhatsApp      = dto.WhatsApp,
            City          = dto.City,
            Address       = dto.Address,
            CNIC          = dto.CNIC,
            PaymentMethod = dto.PaymentMethod,
            AccountTitle  = dto.AccountTitle,
            AccountNumber = dto.AccountNumber,
            BankName      = dto.BankName,
            Status        = "pending"
        };
        db.ResellerProfiles.Add(profile);
        await db.SaveChangesAsync();

        logger.LogInformation("New reseller signup: {Email} — {BusinessName}", user.Email, dto.BusinessName);

        return Ok(new
        {
            message = "Application submitted! We'll review and notify you within 24 hours.",
            status  = "pending"
        });
    }

    // ── GET api/reseller/profile — Reseller only ──────────────
    [HttpGet("profile")]
    [Authorize]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await db.ResellerProfiles
            .Include(r => r.User)
            .Include(r => r.Orders)
            .FirstOrDefaultAsync(r => r.UserId == UserId);

        if (profile is null)
            return NotFound(new { message = "Reseller profile not found." });

        return Ok(MapToDto(profile));
    }

    // ── GET api/reseller/products — Approved resellers only ───
    [HttpGet("products")]
    [Authorize]
    public async Task<IActionResult> GetProducts()
    {
        var profile = await db.ResellerProfiles
            .FirstOrDefaultAsync(r => r.UserId == UserId && r.Status == "approved");

        if (profile is null)
            return Forbid();

        var products = await db.Products
            .Where(p => p.IsActive)
            .Select(p => new
            {
                p.Id, p.Name, p.SubCategory,
                p.Price,
                p.OriginalPrice,
                Images = p.Images,
                p.Sizes, p.Colors,
                p.Stock, p.Rating,
                Category = p.CategoryId == 1 ? "women" : "men"
            })
            .ToListAsync();

        return Ok(products);
    }

    // ── POST api/reseller/orders — Place order ────────────────
    [HttpPost("orders")]
    [Authorize]
    public async Task<IActionResult> PlaceOrder(PlaceResellerOrderDto dto)
    {
        var profile = await db.ResellerProfiles
            .FirstOrDefaultAsync(r => r.UserId == UserId && r.Status == "approved");

        if (profile is null)
            return Forbid();

        if (!dto.Items.Any())
            return BadRequest(new { message = "Order must have at least one item." });

        decimal subTotal = 0;
        decimal totalProfit = 0;
        var items = new List<ResellerOrderItem>();

        foreach (var item in dto.Items)
        {
            var product = await db.Products.FindAsync(item.ProductId);
            if (product is null || !product.IsActive)
                return BadRequest(new { message = $"Product {item.ProductId} not found." });

            if (product.Stock < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {product.Name}." });

            var profit = (item.ResellerPrice - product.Price) * item.Quantity;
            subTotal     += item.ResellerPrice * item.Quantity;
            totalProfit  += profit;

            items.Add(new ResellerOrderItem
            {
                ProductId     = item.ProductId,
                ProductName   = product.Name,
                ProductImage  = product.Images.Split(',').FirstOrDefault() ?? "",
                BasePrice     = product.Price,
                ResellerPrice = item.ResellerPrice,
                Profit        = profit,
                Quantity      = item.Quantity,
                SelectedSize  = item.SelectedSize,
                SelectedColor = item.SelectedColor
            });

            // Reduce stock
            product.Stock -= item.Quantity;
        }

        const decimal freeShipping = 5000m;
        var shipping = subTotal >= freeShipping ? 0m : 300m;

        var order = new ResellerOrder
        {
            ResellerId      = profile.Id,
            CustomerName    = dto.CustomerName,
            CustomerPhone   = dto.CustomerPhone,
            CustomerCity    = dto.CustomerCity,
            CustomerAddress = dto.CustomerAddress,
            PaymentMethod   = dto.PaymentMethod,
            SubTotal        = subTotal,
            ShippingCost    = shipping,
            ResellerProfit  = totalProfit,
            TotalAmount     = subTotal + shipping,
            Notes           = dto.Notes,
            Items           = items
        };

        db.ResellerOrders.Add(order);

        // Update pending earnings
        profile.PendingEarnings += totalProfit;

        await db.SaveChangesAsync();

        return Ok(new
        {
            message       = "Order placed successfully!",
            orderId       = order.Id,
            profit        = totalProfit,
            total         = order.TotalAmount
        });
    }

    // ── GET api/reseller/orders — My orders ───────────────────
    [HttpGet("orders")]
    [Authorize]
    public async Task<IActionResult> GetOrders()
    {
        var profile = await db.ResellerProfiles
            .FirstOrDefaultAsync(r => r.UserId == UserId);

        if (profile is null)
            return NotFound();

        var orders = await db.ResellerOrders
            .Include(o => o.Items)
            .Where(o => o.ResellerId == profile.Id)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return Ok(orders.Select(MapOrderToDto));
    }

    // ══════════════════════════════════════════════════════════
    // ADMIN ENDPOINTS
    // ══════════════════════════════════════════════════════════

    // GET api/reseller/admin/stats — Dashboard stats
    [HttpGet("admin/stats")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetStats()
    {
        var totalResellers   = await db.ResellerProfiles.CountAsync();
        var pendingResellers = await db.ResellerProfiles.CountAsync(r => r.Status == "pending");
        var approvedResellers= await db.ResellerProfiles.CountAsync(r => r.Status == "approved");
        var totalOrders      = await db.ResellerOrders.CountAsync();
        var pendingOrders    = await db.ResellerOrders.CountAsync(o => o.Status == "pending");
        var totalRevenue     = await db.ResellerOrders.SumAsync(o => (decimal?)o.TotalAmount) ?? 0;
        var totalProfit      = await db.ResellerOrders.SumAsync(o => (decimal?)o.ResellerProfit) ?? 0;

        return Ok(new
        {
            totalResellers,
            pendingResellers,
            approvedResellers,
            totalOrders,
            pendingOrders,
            totalRevenue,
            totalProfit
        });
    }

    // GET api/reseller/admin/all
    [HttpGet("admin/all")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var q = db.ResellerProfiles
            .Include(r => r.User)
            .Include(r => r.Orders)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(r => r.Status == status);

        var list = await q.OrderByDescending(r => r.AppliedAt).ToListAsync();

        return Ok(list.Select(r => new AdminResellerDto
        {
            Id            = r.Id,
            UserId        = r.UserId,
            Name          = r.User.Name,
            Email         = r.User.Email,
            Phone         = r.User.Phone,
            BusinessName  = r.BusinessName,
            WhatsApp      = r.WhatsApp,
            City          = r.City,
            PaymentMethod = r.PaymentMethod,
            AccountNumber = r.AccountNumber,
            Status        = r.Status,
            AppliedAt     = r.AppliedAt,
            TotalEarnings = r.TotalEarnings,
            TotalOrders   = r.Orders.Count
        }));
    }

    // PUT api/reseller/admin/{id}/approve
    [HttpPut("admin/{id:int}/approve")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Approve(int id, ApproveResellerDto dto)
    {
        var profile = await db.ResellerProfiles
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (profile is null) return NotFound();

        if (dto.Action == "approve")
        {
            profile.Status     = "approved";
            profile.ApprovedAt = DateTime.UtcNow;
            profile.User.Role  = "reseller";
        }
        else
        {
            profile.Status          = "rejected";
            profile.RejectionReason = dto.RejectionReason;
            profile.User.Role       = "customer";
        }

        await db.SaveChangesAsync();
        return Ok(new { message = $"Reseller {dto.Action}d successfully.", status = profile.Status });
    }

    // GET api/reseller/admin/{id} — Full detail with orders
    [HttpGet("admin/{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetDetail(int id)
    {
        var profile = await db.ResellerProfiles
            .Include(r => r.User)
            .Include(r => r.Orders).ThenInclude(o => o.Items)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (profile is null) return NotFound();

        return Ok(new AdminResellerDetailDto
        {
            Id              = profile.Id,
            UserId          = profile.UserId,
            Name            = profile.User.Name,
            Email           = profile.User.Email,
            Phone           = profile.User.Phone,
            BusinessName    = profile.BusinessName,
            WhatsApp        = profile.WhatsApp,
            City            = profile.City,
            Address         = profile.Address,
            CNIC            = profile.CNIC,
            PaymentMethod   = profile.PaymentMethod,
            AccountTitle    = profile.AccountTitle,
            AccountNumber   = profile.AccountNumber,
            BankName        = profile.BankName,
            Status          = profile.Status,
            RejectionReason = profile.RejectionReason,
            AppliedAt       = profile.AppliedAt,
            ApprovedAt      = profile.ApprovedAt,
            TotalEarnings   = profile.TotalEarnings,
            PendingEarnings = profile.PendingEarnings,
            WithdrawnAmount = profile.WithdrawnAmount,
            TotalOrders     = profile.Orders.Count,
            Orders          = profile.Orders.OrderByDescending(o => o.CreatedAt).Select(o => new AdminResellerOrderDto
            {
                Id              = o.Id,
                CustomerName    = o.CustomerName,
                CustomerPhone   = o.CustomerPhone,
                CustomerCity    = o.CustomerCity,
                CustomerAddress = o.CustomerAddress,
                PaymentMethod   = o.PaymentMethod,
                SubTotal        = o.SubTotal,
                ShippingCost    = o.ShippingCost,
                ResellerProfit  = o.ResellerProfit,
                TotalAmount     = o.TotalAmount,
                Status          = o.Status,
                TrackingNumber  = o.TrackingNumber,
                Notes           = o.Notes,
                CreatedAt       = o.CreatedAt,
                Items           = o.Items.Select(i => new ResellerOrderItemResponseDto
                {
                    ProductName   = i.ProductName,
                    ProductImage  = i.ProductImage,
                    BasePrice     = i.BasePrice,
                    ResellerPrice = i.ResellerPrice,
                    Profit        = i.Profit,
                    Quantity      = i.Quantity,
                    SelectedSize  = i.SelectedSize,
                    SelectedColor = i.SelectedColor
                }).ToList()
            }).ToList()
        });
    }

    // PUT api/reseller/admin/orders/{orderId}/status — Update order status & tracking
    [HttpPut("admin/orders/{orderId:int}/status")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> UpdateOrderStatus(int orderId, UpdateResellerOrderDto dto)
    {
        var order = await db.ResellerOrders
            .Include(o => o.Reseller)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order is null) return NotFound();

        var prevStatus = order.Status;
        order.Status        = dto.Status;
        order.UpdatedAt     = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.TrackingNumber))
            order.TrackingNumber = dto.TrackingNumber;

        // When order delivered — move profit from pending to total earnings
        if (dto.Status == "delivered" && prevStatus != "delivered")
        {
            order.Reseller.TotalEarnings   += order.ResellerProfit;
            order.Reseller.PendingEarnings  = Math.Max(0, order.Reseller.PendingEarnings - order.ResellerProfit);
        }

        await db.SaveChangesAsync();
        return Ok(new { message = "Order updated.", status = order.Status });
    }

    // POST api/reseller/admin/{id}/payout — Record payout to reseller
    [HttpPost("admin/{id:int}/payout")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Payout(int id, AdminPayoutDto dto)
    {
        var profile = await db.ResellerProfiles.FindAsync(id);
        if (profile is null) return NotFound();

        if (dto.Amount <= 0)
            return BadRequest(new { message = "Amount must be greater than 0." });

        if (dto.Amount > profile.TotalEarnings - profile.WithdrawnAmount)
            return BadRequest(new { message = "Payout amount exceeds available balance." });

        profile.WithdrawnAmount += dto.Amount;

        // Record payment history
        var payment = new ResellerPayment
        {
            ResellerId = id,
            Amount     = dto.Amount,
            Method     = dto.Method ?? profile.PaymentMethod,
            Reference  = dto.Reference ?? "",
            Note       = dto.Note,
            Status     = "completed",
            PaidAt     = DateTime.UtcNow,
            PaidBy     = "admin"
        };
        db.ResellerPayments.Add(payment);
        await db.SaveChangesAsync();

        return Ok(new
        {
            message          = $"Payout of PKR {dto.Amount:N0} recorded.",
            withdrawnAmount  = profile.WithdrawnAmount,
            availableBalance = profile.TotalEarnings - profile.WithdrawnAmount,
            paymentId        = payment.Id
        });
    }

    // GET api/reseller/admin/{id}/payments — Payment history for a reseller
    [HttpGet("admin/{id:int}/payments")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetPayments(int id)
    {
        var profile = await db.ResellerProfiles.Include(r => r.User).FirstOrDefaultAsync(r => r.Id == id);
        if (profile is null) return NotFound();

        var payments = await db.ResellerPayments
            .Where(p => p.ResellerId == id)
            .OrderByDescending(p => p.PaidAt)
            .Select(p => new ResellerPaymentDto
            {
                Id           = p.Id,
                ResellerId   = p.ResellerId,
                ResellerName = profile.User.Name,
                Amount       = p.Amount,
                Method       = p.Method,
                Reference    = p.Reference,
                Status       = p.Status,
                Note         = p.Note,
                PaidAt       = p.PaidAt,
                PaidBy       = p.PaidBy
            })
            .ToListAsync();

        return Ok(payments);
    }

    // GET api/reseller/admin/payments — All payment history
    [HttpGet("admin/payments")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllPayments([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var total = await db.ResellerPayments.CountAsync();
        var payments = await db.ResellerPayments
            .Include(p => p.Reseller).ThenInclude(r => r.User)
            .OrderByDescending(p => p.PaidAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ResellerPaymentDto
            {
                Id           = p.Id,
                ResellerId   = p.ResellerId,
                ResellerName = p.Reseller.User.Name,
                Amount       = p.Amount,
                Method       = p.Method,
                Reference    = p.Reference,
                Status       = p.Status,
                Note         = p.Note,
                PaidAt       = p.PaidAt,
                PaidBy       = p.PaidBy
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, data = payments });
    }

    // GET api/reseller/admin/orders — All reseller orders with filters
    [HttpGet("admin/orders")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAllOrders(
        [FromQuery] string? status,
        [FromQuery] int?    resellerId,
        [FromQuery] int     page     = 1,
        [FromQuery] int     pageSize = 20)
    {
        var q = db.ResellerOrders
            .Include(o => o.Reseller).ThenInclude(r => r.User)
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(o => o.Status == status);
        if (resellerId.HasValue)
            q = q.Where(o => o.ResellerId == resellerId.Value);

        var total = await q.CountAsync();
        var orders = await q
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            total, page, pageSize,
            data = orders.Select(o => new
            {
                o.Id,
                ResellerId      = o.ResellerId,
                ResellerName    = o.Reseller.User.Name,
                ResellerBiz     = o.Reseller.BusinessName,
                o.CustomerName,
                o.CustomerCity,
                o.CustomerPhone,
                o.PaymentMethod,
                o.SubTotal,
                o.ShippingCost,
                o.ResellerProfit,
                o.TotalAmount,
                o.Status,
                o.TrackingNumber,
                o.Notes,
                o.CreatedAt,
                ItemCount       = o.Items.Count
            })
        });
    }

    // POST api/reseller/admin/orders/bulk — Bulk update orders
    [HttpPost("admin/orders/bulk")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> BulkOrderAction(BulkOrderActionDto dto)
    {
        if (!dto.OrderIds.Any())
            return BadRequest(new { message = "No orders selected." });

        var orders = await db.ResellerOrders
            .Include(o => o.Reseller)
            .Where(o => dto.OrderIds.Contains(o.Id))
            .ToListAsync();

        if (!orders.Any()) return NotFound(new { message = "Orders not found." });

        foreach (var (order, idx) in orders.Select((o, i) => (o, i)))
        {
            if (dto.Action == "updateStatus" && !string.IsNullOrWhiteSpace(dto.Status))
            {
                var prev = order.Status;
                order.Status    = dto.Status;
                order.UpdatedAt = DateTime.UtcNow;

                if (dto.Status == "delivered" && prev != "delivered")
                {
                    order.Reseller.TotalEarnings   += order.ResellerProfit;
                    order.Reseller.PendingEarnings  = Math.Max(0, order.Reseller.PendingEarnings - order.ResellerProfit);
                }
            }
            else if (dto.Action == "assign_tracking" && !string.IsNullOrWhiteSpace(dto.TrackingPrefix))
            {
                order.TrackingNumber = $"{dto.TrackingPrefix}-{order.Id:D5}";
                order.UpdatedAt      = DateTime.UtcNow;
            }
        }

        await db.SaveChangesAsync();
        return Ok(new { message = $"{orders.Count} orders updated.", updatedCount = orders.Count });
    }

    // GET api/reseller/admin/analytics — Full analytics
    [HttpGet("admin/analytics")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAnalytics()
    {
        // Leaderboard — top 10 resellers by earnings
        var topResellers = await db.ResellerProfiles
            .Include(r => r.User)
            .Include(r => r.Orders)
            .Where(r => r.Status == "approved")
            .OrderByDescending(r => r.TotalEarnings)
            .Take(10)
            .Select(r => new ResellerLeaderboardDto
            {
                ResellerId    = r.Id,
                Name          = r.User.Name,
                BusinessName  = r.BusinessName,
                City          = r.City,
                TotalOrders   = r.Orders.Count,
                TotalEarnings = r.TotalEarnings,
                TotalRevenue  = r.Orders.Sum(o => o.TotalAmount)
            })
            .ToListAsync();

        // Monthly stats — last 6 months
        var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);
        var allOrders = await db.ResellerOrders
            .Where(o => o.CreatedAt >= sixMonthsAgo)
            .ToListAsync();

        var monthlyStats = allOrders
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
            .Select(g => new MonthlyResellerStat
            {
                Month   = $"{g.Key.Year}-{g.Key.Month:D2}",
                Orders  = g.Count(),
                Revenue = g.Sum(o => o.TotalAmount),
                Profit  = g.Sum(o => o.ResellerProfit)
            })
            .ToList();

        // New resellers per month
        var newResellers = await db.ResellerProfiles
            .Where(r => r.AppliedAt >= sixMonthsAgo)
            .GroupBy(r => new { r.AppliedAt.Year, r.AppliedAt.Month })
            .Select(g => new { g.Key.Year, g.Key.Month, Count = g.Count() })
            .ToListAsync();

        foreach (var stat in monthlyStats)
        {
            var parts = stat.Month.Split('-');
            var nr    = newResellers.FirstOrDefault(n => n.Year == int.Parse(parts[0]) && n.Month == int.Parse(parts[1]));
            stat.NewResellers = nr?.Count ?? 0;
        }

        // Orders by status
        var ordersByStatus = await db.ResellerOrders
            .GroupBy(o => o.Status)
            .Select(g => new ResellerOrderStatusStat { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        // Totals
        var totalPayouts   = await db.ResellerPayments.SumAsync(p => (decimal?)p.Amount) ?? 0;
        var totalProfit    = await db.ResellerOrders.SumAsync(o => (decimal?)o.ResellerProfit) ?? 0;
        var activeCount    = await db.ResellerProfiles.CountAsync(r => r.Status == "approved");
        var totalOrdersAll = await db.ResellerOrders.CountAsync();

        return Ok(new ResellerAnalyticsDto
        {
            TopResellers           = topResellers,
            MonthlyStats           = monthlyStats,
            TotalPayoutsPaid       = totalPayouts,
            TotalProfitGenerated   = totalProfit,
            TotalActiveResellers   = activeCount,
            TotalResellerOrders    = totalOrdersAll,
            OrdersByStatus         = ordersByStatus
        });
    }

    // GET api/reseller/admin/pending-payouts — Resellers with balance due
    [HttpGet("admin/pending-payouts")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetPendingPayouts()
    {
        var resellers = await db.ResellerProfiles
            .Include(r => r.User)
            .Where(r => r.Status == "approved" && (r.TotalEarnings - r.WithdrawnAmount) > 0)
            .OrderByDescending(r => r.TotalEarnings - r.WithdrawnAmount)
            .Select(r => new
            {
                r.Id,
                Name          = r.User.Name,
                r.BusinessName,
                r.City,
                r.PaymentMethod,
                r.AccountNumber,
                r.AccountTitle,
                r.TotalEarnings,
                r.WithdrawnAmount,
                AvailableBalance = r.TotalEarnings - r.WithdrawnAmount
            })
            .ToListAsync();

        return Ok(new
        {
            count        = resellers.Count,
            totalDue     = resellers.Sum(r => r.AvailableBalance),
            resellers
        });
    }

    // ── Helpers ───────────────────────────────────────────────
    private static ResellerProfileDto MapToDto(ResellerProfile r) => new()
    {
        Id              = r.Id,
        UserId          = r.UserId,
        Name            = r.User.Name,
        Email           = r.User.Email,
        Phone           = r.User.Phone,
        BusinessName    = r.BusinessName,
        WhatsApp        = r.WhatsApp,
        City            = r.City,
        Address         = r.Address,
        CNIC            = r.CNIC,
        PaymentMethod   = r.PaymentMethod,
        AccountTitle    = r.AccountTitle,
        AccountNumber   = r.AccountNumber,
        BankName        = r.BankName,
        Status          = r.Status,
        RejectionReason = r.RejectionReason,
        AppliedAt       = r.AppliedAt,
        ApprovedAt      = r.ApprovedAt,
        TotalEarnings   = r.TotalEarnings,
        PendingEarnings = r.PendingEarnings,
        WithdrawnAmount = r.WithdrawnAmount,
        TotalOrders     = r.Orders.Count
    };

    private static ResellerOrderResponseDto MapOrderToDto(ResellerOrder o) => new()
    {
        Id              = o.Id,
        CustomerName    = o.CustomerName,
        CustomerPhone   = o.CustomerPhone,
        CustomerCity    = o.CustomerCity,
        CustomerAddress = o.CustomerAddress,
        PaymentMethod   = o.PaymentMethod,
        SubTotal        = o.SubTotal,
        ShippingCost    = o.ShippingCost,
        ResellerProfit  = o.ResellerProfit,
        TotalAmount     = o.TotalAmount,
        Status          = o.Status,
        TrackingNumber  = o.TrackingNumber,
        Notes           = o.Notes,
        CreatedAt       = o.CreatedAt,
        Items           = o.Items.Select(i => new ResellerOrderItemResponseDto
        {
            ProductName   = i.ProductName,
            ProductImage  = i.ProductImage,
            BasePrice     = i.BasePrice,
            ResellerPrice = i.ResellerPrice,
            Profit        = i.Profit,
            Quantity      = i.Quantity,
            SelectedSize  = i.SelectedSize,
            SelectedColor = i.SelectedColor
        }).ToList()
    };
}
