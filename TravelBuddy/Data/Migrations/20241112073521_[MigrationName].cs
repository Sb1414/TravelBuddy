using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelBuddy.Data.Migrations
{
    /// <inheritdoc />
    public partial class MigrationName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Routes_AspNetUsers_UserId",
                table: "Routes");

            migrationBuilder.DropForeignKey(
                name: "FK_RouteStops_Routes_RouteId",
                table: "RouteStops");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Routes",
                table: "Routes");

            migrationBuilder.RenameTable(
                name: "Routes",
                newName: "UserRoute");

            migrationBuilder.RenameIndex(
                name: "IX_Routes_UserId",
                table: "UserRoute",
                newName: "IX_UserRoute_UserId");

            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "RouteStops",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "RouteStops",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddPrimaryKey(
                name: "PK_UserRoute",
                table: "UserRoute",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_RouteStops_UserRoute_RouteId",
                table: "RouteStops",
                column: "RouteId",
                principalTable: "UserRoute",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoute_AspNetUsers_UserId",
                table: "UserRoute",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RouteStops_UserRoute_RouteId",
                table: "RouteStops");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoute_AspNetUsers_UserId",
                table: "UserRoute");

            migrationBuilder.DropPrimaryKey(
                name: "PK_UserRoute",
                table: "UserRoute");

            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "RouteStops");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "RouteStops");

            migrationBuilder.RenameTable(
                name: "UserRoute",
                newName: "Routes");

            migrationBuilder.RenameIndex(
                name: "IX_UserRoute_UserId",
                table: "Routes",
                newName: "IX_Routes_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Routes",
                table: "Routes",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Routes_AspNetUsers_UserId",
                table: "Routes",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_RouteStops_Routes_RouteId",
                table: "RouteStops",
                column: "RouteId",
                principalTable: "Routes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
