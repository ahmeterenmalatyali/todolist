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

            // YENİ: Sadece kabul edilmiş (Accepted) üyelikleri getir
            var joined = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId
                    && pm.Project.OwnerId != userId
                    && pm.Status == InviteStatus.Accepted)
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
                Role = ProjectRole.Leader,
                Status = InviteStatus.Accepted // Proje sahibi direkt kabul edilmiş sayılır
            });
            await _context.SaveChangesAsync();

            return Ok(new { project.Id, project.Name, IsOwner = true, Role = "Leader" });
        }

        // YENİ: Davet gönder (artık Pending olarak kaydedilir, direkt eklenmez)
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

            var existing = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == user.Id);

            if (existing != null)
            {
                if (existing.Status == InviteStatus.Accepted)
                    return BadRequest(new { message = "Kullanıcı zaten bu projenin üyesi." });
                if (existing.Status == InviteStatus.Pending)
                    return BadRequest(new { message = "Bu kullanıcıya zaten davet gönderildi." });
                // Daha önce reddetmişse tekrar davet gönder
                existing.Status = InviteStatus.Pending;
                await _context.SaveChangesAsync();
                return Ok(new { message = "Davet yeniden gönderildi." });
            }

            _context.ProjectMembers.Add(new ProjectMember
            {
                ProjectId = projectId,
                UserId = user.Id,
                Role = ProjectRole.Member,
                Status = InviteStatus.Pending // Bekliyor
            });
            await _context.SaveChangesAsync();
            return Ok(new { message = "Davet gönderildi." });
        }

        // YENİ: Gelen davetleri listele
        [HttpGet("invitations")]
        public async Task<IActionResult> GetPendingInvitations()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var invitations = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId && pm.Status == InviteStatus.Pending)
                .Select(pm => new {
                    ProjectId = pm.Project.Id,
                    ProjectName = pm.Project.Name,
                    InvitedBy = pm.Project.Owner != null ? pm.Project.Owner.Username : "Bilinmiyor"
                }).ToListAsync();

            return Ok(invitations);
        }

        // YENİ: Daveti kabul et
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

        // YENİ: Daveti reddet
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

        // GÜNCELLENDI: Sadece Accepted üyeleri göster + YENİ: AvatarUrl dahil
        [HttpGet("{projectId}/members")]
        public async Task<IActionResult> GetProjectMembers(int projectId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Proje sahibi veya kabul edilmiş üye ise izin ver
            var project = await _context.Projects.FindAsync(projectId);
            var isOwner = project?.OwnerId == userId;

            var isMember = isOwner || await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == projectId
                    && pm.UserId == userId
                    && pm.Status == InviteStatus.Accepted);

            if (!isMember) return Forbid();

            var members = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId && pm.Status == InviteStatus.Accepted)
                .Select(pm => new {
                    pm.User.Id,
                    pm.User.Username,
                    pm.User.Email,
                    pm.User.AvatarUrl,
                    Role = pm.Role.ToString()
                }).ToListAsync();

            return Ok(members);
        }

        // YENİ: Üyeyi projeden çıkar (sadece leader yapabilir)
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

            _context.ProjectMembers.Remove(target);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Üye projeden çıkarıldı." });
        }
    }

    public class ProjectCreateDto { public string Name { get; set; } = string.Empty; }
    public class InviteRequest { public string EmailOrUsername { get; set; } = string.Empty; }
}
