using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;

namespace TravelBuddy.Models;

public class UserRoute
{
    [Key]
    public int Id { get; set; }

    [Required]
    [ForeignKey("ApplicationUser")]
    public string UserId { get; set; }

    [ValidateNever]
    public virtual ApplicationUser ApplicationUser { get; set; }

    [Required]
    [Display(Name = "Название маршрута")]
    public string RouteName { get; set; }

    public virtual ICollection<RouteStop> RouteStops { get; set; } = new List<RouteStop>();
}
