using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TodoApp.Backend.Entities
{
    public class Project
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        public int OwnerId { get; set; }
        public User? Owner { get; set; }

        // İlişkiler
        public List<ProjectMember> ProjectMembers { get; set; } = new();
        public List<Todo> Todos { get; set; } = new();
    }
}