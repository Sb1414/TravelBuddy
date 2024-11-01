using System.ComponentModel.DataAnnotations;

namespace TravelBuddy.Models;

public class LoginViewModel
{
    [Required]
    [EmailAddress]
    [Display(Name = "Электронная почта")]
    public string Email { get; set; }

    [Required]
    [DataType(DataType.Password)]
    [Display(Name = "Пароль")]
    public string Password { get; set; }

    [Display(Name = "Запомнить меня")]
    public bool RememberMe { get; set; }
}