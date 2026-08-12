namespace Shopzee.API.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int? DiscountPercent { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = "";
    public string SubCategory { get; set; } = "";
    public string Sku { get; set; } = "";
    public List<string> Images { get; set; } = [];
    public List<string> Colors { get; set; } = [];
    public List<string> Sizes { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public int Stock { get; set; }
    public bool IsNew { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateProductDto
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal Price { get; set; }
    public decimal? OriginalPrice { get; set; }
    public int CategoryId { get; set; }
    public string SubCategory { get; set; } = "";
    public string Sku { get; set; } = "";
    public List<string> Images { get; set; } = [];
    public List<string> Colors { get; set; } = [];
    public List<string> Sizes { get; set; } = [];
    public List<string> Tags { get; set; } = [];
    public int Stock { get; set; }
    public bool IsNew { get; set; }
    public bool IsFeatured { get; set; }
    public string? SeoTitle { get; set; }
    public string? SeoDescription { get; set; }
    public string? SeoKeywords { get; set; }
}

public class UpdateProductDto : CreateProductDto
{
    public bool IsActive { get; set; } = true;
}

public class ProductFilterDto
{
    public string? Category { get; set; }
    public string? SubCategory { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Tag { get; set; }
    public string? Search { get; set; }
    public string SortBy { get; set; } = "default";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 12;
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNext => Page < TotalPages;
    public bool HasPrev => Page > 1;
}
