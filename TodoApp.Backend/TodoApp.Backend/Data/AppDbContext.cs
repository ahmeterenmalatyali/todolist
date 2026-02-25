using Microsoft.EntityFrameworkCore;
using TodoApp.Backend.Entities;

namespace TodoApp.Backend
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Project> Projects { get; set; } = null!;
        public DbSet<ProjectMember> ProjectMembers { get; set; } = null!;
        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Todo> Todos { get; set; } = null!;
        public DbSet<SubTask> SubTasks { get; set; } = null!;
        public DbSet<Category> Categories { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // ProjectMember Composite Key
            modelBuilder.Entity<ProjectMember>()
                .HasKey(pm => new { pm.ProjectId, pm.UserId });

            // Todo -> AssignedUser (tekil, opsiyonel FK)
            modelBuilder.Entity<Todo>()
                .HasOne(t => t.AssignedUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // Todo -> Assignees (çoklu, many-to-many)
            modelBuilder.Entity<Todo>()
                .HasMany(t => t.Assignees)
                .WithMany(u => u.AssignedTodos)
                .UsingEntity(j => j.ToTable("TodoAssignees"));

            // SubTask -> Todo
            modelBuilder.Entity<SubTask>()
                .HasOne<Todo>()
                .WithMany(t => t.SubTasks)
                .HasForeignKey(st => st.TodoId);

            // SubTask -> AssignedUser (tekil, opsiyonel FK — geriye dönük uyumluluk)
            modelBuilder.Entity<SubTask>()
                .HasOne(s => s.AssignedUser)
                .WithMany()
                .HasForeignKey(s => s.AssignedUserId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // SubTask -> Assignees (çoklu, many-to-many)
            modelBuilder.Entity<SubTask>()
                .HasMany(s => s.Assignees)
                .WithMany(u => u.AssignedSubTasks)
                .UsingEntity(j => j.ToTable("SubTaskAssignees"));

            // Category -> Project
            modelBuilder.Entity<Category>()
                .HasOne(c => c.Project)
                .WithMany()
                .HasForeignKey(c => c.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}