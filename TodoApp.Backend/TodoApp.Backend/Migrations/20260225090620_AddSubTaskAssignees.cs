using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddSubTaskAssignees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SubTaskAssignees",
                columns: table => new
                {
                    AssignedSubTasksId = table.Column<int>(type: "integer", nullable: false),
                    AssigneesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubTaskAssignees", x => new { x.AssignedSubTasksId, x.AssigneesId });
                    table.ForeignKey(
                        name: "FK_SubTaskAssignees_SubTasks_AssignedSubTasksId",
                        column: x => x.AssignedSubTasksId,
                        principalTable: "SubTasks",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubTaskAssignees_Users_AssigneesId",
                        column: x => x.AssigneesId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubTaskAssignees_AssigneesId",
                table: "SubTaskAssignees",
                column: "AssigneesId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SubTaskAssignees");
        }
    }
}
