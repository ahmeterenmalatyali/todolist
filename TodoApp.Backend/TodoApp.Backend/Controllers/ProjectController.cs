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
    public class ProjectController : ControllerBase
    {
        private readonly AppDbContext _context;
        public ProjectController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetProjects()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr)) return Unauthorized();
            var userId = int.Parse(userIdStr);

            var owned = await _context.Projects
                .Where(p => p.OwnerId == userId)
                .Select(p => new { p.Id, p.Name, IsOwner = true, Role = "Leader" })
                .ToListAsync();

            var joined = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId && pm.Project.OwnerId != userId)
                .Select(pm => new {
                    Id = pm.Project.Id,
                    Name = pm.Project.Name,
                    IsOwner = false,
                    Role = pm.Role.ToString()
                }).ToListAsync();

            return Ok(new { owned, joined });
        }

        [HttpPost]
        public async Task<IActionResult> CreateProject([FromBody] ProjectCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var project = new Project { Name = dto.Name, OwnerId = userId };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            _context.ProjectMembers.Add(new ProjectMember
            {
                UserId = userId,
                ProjectId = project.Id,
                Role = ProjectRole.Leader
            });
            await _context.SaveChangesAsync();

            return Ok(new { project.Id, project.Name, IsOwner = true, Role = "Leader" });
        }

        [HttpPost("{projectId}/invite")]
        public async Task<IActionResult> InviteUser(int projectId, [FromBody] InviteRequest dto)
        {
            var requestUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var requesterMember = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == requestUserId);
            if (requesterMember?.Role != ProjectRole.Leader) return Forbid();

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == dto.EmailOrUsername || u.Username == dto.EmailOrUsername);
            if (user == null) return BadRequest(new { message = "Kullanıcı bulunamadı." });

            if (await _context.ProjectMembers.AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id))
                return BadRequest(new { message = "Kullanıcı zaten üye." });

            _context.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = projectId,
                UserId = user.Id,
                Role = ProjectRole.Member
            });
            await _context.SaveChangesAsync();
            return Ok(new { message = "Davet edildi." });
        }

        [HttpGet("{projectId}/members")]
        public async Task<IActionResult> GetProjectMembers(int projectId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isMember = await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
            if (!isMember) return Forbid();

            var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .Select(pm => new {
                    pm.User.Id,
                    pm.User.Username,
                    pm.User.Email,
                    Role = pm.Role.ToString()
                }).ToListAsync();

            return Ok(members);
        }
    }

    public class ProjectCreateDto { public string Name { get; set; } = string.Empty; }
    public class InviteRequest { public string EmailOrUsername { get; set; } = string.Empty; }
}
