using System;
using Npgsql;
using BC = BCrypt.Net.BCrypt;

var connStr = "Host=ep-wild-sky-axtcvc3f.c-4.us-east-2.aws.neon.tech;Database=neondb;Username=neondb_owner;Password=npg_k7eptKRz3LyU;SSL Mode=Require;Trust Server Certificate=true";

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();

// Get current hash
await using var getCmd = new NpgsqlCommand(@"SELECT ""Id"", ""Email"", ""PasswordHash"", ""Role"" FROM ""Users"" WHERE ""Role"" = 'admin'", conn);
await using var reader = await getCmd.ExecuteReaderAsync();
await reader.ReadAsync();
var id    = reader.GetInt32(0);
var email = reader.GetString(1);
var hash  = reader.GetString(2);
await reader.CloseAsync();

Console.WriteLine($"Admin: {email}");
Console.WriteLine($"Current hash: {hash[..30]}...");

// Verify old passwords
var passwords = new[] { "Admin@123", "admin@123", "Admin123", "shopzee@123", "Shopzee@123", "admin123" };
foreach (var p in passwords)
{
    try {
        var ok = BC.Verify(p, hash);
        Console.WriteLine($"  '{p}' => {(ok ? "✅ MATCH" : "❌")}");
    } catch { Console.WriteLine($"  '{p}' => ERROR"); }
}

// Set new password
var newPass = "Admin@2026";
var newHash = BC.HashPassword(newPass);
await using var upd = new NpgsqlCommand(@"UPDATE ""Users"" SET ""PasswordHash""=@h WHERE ""Id""=@id", conn);
upd.Parameters.AddWithValue("h", newHash);
upd.Parameters.AddWithValue("id", id);
await upd.ExecuteNonQueryAsync();

// Verify new hash works
var verify = BC.Verify(newPass, newHash);
Console.WriteLine($"\nNew password set: '{newPass}' => verify: {verify}");
Console.WriteLine($"Email: {email}");
Console.WriteLine($"Password: {newPass}");
