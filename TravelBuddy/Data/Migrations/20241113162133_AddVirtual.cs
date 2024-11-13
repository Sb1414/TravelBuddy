using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TravelBuddy.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVirtual : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserRoute",
                type: "nvarchar(450)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoute_UserId",
                table: "UserRoute",
                column: "UserId");

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
                name: "FK_UserRoute_AspNetUsers_UserId",
                table: "UserRoute");

            migrationBuilder.DropIndex(
                name: "IX_UserRoute_UserId",
                table: "UserRoute");

            migrationBuilder.AlterColumn<string>(
                name: "UserId",
                table: "UserRoute",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(450)");
        }
    }
}
