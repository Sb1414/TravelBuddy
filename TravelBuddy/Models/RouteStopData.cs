namespace TravelBuddy.Models;

public class RouteStopDTO
{
    public string DestinationCity { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public TransportationDTO Transportation { get; set; }
    public CoordinatesDTO TransportationFromCoords { get; set; }
    public CoordinatesDTO TransportationToCoords { get; set; }
    public HotelDTO Hotel { get; set; }
    public string DurationType { get; set; }
    public int? Duration { get; set; }
    public string HotelCheckOutDate { get; set; }
}


public class CoordinatesDTO
{
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
}

public class TransportationDTO
{
    public ThreadDTO thread { get; set; }
    public string stops { get; set; }
    public StationDTO from { get; set; }
    public StationDTO to { get; set; }
    public string TransportType { get; set; }
    public string departure_platform { get; set; }
    public string arrival_platform { get; set; }
    public string departure_terminal { get; set; }
    public string arrival_terminal { get; set; }
    public int duration { get; set; }
    public bool has_transfers { get; set; }
    public TicketsInfoDTO tickets_info { get; set; }
    public DateTime departure { get; set; }
    public DateTime arrival { get; set; }
    public string start_date { get; set; }
}

public class ThreadDTO
{
    public string number { get; set; }
    public string title { get; set; }
    public string short_title { get; set; }
    public string express_type { get; set; }
    public string transport_type { get; set; }
    public CarrierDTO carrier { get; set; }
    public string uid { get; set; }
    public string vehicle { get; set; }
    public TransportSubtypeDTO transport_subtype { get; set; }
    public string thread_method_link { get; set; }
}

public class CarrierDTO
{
    public int code { get; set; }
    public string title { get; set; }
    public CodesDTO codes { get; set; }
    public string address { get; set; }
    public string url { get; set; }
    public string email { get; set; }
    public string contacts { get; set; }
    public string phone { get; set; }
    public string logo { get; set; }
    public string logo_svg { get; set; }
}

public class CodesDTO
{
    public string sirena { get; set; }
    public string iata { get; set; }
    public string icao { get; set; }
}

public class TransportSubtypeDTO
{
    public string title { get; set; }
    public string code { get; set; }
    public string color { get; set; }
}

public class StationDTO
{
    public string type { get; set; }
    public string title { get; set; }
    public string short_title { get; set; }
    public string popular_title { get; set; }
    public string code { get; set; }
    public string station_type { get; set; }
    public string station_type_name { get; set; }
    public string transport_type { get; set; }
}

public class TicketsInfoDTO
{
    public bool et_marker { get; set; }
    public List<object> places { get; set; }
}

public class HotelDTO
{
    public string name { get; set; }
    public double price { get; set; }
    public int rating { get; set; }
    public double? latitude { get; set; }
    public double? longitude { get; set; }
    public string imageUrl { get; set; }
}
