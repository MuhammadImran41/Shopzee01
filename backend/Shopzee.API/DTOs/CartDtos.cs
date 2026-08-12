namespace Shopzee.API.DTOs;

public class AddToCartDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } = 1;
    public string SelectedSize { get; set; } = "";
    public string SelectedColor { get; set; } = "";
}

public class UpdateCartItemDto
{
    public int Quantity { get; set; }
}

public class CartDto
{
    public int Id { get; set; }
    public List<CartItemDto> Items { get; set; } = [];
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Total { get; set; }
    public int ItemCount { get; set; }
}

public class CartItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string ProductImage { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public string SelectedSize { get; set; } = "";
    public string SelectedColor { get; set; } = "";
    public decimal LineTotal { get; set; }
    public int Stock { get; set; }
}
