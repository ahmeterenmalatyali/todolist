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
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;
        private static readonly string[] DefaultCategories = { "Genel", "İş", "Kişisel", "Alışveriş", "Eğitim" };

        public CategoryController(AppDbContext context) => _context = context;

        // Projeye ait kategorileri getir (default + özel)
        [HttpGet("{projectId}")]
        public async Task<IActionResult> GetCategories(int projectId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isMember = await _context.ProjectMembers
                .AnyAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
            if (!isMember) return Forbid();

            // Eğer bu proje için henüz default kategoriler yoksa oluştur
            var existing = await _context.Categories
                .Where(c => c.ProjectId == projectId)
                .ToListAsync();

            if (!existing.Any())
            {
                var defaults = DefaultCategories.Select(name => new Category
                {
                    Name = name,
                    ProjectId = projectId,
                    IsDefault = true
                }).ToList();
                _context.Categories.AddRange(defaults);
                await _context.SaveChangesAsync();
                return Ok(defaults.Select(c => new { c.Id, c.Name, c.IsDefault }));
            }

            return Ok(existing.Select(c => new { c.Id, c.Name, c.IsDefault }));
        }

        // Yeni özel kategori ekle
        [HttpPost("{projectId}")]
        public async Task<IActionResult> AddCategory(int projectId, [FromBody] CategoryCreateDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Sadece proje lideri ekleyebilir
            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == projectId && pm.UserId == userId);
            if (member?.Role != ProjectRole.Leader) return Forbid();

            // Aynı isimde kategori var mı?
            var exists = await _context.Categories
                .AnyAsync(c => c.ProjectId == projectId && c.Name == dto.Name);
            if (exists) return BadRequest(new { message = "Bu kategori zaten mevcut." });

            var category = new Category
            {
                Name = dto.Name,
                ProjectId = projectId,
                IsDefault = false
            };
            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return Ok(new { category.Id, category.Name, category.IsDefault });
        }

        // Özel kategori sil (default silinemez)
        [HttpDelete("{categoryId}")]
        public async Task<IActionResult> DeleteCategory(int categoryId)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var category = await _context.Categories.FindAsync(categoryId);
            if (category == null) return NotFound();
            if (category.IsDefault) return BadRequest(new { message = "Varsayılan kategoriler silinemez." });

            var member = await _context.ProjectMembers
                .FirstOrDefaultAsync(pm => pm.ProjectId == category.ProjectId && pm.UserId == userId);
            if (member?.Role != ProjectRole.Leader) return Forbid();

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }

    public class CategoryCreateDto { public string Name { get; set; } = string.Empty; }
}