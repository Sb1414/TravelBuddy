using System.ComponentModel.DataAnnotations;

namespace TravelBuddy.Models;

public class ProfileViewModel
{
    [Display(Name = "ФИО")]
    public string FullName { get; set; }

    [Display(Name = "Дата рождения")]
    [DataType(DataType.Date)]
    public DateTime? BirthDate { get; set; }

    [Display(Name = "Серия паспорта")]
    public string PassportSeries { get; set; }

    [Display(Name = "Номер паспорта")]
    public string PassportNumber { get; set; }

    [Display(Name = "Город проживания")]
    public string City { get; set; }

    [Display(Name = "Фото профиля")]
    public string ProfilePictureUrl { get; set; }

    [Display(Name = "Загрузить фото")]
    public IFormFile ProfilePicture { get; set; }
    
    public ChangePasswordViewModel ChangePasswordModel { get; set; }
}