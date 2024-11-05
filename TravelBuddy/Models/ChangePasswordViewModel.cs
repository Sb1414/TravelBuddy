using System.ComponentModel.DataAnnotations;

namespace TravelBuddy.Models;

public class ChangePasswordViewModel
{
    [Required(ErrorMessage = "Текущий пароль обязателен.")]
    [DataType(DataType.Password)]
    public string OldPassword { get; set; }

    [Required(ErrorMessage = "Новый пароль обязателен.")]
    [StringLength(100, ErrorMessage = "Пароль должен содержать как минимум {2} символов.", MinimumLength = 6)]
    [DataType(DataType.Password)]
    public string NewPassword { get; set; }

    [Required(ErrorMessage = "Подтверждение пароля обязательно.")]
    [DataType(DataType.Password)]
    [Compare("NewPassword", ErrorMessage = "Пароли не совпадают.")]
    public string ConfirmPassword { get; set; }
}
