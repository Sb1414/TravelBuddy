using System.ComponentModel.DataAnnotations;

namespace TravelBuddy.Models;

public class RegisterViewModel
{
    [Required]
    [EmailAddress]
    [Display(Name = "Электронная почта")]
    public string Email { get; set; }

    [Required]
    [StringLength(100, ErrorMessage = "Пароль должен содержать как минимум {2} символов.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    [Display(Name = "Пароль")]
    public string Password { get; set; }

    [DataType(DataType.Password)]
    [Display(Name = "Подтвердите пароль")]
    [Compare("Password", ErrorMessage = "Пароли не совпадают.")]
    public string ConfirmPassword { get; set; }
    
}