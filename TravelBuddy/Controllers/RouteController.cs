using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using TravelBuddy.Data;
using TravelBuddy.Models;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

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

    public async Task<IActionResult> Routes()
    {
        var routes = await _context.UserRoutes
            .Include(r => r.RouteStops)
            .ToListAsync();
        return View(routes);
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
            return Json(new { success = false, message = "Пользователь не авторизован" });
        }

        var currentUser = await _userManager.GetUserAsync(User);
        if (currentUser == null)
        {
            return Json(new { success = false, message = "Не удалось получить текущего пользователя" });
        }

        route.UserId = currentUser.Id;
        route.ApplicationUser = currentUser;
        route.RouteName = route.RouteName ?? "Маршрут";
        
        ModelState.Remove("UserId"); 
        for (int i = 0; i < route.RouteStops.Count; i++)
        {
            ModelState.Remove($"RouteStops[{i}].Route");
        }
        ModelState.Remove("ApplicationUser");

        route.RouteStops.Clear();
        if (ModelState.IsValid)
        {
            try
            {
                _context.UserRoutes.Add(route);
                await _context.SaveChangesAsync();

                var stopsData = JsonConvert.DeserializeObject<Dictionary<int, RouteStop>>(routeStopsData);

                foreach (var stopData in stopsData.Values)
                {
                    var stop = new RouteStop
                    {
                        RouteId = route.Id,
                        Route = route,
                        DestinationCity = stopData.DestinationCity,
                        Transportation = stopData.Transportation,
                        Duration = stopData.Duration,
                        DurationType = stopData.DurationType,
                        Latitude = stopData.Latitude,
                        Longitude = stopData.Longitude
                    };

                    _context.RouteStops.Add(stop);
                }

                await _context.SaveChangesAsync();
                return Json(new { success = true, message = "Маршрут и остановки успешно сохранены!" });
            }
            catch (Exception ex)
            {
                return Json(new { success = false, message = $"Ошибка при сохранении данных: {ex.Message}" });
            }
        }
        else
        {
            var errorDetails = ModelState
                .Where(ms => ms.Value.Errors.Count > 0)
                .Select(ms => new 
                {
                    Field = ms.Key,
                    Errors = ms.Value.Errors.Select(e => e.ErrorMessage).ToList()
                })
                .ToList();

            Console.WriteLine("Ошибки валидации:");
            foreach (var error in errorDetails)
            {
                Console.WriteLine($"Поле: {error.Field}, Ошибки: {string.Join(", ", error.Errors)}");
            }

            return Json(new { success = false, message = "Ошибки валидации", errors = errorDetails });
        }
    }
    
    [HttpGet]
    public async Task<IActionResult> Details(int id)
    {
        var route = await _context.UserRoutes
            .Include(r => r.RouteStops)
            .Include(r => r.ApplicationUser) // Загрузка данных о пользователе
            .FirstOrDefaultAsync(r => r.Id == id);

        if (route == null)
        {
            return NotFound();
        }

        return View(route);
    }


}
