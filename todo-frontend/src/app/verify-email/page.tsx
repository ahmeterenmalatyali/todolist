"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { FiCheckCircle, FiXCircle, FiLoader } from "react-icons/fi";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token"); // URL'deki ?token=... kısmını alır

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("E-posta adresiniz doğrulanıyor...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Geçersiz veya eksik doğrulama kodu.");
      return;
    }

    const verifyToken = async () => {
      try {
        // Backend'deki [HttpGet("verify-email")] ucuna istek atar
        const response = await api.get(`/Auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(response.data.message || "Hesabınız başarıyla doğrulandı!");
        toast.success("Doğrulama başarılı!");
        
        // 3 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => router.push("/login"), 3000);
      } catch (error: any) {
        setStatus("error");
        const errorMsg = error.response?.data?.message || "Doğrulama başarısız oldu.";
        setMessage(errorMsg);
        toast.error(errorMsg);
      }
    };

    verifyToken();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 dark:border-white/5">
        
        {/* Yükleniyor Durumu */}
        {status === "loading" && (
          <div className="space-y-4">
            <FiLoader className="text-6xl text-indigo-500 animate-spin mx-auto" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Doğrulanıyor...</h2>
            <p className="text-slate-500">{message}</p>
          </div>
        )}

        {/* Başarılı Durumu */}
        {status === "success" && (
          <div className="space-y-4">
            <FiCheckCircle className="text-6xl text-emerald-500 mx-auto" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Harika!</h2>
            <p className="text-slate-500">{message}</p>
            <p className="text-xs text-indigo-500 font-bold italic pt-4">Giriş sayfasına yönlendiriliyorsunuz...</p>
          </div>
        )}

        {/* Hata Durumu */}
        {status === "error" && (
          <div className="space-y-4">
            <FiXCircle className="text-6xl text-red-500 mx-auto" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Hata Oluştu</h2>
            <p className="text-slate-500">{message}</p>
            <div className="pt-6">
              <Link href="/register" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Tekrar Kayıt Ol
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}