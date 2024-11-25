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
    public IActionResult Search()
    {
        return View();
    }

    [HttpPost]
    public async Task<IActionResult> Search(string city, string checkIn, string checkOut, int adults = 1, int children = 0)
    {
        var hotels = await _hotelService.SearchHotelsAsync(city, checkIn, checkOut, adults, children);
        return View("Results", hotels);
    }
}
