using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelBuddy.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteStopsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DepartureCity",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "DestinationCity",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "Duration",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "DurationType",
                table: "Routes");

            migrationBuilder.DropColumn(
                name: "TransportationBack",
                table: "Routes");

            migrationBuilder.RenameColumn(
                name: "TransportationTo",
                table: "Routes",
                newName: "RouteName");

            migrationBuilder.CreateTable(
                name: "RouteStops",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RouteId = table.Column<int>(type: "int", nullable: false),
                    DestinationCity = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Transportation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Duration = table.Column<int>(type: "int", nullable: false),
                    DurationType = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RouteStops", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RouteStops_Routes_RouteId",
                        column: x => x.RouteId,
                        principalTable: "Routes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RouteStops_RouteId",
                table: "RouteStops",
                column: "RouteId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RouteStops");

            migrationBuilder.RenameColumn(
                name: "RouteName",
                table: "Routes",
                newName: "TransportationTo");

            migrationBuilder.AddColumn<string>(
                name: "DepartureCity",
                table: "Routes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "DestinationCity",
                table: "Routes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Duration",
                table: "Routes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "DurationType",
                table: "Routes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TransportationBack",
                table: "Routes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
