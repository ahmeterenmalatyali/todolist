using System;
using System.Collections.Generic;

namespace TodoApp.Backend.Entities
{
    public class Todo
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int Priority { get; set; }
        public string Category { get; set; } = "Genel";
        public DateTime? DueDate { get; set; }
        public int Order { get; set; }
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        // ESKİ YAPI (Tekil Atama)
        public int? AssignedUserId { get; set; }
        public User? AssignedUser { get; set; }

        // YENİ YAPI (Çoklu Atama - Silmeden eklendi)
        public ICollection<User> Assignees { get; set; } = new List<User>();

        // ALT GÖREVLER (Artık Entities namespace'indeki SubTask'ı görüyor)
        public List<SubTask> SubTasks { get; set; } = new();
    }
}