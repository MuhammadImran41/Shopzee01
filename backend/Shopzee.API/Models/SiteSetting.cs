namespace Shopzee.API.Models;

/// <summary>
/// Key-value store for site-wide settings (theme colors, home images, etc.)
/// </summary>
public class SiteSetting
{
    public int    Id        { get; set; }
    public string Key       { get; set; } = string.Empty;  // e.g. "theme.gold"
    public string Value     { get; set; } = string.Empty;  // e.g. "#C9A84C"
    public string? Group    { get; set; }                  // "theme" | "images" | "general"
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
