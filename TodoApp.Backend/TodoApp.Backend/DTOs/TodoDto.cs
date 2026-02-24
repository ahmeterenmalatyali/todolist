namespace TodoApp.Backend.DTOs
{
    public class TodoDto
    {
        public string Title { get; set; }
        public int ProjectId { get; set; }
        public int Priority { get; set; }
        public string Category { get; set; }
        public DateTime? DueDate { get; set; }
        public int? AssignedUserId { get; set; }
    }
}