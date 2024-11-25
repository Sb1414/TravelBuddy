using Newtonsoft.Json.Linq;
namespace TravelBuddy.Models;

public class HotelService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;

    public HotelService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _apiKey = configuration["Travelpayouts:ApiKey"];
    }

    public async Task<List<Hotel>> SearchHotelsAsync(string city, string checkIn, string checkOut, int? adults, int? children)
    {
        var baseUrl = "https://engine.hotellook.com/api/v2/cache.json";
        var parameters = new Dictionary<string, string>
        {
            { "location", city },
            { "currency", "rub" },
            { "checkIn", checkIn },
            { "checkOut", checkOut },
            { "adultsCount", adults?.ToString() ?? "1" },
            { "childrenCount", children?.ToString() ?? "0" },
            { "limit", "10" }
        };

        var queryString = string.Join("&", parameters.Select(p => $"{p.Key}={p.Value}"));
        var url = $"{baseUrl}?{queryString}";

        var request = new HttpRequestMessage(HttpMethod.Get, url);
        request.Headers.Add("X-Access-Token", _apiKey);

        var response = await _httpClient.SendAsync(request);
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            return ParseHotels(content);
        }
        return new List<Hotel>();
    }

    private List<Hotel> ParseHotels(string jsonResponse)
    {
        var hotels = new List<Hotel>();
        var jsonArray = JArray.Parse(jsonResponse);

        foreach (var item in jsonArray)
        {
            hotels.Add(new Hotel
            {
                Name = (string)item["hotelName"],
                Price = (decimal?)item["priceAvg"] ?? 0,
                Rating = (float?)item["stars"] ?? 0,
                Address = (string)item["address"] ?? "Адрес не указан",
                ImageUrl = (string)item["imageUrl"] ?? "/images/no-image.png"
            });
        }

        return hotels;
    }
}
