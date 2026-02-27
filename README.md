# 📝 Todo App
Proje tabanlı görev takip uygulaması. Kullanıcılar proje oluşturabilir, takım arkadaşlarını davet edebilir ve görevleri birlikte yönetebilir.

## 🚀 Teknolojiler

### Backend

- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- BCrypt şifreleme
- Mailtrap (e-posta doğrulama)

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- React Beautiful DnD (sürükle-bırak)


## ✨ Özellikler
### 🔐 Kimlik Doğrulama

- Kullanıcı kaydı ve girişi (JWT tabanlı)
- E-posta doğrulama (kayıt sonrası mail onayı)
- Profil avatarı

### 📁 Proje Yönetimi

- Proje oluşturma ve silme
- Proje arşivleme / arşivden çıkarma
- Üye davet sistemi (e-posta veya kullanıcı adıyla)
- Davet kabul / red etme
- Rol sistemi: Leader ve Member
- Üye çıkarma (göreve atanmış üye koruması)

### ✅ Görev Yönetimi

- Görev oluşturma, silme ve tamamlama
- Birden fazla üyeye görev atama
- Alt görev (SubTask) desteği
- Alt görevlere üye atama
- Öncelik seviyesi (Priority)
- Son tarih (Due Date)
- Kategori filtreleme
- ↕️ Sürükle-bırak ile görev sıralama
