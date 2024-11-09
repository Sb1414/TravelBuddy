using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBuddy.Models;

public class UserRoute
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }

    [ForeignKey("UserId")]
    public virtual ApplicationUser User { get; set; }

    [Required]
    [Display(Name = "Город отправления")]
    public string DepartureCity { get; set; }

    [Required]
    [Display(Name = "Город назначения")]
    public string DestinationCity { get; set; }

    [Required]
    [Display(Name = "Средство передвижения туда")]
    public string TransportationTo { get; set; }

    [Required]
    [Display(Name = "Время пребывания")]
    public int Duration { get; set; }

    [Required]
    [Display(Name = "Тип времени")]
    public string DurationType { get; set; } // "Дни" или "Часы"

    [Required]
    [Display(Name = "Средство передвижения обратно")]
    public string TransportationBack { get; set; }
}