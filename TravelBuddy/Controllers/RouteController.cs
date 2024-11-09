using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using TravelBuddy.Data;
using TravelBuddy.Models;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

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
        var routes = await _context.Routes.ToListAsync();
        return View(routes);
    }

    [HttpGet]
    public IActionResult Create()
    {
        return View();
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Create(UserRoute model)
    {
        if (ModelState.IsValid)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            model.UserId = user.Id;
            _context.Routes.Add(model);
            await _context.SaveChangesAsync();
            return RedirectToAction("Routes");
        }
        return View(model);
    }
}
