using BC = BCrypt.Net.BCrypt;
Console.WriteLine(BC.HashPassword("Admin@123"));
Console.WriteLine(BC.HashPassword("User@123"));
