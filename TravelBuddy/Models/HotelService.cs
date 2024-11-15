using Newtonsoft.Json;

namespace TravelBuddy.Models;

public class HotelService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _baseUrl;

    public HotelService(IConfiguration configuration)
    {
        _httpClient = new HttpClient();
        _apiKey = configuration["BookingAPI:ApiKey"];
        _baseUrl = configuration["BookingAPI:BaseUrl"];
    }

    public async Task<List<Hotel>> GetHotelsAsync(string city, int? minPrice, int? maxPrice)
    {
        var url = $"{_baseUrl}/v1/hotels/search?city={city}";

        // Добавляем параметры цены только при наличии значений
        if (minPrice.HasValue)
        {
            url += $"&min_price={minPrice.Value}";
        }
        if (maxPrice.HasValue)
        {
            url += $"&max_price={maxPrice.Value}";
        }

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("X-RapidAPI-Key", _apiKey);
        _httpClient.DefaultRequestHeaders.Add("X-RapidAPI-Host", "booking-com.p.rapidapi.com");

        var response = await _httpClient.GetAsync(url);
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            var hotels = JsonConvert.DeserializeObject<List<Hotel>>(content); // Преобразуйте данные в нужный формат
            return hotels;
        }
        return new List<Hotel>();
    }

}