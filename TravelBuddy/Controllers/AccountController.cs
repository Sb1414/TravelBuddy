using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using TravelBuddy.Models;

namespace TravelBuddy.Controllers;

public class AccountController : Controller
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;

    public AccountController(UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    // GET: /Account/Register
    [HttpGet]
    public IActionResult Register()
    {
        return View();
    }

    // POST: /Account/Register
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Register(RegisterViewModel model)
    {
        if(ModelState.IsValid)
        {
            var user = new ApplicationUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);
            if(result.Succeeded)
            {
                await _signInManager.SignInAsync(user, isPersistent: false);
                return RedirectToAction("Index", "Home");
            }
            foreach(var error in result.Errors)
            {
                ModelState.AddModelError("", error.Description);
            }
        }
        return View(model);
    }

    // GET: /Account/Login
    [HttpGet]
    public IActionResult Login()
    {
        return View();
    }

    // POST: /Account/Login
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Login(LoginViewModel model)
    {
        if(ModelState.IsValid)
        {
            var result = await _signInManager.PasswordSignInAsync(
                model.Email, model.Password, model.RememberMe, lockoutOnFailure: false);
            if(result.Succeeded)
            {
                return RedirectToAction("Index", "Home");
            }
            ModelState.AddModelError("", "Неверные логин или пароль.");
        }
        return View(model);
    }

    // POST: /Account/Logout
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return RedirectToAction("Index", "Home");
    }
    
     [HttpGet]
    public async Task<IActionResult> Profile()
    {
        var user = await _userManager.GetUserAsync(User);
        if (user == null)
        {
            return RedirectToAction("Login", "Account");
        }

        var model = new ProfileViewModel
        {
            FullName = user.FullName,
            BirthDate = user.BirthDate,
            PassportSeries = user.PassportSeries,
            PassportNumber = user.PassportNumber,
            City = user.City,
            ProfilePictureUrl = user.ProfilePictureUrl
        };

        return View(model);
    }

    [HttpPost]
    public async Task<IActionResult> Profile(ProfileViewModel model)
    {
        if (ModelState.IsValid)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null)
            {
                return RedirectToAction("Login", "Account");
            }

            user.FullName = model.FullName;
            user.BirthDate = model.BirthDate;
            user.PassportSeries = model.PassportSeries;
            user.PassportNumber = model.PassportNumber;
            user.City = model.City;

            if (model.ProfilePicture != null && model.ProfilePicture.Length > 0)
            {
                var uploadsFolder = Path.Combine("wwwroot", "images", "profiles");
                Directory.CreateDirectory(uploadsFolder);

                var uniqueFileName = $"{user.Id}_{Path.GetFileName(model.ProfilePicture.FileName)}";
                var filePath = Path.Combine(uploadsFolder, uniqueFileName);

                using (var fileStream = new FileStream(filePath, FileMode.Create))
                {
                    await model.ProfilePicture.CopyToAsync(fileStream);
                }

                user.ProfilePictureUrl = $"/images/profiles/{uniqueFileName}";
            }

            await _userManager.UpdateAsync(user);
            return RedirectToAction("Profile");
        }

        return View(model);
    }

}