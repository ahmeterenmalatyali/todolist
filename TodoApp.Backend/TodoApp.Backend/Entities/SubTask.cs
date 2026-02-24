namespace TodoApp.Backend.Entities
{
    // HATA DÜZELTMESİ: Bu dosya /models klasöründen /Entities klasörüne taşınmalıdır.
    // Dosyanın yeni konumu: backend/Entities/SubTask.cs
    public class SubTask
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public bool IsCompleted { get; set; }
        public int TodoId { get; set; }

        public int? AssignedUserId { get; set; }
        public User? AssignedUser { get; set; }
    }
}
