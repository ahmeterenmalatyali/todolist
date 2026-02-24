using System.Collections.Generic;

namespace TodoApp.Backend.Entities
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public List<ProjectMember> ProjectMemberships { get; set; } = new();
        public bool IsEmailConfirmed { get; set; }
        public string? EmailConfirmationToken { get; set; }

        // Çoklu atama ilişkisi
        public ICollection<Todo> AssignedTodos { get; set; } = new List<Todo>();
    }
}
