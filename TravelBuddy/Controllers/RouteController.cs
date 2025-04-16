using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using TravelBuddy.Data;
using TravelBuddy.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace TravelBuddy.Controllers;

public class RouteController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public RouteController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<IActionResult> Routes(string departureCity, string arrivalCity)
    {
        var routes = await _context.UserRoutes
            .Include(r => r.RouteStops)
            .ToListAsync();

        foreach (var route in routes)
        {
            route.RouteStops = route.RouteStops.OrderBy(rs => rs.Id).ToList();
        }

        var departureCities = routes
            .Select(r => r.RouteStops.FirstOrDefault()?.DestinationCity)
            .Where(c => !string.IsNullOrEmpty(c))
            .Distinct()
            .ToList();

        var arrivalCities = routes
            .Select(r => r.RouteStops.LastOrDefault()?.DestinationCity)
            .Where(c => !string.IsNullOrEmpty(c))
            .Distinct()
            .ToList();

        if (!string.IsNullOrEmpty(departureCity))
        {
            routes = routes
                .Where(r => r.RouteStops.FirstOrDefault()?.DestinationCity == departureCity)
                .ToList();
        }

        if (!string.IsNullOrEmpty(arrivalCity))
        {
            routes = routes
                .Where(r => r.RouteStops.LastOrDefault()?.DestinationCity == arrivalCity)
                .ToList();
        }

        var model = new RoutesViewModel
        {
            Routes = routes,
            DepartureCities = departureCities,
            ArrivalCities = arrivalCities,
            SelectedDepartureCity = departureCity,
            SelectedArrivalCity = arrivalCity
        };

        return View(model);
    }
    
    [Authorize]
    [HttpGet]
    public IActionResult Create()
    {
        return View();
    }

    [Authorize]
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(UserRoute route, string routeStopsData)
    {
        if (!User.Identity.IsAuthenticated)
        {
            Console.WriteLine("Пользователь не авторизован.");
            return RedirectToAction("Login", "Account");
        }

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null || string.IsNullOrEmpty(currentUser.Id))
        {
            Console.WriteLine("Не удалось получить текущего пользователя или его Id.");
            return Json(new { success = false, message = "Не удалось получить текущего пользователя" });
        }

        route.UserId = currentUser.Id;
        route.ApplicationUser = currentUser;
        route.RouteName = string.IsNullOrWhiteSpace(route.RouteName) ? "Маршрут" : route.RouteName;

        List<RouteStopDTO> stopsDTO;
        try
        {
            stopsDTO = JsonSerializer.Deserialize<List<RouteStopDTO>>(routeStopsData, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при десериализации: {ex.Message}");
            ModelState.AddModelError("", "Ошибка при обработке данных остановок.");
            return View(route);
        }

        if (stopsDTO == null || !stopsDTO.Any())
        {
            Console.WriteLine("Нет остановок для сохранения.");
            ModelState.AddModelError("", "Необходимо добавить хотя бы одну остановку.");
            return View(route);
        }
        
        var prices = new decimal[] { 6800, 2500, 3050, 2599, 3199, 8700, 5499, 7199, 2399, 1700 };
        var random = new Random();

        foreach (var stopDTO in stopsDTO)
        {
            var randomPrice = prices[random.Next(prices.Length)];
            var stop = new RouteStop
            {
                DestinationCity = stopDTO.DestinationCity,
                Latitude = stopDTO.Latitude ?? 0,
                Longitude = stopDTO.Longitude ?? 0,
                TransportationCarrier = stopDTO.Transportation?.thread?.carrier?.title,
                TransportationDepartureTime = stopDTO.Transportation?.departure,
                TransportationArrivalTime = stopDTO.Transportation?.arrival,
                TransportationFromTitle = stopDTO.Transportation?.from?.title,
                TransportationToTitle = stopDTO.Transportation?.to?.title,
                TransportationFromLatitude = stopDTO.TransportationFromCoords?.Latitude,
                TransportationFromLongitude = stopDTO.TransportationFromCoords?.Longitude,
                TransportationToLatitude = stopDTO.TransportationToCoords?.Latitude,
                TransportationToLongitude = stopDTO.TransportationToCoords?.Longitude,
                TransportationPrice = randomPrice.ToString(),
                TransportationType = stopDTO.Transportation?.TransportType,
                HotelName = stopDTO.Hotel?.name,
                HotelLatitude = stopDTO.Hotel?.latitude,
                HotelLongitude = stopDTO.Hotel?.longitude,
                HotelPrice = stopDTO.Hotel?.price.ToString(),
                HotelRating = stopDTO.Hotel?.rating.ToString(),
                HotelImageUrl = stopDTO.Hotel?.imageUrl,
                Duration = stopDTO.Duration,
                DurationType = stopDTO.DurationType,
                HotelCheckOutDate = !string.IsNullOrEmpty(stopDTO.HotelCheckOutDate) ? DateTime.Parse(stopDTO.HotelCheckOutDate) : (DateTime?)null
            };
            route.RouteStops.Add(stop);
        }

        try
        {
            _context.UserRoutes.Add(route);
            await _context.SaveChangesAsync();
            Console.WriteLine("Маршрут успешно сохранен.");
            return RedirectToAction("Routes");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Ошибка при сохранении маршрута: {ex.Message}");
            ModelState.AddModelError("", "Ошибка при сохранении маршрута: " + ex.Message);
        }

        return View(route);
    }
    
    [HttpGet]
    public async Task<IActionResult> Details(int id)
    {
        var route = await _context.UserRoutes
            .Include(r => r.RouteStops)
            .Include(r => r.ApplicationUser)
            .FirstOrDefaultAsync(r => r.Id == id);

        if (route == null)
        {
            return NotFound();
        }

        return View(route);
    }
}
