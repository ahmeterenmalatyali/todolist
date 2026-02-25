namespace TodoApp.Backend.Entities
{
    public class SubTask
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int TodoId { get; set; }

        // Eski tekil atama — geriye dönük uyumluluk için tutuldu
        public int? AssignedUserId { get; set; }
        public User? AssignedUser { get; set; }

        // YENİ: Çoklu atama (many-to-many)
        public ICollection<User> Assignees { get; set; } = new List<User>();
    }
}