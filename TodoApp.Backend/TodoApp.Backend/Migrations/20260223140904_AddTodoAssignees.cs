using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddTodoAssignees : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedUserId",
                table: "SubTasks",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "TodoAssignees",
                columns: table => new
                {
                    AssignedTodosId = table.Column<int>(type: "integer", nullable: false),
                    AssigneesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TodoAssignees", x => new { x.AssignedTodosId, x.AssigneesId });
                    table.ForeignKey(
                        name: "FK_TodoAssignees_Todos_AssignedTodosId",
                        column: x => x.AssignedTodosId,
                        principalTable: "Todos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TodoAssignees_Users_AssigneesId",
                        column: x => x.AssigneesId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_SubTasks_AssignedUserId",
                table: "SubTasks",
                column: "AssignedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_TodoAssignees_AssigneesId",
                table: "TodoAssignees",
                column: "AssigneesId");

            migrationBuilder.AddForeignKey(
                name: "FK_SubTasks_Users_AssignedUserId",
                table: "SubTasks",
                column: "AssignedUserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SubTasks_Users_AssignedUserId",
                table: "SubTasks");

            migrationBuilder.DropTable(
                name: "TodoAssignees");

            migrationBuilder.DropIndex(
                name: "IX_SubTasks_AssignedUserId",
                table: "SubTasks");

            migrationBuilder.DropColumn(
                name: "AssignedUserId",
                table: "SubTasks");
        }
    }
}
