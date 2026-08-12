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
[Route("api/cart")]
[Authorize]
public class CartController(ShopzeeDbContext db) : ControllerBase
{
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private async Task<Cart> GetOrCreateCart()
    {
        var cart = await db.Carts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == UserId);

        if (cart is null)
        {
            cart = new Cart { UserId = UserId };
            db.Carts.Add(cart);
            await db.SaveChangesAsync();
        }
        return cart;
    }

    private static CartDto MapCart(Cart cart)
    {
        const decimal freeShippingThreshold = 5000m;
        var subTotal = cart.Items.Sum(i => (i.Product?.Price ?? 0) * i.Quantity);
        var shipping = subTotal >= freeShippingThreshold ? 0m : 300m;

        return new CartDto
        {
            Id           = cart.Id,
            Items        = cart.Items.Select(i => i.ToDto()).ToList(),
            SubTotal     = subTotal,
            ShippingCost = shipping,
            Total        = subTotal + shipping,
            ItemCount    = cart.Items.Sum(i => i.Quantity)
        };
    }

    // GET api/cart
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var cart = await GetOrCreateCart();
        return Ok(MapCart(cart));
    }

    // POST api/cart/items
    [HttpPost("items")]
    public async Task<IActionResult> AddItem(AddToCartDto dto)
    {
        var product = await db.Products.FindAsync(dto.ProductId);
        if (product is null || !product.IsActive)
            return NotFound(new { message = "Product not found." });

        if (product.Stock < dto.Quantity)
            return BadRequest(new { message = "Insufficient stock." });

        var cart = await GetOrCreateCart();

        var existing = cart.Items.FirstOrDefault(i =>
            i.ProductId    == dto.ProductId &&
            i.SelectedSize == dto.SelectedSize &&
            i.SelectedColor== dto.SelectedColor);

        if (existing is not null)
            existing.Quantity += dto.Quantity;
        else
            cart.Items.Add(new CartItem
            {
                CartId        = cart.Id,
                ProductId     = dto.ProductId,
                Quantity      = dto.Quantity,
                SelectedSize  = dto.SelectedSize,
                SelectedColor = dto.SelectedColor
            });

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        // Reload with product data
        var updated = await GetOrCreateCart();
        return Ok(MapCart(updated));
    }

    // PUT api/cart/items/{itemId}
    [HttpPut("items/{itemId:int}")]
    public async Task<IActionResult> UpdateItem(int itemId, UpdateCartItemDto dto)
    {
        var cart = await GetOrCreateCart();
        var item = cart.Items.FirstOrDefault(i => i.Id == itemId);
        if (item is null) return NotFound();

        if (dto.Quantity <= 0)
            db.CartItems.Remove(item);
        else
            item.Quantity = dto.Quantity;

        cart.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        var updated = await GetOrCreateCart();
        return Ok(MapCart(updated));
    }

    // DELETE api/cart/items/{itemId}
    [HttpDelete("items/{itemId:int}")]
    public async Task<IActionResult> RemoveItem(int itemId)
    {
        var item = await db.CartItems
            .FirstOrDefaultAsync(i => i.Id == itemId && i.Cart.UserId == UserId);

        if (item is null) return NotFound();

        db.CartItems.Remove(item);
        await db.SaveChangesAsync();

        var updated = await GetOrCreateCart();
        return Ok(MapCart(updated));
    }

    // DELETE api/cart  (clear)
    [HttpDelete]
    public async Task<IActionResult> Clear()
    {
        var cart = await db.Carts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.UserId == UserId);

        if (cart is not null)
        {
            db.CartItems.RemoveRange(cart.Items);
            await db.SaveChangesAsync();
        }
        return NoContent();
    }
}
