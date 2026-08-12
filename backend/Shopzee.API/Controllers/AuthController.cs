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
[Route("api/auth")]
public class AuthController(ShopzeeDbContext db, JwtHelper jwt) : ControllerBase
{
    // POST api/auth/register
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            return BadRequest(new { message = "Email already registered." });

        var user = new User
        {
            Name         = dto.Name.Trim(),
            Email        = dto.Email.ToLower().Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Phone        = dto.Phone,
            Role         = "customer"
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        // Create empty cart
        db.Carts.Add(new Cart { UserId = user.Id });
        await db.SaveChangesAsync();

        var token = jwt.GenerateToken(user);
        return Ok(new AuthResponseDto(token, "", user.ToDto()));
    }

    // POST api/auth/login
    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());
        if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });

        if (!user.IsActive)
            return Unauthorized(new { message = "Account is disabled." });

        var token = jwt.GenerateToken(user);
        return Ok(new AuthResponseDto(token, "", user.ToDto()));
    }

    // GET api/auth/me
    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user   = await db.Users.FindAsync(userId);
        return user is null ? NotFound() : Ok(user.ToDto());
    }

    // PUT api/auth/profile
    [Authorize]
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile(UpdateProfileDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user   = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        user.Name  = dto.Name.Trim();
        user.Phone = dto.Phone;
        await db.SaveChangesAsync();
        return Ok(user.ToDto());
    }

    // PUT api/auth/change-password
    [Authorize]
    [HttpPut("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var user   = await db.Users.FindAsync(userId);
        if (user is null) return NotFound();

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        await db.SaveChangesAsync();
        return Ok(new { message = "Password updated successfully." });
    }
}
