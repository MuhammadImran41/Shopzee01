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
[Route("api/orders")]
[Authorize]
public class OrdersController(ShopzeeDbContext db, EmailService emailService) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // POST api/orders  — place new order
    [HttpPost]
    public async Task<IActionResult> PlaceOrder(CreateOrderDto dto)
    {
        if (!dto.Items.Any())
            return BadRequest(new { message = "Order must have at least one item." });

        decimal subTotal = 0;
        var orderItems = new List<OrderItem>();

        foreach (var item in dto.Items)
        {
            var product = await db.Products.FindAsync(item.ProductId);
            if (product is null || !product.IsActive)
                return BadRequest(new { message = $"Product {item.ProductId} not found." });

            if (product.Stock < item.Quantity)
                return BadRequest(new { message = $"Insufficient stock for {product.Name}." });

            subTotal += product.Price * item.Quantity;

            orderItems.Add(new OrderItem
            {
                ProductId     = item.ProductId,
                ProductName   = product.Name,
                ProductImage  = product.Images.Split(',').FirstOrDefault() ?? "",
                UnitPrice     = product.Price,
                Quantity      = item.Quantity,
                SelectedSize  = item.SelectedSize,
                SelectedColor = item.SelectedColor
            });
        }

        const decimal freeShipping = 5000m;
        var shipping = subTotal >= freeShipping ? 0m : 300m;
        var orderNumber = $"SZ{DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 100000:D5}";

        var order = new Order
        {
            OrderNumber    = orderNumber,
            UserId         = UserId,
            ShippingName   = $"{dto.FirstName} {dto.LastName}".Trim(),
            ShippingLine1  = dto.Address1,
            ShippingLine2  = dto.Address2,
            ShippingCity   = dto.City,
            ShippingState  = dto.State,
            ShippingPhone  = dto.Phone,
            SubTotal       = subTotal,
            ShippingCost   = shipping,
            Total          = subTotal + shipping,
            PaymentMethod  = dto.PaymentMethod,
            Status         = "processing",
            Items          = orderItems
        };

        db.Orders.Add(order);

        // Reduce stock
        foreach (var item in dto.Items)
        {
            var product = await db.Products.FindAsync(item.ProductId);
            product!.Stock -= item.Quantity;
        }

        // Clear cart
        var cart = await db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == UserId);
        if (cart is not null)
            db.CartItems.RemoveRange(cart.Items);

        await db.SaveChangesAsync();

        var created = await db.Orders
            .Include(o => o.Items)
            .FirstAsync(o => o.Id == order.Id);

        var orderDto = created.ToDto();

        // ── Send emails (fire & forget — don't block response) ──
        var user = await db.Users.FindAsync(UserId);
        if (user is not null)
        {
            _ = Task.Run(async () =>
            {
                // 1. Confirmation to customer
                await emailService.SendOrderConfirmationAsync(
                    user.Email, user.Name, orderDto);

                // 2. Alert to admin
                await emailService.SendAdminOrderAlertAsync(
                    orderDto, user.Email);
            });
        }

        return CreatedAtAction(nameof(GetById), new { id = order.Id }, orderDto);
    }

    // GET api/orders  — my orders
    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var orders = await db.Orders
            .Include(o => o.Items)
            .Where(o => o.UserId == UserId)
            .OrderByDescending(o => o.CreatedAt)
            .Select(o => o.ToDto())
            .ToListAsync();
        return Ok(orders);
    }

    // GET api/orders/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var order = await db.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id && o.UserId == UserId);
        return order is null ? NotFound() : Ok(order.ToDto());
    }

    // ── Admin ───────────────────────────────────────────────

    // GET api/orders/admin/all  [Admin]
    [Authorize(Roles = "admin")]
    [HttpGet("admin/all")]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? status,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var q = db.Orders
            .Include(o => o.User)
            .Include(o => o.Items)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
            q = q.Where(o => o.Status == status);

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(o => o.OrderNumber.Contains(search)
                           || o.User.Name.Contains(search)
                           || o.User.Email.Contains(search));

        var total = await q.CountAsync();
        var orders = await q
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return Ok(new
        {
            items      = orders.Select(o => new
            {
                o.Id, o.OrderNumber,
                customerName  = o.User.Name,
                customerEmail = o.User.Email,
                o.Total, o.Status, o.PaymentMethod,
                o.CreatedAt,
                itemCount = o.Items.Count
            }),
            totalCount = total, page, pageSize
        });
    }

    // PUT api/orders/admin/{id}/status  [Admin]
    [Authorize(Roles = "admin")]
    [HttpPut("admin/{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        var order = await db.Orders.FindAsync(id);
        if (order is null) return NotFound();

        var validStatuses = new[] { "pending","processing","shipped","delivered","cancelled" };
        if (!validStatuses.Contains(dto.Status))
            return BadRequest(new { message = "Invalid status." });

        order.Status         = dto.Status;
        order.UpdatedAt      = DateTime.UtcNow;
        if (!string.IsNullOrWhiteSpace(dto.TrackingNumber))
            order.TrackingNumber = dto.TrackingNumber;

        await db.SaveChangesAsync();

        var updated = await db.Orders.Include(o => o.Items).FirstAsync(o => o.Id == id);
        return Ok(updated.ToDto());
    }
}
