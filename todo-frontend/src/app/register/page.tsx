"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiUser, FiMail, FiLock, FiUserPlus, FiArrowRight } from "react-icons/fi";

export default function RegisterPage() {
  const router = useRouter();
  
  // --- STATE'LER ---
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // --- INPUT DEĞİŞİMİ ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- KAYIT İŞLEMİ ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Backend AuthController içindeki RegisterDto ile birebir uyumlu
      await api.post("/Auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password
      });

      toast.success("Hesabınız başarıyla oluşturuldu!");
      router.push("/login");
    } catch (error: any) {
      const errorMessage = error.response?.data || "Kayıt sırasında bir hata oluştu.";
      toast.error(typeof errorMessage === 'string' ? errorMessage : "Kayıt başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-500/20 mb-4">
            <FiUserPlus className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Yeni Hesap Oluştur
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Ekibine katılmak ve projelerini yönetmek için başla.
          </p>
        </div>

        {/* Kayıt Formu */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none p-8 border border-slate-100 dark:border-white/5">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Kullanıcı Adı */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kullanıcı Adı</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="johndoe"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500/30 text-slate-800 dark:text-white font-bold transition-all"
                />
              </div>
            </div>

            {/* E-posta (Kritik Alan) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-Posta Adresi</label>
              <div className="relative group">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500/30 text-slate-800 dark:text-white font-bold transition-all"
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Şifre</label>
              <div className="relative group">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500/30 text-slate-800 dark:text-white font-bold transition-all"
                />
              </div>
            </div>

            {/* Kayıt Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "KAYDEDİLİYOR..." : (
                <>
                  HESAP OLUŞTUR <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Giriş Linki */}
          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline ml-1">
                Giriş Yap
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}