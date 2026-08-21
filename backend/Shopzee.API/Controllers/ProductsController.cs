using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.DTOs;
using Shopzee.API.Helpers;
using Shopzee.API.Models;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/products")]
public class ProductsController(ShopzeeDbContext db) : ControllerBase
{
    // GET api/products
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] ProductFilterDto filter)
    {
        var q = db.Products
                  .Include(p => p.Category)
                  .Where(p => p.IsActive)
                  .AsQueryable();

        // Filters
        if (!string.IsNullOrWhiteSpace(filter.Category))
            q = q.Where(p => p.Category.Slug == filter.Category.ToLower());

        if (!string.IsNullOrWhiteSpace(filter.SubCategory))
            q = q.Where(p => p.SubCategory == filter.SubCategory);

        if (filter.MinPrice.HasValue)
            q = q.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            q = q.Where(p => p.Price <= filter.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(filter.Tag))
            q = q.Where(p => p.Tags.Contains(filter.Tag));

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var s = filter.Search.ToLower();
            q = q.Where(p => p.Name.ToLower().Contains(s)
                           || p.Description.ToLower().Contains(s)
                           || p.Tags.ToLower().Contains(s));
        }

        // Sorting (Cast to double for SQLite decimal OrderBy compatibility)
        q = filter.SortBy switch
        {
            "price-asc"  => q.OrderBy(p => (double)p.Price),
            "price-desc" => q.OrderByDescending(p => (double)p.Price),
            "newest"     => q.OrderByDescending(p => p.CreatedAt),
            "rating"     => q.OrderByDescending(p => p.Rating),
            _            => q.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
        };

        var total = await q.CountAsync();
        var items = await q
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(p => p.ToDto())
            .ToListAsync();

        return Ok(new PagedResult<ProductDto>
        {
            Items      = items,
            TotalCount = total,
            Page       = filter.Page,
            PageSize   = filter.PageSize
        });
    }

    // GET api/products/featured
    [HttpGet("featured")]
    public async Task<IActionResult> GetFeatured()
    {
        var items = await db.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive && p.IsFeatured)
            .OrderByDescending(p => p.Rating)
            .Take(8)
            .Select(p => p.ToDto())
            .ToListAsync();

        return Ok(items);
    }

    // GET api/products/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        return p is null ? NotFound() : Ok(p.ToDto());
    }

    // GET api/products/slug/{slug}
    [HttpGet("slug/{slug}")]
    public async Task<IActionResult> GetBySlug(string slug)
    {
        var p = await db.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

        return p is null ? NotFound() : Ok(p.ToDto());
    }

    // GET api/products/{id}/related
    [HttpGet("{id:int}/related")]
    public async Task<IActionResult> GetRelated(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        var related = await db.Products
            .Include(p => p.Category)
            .Where(p => p.CategoryId == product.CategoryId
                     && p.Id != id
                     && p.IsActive)
            .OrderByDescending(p => p.Rating)
            .Take(4)
            .Select(p => p.ToDto())
            .ToListAsync();

        return Ok(related);
    }

    // GET api/products/categories
    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var cats = await db.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.SortOrder)
            .Select(c => new { c.Id, c.Name, c.Slug, c.Description })
            .ToListAsync();
        return Ok(cats);
    }

    // ── Admin endpoints ──────────────────────────────────────

    // POST api/products  [Admin]
    [Authorize(Roles = "admin")]
    [HttpPost]
    public async Task<IActionResult> Create(CreateProductDto dto)
    {
        var product = new Product
        {
            Name           = dto.Name.Trim(),
            Slug           = dto.Name.ToSlug(),
            Description    = dto.Description,
            Price          = dto.Price,
            OriginalPrice  = dto.OriginalPrice,
            DiscountPercent= dto.OriginalPrice.HasValue
                                 ? (int?)Math.Round((1 - dto.Price / dto.OriginalPrice.Value) * 100)
                                 : null,
            CategoryId     = dto.CategoryId,
            SubCategory    = dto.SubCategory,
            Sku            = dto.Sku,
            Images         = string.Join(",", dto.Images),
            Colors         = string.Join(",", dto.Colors),
            Sizes          = string.Join(",", dto.Sizes),
            Tags           = string.Join(",", dto.Tags),
            Stock          = dto.Stock,
            IsNew          = dto.IsNew,
            IsFeatured     = dto.IsFeatured,
            SeoTitle       = dto.SeoTitle,
            SeoDescription = dto.SeoDescription,
            SeoKeywords    = dto.SeoKeywords
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        var created = await db.Products.Include(p => p.Category).FirstAsync(p => p.Id == product.Id);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, created.ToDto());
    }

    // PUT api/products/{id}  [Admin]
    [Authorize(Roles = "admin")]
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateProductDto dto)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.Name           = dto.Name.Trim();
        product.Slug           = dto.Name.ToSlug();
        product.Description    = dto.Description;
        product.Price          = dto.Price;
        product.OriginalPrice  = dto.OriginalPrice;
        product.CategoryId     = dto.CategoryId;
        product.SubCategory    = dto.SubCategory;
        product.Sku            = dto.Sku;
        product.Images         = string.Join(",", dto.Images);
        product.Colors         = string.Join(",", dto.Colors);
        product.Sizes          = string.Join(",", dto.Sizes);
        product.Tags           = string.Join(",", dto.Tags);
        product.Stock          = dto.Stock;
        product.IsNew          = dto.IsNew;
        product.IsFeatured     = dto.IsFeatured;
        product.IsActive       = dto.IsActive;
        product.IsInStock      = dto.IsInStock;
        product.SeoTitle       = dto.SeoTitle;
        product.SeoDescription = dto.SeoDescription;
        product.SeoKeywords    = dto.SeoKeywords;
        product.UpdatedAt      = DateTime.UtcNow;

        await db.SaveChangesAsync();
        var updated = await db.Products.Include(p => p.Category).FirstAsync(p => p.Id == id);
        return Ok(updated.ToDto());
    }

    // DELETE api/products/{id}  [Admin]
    [Authorize(Roles = "admin")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        // Soft delete
        product.IsActive  = false;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // PATCH api/products/{id}/stock-toggle  [Admin]
    [Authorize(Roles = "admin")]
    [HttpPatch("{id:int}/stock-toggle")]
    public async Task<IActionResult> ToggleStock(int id)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.IsInStock = !product.IsInStock;
        product.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();

        return Ok(new { id = product.Id, isInStock = product.IsInStock });
    }

    // PUT api/products/{id}/seo  [Admin]
    [Authorize(Roles = "admin")]
    [HttpPut("{id:int}/seo")]
    public async Task<IActionResult> UpdateSeo(int id, UpdateSeoDto dto)
    {
        var product = await db.Products.FindAsync(id);
        if (product is null) return NotFound();

        product.SeoTitle       = dto.SeoTitle;
        product.SeoDescription = dto.SeoDescription;
        product.SeoKeywords    = dto.SeoKeywords;
        product.UpdatedAt      = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(new { message = "SEO updated." });
    }
}
