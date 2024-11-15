using Microsoft.AspNetCore.Mvc;
using TravelBuddy.Models;

namespace TravelBuddy.Controllers;

public class HotelsController : Controller
{
    private readonly HotelService _hotelService;

    public HotelsController(HotelService hotelService)
    {
        _hotelService = hotelService;
    }

    [HttpGet]
    public IActionResult SearchHotels()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> SearchHotels(string city, int? minPrice, int? maxPrice)
    {
        if (string.IsNullOrWhiteSpace(city))
        {
            ModelState.AddModelError("City", "Введите название города.");
            return View();
        }

        var hotels = await _hotelService.GetHotelsAsync(city, minPrice, maxPrice);
        return View("HotelResults", hotels); // Отображаем результаты в представлении HotelResults
    }
}