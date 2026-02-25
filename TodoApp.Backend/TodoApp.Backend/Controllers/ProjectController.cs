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

            var ownedRaw = await _context.Projects
                .Where(p => p.OwnerId == userId)
                .ToListAsync();

            var owned = ownedRaw.Select(p => new
            {
                p.Id,
                p.Name,
                IsOwner = true,
                Role = "Leader",
                p.IsArchived
            }).ToList();

            var joinedRaw = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId
                    && pm.Project.OwnerId != userId
                    && pm.Status == InviteStatus.Accepted)
                .Include(pm => pm.Project)
                .ToListAsync();

            var joined = joinedRaw.Select(pm => new
            {
                Id = pm.Project.Id,
                Name = pm.Project.Name,
                IsOwner = false,
                Role = pm.Role.ToString(),
                pm.Project.IsArchived
            }).ToList();

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
                Role = ProjectRole.Leader,
                Status = InviteStatus.Accepted
            });
            await _context.SaveChangesAsync();

            return Ok(new { project.Id, project.Name, IsOwner = true, Role = "Leader", project.IsArchived });
        }

        // ARŞİVLE (sadece proje sahibi)
        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> ArchiveProject(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();
            if (project.OwnerId != userId) return Forbid();

            project.IsArchived = true;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Proje arşivlendi." });
        }

        // ARŞİVDEN ÇIKAR (sadece proje sahibi)
        [HttpPatch("{id}/unarchive")]
        public async Task<IActionResult> UnarchiveProject(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var project = await _context.Projects.FindAsync(id);
            if (project == null) return NotFound();
            if (project.OwnerId != userId) return Forbid();

            project.IsArchived = false;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Proje arşivden çıkarıldı." });
        }

        [HttpPost("{projectId}/invite")]
        public async Task<IActionResult> InviteUser(int projectId, [FromBody] InviteRequest dto)
        {
            var requestUserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Arşivlenmiş projeye davet gönderilemez
            var project = await _context.Projects.FindAsync(projectId);
            if (project?.IsArchived == true)
                return BadRequest(new { message = "Arşivlenmiş projeye davet gönderilmez." });

            var requesterMember = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == requestUserId);
            if (requesterMember?.Role != ProjectRole.Leader) return Forbid();

            var user = await _context.Users.FirstOrDefaultAsync(u =>
                u.Email == dto.EmailOrUsername || u.Username == dto.EmailOrUsername);
            if (user == null) return BadRequest(new { message = "Kullanıcı bulunamadı." });

            var existing = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);

            if (existing != null)
            {
                if (existing.Status == InviteStatus.Accepted)
                    return BadRequest(new { message = "Kullanıcı zaten bu projenin üyesi." });
                if (existing.Status == InviteStatus.Pending)
                    return BadRequest(new { message = "Bu kullanıcıya zaten davet gönderildi." });
                existing.Status = InviteStatus.Pending;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Davet yeniden gönderildi." });
            }

            _context.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = projectId,
                UserId = user.Id,
                Role = ProjectRole.Member,
                Status = InviteStatus.Pending
            });
            await _context.SaveChangesAsync();
            return Ok(new { message = "Davet gönderildi." });
        }

        [HttpGet("invitations")]
        public async Task<IActionResult> GetPendingInvitations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var rawData = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId && pm.Status == InviteStatus.Pending)
                .Include(pm => pm.Project)
                    .ThenInclude(p => p.Owner)
                .ToListAsync();

            var invitations = rawData.Select(pm => new
            {
                ProjectId = pm.Project.Id,
                ProjectName = pm.Project.Name,
                InvitedBy = pm.Project.Owner != null ? pm.Project.Owner.Username : "Bilinmiyor"
            }).ToList();

            return Ok(invitations);
        }

        [HttpPost("{projectId}/invitations/accept")]
        public async Task<IActionResult> AcceptInvitation(int projectId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId
                    && pm.UserId == userId
                    && pm.Status == InviteStatus.Pending);

            if (member == null) return NotFound(new { message = "Bekleyen davet bulunamadı." });

            member.Status = InviteStatus.Accepted;
            await _context.SaveChangesAsync();

            var project = await _context.Projects.FindAsync(projectId);
            return Ok(new { message = "Daveti kabul ettiniz.", projectName = project?.Name });
        }

        [HttpPost("{projectId}/invitations/reject")]
        public async Task<IActionResult> RejectInvitation(int projectId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId
                    && pm.UserId == userId
                    && pm.Status == InviteStatus.Pending);

            if (member == null) return NotFound(new { message = "Bekleyen davet bulunamadı." });

            member.Status = InviteStatus.Rejected;
            await _context.SaveChangesAsync();
            return Ok(new { message = "Davet reddedildi." });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var project = await _context.Projects.FirstOrDefaultAsync(p => p.Id == id);
            if (project == null) return NotFound("Proje bulunamadı.");
            if (project.OwnerId != userId) return Forbid();

            _context.Projects.Remove(project);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpGet("{projectId}/members")]
        public async Task<IActionResult> GetProjectMembers(int projectId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var project = await _context.Projects.FindAsync(projectId);
            var isOwner = project?.OwnerId == userId;

            var isMember = isOwner || await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == projectId
                    && pm.UserId == userId
                    && pm.Status == InviteStatus.Accepted);

            if (!isMember) return Forbid();

            var rawMembers = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId && pm.Status == InviteStatus.Accepted)
                .Include(pm => pm.User)
                .ToListAsync();

            var members = rawMembers.Select(pm => new
            {
                pm.User.Id,
                pm.User.Username,
                pm.User.Email,
                pm.User.AvatarUrl,
                Role = pm.Role.ToString()
            }).ToList();

            return Ok(members);
        }

        [HttpDelete("{projectId}/members/{targetUserId}")]
        public async Task<IActionResult> RemoveMember(int projectId, int targetUserId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            if (userId == targetUserId)
                return BadRequest(new { message = "Kendinizi projeden çıkaramazsınız." });

            var requester = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
            if (requester?.Role != ProjectRole.Leader) return Forbid();

            var target = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == targetUserId);
            if (target == null) return NotFound(new { message = "Üye bulunamadı." });

            // Göreve atanmış mı kontrol et
            var assignedTodoTitles = await _context.Todos
                .Where(t => t.ProjectId == projectId && t.Assignees.Any(u => u.Id == targetUserId))
                .Select(t => t.Title)
                .ToListAsync();

            if (assignedTodoTitles.Any())
                return BadRequest(new { message = $"Bu üye {assignedTodoTitles.Count} göreve atanmış. Önce görevlerden çıkarın.", tasks = assignedTodoTitles });

            _context.ProjectMembers.Remove(target);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Üye projeden çıkarıldı." });
        }
    }

    public class ProjectCreateDto { public string Name { get; set; } = string.Empty; }
    public class InviteRequest { public string EmailOrUsername { get; set; } = string.Empty; }
}