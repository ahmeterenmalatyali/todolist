namespace TodoApp.Backend.Entities
{
    public class ProjectMember
    {
        public int ProjectId { get; set; }
        public Project Project { get; set; } = null!;

        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public ProjectRole Role { get; set; }

        // YENİ: Davet durumu (eski kayıtlar Accepted sayılsın diye default = 1)
        public InviteStatus Status { get; set; } = InviteStatus.Accepted;
    }
}
