using System.ComponentModel.DataAnnotations;

namespace TodoApp.Backend.DTOs
{
    // HATA DÜZELTMESİ: Email alanı eklendi. AuthController'daki RegisterDto ile uyumlu hale getirildi.
    // NOT: AuthController kendi RegisterDto'sunu kullandığı için bu dosya artık tutarlı referans olarak kalıyor.
    public class UserRegisterDto
    {
        [Required(ErrorMessage = "Kullanıcı adı zorunludur.")]
        [MinLength(3, ErrorMessage = "Kullanıcı adı en az 3 karakter olmalıdır.")]
        public string Username { get; set; } = string.Empty;

        [Required(ErrorMessage = "E-posta zorunludur.")]
        [EmailAddress(ErrorMessage = "Geçerli bir e-posta adresi giriniz.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Şifre zorunludur.")]
        [MinLength(6, ErrorMessage = "Şifre en az 6 karakter olmalıdır.")]
        public string Password { get; set; } = string.Empty;
    }
}
