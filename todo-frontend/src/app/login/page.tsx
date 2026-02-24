"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiUser, FiLock, FiLogIn, FiArrowRight } from "react-icons/fi";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/Auth/login", formData);
      
      // Token'ı kaydet
      localStorage.setItem("token", response.data.token);
      
      toast.success("Başarıyla giriş yapıldı!");
      router.push("/"); // Ana sayfaya yönlendir
    } catch (error: any) {
      toast.error(error.response?.data || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
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
            <FiLogIn className="text-white text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">
            Tekrar Hoş Geldin!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
            Devam etmek için hesabına giriş yap.
          </p>
        </div>

        {/* Giriş Formu */}
        <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-8 border border-slate-100 dark:border-white/5">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Kullanıcı Adı veya Email */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Kullanıcı Adı veya E-posta</label>
              <div className="relative group">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  required
                  type="text"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  placeholder="johndoe veya john@example.com"
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500/30 text-slate-800 dark:text-white font-bold transition-all"
                />
              </div>
            </div>

            {/* Şifre */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Şifre</label>
                <button type="button" className="text-[10px] font-bold text-indigo-500 hover:underline">Şifremi Unuttum?</button>
              </div>
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

            {/* Giriş Butonu */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? "GİRİŞ YAPILIYOR..." : (
                <>
                  GİRİŞ YAP <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Kayıt Ol Linki */}
          <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 text-center">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Henüz hesabın yok mu?{" "}
              <Link href="/register" className="text-indigo-600 dark:text-indigo-400 font-black hover:underline ml-1">
                Hemen Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}