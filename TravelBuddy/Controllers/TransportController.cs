using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using TravelBuddy.Models;

namespace TravelBuddy.Controllers;

public class TransportController : Controller
{
    private readonly YandexTransportService _transportService;

    public TransportController(YandexTransportService transportService)
    {
        _transportService = transportService;
    }

    [HttpGet]
    public IActionResult Index()
    {
        return View();
    }

    [HttpPost]
    [HttpPost]
    public async Task<IActionResult> Search(string from, string to, string date, string transportType)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to) || string.IsNullOrWhiteSpace(date))
        {
            return BadRequest("Пожалуйста, заполните все поля.");
        }

        var result = await _transportService.GetTransportOptions(from, to, date, transportType);

        if (result?.segments == null)
        {
            return Ok(new List<object>()); // пустой массив, если ничего не найдено
        }

        // Логирование для отладки
        foreach (var segment in result.segments)
        {
            Console.WriteLine(JsonConvert.SerializeObject(segment));
        }

        return Ok(result.segments);
    }

}