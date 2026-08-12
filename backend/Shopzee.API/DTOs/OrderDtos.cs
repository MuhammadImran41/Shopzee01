namespace Shopzee.API.DTOs;

public class CreateOrderDto
{
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address1 { get; set; } = "";
    public string? Address2 { get; set; }
    public string City { get; set; } = "";
    public string State { get; set; } = "";
    public string PaymentMethod { get; set; } = "cod";
    public List<OrderItemInputDto> Items { get; set; } = [];
}

public class OrderItemInputDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public string SelectedSize { get; set; } = "";
    public string SelectedColor { get; set; } = "";
}

public class OrderDto
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = "";
    public string Status { get; set; } = "";
    public string PaymentMethod { get; set; } = "";
    public string PaymentStatus { get; set; } = "";
    public decimal SubTotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Total { get; set; }
    public string ShippingName { get; set; } = "";
    public string ShippingCity { get; set; } = "";
    public string ShippingPhone { get; set; } = "";
    public string? TrackingNumber { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = [];
}

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public string ProductImage { get; set; } = "";
    public decimal UnitPrice { get; set; }
    public int Quantity { get; set; }
    public string SelectedSize { get; set; } = "";
    public string SelectedColor { get; set; } = "";
    public decimal LineTotal { get; set; }
}

public class UpdateOrderStatusDto
{
    public string Status { get; set; } = "";
    public string? TrackingNumber { get; set; }
}
