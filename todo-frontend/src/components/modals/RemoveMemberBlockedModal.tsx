"use client";

import { FiAlertTriangle, FiX } from "react-icons/fi";

interface Props {
  data: { username: string; tasks: string[] };
  onClose: () => void;
}

export function RemoveMemberBlockedModal({ data, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500">
              <FiAlertTriangle size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">Çıkarılamaz</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Aktif görevi olan üye</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-black text-slate-800 dark:text-white">{data.username}</span>{" "}
            şu anda {data.tasks.length} göreve atanmış. Önce bu görevlerden çıkarın:
          </p>
          <ul className="mt-3 space-y-1.5">
            {data.tasks.map((t, i) => (
              <li key={i} className="text-xs font-semibold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl truncate">
                • {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
            Tamam
          </button>
        </div>
      </div>
    </div>
  );
}
