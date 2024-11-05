using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TravelBuddy.Data;
using TravelBuddy.Models;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;

public class PeopleController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IAntiforgery _antiforgery;

    public PeopleController(ApplicationDbContext context, UserManager<ApplicationUser> userManager, IAntiforgery antiforgery)
    {
        _context = context;
        _userManager = userManager;
        _antiforgery = antiforgery;
    }

    public async Task<IActionResult> Peoples(string filterBy = "", string filterValue = "")
    {
        var usersQuery = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(filterBy) && !string.IsNullOrEmpty(filterValue))
        {
            switch (filterBy)
            {
                case "FullName":
                    usersQuery = usersQuery.Where(u => u.FullName.Contains(filterValue));
                    break;
                case "Age":
                    if (int.TryParse(filterValue, out int age))
                    {
                        usersQuery = usersQuery.Where(u => u.BirthDate.HasValue &&
                            (DateTime.Now.Year - u.BirthDate.Value.Year) == age);
                    }
                    break;
                case "City":
                    usersQuery = usersQuery.Where(u => u.City.Contains(filterValue));
                    break;
            }
        }

        var users = await usersQuery.Select(u => new UserListViewModel
        {
            Id = u.Id,
            FullName = u.FullName,
            City = u.City,
            ProfilePictureUrl = u.ProfilePictureUrl ?? "/images/default-avatar.png",
            Age = u.BirthDate.HasValue ? (int?)(DateTime.Now.Year - u.BirthDate.Value.Year) : null
        }).ToListAsync();


        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView("_PeopleList", users);
        }

        return View(users);
    }

    public async Task<IActionResult> GetFilterValues(string filterBy)
    {
        List<string> filterValues = filterBy switch
        {
            "FullName" => await _context.Users.Select(u => u.FullName).Distinct().ToListAsync(),
            "Age" => await _context.Users
                .Where(u => u.BirthDate.HasValue)
                .Select(u => (DateTime.Now.Year - u.BirthDate.Value.Year).ToString())
                .Distinct()
                .ToListAsync(),
            "City" => await _context.Users.Select(u => u.City).Distinct().ToListAsync(),
            _ => new List<string>()
        };

        return Json(filterValues);
    }
    
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> SendMessage(string recipientId, string content)
    {
        Console.WriteLine("Received content: " + content); 
        
        if (string.IsNullOrWhiteSpace(content))
        {
            return BadRequest("Сообщение не может быть пустым.");
        }

        var senderId = _userManager.GetUserId(User);
        if (senderId == null)
        {
            return Unauthorized();
        }

        var message = new Message
        {
            SenderId = senderId,
            RecipientId = recipientId,
            Content = content,
            SentAt = DateTime.Now
        };

        _context.Messages.Add(message);
        await _context.SaveChangesAsync();

        return Ok();
    }


}
