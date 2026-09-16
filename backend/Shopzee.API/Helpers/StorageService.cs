using System.Net.Http.Headers;

namespace Shopzee.API.Helpers;

public class StorageService
{
    private readonly HttpClient _http;
    private readonly string _supabaseUrl;
    private readonly string _supabaseKey;
    private readonly string _bucket = "product-images";
    private readonly ILogger<StorageService> _logger;

    public StorageService(IConfiguration config, ILogger<StorageService> logger)
    {
        _supabaseUrl = config["Supabase:Url"]
                       ?? Environment.GetEnvironmentVariable("SUPABASE_URL")
                       ?? "";
        _supabaseKey = config["Supabase:ServiceKey"]
                       ?? Environment.GetEnvironmentVariable("SUPABASE_SERVICE_KEY")
                       ?? "";
        _logger = logger;
        _http = new HttpClient();
    }

    /// <summary>
    /// Upload a base64 data URL to Supabase Storage and return the public URL.
    /// If upload fails or Supabase not configured, returns the original base64 string.
    /// </summary>
    public async Task<string> UploadBase64Async(string base64DataUrl, string fileName)
    {
        if (string.IsNullOrWhiteSpace(_supabaseUrl) || string.IsNullOrWhiteSpace(_supabaseKey))
            return base64DataUrl; // fallback — return as-is

        try
        {
            // Parse data URL: "data:image/jpeg;base64,/9j/..."
            var commaIdx = base64DataUrl.IndexOf(',');
            if (commaIdx < 0) return base64DataUrl;

            var header      = base64DataUrl.Substring(5, commaIdx - 5); // "image/jpeg;base64"
            var mimeType    = header.Split(';')[0];                       // "image/jpeg"
            var ext         = mimeType.Split('/')[1];                     // "jpeg"
            var base64Data  = base64DataUrl.Substring(commaIdx + 1);
            var bytes       = Convert.FromBase64String(base64Data);

            var uniqueName  = $"{fileName}-{Guid.NewGuid():N}.{ext}";
            var uploadUrl   = $"{_supabaseUrl}/storage/v1/object/{_bucket}/{uniqueName}";

            using var content = new ByteArrayContent(bytes);
            content.Headers.ContentType = new MediaTypeHeaderValue(mimeType);

            var request = new HttpRequestMessage(HttpMethod.Post, uploadUrl);
            request.Headers.Add("Authorization", $"Bearer {_supabaseKey}");
            request.Headers.Add("x-upsert", "true");
            request.Content = content;

            var response = await _http.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Supabase upload failed: {Status} {Error}", response.StatusCode, err);
                return base64DataUrl;
            }

            // Return public URL
            var publicUrl = $"{_supabaseUrl}/storage/v1/object/public/{_bucket}/{uniqueName}";
            _logger.LogInformation("Image uploaded to Supabase: {Url}", publicUrl);
            return publicUrl;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload image to Supabase Storage");
            return base64DataUrl;
        }
    }

    /// <summary>
    /// Process a list of image strings — upload base64 ones to Storage,
    /// leave existing URLs (http/https) as-is.
    /// </summary>
    public async Task<List<string>> ProcessImagesAsync(List<string> images, string productName)
    {
        var result = new List<string>();
        var slug   = productName.ToLower().Replace(" ", "-").Replace("'", "");
        var i      = 0;

        foreach (var img in images)
        {
            if (img.StartsWith("data:"))
                result.Add(await UploadBase64Async(img, $"{slug}-{i++}"));
            else
                result.Add(img); // already a URL
        }

        return result;
    }
}
