using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.Helpers;
using Shopzee.API.Models;
using System.Security.Claims;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/wishlist")]
[Authorize]
public class WishlistController(ShopzeeDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // GET api/wishlist
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var items = await db.WishlistItems
            .Include(w => w.Product).ThenInclude(p => p.Category)
            .Where(w => w.UserId == UserId)
            .OrderByDescending(w => w.AddedAt)
            .Select(w => w.Product.ToDto())
            .ToListAsync();
        return Ok(items);
    }

    // POST api/wishlist/{productId}  — toggle
    [HttpPost("{productId:int}")]
    public async Task<IActionResult> Toggle(int productId)
    {
        var existing = await db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == UserId && w.ProductId == productId);

        if (existing is not null)
        {
            db.WishlistItems.Remove(existing);
            await db.SaveChangesAsync();
            return Ok(new { wishlisted = false });
        }

        var product = await db.Products.FindAsync(productId);
        if (product is null) return NotFound();

        db.WishlistItems.Add(new WishlistItem { UserId = UserId, ProductId = productId });
        await db.SaveChangesAsync();
        return Ok(new { wishlisted = true });
    }

    // DELETE api/wishlist/{productId}
    [HttpDelete("{productId:int}")]
    public async Task<IActionResult> Remove(int productId)
    {
        var item = await db.WishlistItems
            .FirstOrDefaultAsync(w => w.UserId == UserId && w.ProductId == productId);
        if (item is null) return NotFound();

        db.WishlistItems.Remove(item);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
