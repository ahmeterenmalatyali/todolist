namespace TodoApp.Backend.DTOs
{
    public class UserLoginDto
    {
        // Kullanıcının giriş yaparken girdiği ad
        public string Username { get; set; } = string.Empty;

        // Kullanıcının giriş yaparken girdiği şifre
        public string Password { get; set; } = string.Empty;
    }
}