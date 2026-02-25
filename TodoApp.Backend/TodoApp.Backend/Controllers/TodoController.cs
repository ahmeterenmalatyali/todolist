using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TodoApp.Backend.Entities;

namespace TodoApp.Backend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class TodoController : ControllerBase
    {
        private readonly AppDbContext _context;
        public TodoController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetTodos(int projectId)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            var project = await _context.Projects.FindAsync(projectId);
            var isOwner = project?.OwnerId == userId;

            var isMember = isOwner || await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == projectId
                    && pm.UserId == userId
                    && pm.Status == InviteStatus.Accepted);

            if (!isMember) return Forbid();

            // EF Core + Npgsql, nested Select içindeki koşullu navigation property'leri
            // ve AssignedUser null kontrolünü SQL'e çeviremez → 500 hatası.
            // Çözüm: önce Include ile veriyi C#'a çek, sonra project et.
            var todoEntities = await _context.Todos
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.SubTasks)
                    .ThenInclude(s => s.AssignedUser)
                .Include(t => t.SubTasks)
                    .ThenInclude(s => s.Assignees)
                .Include(t => t.AssignedUser)
                .Include(t => t.Assignees)
                .OrderBy(t => t.Order)
                .ToListAsync();

            var todos = todoEntities.Select(t => new
            {
                t.Id,
                t.Title,
                t.IsCompleted,
                t.Priority,
                t.Category,
                t.DueDate,
                t.Order,
                AssignedUserName = t.AssignedUser != null ? t.AssignedUser.Username : "Atanmamış",
                t.AssignedUserId,
                Assignees = t.Assignees.Select(a => new
                {
                    a.Id,
                    a.Username,
                    a.AvatarUrl
                }).ToList(),
                SubTasks = t.SubTasks.OrderBy(s => s.Id).Select(s => new
                {
                    s.Id,
                    s.Title,
                    s.IsCompleted,
                    s.AssignedUserId,
                    AssignedUser = s.AssignedUser != null
                        ? (object)new { s.AssignedUser.Id, s.AssignedUser.Username, s.AssignedUser.AvatarUrl }
                        : null,
                    Assignees = s.Assignees.Select(a => new
                    {
                        a.Id,
                        a.Username,
                        a.AvatarUrl
                    }).ToList()
                }).ToList()
            }).ToList();

            return Ok(todos);
        }

        [HttpPost]
        public async Task<IActionResult> CreateTodo([FromBody] TodoCreateDto dto)
        {
            var todo = new Todo
            {
                Title = dto.Title,
                ProjectId = dto.ProjectId,
                Priority = dto.Priority,
                Category = dto.Category,
                DueDate = dto.DueDate,
                IsCompleted = false,
                Order = _context.Todos.Count(t => t.ProjectId == dto.ProjectId) + 1
            };
            _context.Todos.Add(todo);
            await _context.SaveChangesAsync();
            return Ok(todo);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTodo(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var todo = await _context.Todos.FindAsync(id);
            if (todo == null) return NotFound();

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == todo.ProjectId && pm.UserId == userId);
            if (member?.Role != ProjectRole.Leader) return Forbid();

            _context.Todos.Remove(todo);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{id}/assign/{userId}")]
        public async Task<IActionResult> AssignUser(int id, int userId)
        {
            var todo = await _context.Todos.Include(t => t.Assignees).FirstOrDefaultAsync(t => t.Id == id);
            var user = await _context.Users.FindAsync(userId);
            if (todo == null || user == null) return NotFound();

            if (todo.Assignees.Any(u => u.Id == userId)) todo.Assignees.Remove(user);
            else todo.Assignees.Add(user);

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("{id}/toggle")]
        public async Task<IActionResult> ToggleTodo(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var todo = await _context.Todos
                .Include(t => t.SubTasks)
                .Include(t => t.Assignees)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (todo == null) return NotFound();

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == todo.ProjectId && pm.UserId == userId);
            bool canToggle = member?.Role == ProjectRole.Leader
                || todo.Assignees.Any(a => a.Id == userId)
                || todo.AssignedUserId == userId;
            if (!canToggle) return Forbid();

            if (!todo.IsCompleted && todo.SubTasks.Any(s => !s.IsCompleted))
                return BadRequest("Önce alt görevleri bitirin.");

            todo.IsCompleted = !todo.IsCompleted;
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("reorder")]
        public async Task<IActionResult> Reorder([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any()) return BadRequest();
            var firstTodo = await _context.Todos.FindAsync(ids.First());
            if (firstTodo == null) return NotFound();

            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == firstTodo.ProjectId && pm.UserId == userId);
            if (member?.Role != ProjectRole.Leader) return Forbid();

            for (int i = 0; i < ids.Count; i++)
            {
                var todo = await _context.Todos.FindAsync(ids[i]);
                if (todo != null) todo.Order = i;
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("{todoId}/subtask")]
        public async Task<IActionResult> AddSubTask(int todoId, [FromQuery] string title, [FromQuery] int? assignedUserId)
        {
            var subTask = new SubTask
            {
                Title = title,
                TodoId = todoId,
                AssignedUserId = assignedUserId,
                IsCompleted = false
            };
            _context.SubTasks.Add(subTask);
            await _context.SaveChangesAsync();
            return Ok(subTask);
        }

        [HttpPost("subtask/{subTaskId}/assign/{userId}")]
        public async Task<IActionResult> AssignSubTaskUser(int subTaskId, int userId)
        {
            var subTask = await _context.SubTasks
                .Include(s => s.Assignees)
                .FirstOrDefaultAsync(s => s.Id == subTaskId);
            var user = await _context.Users.FindAsync(userId);
            if (subTask == null || user == null) return NotFound();

            if (subTask.Assignees.Any(u => u.Id == userId))
                subTask.Assignees.Remove(user);
            else
                subTask.Assignees.Add(user);

            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPut("subtask/{subTaskId}/toggle")]
        public async Task<IActionResult> ToggleSubTask(int subTaskId)
        {
            var subTask = await _context.SubTasks.FindAsync(subTaskId);
            if (subTask == null) return NotFound();

            subTask.IsCompleted = !subTask.IsCompleted;
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class TodoCreateDto
    {
        public string Title { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public int Priority { get; set; }
        public string Category { get; set; } = "Genel";
        public DateTime? DueDate { get; set; }
    }
}