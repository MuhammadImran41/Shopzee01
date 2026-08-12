namespace Shopzee.API.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;        // e.g. "Women", "Men"
    public string Slug { get; set; } = string.Empty;        // e.g. "women", "men"
    public string? Description { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; } = 0;

    // Navigation
    public ICollection<Product> Products { get; set; } = [];
}
