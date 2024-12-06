using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelBuddy.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTransportAndHotelDetailsToRouteStop : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Transportation",
                table: "RouteStops",
                newName: "TransportationToTitle");

            migrationBuilder.AddColumn<string>(
                name: "HotelImageUrl",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HotelLatitude",
                table: "RouteStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "HotelLongitude",
                table: "RouteStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HotelName",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HotelPrice",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HotelRating",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TransportationArrivalTime",
                table: "RouteStops",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransportationCarrier",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "TransportationDepartureTime",
                table: "RouteStops",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TransportationFromLatitude",
                table: "RouteStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TransportationFromLongitude",
                table: "RouteStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransportationFromTitle",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransportationPrice",
                table: "RouteStops",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TransportationToLatitude",
                table: "RouteStops",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TransportationToLongitude",
                table: "RouteStops",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HotelImageUrl",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "HotelLatitude",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "HotelLongitude",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "HotelName",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "HotelPrice",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "HotelRating",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationArrivalTime",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationCarrier",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationDepartureTime",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationFromLatitude",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationFromLongitude",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationFromTitle",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationPrice",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationToLatitude",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "TransportationToLongitude",
                table: "RouteStops");

            migrationBuilder.RenameColumn(
                name: "TransportationToTitle",
                table: "RouteStops",
                newName: "Transportation");
        }
    }
}
