"use client";

import { useState, useRef } from "react";
import { FiX, FiUpload, FiRefreshCw } from "react-icons/fi";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface AvatarModalProps {
  currentUser: any;
  onClose: () => void;
  onUpdated: (avatarUrl: string | null) => void;
}

const DICEBEAR_SEEDS = [
  "Felix", "Anita", "Zara", "Orion", "Luna", "Kai",
  "Nova", "Remy", "Sage", "Storm", "Atlas", "Ember",
  "River", "Finn", "Skye", "Leo"
];

export const AvatarModal = ({ currentUser, onClose, onUpdated }: AvatarModalProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedSeed, setSelectedSeed] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2_000_000) {
      toast.error("Dosya 2MB'den küçük olmalı.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      setSelectedSeed(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let avatarData: string | null = null;
      if (preview) {
        avatarData = preview;
      } else if (selectedSeed) {
        avatarData = `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSeed}`;
      }
      const res = await api.put("/Auth/avatar", { avatarData });
      toast.success("Avatar güncellendi!");
      onUpdated(res.data.avatarUrl);
      onClose();
    } catch {
      toast.error("Avatar güncellenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    try {
      await api.put("/Auth/avatar", { avatarData: null });
      toast.success("Avatar varsayılana döndürüldü.");
      onUpdated(null);
      onClose();
    } catch {
      toast.error("Sıfırlama başarısız.");
    } finally {
      setLoading(false);
    }
  };

  const currentSrc = preview
    || (selectedSeed ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedSeed}` : null)
    || currentUser?.avatarUrl
    || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.username}`;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-white">Avatar Değiştir</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
            <FiX size={22} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Önizleme */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-200 dark:border-indigo-800 flex-shrink-0">
              <img src={currentSrc} alt="önizleme" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{currentUser?.username}</p>
              <p className="text-xs text-slate-400 mt-1">Önizleme</p>
            </div>
          </div>

          {/* Dosya Yükle */}
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Fotoğraf Yükle</p>
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all w-full justify-center"
            >
              <FiUpload size={16} /> Bilgisayardan Seç (max 2MB)
            </button>
          </div>

          {/* Hazır DiceBear Avatarlar */}
          <div>
            <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Hazır Avatar Seç</p>
            <div className="grid grid-cols-8 gap-2">
              {DICEBEAR_SEEDS.map((seed) => (
                <button
                  key={seed}
                  onClick={() => { setSelectedSeed(seed); setPreview(null); }}
                  className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedSeed === seed
                      ? "border-indigo-500 scale-110 shadow-lg"
                      : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`} alt={seed} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex gap-3">
          <button
            onClick={handleReset}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-black text-slate-500 hover:bg-slate-200 transition-all"
          >
            <FiRefreshCw size={14} /> Varsayılan
          </button>
          <button
            onClick={handleSave}
            disabled={loading || (!preview && !selectedSeed)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-2xl text-sm font-black transition-all"
          >
            {loading ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
};
