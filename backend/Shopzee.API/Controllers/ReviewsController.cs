using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.Models;
using System.Security.Claims;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/products/{productId:int}/reviews")]
public class ReviewsController(ShopzeeDbContext db) : ControllerBase
{
    private int? UserId => User.Identity?.IsAuthenticated == true
        ? int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
        : null;

    // GET api/products/{productId}/reviews
    [HttpGet]
    public async Task<IActionResult> GetReviews(int productId)
    {
        var reviews = await db.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsApproved)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.Id,
                r.Rating,
                r.Comment,
                r.CreatedAt,
                userName    = r.User.Name,
                userInitial = r.User.Name.Substring(0, 1).ToUpper()
            })
            .ToListAsync();

        var avg = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0.0;
        var dist = new int[5];
        foreach (var r in reviews) dist[r.Rating - 1]++;

        return Ok(new
        {
            reviews,
            average      = Math.Round(avg, 1),
            totalCount   = reviews.Count,
            distribution = dist   // [1star, 2star, 3star, 4star, 5star]
        });
    }

    // POST api/products/{productId}/reviews  [Auth]
    [HttpPost]
    [Authorize]
    public async Task<IActionResult> AddReview(int productId, [FromBody] CreateReviewDto dto)
    {
        if (dto.Rating < 1 || dto.Rating > 5)
            return BadRequest(new { message = "Rating must be between 1 and 5." });

        if (string.IsNullOrWhiteSpace(dto.Comment) || dto.Comment.Trim().Length < 5)
            return BadRequest(new { message = "Review comment must be at least 5 characters." });

        var product = await db.Products.FindAsync(productId);
        if (product is null || !product.IsActive)
            return NotFound(new { message = "Product not found." });

        var uid = UserId!.Value;

        // One review per user per product
        var existing = await db.Reviews.FirstOrDefaultAsync(r => r.ProductId == productId && r.UserId == uid);
        if (existing is not null)
            return BadRequest(new { message = "You have already reviewed this product." });

        var review = new Review
        {
            ProductId  = productId,
            UserId     = uid,
            Rating     = dto.Rating,
            Comment    = dto.Comment.Trim(),
            IsApproved = true
        };
        db.Reviews.Add(review);

        // Update product rating
        var allReviews = await db.Reviews
            .Where(r => r.ProductId == productId && r.IsApproved)
            .ToListAsync();

        var newCount = allReviews.Count + 1;
        var newAvg   = (allReviews.Sum(r => r.Rating) + dto.Rating) / (double)newCount;
        product.Rating      = Math.Round(newAvg, 1);
        product.ReviewCount = newCount;

        await db.SaveChangesAsync();

        var user = await db.Users.FindAsync(uid);
        return Ok(new
        {
            id          = review.Id,
            rating      = review.Rating,
            comment     = review.Comment,
            createdAt   = review.CreatedAt,
            userName    = user!.Name,
            userInitial = user.Name.Substring(0, 1).ToUpper()
        });
    }
}

public record CreateReviewDto(int Rating, string Comment);
