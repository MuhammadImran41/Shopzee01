using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Shopzee.API.DTOs;

namespace Shopzee.API.Helpers;

public class EmailSettings
{
    public string SmtpHost    { get; set; } = "smtp.gmail.com";
    public int    SmtpPort    { get; set; } = 587;
    public string Username    { get; set; } = "";
    public string Password    { get; set; } = "";
    public string FromName    { get; set; } = "STYLEMAKER";
    public string FromAddress { get; set; } = "";
    public string AdminEmail  { get; set; } = "";
}

public class EmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _settings = config.GetSection("Email").Get<EmailSettings>() ?? new EmailSettings();
        _logger   = logger;
    }

    // ── Forgot password email ─────────────────────────────
    public async Task SendForgotPasswordAsync(string toEmail, string toName, string resetToken)
    {
        var subject = "Reset Your Password — STYLEMAKER";
        var html = $"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"/></head>
            <body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,sans-serif;">
              <div style="max-width:520px;margin:40px auto;background:#fff;border:1px solid #ede9e0;">
                <div style="background:#1a1a1a;padding:28px 32px;text-align:center;">
                  <h1 style="margin:0;color:#c9a84c;font-family:Georgia,serif;font-size:24px;letter-spacing:4px;">STYLEMAKER</h1>
                </div>
                <div style="padding:40px 32px;">
                  <h2 style="font-family:Georgia,serif;font-size:20px;color:#1a1a1a;margin:0 0 12px;">Reset Your Password</h2>
                  <p style="color:#666;margin:0 0 8px;">Hello {toName},</p>
                  <p style="color:#666;margin:0 0 28px;line-height:1.7;">
                    We received a request to reset your STYLEMAKER password. Use the OTP code below — it expires in <strong>15 minutes</strong>.
                  </p>
                  <div style="background:#faf7f2;border:2px solid #c9a84c;padding:24px;text-align:center;margin-bottom:28px;">
                    <p style="margin:0 0 8px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#888;">Your OTP Code</p>
                    <p style="margin:0;font-size:40px;font-weight:700;letter-spacing:10px;color:#1a1a1a;font-family:monospace;">{resetToken}</p>
                  </div>
                  <p style="color:#999;font-size:13px;line-height:1.6;">
                    If you didn't request this, please ignore this email. Your password will remain unchanged.
                  </p>
                </div>
                <div style="background:#1a1a1a;padding:16px 32px;text-align:center;">
                  <p style="margin:0;color:rgba(245,240,232,0.4);font-size:11px;letter-spacing:1px;">
                    © {DateTime.UtcNow.Year} STYLEMAKER — Premium Pakistani Fashion
                  </p>
                </div>
              </div>
            </body>
            </html>
            """;
        await SendAsync(toEmail, toName, subject, html);
    }

    // ── Order confirmation to customer ───────────────────
    public async Task SendOrderConfirmationAsync(string toEmail, string toName, OrderDto order)
    {
        var subject = $"Order Confirmed — #{order.OrderNumber} | STYLEMAKER";
        var html    = BuildOrderConfirmationHtml(toName, order);
        await SendAsync(toEmail, toName, subject, html);
    }

    // ── Order alert to admin ──────────────────────────────
    public async Task SendAdminOrderAlertAsync(OrderDto order, string customerEmail)
    {
        var subject = $"🛒 New Order #{order.OrderNumber} — PKR {order.Total:N0}";
        var html    = BuildAdminAlertHtml(order, customerEmail);
        await SendAsync(_settings.AdminEmail, "STYLEMAKER Admin", subject, html);
    }

    // ── Core send method ──────────────────────────────────
    private async Task SendAsync(string toEmail, string toName, string subject, string htmlBody)
    {
        if (string.IsNullOrWhiteSpace(_settings.Password))
        {
            _logger.LogWarning("Email not sent — Email:Password not configured. Subject: {Subject}", subject);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
            message.To.Add(new MailboxAddress(toName, toEmail));
            message.Subject = subject;

            var builder = new BodyBuilder { HtmlBody = htmlBody };
            message.Body = builder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(_settings.SmtpHost, _settings.SmtpPort, SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(_settings.Username, _settings.Password);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation("Email sent to {Email} — {Subject}", toEmail, subject);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {Email}", toEmail);
        }
    }

    // ── HTML Templates ────────────────────────────────────
    private static string BuildOrderConfirmationHtml(string name, OrderDto order)
    {
        var itemsHtml = string.Join("", order.Items.Select(i => $"""
            <tr>
              <td style="padding:10px 0;border-bottom:1px solid #f0ece4;">
                <strong style="color:#1a1a1a">{i.ProductName}</strong><br/>
                <span style="font-size:12px;color:#888">Size: {i.SelectedSize} | Color: {i.SelectedColor} | Qty: {i.Quantity}</span>
              </td>
              <td style="padding:10px 0;border-bottom:1px solid #f0ece4;text-align:right;color:#b8963c;font-weight:600">
                PKR {i.UnitPrice * i.Quantity:N0}
              </td>
            </tr>
            """));

        return $"""
            <!DOCTYPE html>
            <html>
            <head><meta charset="utf-8"/></head>
            <body style="margin:0;padding:0;background:#f5f0e8;font-family:Inter,sans-serif;">
              <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #ede9e0;">

                <!-- Header -->
                <div style="background:#1a1a1a;padding:32px;text-align:center;">
                  <h1 style="margin:0;color:#c9a84c;font-family:Georgia,serif;font-size:28px;letter-spacing:4px;">STYLEMAKER</h1>
                  <p style="margin:8px 0 0;color:rgba(245,240,232,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Premium Pakistani Fashion</p>
                </div>

                <!-- Body -->
                <div style="padding:40px 32px;">
                  <h2 style="font-family:Georgia,serif;font-size:22px;color:#1a1a1a;margin:0 0 8px;">Order Confirmed ✓</h2>
                  <p style="color:#666;margin:0 0 24px;">Hello {name}, your order has been placed successfully!</p>

                  <!-- Order Info -->
                  <div style="background:#faf7f2;border:1px solid #ede9e0;padding:16px 20px;margin-bottom:28px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr>
                        <td style="color:#888;font-size:13px;">Order Number</td>
                        <td style="text-align:right;font-weight:700;color:#b8963c">#{order.OrderNumber}</td>
                      </tr>
                      <tr>
                        <td style="color:#888;font-size:13px;padding-top:6px;">Date</td>
                        <td style="text-align:right;font-size:13px;padding-top:6px;">{order.CreatedAt:dd MMM yyyy, hh:mm tt}</td>
                      </tr>
                      <tr>
                        <td style="color:#888;font-size:13px;padding-top:6px;">Payment</td>
                        <td style="text-align:right;font-size:13px;padding-top:6px;text-transform:capitalize">{order.PaymentMethod}</td>
                      </tr>
                    </table>
                  </div>

                  <!-- Items -->
                  <h3 style="font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;margin:0 0 12px;">Order Items</h3>
                  <table style="width:100%;border-collapse:collapse;">
                    {itemsHtml}
                  </table>

                  <!-- Totals -->
                  <table style="width:100%;border-collapse:collapse;margin-top:20px;">
                    <tr>
                      <td style="color:#888;font-size:13px;padding:4px 0;">Subtotal</td>
                      <td style="text-align:right;font-size:13px;padding:4px 0;">PKR {order.SubTotal:N0}</td>
                    </tr>
                    <tr>
                      <td style="color:#888;font-size:13px;padding:4px 0;">Shipping</td>
                      <td style="text-align:right;font-size:13px;padding:4px 0;">{(order.ShippingCost == 0 ? "Free" : $"PKR {order.ShippingCost:N0}")}</td>
                    </tr>
                    <tr style="border-top:2px solid #1a1a1a;">
                      <td style="font-weight:700;font-size:16px;padding-top:10px;">Total</td>
                      <td style="text-align:right;font-weight:700;font-size:16px;padding-top:10px;color:#b8963c;">PKR {order.Total:N0}</td>
                    </tr>
                  </table>

                  <!-- Shipping Address -->
                  <div style="margin-top:28px;padding:16px 20px;background:#faf7f2;border:1px solid #ede9e0;">
                    <p style="margin:0 0 8px;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;">Shipping To</p>
                    <p style="margin:0;color:#444;font-size:14px;line-height:1.6;">
                      {order.ShippingName}<br/>
                      {order.ShippingCity}<br/>
                      Phone: {order.ShippingPhone}
                    </p>
                  </div>

                  <p style="margin-top:28px;color:#666;font-size:13px;line-height:1.7;">
                    We'll notify you when your order ships. For any questions, reply to this email or contact us at
                    <a href="mailto:STYLEMAKERofficial.store@gmail.com" style="color:#b8963c;">STYLEMAKERofficial.store@gmail.com</a>
                  </p>
                </div>

                <!-- Footer -->
                <div style="background:#1a1a1a;padding:20px 32px;text-align:center;">
                  <p style="margin:0;color:rgba(245,240,232,0.4);font-size:11px;letter-spacing:1px;">
                    © {DateTime.UtcNow.Year} STYLEMAKER — Premium Pakistani Fashion
                  </p>
                </div>

              </div>
            </body>
            </html>
            """;
    }

    private static string BuildAdminAlertHtml(OrderDto order, string customerEmail)
    {
        var itemsHtml = string.Join("", order.Items.Select(i => $"""
            <tr>
              <td style="padding:8px;border-bottom:1px solid #eee;">{i.ProductName}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">{i.Quantity}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;">{i.SelectedSize}</td>
              <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;color:#b8963c;font-weight:600">PKR {i.UnitPrice * i.Quantity:N0}</td>
            </tr>
            """));

        return $"""
            <!DOCTYPE html>
            <html>
            <body style="font-family:Inter,sans-serif;background:#f5f0e8;margin:0;padding:0;">
              <div style="max-width:600px;margin:40px auto;background:#fff;border:1px solid #ede9e0;">

                <div style="background:#c9a84c;padding:20px 32px;">
                  <h1 style="margin:0;color:#1a1a1a;font-size:18px;letter-spacing:2px;">🛒 NEW ORDER — STYLEMAKER</h1>
                </div>

                <div style="padding:32px;">
                  <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                    <tr>
                      <td style="color:#888;font-size:13px;">Order #</td>
                      <td style="font-weight:700;color:#b8963c;">#{order.OrderNumber}</td>
                    </tr>
                    <tr><td style="color:#888;font-size:13px;padding-top:8px;">Customer</td><td style="padding-top:8px;">{order.ShippingName}</td></tr>
                    <tr><td style="color:#888;font-size:13px;padding-top:8px;">Email</td><td style="padding-top:8px;"><a href="mailto:{customerEmail}" style="color:#b8963c">{customerEmail}</a></td></tr>
                    <tr><td style="color:#888;font-size:13px;padding-top:8px;">Phone</td><td style="padding-top:8px;">{order.ShippingPhone}</td></tr>
                    <tr><td style="color:#888;font-size:13px;padding-top:8px;">Address</td><td style="padding-top:8px;">{order.ShippingCity}</td></tr>
                    <tr><td style="color:#888;font-size:13px;padding-top:8px;">Payment</td><td style="padding-top:8px;text-transform:capitalize">{order.PaymentMethod}</td></tr>
                    <tr><td style="color:#888;font-size:13px;padding-top:8px;">Total</td><td style="padding-top:8px;font-weight:700;font-size:18px;color:#b8963c;">PKR {order.Total:N0}</td></tr>
                  </table>

                  <h3 style="font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#c9a84c;">Items Ordered</h3>
                  <table style="width:100%;border-collapse:collapse;font-size:13px;">
                    <thead>
                      <tr style="background:#f5f0e8;">
                        <th style="padding:8px;text-align:left;">Product</th>
                        <th style="padding:8px;text-align:center">Qty</th>
                        <th style="padding:8px;text-align:left">Size</th>
                        <th style="padding:8px;text-align:right">Price</th>
                      </tr>
                    </thead>
                    <tbody>{itemsHtml}</tbody>
                  </table>
                </div>

              </div>
            </body>
            </html>
            """;
    }
}
