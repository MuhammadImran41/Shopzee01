using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Shopzee.API.Data;
using Shopzee.API.Models;
using System.Security.Claims;

namespace Shopzee.API.Controllers;

[ApiController]
[Route("api/settings")]
[Authorize(Roles = "admin")]
public class SettingsController(ShopzeeDbContext db) : ControllerBase
{
    private int AdminId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ── GET all settings ─────────────────────────────
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var settings = await db.SiteSettings
            .OrderBy(s => s.Group).ThenBy(s => s.Key)
            .ToListAsync();

        // Group them for easy frontend consumption
        var grouped = settings
            .GroupBy(s => s.Group ?? "general")
            .ToDictionary(
                g => g.Key,
                g => g.ToDictionary(s => s.Key, s => s.Value)
            );

        return Ok(grouped);
    }

    // ── GET by group ──────────────────────────────────
    [HttpGet("{group}")]
    [AllowAnonymous]  // Theme + images are public (needed on app load)
    public async Task<IActionResult> GetByGroup(string group)
    {
        var settings = await db.SiteSettings
            .Where(s => s.Group == group)
            .ToDictionaryAsync(s => s.Key, s => s.Value);
        return Ok(settings);
    }

    // ── BULK UPSERT ───────────────────────────────────
    [HttpPost("bulk")]
    public async Task<IActionResult> BulkSave([FromBody] BulkSaveDto dto)
    {
        foreach (var kv in dto.Settings)
        {
            var existing = await db.SiteSettings.FirstOrDefaultAsync(s => s.Key == kv.Key);
            if (existing is not null)
            {
                existing.Value     = kv.Value;
                existing.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                db.SiteSettings.Add(new SiteSetting
                {
                    Key   = kv.Key,
                    Value = kv.Value,
                    Group = kv.Group
                });
            }
        }
        await db.SaveChangesAsync();
        return Ok(new { message = "Settings saved." });
    }

    // ── CHANGE ADMIN CREDENTIALS ──────────────────────
    [HttpPost("admin-credentials")]
    public async Task<IActionResult> ChangeCredentials([FromBody] ChangeCredentialsDto dto)
    {
        var admin = await db.Users.FindAsync(AdminId);
        if (admin is null) return NotFound();

        // Verify current password
        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, admin.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect." });

        // Update email if provided
        if (!string.IsNullOrWhiteSpace(dto.NewEmail) && dto.NewEmail != admin.Email)
        {
            var emailExists = await db.Users.AnyAsync(u =>
                u.Email == dto.NewEmail.ToLower() && u.Id != AdminId);
            if (emailExists)
                return BadRequest(new { message = "This email is already in use." });
            admin.Email = dto.NewEmail.ToLower().Trim();
        }

        // Update password if provided
        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            if (dto.NewPassword.Length < 6)
                return BadRequest(new { message = "New password must be at least 6 characters." });
            admin.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        await db.SaveChangesAsync();
        return Ok(new
        {
            message  = "Credentials updated successfully.",
            email    = admin.Email
        });
    }
}

public record BulkSaveSettingItem(string Key, string Value, string? Group);
public record BulkSaveDto(List<BulkSaveSettingItem> Settings);
public record ChangeCredentialsDto(
    string CurrentPassword,
    string? NewEmail,
    string? NewPassword);
