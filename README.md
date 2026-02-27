# 📝 Todo App

Proje tabanlı görev takip uygulaması. Kullanıcılar proje oluşturabilir, takım arkadaşlarını davet edebilir ve görevleri birlikte yönetebilir.

---

## 🚀 Teknolojiler

**Backend**
- .NET 8 (ASP.NET Core Web API)
- Entity Framework Core
- PostgreSQL
- JWT Authentication
- BCrypt şifreleme
- Mailtrap (e-posta doğrulama)

**Frontend**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios
- React Beautiful DnD (sürükle-bırak)

---

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
- Rol sistemi: **Leader** ve **Member**
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

---

## ⚙️ Kurulum

### Gereksinimler
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)

---

### 1. Veritabanı

PostgreSQL'de bir veritabanı oluştur:
```sql
CREATE DATABASE TodoBasicDb;
```

---

### 2. Backend

```bash
cd backend/TodoApp.Backend/TodoApp.Backend
```

`appsettings.json` içindeki bağlantı bilgilerini güncelle:
```json
"ConnectionStrings": {
  "DefaultConnection": "Host=localhost;Database=TodoBasicDb;Username=postgres;Password=SIFREN"
}
```

Migration'ları uygula ve başlat:
```bash
dotnet ef database update
dotnet run --launch-profile http
```

Backend `http://localhost:5121` adresinde çalışır.  
Swagger UI: `http://localhost:5121/swagger`

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışır.

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| POST | `/api/Auth/register` | Kayıt ol |
| GET | `/api/Auth/verify-email?token=` | E-posta doğrula |
| POST | `/api/Auth/login` | Giriş yap |
| GET | `/api/Auth/me` | Oturum bilgisi |

### Project
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/Project` | Projeleri listele |
| POST | `/api/Project` | Proje oluştur |
| DELETE | `/api/Project/{id}` | Proje sil |
| PATCH | `/api/Project/{id}/archive` | Arşivle |
| PATCH | `/api/Project/{id}/unarchive` | Arşivden çıkar |
| POST | `/api/Project/{id}/invite` | Üye davet et |
| GET | `/api/Project/invitations` | Bekleyen davetler |
| POST | `/api/Project/{id}/invitations/accept` | Daveti kabul et |
| POST | `/api/Project/{id}/invitations/reject` | Daveti reddet |
| GET | `/api/Project/{id}/members` | Üyeleri listele |
| DELETE | `/api/Project/{id}/members/{userId}` | Üyeyi çıkar |

### Todo
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/Todo` | Görevleri listele |
| POST | `/api/Todo` | Yeni görev ekle |
| DELETE | `/api/Todo/{id}` | Görev sil |
| PUT | `/api/Todo/{id}/toggle` | Tamamla / geri al |
| PUT | `/api/Todo/reorder` | Sıralamayı güncelle |
| POST | `/api/Todo/{id}/subtask` | Alt görev ekle |
| PUT | `/api/Todo/subtask/{id}/toggle` | Alt görevi tamamla |

### Category
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| GET | `/api/Category` | Kategorileri listele |
| POST | `/api/Category` | Kategori oluştur |

---

## 📁 Proje Yapısı

```
├── backend/
│   └── TodoApp.Backend/
│       └── TodoApp.Backend/
│           ├── Controllers/
│           │   ├── AuthController.cs
│           │   ├── ProjectController.cs
│           │   ├── TodoController.cs
│           │   └── CategoryController.cs
│           ├── Entities/
│           │   ├── User.cs
│           │   ├── Project.cs
│           │   ├── ProjectMember.cs
│           │   ├── Todo.cs
│           │   ├── SubTask.cs
│           │   ├── Category.cs
│           │   └── Enums.cs
│           ├── DTOs/
│           ├── Services/
│           │   └── EmailService.cs
│           ├── Data/
│           │   └── AppDbContext.cs
│           ├── Migrations/
│           ├── appsettings.json
│           └── Program.cs
│
└── frontend/
    └── src/
        ├── app/
        │   ├── page.tsx
        │   ├── login/
        │   ├── register/
        │   └── verify-email/
        ├── components/
        │   ├── Sidebar.tsx
        │   ├── AddTodoForm.tsx
        │   ├── TodoItem.tsx
        │   ├── TodoHeader.tsx
        │   ├── TodoToolbar.tsx
        │   ├── FilterPopup.tsx
        │   ├── SubTaskModal.tsx
        │   ├── InviteMemberModal.tsx
        │   ├── NewProjectModal.tsx
        │   ├── AvatarModal.tsx
        │   └── modals/
        ├── hooks/
        │   ├── useProjects.ts
        │   ├── useTodos.ts
        │   ├── useMembers.ts
        │   └── useFilters.ts
        └── lib/
            ├── api.ts
            └── utils.ts
```
