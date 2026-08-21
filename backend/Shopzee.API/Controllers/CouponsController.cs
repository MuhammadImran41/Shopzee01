using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.Models;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/coupons")]
public class CouponsController(ShopzeeDbContext db) : ControllerBase
{
    // POST api/coupons/validate  [Auth]
    [HttpPost("validate")]
    [Authorize]
    public async Task<IActionResult> Validate([FromBody] ValidateCouponDto dto)
    {
        var code = dto.Code?.Trim().ToUpper();
        if (string.IsNullOrEmpty(code))
            return BadRequest(new { message = "Please enter a coupon code." });

        var coupon = await db.Coupons.FirstOrDefaultAsync(c =>
            c.Code == code && c.IsActive);

        if (coupon is null)
            return BadRequest(new { message = "Invalid coupon code." });

        if (coupon.ExpiresAt.HasValue && coupon.ExpiresAt < DateTime.UtcNow)
            return BadRequest(new { message = "This coupon has expired." });

        if (coupon.MaxUses.HasValue && coupon.UsedCount >= coupon.MaxUses)
            return BadRequest(new { message = "This coupon has reached its usage limit." });

        if (coupon.MinOrderAmount.HasValue && dto.OrderAmount < coupon.MinOrderAmount)
            return BadRequest(new { message = $"Minimum order of PKR {coupon.MinOrderAmount:N0} required for this coupon." });

        var discount = coupon.Type == "percent"
            ? Math.Round(dto.OrderAmount * coupon.Value / 100, 0)
            : coupon.Value;

        discount = Math.Min(discount, dto.OrderAmount); // can't discount more than total

        return Ok(new
        {
            code         = coupon.Code,
            type         = coupon.Type,
            value        = coupon.Value,
            discount,
            message      = coupon.Type == "percent"
                ? $"{coupon.Value}% off applied! Saving PKR {discount:N0}"
                : $"PKR {discount:N0} off applied!"
        });
    }

    // ── Admin CRUD ───────────────────────────────────────

    // GET api/coupons  [Admin]
    [HttpGet]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> GetAll()
    {
        var coupons = await db.Coupons
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id, c.Code, c.Type, c.Value,
                c.MinOrderAmount, c.MaxUses, c.UsedCount,
                c.ExpiresAt, c.IsActive, c.CreatedAt,
                isExpired = c.ExpiresAt.HasValue && c.ExpiresAt < DateTime.UtcNow
            })
            .ToListAsync();
        return Ok(coupons);
    }

    // POST api/coupons  [Admin]
    [HttpPost]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Create([FromBody] CreateCouponDto dto)
    {
        var code = dto.Code.Trim().ToUpper();
        if (await db.Coupons.AnyAsync(c => c.Code == code))
            return BadRequest(new { message = "A coupon with this code already exists." });

        var coupon = new Coupon
        {
            Code            = code,
            Type            = dto.Type,
            Value           = dto.Value,
            MinOrderAmount  = dto.MinOrderAmount,
            MaxUses         = dto.MaxUses,
            ExpiresAt       = dto.ExpiresAt
        };

        db.Coupons.Add(coupon);
        await db.SaveChangesAsync();
        return Ok(coupon);
    }

    // PATCH api/coupons/{id}/toggle  [Admin]
    [HttpPatch("{id:int}/toggle")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Toggle(int id)
    {
        var coupon = await db.Coupons.FindAsync(id);
        if (coupon is null) return NotFound();
        coupon.IsActive = !coupon.IsActive;
        await db.SaveChangesAsync();
        return Ok(new { id, isActive = coupon.IsActive });
    }

    // DELETE api/coupons/{id}  [Admin]
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "admin")]
    public async Task<IActionResult> Delete(int id)
    {
        var coupon = await db.Coupons.FindAsync(id);
        if (coupon is null) return NotFound();
        db.Coupons.Remove(coupon);
        await db.SaveChangesAsync();
        return NoContent();
    }
}

public record ValidateCouponDto(string Code, decimal OrderAmount);
public record CreateCouponDto(
    string Code, string Type, decimal Value,
    decimal? MinOrderAmount, int? MaxUses, DateTime? ExpiresAt);
