using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBuddy.Models;

public class UserRoute
{
    [Key]
    public int Id { get; set; }

    [Required(ErrorMessage = "Поле UserId обязательно.")]
    public string UserId { get; set; }

    [Required(ErrorMessage = "Поле Название маршрута обязательно.")]
    [Display(Name = "Название маршрута")]
    public string RouteName { get; set; }

    public virtual ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();
}
