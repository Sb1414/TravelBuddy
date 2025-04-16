using Newtonsoft.Json;

namespace TravelBuddy.Models;

public class YandexTransportService
{
    private readonly string _apiKey = "a839de5b-0c4f-4584-a032-6bf00b1ff336";
    private readonly string _baseUrl = "https://api.rasp.yandex.net/v3.0";

    public async Task<TransportResponse> GetTransportOptions(string from, string to, string date, string transportType = "")
    {
        using var client = new HttpClient();
        var url = $"{_baseUrl}/search/?apikey={_apiKey}&from={from}&to={to}&date={date}";

        if (!string.IsNullOrEmpty(transportType))
        {
            url += $"&transport_types={transportType}";
        }

        var response = await client.GetAsync(url);
        if (response.IsSuccessStatusCode)
        {
            var content = await response.Content.ReadAsStringAsync();
            return JsonConvert.DeserializeObject<TransportResponse>(content);
        }

        return null;
    }
}