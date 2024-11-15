using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace TravelBuddy.Models;

public class ApplicationUser : IdentityUser
{
    [Display(Name = "ФИО")]
    public string? FullName { get; set; }

    [Display(Name = "Дата рождения")]
    [DataType(DataType.Date)]
    public DateTime? BirthDate { get; set; }

    [Display(Name = "Серия паспорта")]
    public string? PassportSeries { get; set; }

    [Display(Name = "Номер паспорта")]
    public string? PassportNumber { get; set; }

    [Display(Name = "Город проживания")]
    public string? City { get; set; }

    [Display(Name = "Фото профиля")]
    public string? ProfilePictureUrl { get; set; }
    public virtual ICollection<UserRoute> UserRoutes { get; set; } = new List<UserRoute>();
}