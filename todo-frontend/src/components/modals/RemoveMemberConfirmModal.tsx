"use client";

import { FiAlertTriangle, FiX } from "react-icons/fi";

interface Props {
  member: { id: number; username: string };
  isLoading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function RemoveMemberConfirmModal({ member, isLoading, onConfirm, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-500">
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">Üyeyi Çıkar</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Bu işlem geri alınamaz</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-black text-slate-800 dark:text-white">{member.username}</span>{" "}
            adlı kullanıcıyı bu projeden çıkarmak istediğinize emin misiniz?
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Kullanıcı projeye erişimini kaybedecek ve atandığı görevlerden çıkarılacak.
          </p>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl text-sm font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-3 rounded-2xl text-sm font-black bg-rose-500 hover:bg-rose-600 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Çıkarılıyor..." : "Çıkar"}
          </button>
        </div>
      </div>
    </div>
  );
}
