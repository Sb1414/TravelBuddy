namespace TravelBuddy.Models;

public class TransportResponse
{
    public List<Segment> segments { get; set; }
}

public class Segment
{
    public Thread thread { get; set; }
    public string stops { get; set; }
    public From from { get; set; }
    public To to { get; set; }
    public string departure_platform { get; set; }
    public string arrival_platform { get; set; }
    public string departure_terminal { get; set; }
    public string arrival_terminal { get; set; }
    public double duration { get; set; }
    public bool has_transfers { get; set; }
    public TicketsInfo tickets_info { get; set; }
    public DateTime departure { get; set; }
    public DateTime arrival { get; set; }
    public string start_date { get; set; }
}

public class Thread
{
    public string number { get; set; }
    public string title { get; set; }
    public string short_title { get; set; }
    public string express_type { get; set; }
    public string transport_type { get; set; }
    public Carrier carrier { get; set; }
    public string uid { get; set; }
    public string vehicle { get; set; }
    public TransportSubtype transport_subtype { get; set; }
    public string thread_method_link { get; set; }
}

public class Carrier
{
    public int code { get; set; }
    public string title { get; set; }
    public Codes codes { get; set; }
    public string address { get; set; }
    public string url { get; set; }
    public string email { get; set; }
    public string contacts { get; set; }
    public string phone { get; set; }
    public string logo { get; set; }
    public string logo_svg { get; set; }
}

public class Codes
{
    public string sirena { get; set; }
    public string iata { get; set; }
    public string icao { get; set; }
}

public class TransportSubtype
{
    public string title { get; set; }
    public string code { get; set; }
    public string color { get; set; }
}

public class From
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

public class To
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

public class TicketsInfo
{
    public bool et_marker { get; set; }
    public List<object> places { get; set; }
}
