using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBuddy.Models;

public class RouteStop
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int RouteId { get; set; }
    
    [ForeignKey("RouteId")]
    public virtual UserRoute Route { get; set; }

    [Required]
    [Display(Name = "Город назначения")]
    public string DestinationCity { get; set; }

    [Required]
    [Display(Name = "Средство передвижения")]
    public string Transportation { get; set; }

    [Required]
    [Display(Name = "Время пребывания")]
    public int Duration { get; set; }

    [Required]
    [Display(Name = "Тип времени")]
    public string DurationType { get; set; } // "Дни" или "Часы"
    
    [Display(Name = "Широта")]
    public double Latitude { get; set; }

    [Display(Name = "Долгота")]
    public double Longitude { get; set; }
}