using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace TravelBuddy.Models;

public class UserRoute
{
    [Key]
    public int Id { get; set; }

    [Required]
    public string UserId { get; set; }
    
    public virtual ApplicationUser User { get; set; }
    
    [Display(Name = "Название маршрута")]
    public string RouteName { get; set; }

    // Навигационное свойство для связи с RouteStop
    public virtual ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();
}