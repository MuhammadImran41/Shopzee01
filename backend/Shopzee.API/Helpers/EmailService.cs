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

    // ── Forgot password ───────────────────────────────────
    public async Task SendForgotPasswordAsync(string toEmail, string toName, string resetToken)
    {
        var subject = "Reset Your Password — STYLEMAKER";
        var html = $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <title>Reset Password</title>
            </head>
            <body style="margin:0;padding:0;background:#f0ebe0;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe0;padding:40px 0;">
                <tr><td align="center">
                  <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e0d8c8;">

                    <!-- Header -->
                    <tr>
                      <td style="background:#1a1a1a;padding:36px 40px;text-align:center;">
                        <div style="display:inline-block;">
                          <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#c9a84c;letter-spacing:6px;text-transform:uppercase;">STYLEMAKER</span>
                          <div style="height:1px;background:linear-gradient(to right,transparent,#c9a84c,transparent);margin:8px 0;"></div>
                          <span style="font-size:10px;color:rgba(245,240,232,0.5);letter-spacing:4px;text-transform:uppercase;">Premium Pakistani Fashion</span>
                        </div>
                      </td>
                    </tr>

                    <!-- Gold top border -->
                    <tr><td style="height:3px;background:linear-gradient(to right,#b8963c,#e2c97e,#b8963c);"></td></tr>

                    <!-- Body -->
                    <tr>
                      <td style="padding:44px 44px 36px;">
                        <p style="margin:0 0 6px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Security Notice</p>
                        <h2 style="margin:0 0 20px;font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1a1a1a;line-height:1.3;">Reset Your Password</h2>
                        <p style="margin:0 0 8px;font-size:15px;color:#4a4a4a;line-height:1.7;">Hello, <strong style="color:#1a1a1a;">{System.Net.WebUtility.HtmlEncode(toName)}</strong></p>
                        <p style="margin:0 0 32px;font-size:14px;color:#666;line-height:1.8;">
                          We received a password reset request for your STYLEMAKER account. Use the one-time code below — it expires in <strong style="color:#1a1a1a;">15 minutes</strong>.
                        </p>

                        <!-- OTP Box -->
                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                          <tr>
                            <td style="background:#faf7f2;border:2px solid #c9a84c;padding:28px 20px;text-align:center;">
                              <p style="margin:0 0 10px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#a09080;font-weight:600;">Your One-Time Code</p>
                              <p style="margin:0;font-size:44px;font-weight:700;letter-spacing:14px;color:#1a1a1a;font-family:'Courier New',monospace;">{resetToken}</p>
                              <p style="margin:10px 0 0;font-size:11px;color:#b8963c;letter-spacing:2px;">EXPIRES IN 15 MINUTES</p>
                            </td>
                          </tr>
                        </table>

                        <p style="margin:0 0 24px;font-size:13px;color:#888;line-height:1.8;border-left:3px solid #e8dcc8;padding-left:16px;">
                          If you did not request a password reset, please ignore this email. Your account is safe and your password will not change.
                        </p>
                      </td>
                    </tr>

                    <!-- Footer -->
                    <tr><td style="height:1px;background:#e8e0d0;"></td></tr>
                    <tr>
                      <td style="background:#1a1a1a;padding:24px 40px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="text-align:center;">
                              <p style="margin:0 0 6px;font-family:Georgia,serif;font-size:14px;color:#c9a84c;letter-spacing:3px;">STYLEMAKER</p>
                              <p style="margin:0;font-size:11px;color:rgba(245,240,232,0.35);letter-spacing:1px;">© {DateTime.UtcNow.Year} — Premium Pakistani Fashion</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
        await SendAsync(toEmail, toName, subject, html);
    }

    // ── Order confirmation to customer ───────────────────
    public async Task SendOrderConfirmationAsync(string toEmail, string toName, OrderDto order)
    {
        var subject = $"✨ Order Confirmed #{order.OrderNumber} — Thank You, {toName.Split(' ')[0]}!";
        var html    = BuildOrderConfirmationHtml(toName, order);
        await SendAsync(toEmail, toName, subject, html);
    }

    // ── Order alert to admin ──────────────────────────────
    public async Task SendAdminOrderAlertAsync(OrderDto order, string customerEmail)
    {
        var subject = $"🛒 New Order #{order.OrderNumber} — PKR {order.Total:N0} | {order.ShippingName}";
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

    // ════════════════════════════════════════════════════════
    // CUSTOMER ORDER CONFIRMATION — Beautiful luxury receipt
    // ════════════════════════════════════════════════════════
    private static string BuildOrderConfirmationHtml(string name, OrderDto order)
    {
        var firstName = name.Split(' ')[0];

        // Build items rows
        var itemsHtml = string.Join("", order.Items.Select(i => $"""
            <tr>
              <td style="padding:16px 0;border-bottom:1px solid #f0ece4;vertical-align:top;">
                <div style="display:flex;align-items:flex-start;gap:14px;">
                  <div>
                    <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#1a1a1a;">{System.Net.WebUtility.HtmlEncode(i.ProductName)}</p>
                    <p style="margin:0;font-size:12px;color:#999;">
                      {(string.IsNullOrEmpty(i.SelectedSize) ? "" : $"Size: <strong style='color:#666'>{i.SelectedSize}</strong>&nbsp;&nbsp;")}
                      {(string.IsNullOrEmpty(i.SelectedColor) ? "" : $"Color: <strong style='color:#666'>{i.SelectedColor}</strong>&nbsp;&nbsp;")}
                      Qty: <strong style="color:#666">{i.Quantity}</strong>
                    </p>
                  </div>
                </div>
              </td>
              <td style="padding:16px 0;border-bottom:1px solid #f0ece4;text-align:right;vertical-align:top;white-space:nowrap;">
                <span style="font-size:14px;font-weight:700;color:#b8963c;">PKR {i.UnitPrice * i.Quantity:N0}</span>
              </td>
            </tr>
            """));

        var shippingText = order.ShippingCost == 0
            ? "<span style='color:#4caf50;font-weight:600;'>FREE</span>"
            : $"PKR {order.ShippingCost:N0}";

        var paymentIcon = order.PaymentMethod?.ToLower() switch
        {
            "cod" or "cash on delivery" => "💵",
            "easypaisa" => "💚",
            "jazzcash"  => "🔴",
            "bank"      => "🏦",
            _           => "💳"
        };

        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <title>Order Confirmed — STYLEMAKER</title>
            </head>
            <body style="margin:0;padding:0;background:#f0ebe0;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ebe0;padding:40px 16px;">
                <tr><td align="center">
                  <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;">

                    <!-- ══ HEADER ══ -->
                    <tr>
                      <td style="background:#1a1a1a;padding:0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:36px 44px 28px;text-align:center;">
                              <p style="margin:0 0 4px;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;color:#c9a84c;letter-spacing:8px;text-transform:uppercase;">STYLEMAKER</p>
                              <table width="200" cellpadding="0" cellspacing="0" align="center" style="margin:10px auto;">
                                <tr>
                                  <td style="height:1px;background:linear-gradient(to right,transparent,#c9a84c55,#c9a84c,#c9a84c55,transparent);"></td>
                                </tr>
                              </table>
                              <p style="margin:0;font-size:10px;color:rgba(201,168,76,0.55);letter-spacing:5px;text-transform:uppercase;">Premium Pakistani Fashion</p>
                            </td>
                          </tr>
                          <!-- Gold gradient bar -->
                          <tr><td style="height:3px;background:linear-gradient(to right,#8a6820,#c9a84c,#e2c97e,#c9a84c,#8a6820);"></td></tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ SUCCESS BANNER ══ -->
                    <tr>
                      <td style="background:linear-gradient(135deg,#faf7f0 0%,#f5f0e4 100%);padding:40px 44px 32px;text-align:center;border-bottom:1px solid #ede5d0;">
                        <div style="width:64px;height:64px;background:#1a1a1a;border-radius:50%;margin:0 auto 18px;display:inline-block;line-height:64px;text-align:center;">
                          <span style="font-size:28px;line-height:64px;display:inline-block;">✓</span>
                        </div>
                        <p style="margin:0 0 6px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Order Placed Successfully</p>
                        <h1 style="margin:0 0 10px;font-family:Georgia,serif;font-size:28px;font-weight:400;color:#1a1a1a;">Thank You, {System.Net.WebUtility.HtmlEncode(firstName)}!</h1>
                        <p style="margin:0;font-size:14px;color:#888;line-height:1.7;">Your order has been received and is being prepared with care.</p>
                      </td>
                    </tr>

                    <!-- ══ ORDER META ══ -->
                    <tr>
                      <td style="padding:28px 44px;background:#fff;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <!-- Order Number -->
                            <td width="33%" style="text-align:center;padding:16px;border-right:1px solid #f0ece4;">
                              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#bbb;">Order No.</p>
                              <p style="margin:0;font-size:16px;font-weight:700;color:#b8963c;font-family:Georgia,serif;">#{order.OrderNumber}</p>
                            </td>
                            <!-- Date -->
                            <td width="33%" style="text-align:center;padding:16px;border-right:1px solid #f0ece4;">
                              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#bbb;">Date</p>
                              <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">{order.CreatedAt:dd MMM yyyy}</p>
                            </td>
                            <!-- Payment -->
                            <td width="33%" style="text-align:center;padding:16px;">
                              <p style="margin:0 0 6px;font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#bbb;">Payment</p>
                              <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a1a;">{paymentIcon} {System.Net.WebUtility.HtmlEncode(order.PaymentMethod ?? "N/A")}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ ITEMS ══ -->
                    <tr>
                      <td style="padding:0 44px 24px;">
                        <p style="margin:0 0 14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:600;border-bottom:1px solid #f0ece4;padding-bottom:10px;">Your Items</p>
                        <table width="100%" cellpadding="0" cellspacing="0">
                          {itemsHtml}
                        </table>
                      </td>
                    </tr>

                    <!-- ══ ORDER TOTALS ══ -->
                    <tr>
                      <td style="padding:0 44px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f2;border:1px solid #ede9e0;padding:20px 24px;">
                          <tr>
                            <td style="padding:7px 0;font-size:13px;color:#888;">Subtotal</td>
                            <td style="padding:7px 0;font-size:13px;color:#444;text-align:right;">PKR {order.SubTotal:N0}</td>
                          </tr>
                          <tr>
                            <td style="padding:7px 0;font-size:13px;color:#888;">Shipping</td>
                            <td style="padding:7px 0;font-size:13px;text-align:right;">{shippingText}</td>
                          </tr>
                          <tr>
                            <td colspan="2" style="height:1px;background:#e8e0d0;padding:0;"></td>
                          </tr>
                          <tr>
                            <td style="padding:14px 0 0;font-size:16px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">Total Payable</td>
                            <td style="padding:14px 0 0;font-size:20px;font-weight:700;color:#b8963c;text-align:right;font-family:Georgia,serif;">PKR {order.Total:N0}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ SHIPPING ADDRESS ══ -->
                    <tr>
                      <td style="padding:0 44px 36px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#1a1a1a;padding:20px 24px;">
                              <p style="margin:0 0 12px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:600;">📦 Delivering To</p>
                              <p style="margin:0;font-size:15px;font-weight:600;color:#f5f0e8;line-height:1.5;">{System.Net.WebUtility.HtmlEncode(order.ShippingName)}</p>
                              <p style="margin:4px 0 0;font-size:13px;color:rgba(245,240,232,0.65);line-height:1.6;">
                                {System.Net.WebUtility.HtmlEncode(order.ShippingCity)}<br/>
                                📞 {System.Net.WebUtility.HtmlEncode(order.ShippingPhone)}
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ WHAT'S NEXT ══ -->
                    <tr>
                      <td style="padding:0 44px 36px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #ede9e0;">
                          <tr>
                            <td style="padding:20px 24px;">
                              <p style="margin:0 0 16px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:600;">What Happens Next?</p>
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding:8px 0;font-size:13px;color:#555;line-height:1.6;">
                                    <span style="display:inline-block;width:22px;height:22px;background:#c9a84c;color:#1a1a1a;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;margin-right:10px;vertical-align:middle;">1</span>
                                    We are preparing your order with care
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding:8px 0;font-size:13px;color:#555;line-height:1.6;">
                                    <span style="display:inline-block;width:22px;height:22px;background:#c9a84c;color:#1a1a1a;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;margin-right:10px;vertical-align:middle;">2</span>
                                    You will receive a dispatch notification
                                  </td>
                                </tr>
                                <tr>
                                  <td style="padding:8px 0;font-size:13px;color:#555;line-height:1.6;">
                                    <span style="display:inline-block;width:22px;height:22px;background:#c9a84c;color:#1a1a1a;border-radius:50%;text-align:center;line-height:22px;font-size:11px;font-weight:700;margin-right:10px;vertical-align:middle;">3</span>
                                    Delivered to your door within 3–5 working days
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ SUPPORT ══ -->
                    <tr>
                      <td style="padding:0 44px 40px;text-align:center;">
                        <p style="margin:0 0 8px;font-size:13px;color:#888;line-height:1.8;">Questions? We're here for you.</p>
                        <a href="mailto:trendzyofficial.store@gmail.com" style="color:#b8963c;font-size:13px;font-weight:600;text-decoration:none;">trendzyofficial.store@gmail.com</a>
                      </td>
                    </tr>

                    <!-- ══ FOOTER ══ -->
                    <tr><td style="height:3px;background:linear-gradient(to right,#8a6820,#c9a84c,#e2c97e,#c9a84c,#8a6820);"></td></tr>
                    <tr>
                      <td style="background:#1a1a1a;padding:28px 44px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="text-align:center;">
                              <p style="margin:0 0 8px;font-family:Georgia,serif;font-size:16px;color:#c9a84c;letter-spacing:4px;text-transform:uppercase;">STYLEMAKER</p>
                              <p style="margin:0 0 12px;font-size:11px;color:rgba(245,240,232,0.35);letter-spacing:1px;">Premium Pakistani Fashion</p>
                              <p style="margin:0;font-size:11px;color:rgba(245,240,232,0.2);">© {DateTime.UtcNow.Year} STYLEMAKER. All rights reserved.</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                  </table>

                  <!-- Bottom spacing note -->
                  <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;margin-top:20px;">
                    <tr>
                      <td style="text-align:center;padding:0 20px 20px;">
                        <p style="margin:0;font-size:11px;color:#b8a898;">You received this email because you placed an order at stylemaker.store</p>
                      </td>
                    </tr>
                  </table>

                </td></tr>
              </table>
            </body>
            </html>
            """;
    }

    // ════════════════════════════════════════════════════════
    // ADMIN ORDER ALERT — Clean, information-rich dashboard
    // ════════════════════════════════════════════════════════
    private static string BuildAdminAlertHtml(OrderDto order, string customerEmail)
    {
        var itemsHtml = string.Join("", order.Items.Select(i => $"""
            <tr style="background:white;">
              <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:13px;font-weight:600;color:#1a1a1a;">{System.Net.WebUtility.HtmlEncode(i.ProductName)}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#666;text-align:center;">{i.Quantity}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:13px;color:#666;">{System.Net.WebUtility.HtmlEncode(i.SelectedSize)}</td>
              <td style="padding:12px 16px;border-bottom:1px solid #f5f5f5;font-size:13px;font-weight:700;color:#b8963c;text-align:right;">PKR {i.UnitPrice * i.Quantity:N0}</td>
            </tr>
            """));

        var paymentBadgeColor = order.PaymentMethod?.ToLower() switch
        {
            "cod" or "cash on delivery" => "#1a1a1a",
            "easypaisa" => "#4caf50",
            "jazzcash"  => "#e53935",
            _           => "#1565c0"
        };

        return $"""
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="utf-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <title>New Order Alert — STYLEMAKER Admin</title>
            </head>
            <body style="margin:0;padding:0;background:#f0f0f0;font-family:'Helvetica Neue',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f0f0;padding:40px 16px;">
                <tr><td align="center">
                  <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;background:#ffffff;border:1px solid #e0e0e0;">

                    <!-- ══ ADMIN HEADER ══ -->
                    <tr>
                      <td style="background:#1a1a1a;padding:0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding:20px 32px;">
                              <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                  <td>
                                    <p style="margin:0;font-family:Georgia,serif;font-size:20px;color:#c9a84c;letter-spacing:4px;">STYLEMAKER</p>
                                    <p style="margin:2px 0 0;font-size:11px;color:rgba(245,240,232,0.4);letter-spacing:2px;text-transform:uppercase;">Admin Dashboard</p>
                                  </td>
                                  <td style="text-align:right;">
                                    <p style="margin:0;font-size:11px;color:rgba(245,240,232,0.4);letter-spacing:1px;">{order.CreatedAt:dd MMM yyyy, hh:mm tt}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                          <tr><td style="height:3px;background:linear-gradient(to right,#8a6820,#c9a84c,#e2c97e,#c9a84c,#8a6820);"></td></tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ ALERT BANNER ══ -->
                    <tr>
                      <td style="background:#c9a84c;padding:18px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="margin:0;font-size:18px;font-weight:700;color:#1a1a1a;letter-spacing:1px;">🛒 NEW ORDER RECEIVED</p>
                              <p style="margin:4px 0 0;font-size:13px;color:rgba(26,26,26,0.65);">Action required — review and process</p>
                            </td>
                            <td style="text-align:right;white-space:nowrap;">
                              <p style="margin:0;font-size:22px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">#{order.OrderNumber}</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ ORDER AMOUNT HIGHLIGHT ══ -->
                    <tr>
                      <td style="padding:28px 32px 20px;text-align:center;background:#fafafa;border-bottom:1px solid #eee;">
                        <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#999;">Order Total</p>
                        <p style="margin:0;font-size:38px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">PKR {order.Total:N0}</p>
                        <span style="display:inline-block;margin-top:8px;padding:4px 14px;background:{paymentBadgeColor};color:#fff;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:2px;">{System.Net.WebUtility.HtmlEncode(order.PaymentMethod ?? "N/A")}</span>
                      </td>
                    </tr>

                    <!-- ══ CUSTOMER INFO ══ -->
                    <tr>
                      <td style="padding:24px 32px;">
                        <p style="margin:0 0 14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Customer Details</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;">
                          <tr style="background:#f9f9f9;">
                            <td style="padding:10px 16px;font-size:12px;color:#999;font-weight:600;width:35%;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;">Name</td>
                            <td style="padding:10px 16px;font-size:13px;color:#1a1a1a;font-weight:600;border-bottom:1px solid #eee;">{System.Net.WebUtility.HtmlEncode(order.ShippingName)}</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 16px;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;">Email</td>
                            <td style="padding:10px 16px;border-bottom:1px solid #eee;"><a href="mailto:{System.Net.WebUtility.HtmlEncode(customerEmail)}" style="color:#b8963c;font-size:13px;text-decoration:none;">{System.Net.WebUtility.HtmlEncode(customerEmail)}</a></td>
                          </tr>
                          <tr style="background:#f9f9f9;">
                            <td style="padding:10px 16px;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:1px;border-bottom:1px solid #eee;">Phone</td>
                            <td style="padding:10px 16px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #eee;">{System.Net.WebUtility.HtmlEncode(order.ShippingPhone)}</td>
                          </tr>
                          <tr>
                            <td style="padding:10px 16px;font-size:12px;color:#999;font-weight:600;text-transform:uppercase;letter-spacing:1px;">City</td>
                            <td style="padding:10px 16px;font-size:13px;color:#1a1a1a;">{System.Net.WebUtility.HtmlEncode(order.ShippingCity)}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ ITEMS TABLE ══ -->
                    <tr>
                      <td style="padding:0 32px 24px;">
                        <p style="margin:0 0 14px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#c9a84c;font-weight:600;">Items Ordered</p>
                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-collapse:collapse;">
                          <thead>
                            <tr style="background:#1a1a1a;">
                              <th style="padding:10px 16px;text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,240,232,0.6);font-weight:600;">Product</th>
                              <th style="padding:10px 16px;text-align:center;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,240,232,0.6);font-weight:600;">Qty</th>
                              <th style="padding:10px 16px;text-align:left;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,240,232,0.6);font-weight:600;">Size</th>
                              <th style="padding:10px 16px;text-align:right;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(245,240,232,0.6);font-weight:600;">Total</th>
                            </tr>
                          </thead>
                          <tbody>{itemsHtml}</tbody>
                          <tfoot>
                            <tr style="background:#faf7f2;">
                              <td colspan="3" style="padding:14px 16px;font-size:14px;font-weight:700;color:#1a1a1a;font-family:Georgia,serif;">ORDER TOTAL</td>
                              <td style="padding:14px 16px;font-size:18px;font-weight:700;color:#b8963c;text-align:right;font-family:Georgia,serif;">PKR {order.Total:N0}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ SUBTOTALS ══ -->
                    <tr>
                      <td style="padding:0 32px 32px;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border:1px solid #eee;padding:16px 20px;">
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#888;">Subtotal</td>
                            <td style="padding:6px 0;font-size:13px;color:#444;text-align:right;">PKR {order.SubTotal:N0}</td>
                          </tr>
                          <tr>
                            <td style="padding:6px 0;font-size:13px;color:#888;">Shipping</td>
                            <td style="padding:6px 0;font-size:13px;color:#444;text-align:right;">{(order.ShippingCost == 0 ? "Free" : $"PKR {order.ShippingCost:N0}")}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>

                    <!-- ══ FOOTER ══ -->
                    <tr><td style="height:3px;background:linear-gradient(to right,#8a6820,#c9a84c,#e2c97e,#c9a84c,#8a6820);"></td></tr>
                    <tr>
                      <td style="background:#1a1a1a;padding:20px 32px;text-align:center;">
                        <p style="margin:0 0 4px;font-family:Georgia,serif;font-size:13px;color:#c9a84c;letter-spacing:3px;">STYLEMAKER ADMIN</p>
                        <p style="margin:0;font-size:11px;color:rgba(245,240,232,0.25);">© {DateTime.UtcNow.Year} — This is an automated order notification</p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """;
    }
}
