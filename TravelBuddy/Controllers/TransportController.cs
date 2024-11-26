using Microsoft.AspNetCore.Mvc;
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
    public async Task<IActionResult> Search(string from, string to, string date, string transportType)
    {
        if (string.IsNullOrWhiteSpace(from) || string.IsNullOrWhiteSpace(to) || string.IsNullOrWhiteSpace(date))
        {
            ViewBag.ErrorMessage = "Пожалуйста, заполните все поля.";
            return View("Index");
        }

        var result = await _transportService.GetTransportOptions(from, to, date, transportType);

        if (result?.segments == null)
        {
            return Json(new List<object>()); // пустой массив, если ничего не найдено
        }

        return Json(result.segments);
    }

}