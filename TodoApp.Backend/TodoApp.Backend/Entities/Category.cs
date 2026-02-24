namespace TodoApp.Backend.Entities
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;
        public bool IsDefault { get; set; } = false; // true = sistem default'u
    }
}
