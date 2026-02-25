"use client";

import { FiX } from "react-icons/fi";

interface Props {
  data: { title: string; assignees: any[] };
  onClose: () => void;
}

export function NotAssignedModal({ data, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">

        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-xl">
              🔒
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 dark:text-white">Bu görev sana ait değil</h3>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">Yalnızca atanan kişi tamamlayabilir</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
            <FiX size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            <span className="font-black text-slate-800 dark:text-white">"{data.title}"</span> görevini tamamlamak için bu göreve atanmış olman gerekiyor.
          </p>

          {data.assignees.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Bu göreve atananlar:</p>
              <div className="flex flex-wrap gap-2">
                {data.assignees.map((a: any) => (
                  <div key={a.id} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={a.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${a.username}`}
                        alt={a.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{a.username}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 px-4 py-3 rounded-2xl border border-amber-100 dark:border-amber-800/50">
              <span className="text-base">⚠️</span>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                Bu göreve henüz kimse atanmamış. Proje liderinden seni atamasını isteyebilirsin.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full py-3 rounded-2xl text-sm font-black bg-indigo-600 hover:bg-indigo-700 text-white transition-all">
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
}
