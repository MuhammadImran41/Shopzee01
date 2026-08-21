namespace Shopzee.API.DTOs;

public record RegisterDto(
    string Name,
    string Email,
    string Password,
    string Phone = "");

public record LoginDto(
    string Email,
    string Password);

public record AuthResponseDto(
    string Token,
    string RefreshToken,
    UserDto User);

public record UserDto(
    int Id,
    string Name,
    string Email,
    string Phone,
    string Role);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword);

public record UpdateProfileDto(
    string Name,
    string Phone);

public record ForgotPasswordDto(string Email);

public record ResetPasswordDto(string Token, string NewPassword);
