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
            profile.User.Role  = "reseller"; // Upgrade role
        }
        else
        {
            profile.Status          = "rejected";
            profile.RejectionReason = dto.RejectionReason;
            profile.User.Role       = "customer"; // Keep as customer
        }

        await db.SaveChangesAsync();

        return Ok(new { message = $"Reseller {dto.Action}d successfully.", status = profile.Status });
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
