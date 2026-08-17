namespace Shopzee.API.DTOs;

// ── Reseller Signup ───────────────────────────────────────────
public class ResellerSignupDto
{
    // Personal
    public string Name          { get; set; } = "";
    public string Email         { get; set; } = "";
    public string Password      { get; set; } = "";
    public string Phone         { get; set; } = "";

    // Business
    public string BusinessName  { get; set; } = "";
    public string WhatsApp      { get; set; } = "";
    public string City          { get; set; } = "";
    public string Address       { get; set; } = "";
    public string? CNIC         { get; set; }

    // Payment
    public string PaymentMethod { get; set; } = "easypaisa";
    public string AccountTitle  { get; set; } = "";
    public string AccountNumber { get; set; } = "";
    public string? BankName     { get; set; }
}

// ── Reseller Profile Response ─────────────────────────────────
public class ResellerProfileDto
{
    public int     Id              { get; set; }
    public int     UserId          { get; set; }
    public string  Name            { get; set; } = "";
    public string  Email           { get; set; } = "";
    public string  Phone           { get; set; } = "";
    public string  BusinessName    { get; set; } = "";
    public string  WhatsApp        { get; set; } = "";
    public string  City            { get; set; } = "";
    public string  Address         { get; set; } = "";
    public string? CNIC            { get; set; }
    public string  PaymentMethod   { get; set; } = "";
    public string  AccountTitle    { get; set; } = "";
    public string  AccountNumber   { get; set; } = "";
    public string? BankName        { get; set; }
    public string  Status          { get; set; } = "";
    public string? RejectionReason { get; set; }
    public DateTime AppliedAt      { get; set; }
    public DateTime? ApprovedAt    { get; set; }
    public decimal TotalEarnings   { get; set; }
    public decimal PendingEarnings { get; set; }
    public decimal WithdrawnAmount { get; set; }
    public int     TotalOrders     { get; set; }
}

// ── Reseller Order Place ──────────────────────────────────────
public class PlaceResellerOrderDto
{
    public string CustomerName    { get; set; } = "";
    public string CustomerPhone   { get; set; } = "";
    public string CustomerCity    { get; set; } = "";
    public string CustomerAddress { get; set; } = "";
    public string PaymentMethod   { get; set; } = "cod";
    public string? Notes          { get; set; }
    public List<ResellerOrderItemDto> Items { get; set; } = [];
}

public class ResellerOrderItemDto
{
    public int     ProductId      { get; set; }
    public int     Quantity       { get; set; } = 1;
    public string  SelectedSize   { get; set; } = "";
    public string  SelectedColor  { get; set; } = "";
    public decimal ResellerPrice  { get; set; }  // Price reseller charges customer
}

// ── Reseller Order Response ───────────────────────────────────
public class ResellerOrderResponseDto
{
    public int     Id              { get; set; }
    public string  CustomerName    { get; set; } = "";
    public string  CustomerPhone   { get; set; } = "";
    public string  CustomerCity    { get; set; } = "";
    public string  CustomerAddress { get; set; } = "";
    public string  PaymentMethod   { get; set; } = "";
    public decimal SubTotal        { get; set; }
    public decimal ShippingCost    { get; set; }
    public decimal ResellerProfit  { get; set; }
    public decimal TotalAmount     { get; set; }
    public string  Status          { get; set; } = "";
    public string? TrackingNumber  { get; set; }
    public string? Notes           { get; set; }
    public DateTime CreatedAt      { get; set; }
    public List<ResellerOrderItemResponseDto> Items { get; set; } = [];
}

public class ResellerOrderItemResponseDto
{
    public string  ProductName    { get; set; } = "";
    public string  ProductImage   { get; set; } = "";
    public decimal BasePrice      { get; set; }
    public decimal ResellerPrice  { get; set; }
    public decimal Profit         { get; set; }
    public int     Quantity       { get; set; }
    public string  SelectedSize   { get; set; } = "";
    public string  SelectedColor  { get; set; } = "";
}

// ── Admin: All Resellers ──────────────────────────────────────
public class AdminResellerDto
{
    public int     Id              { get; set; }
    public int     UserId          { get; set; }
    public string  Name            { get; set; } = "";
    public string  Email           { get; set; } = "";
    public string  Phone           { get; set; } = "";
    public string  BusinessName    { get; set; } = "";
    public string  WhatsApp        { get; set; } = "";
    public string  City            { get; set; } = "";
    public string  PaymentMethod   { get; set; } = "";
    public string  AccountNumber   { get; set; } = "";
    public string  Status          { get; set; } = "";
    public DateTime AppliedAt      { get; set; }
    public decimal TotalEarnings   { get; set; }
    public int     TotalOrders     { get; set; }
}

public class ApproveResellerDto
{
    public string Action           { get; set; } = "approve"; // approve | reject
    public string? RejectionReason { get; set; }
}
