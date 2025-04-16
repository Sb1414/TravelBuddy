namespace TravelBuddy.Models;

public class RoutesViewModel
{
    public List<UserRoute> Routes { get; set; }
    public List<string> DepartureCities { get; set; }
    public List<string> ArrivalCities { get; set; }
    public string SelectedDepartureCity { get; set; }
    public string SelectedArrivalCity { get; set; }
}