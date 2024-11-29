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
    
    [Display(Name = "Тип транспорта")]
    public string? TransportationType { get; set; } 

    [Display(Name = "Перевозчик")]
    public string? TransportationCarrier { get; set; }

    [Display(Name = "Время отправления")]
    public DateTime? TransportationDepartureTime { get; set; }

    [Display(Name = "Время прибытия")]
    public DateTime? TransportationArrivalTime { get; set; }

    [Display(Name = "Откуда")]
    public string? TransportationFromTitle { get; set; }

    [Display(Name = "Куда")]
    public string? TransportationToTitle { get; set; }

    [Display(Name = "Координаты откуда (Широта)")]
    public double? TransportationFromLatitude { get; set; }

    [Display(Name = "Координаты откуда (Долгота)")]
    public double? TransportationFromLongitude { get; set; }

    [Display(Name = "Координаты куда (Широта)")]
    public double? TransportationToLatitude { get; set; }

    [Display(Name = "Координаты куда (Долгота)")]
    public double? TransportationToLongitude { get; set; }

    [Display(Name = "Цена транспорта")]
    public string? TransportationPrice { get; set; }

    // Hotel Details
    [Display(Name = "Название отеля")]
    public string? HotelName { get; set; }

    [Display(Name = "Координаты отеля (Широта)")]
    public double? HotelLatitude { get; set; }

    [Display(Name = "Координаты отеля (Долгота)")]
    public double? HotelLongitude { get; set; }

    [Display(Name = "Цена отеля")]
    public string? HotelPrice { get; set; }

    [Display(Name = "Рейтинг отеля")]
    public string? HotelRating { get; set; }

    [Display(Name = "URL изображения отеля")]
    public string? HotelImageUrl { get; set; }

    // Destination Coordinates
    [Display(Name = "Широта")]
    public double Latitude { get; set; }

    [Display(Name = "Долгота")]
    public double Longitude { get; set; }

    // Optional Fields
    [Display(Name = "Время пребывания")]
    public int? Duration { get; set; }
    
    [Display(Name = "Дата выезда из отеля")]
    public DateTime? HotelCheckOutDate { get; set; }

    [Display(Name = "Тип времени")]
    public string? DurationType { get; set; } // "Дни" или "Часы"
}