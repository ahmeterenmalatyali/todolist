namespace TodoApp.Backend.Entities
{
    public enum ProjectRole { Leader, Member }

    // YENİ: Davet durumu
    public enum InviteStatus
    {
        Pending = 0,   // Davet gönderildi, bekliyor
        Accepted = 1,  // Kabul edildi
        Rejected = 2   // Reddedildi
    }
}
