"use client";

import { FiHash, FiPlus, FiFolder, FiUsers, FiSettings, FiLogOut, FiUserPlus } from "react-icons/fi";

interface SidebarProps {
  projects: { owned: any[]; joined: any[] };
  activeProject: any;
  setActiveProject: (p: any) => void;
  username?: string;
  onNewProject: () => void;
  onInviteOpen: (project: any) => void; // <-- Bu prop geri geldi
  onLogout: () => void;
}

export default function Sidebar({ projects, activeProject, setActiveProject, username, onNewProject, onInviteOpen, onLogout }: SidebarProps) {
  return (
    <div className="w-72 h-screen bg-slate-950 text-slate-400 flex flex-col border-r border-slate-800">
      <div className="p-6">
        {/* Kullanıcı Profili */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
            {username?.charAt(0).toUpperCase() || "T"}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">{username}</span>
            <span className="text-[10px] text-slate-500 uppercase">Çalışma Alanı</span>
          </div>
        </div>

        {/* Yeni Liste Butonu */}
        <button 
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl transition-all text-sm font-bold mb-8"
        >
          <FiPlus size={18} /> Yeni Liste Oluştur
        </button>

        <nav className="space-y-8 overflow-y-auto max-h-[calc(100vh-280px)] pr-2 custom-scrollbar">
          {/* KENDİ LİSTELERİM */}
          <div>
            <div className="flex items-center justify-between px-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Kendi Listelerim</span>
              <FiFolder size={12} />
            </div>
            <div className="space-y-1">
              {projects.owned?.map((p) => (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => setActiveProject(p)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeProject?.id === p.id ? "bg-indigo-600/10 text-indigo-400" : "hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <FiHash className={activeProject?.id === p.id ? "text-indigo-400" : "text-slate-600"} />
                    <span className="truncate pr-8">{p.name}</span>
                  </button>
                  
                  {/* DAVET ET BUTONU (Sadece üzerine gelince veya seçiliyken görünür) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); onInviteOpen(p); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-white bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Kullanıcı Davet Et"
                  >
                    <FiUserPlus size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* KATILDIĞIM LİSTELER */}
          {projects.joined?.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Katıldığım Listeler</span>
                <FiUsers size={12} />
              </div>
              <div className="space-y-1">
                {projects.joined.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeProject?.id === p.id ? "bg-emerald-600/10 text-emerald-400" : "hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <FiHash className={activeProject?.id === p.id ? "text-emerald-400" : "text-slate-600"} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
      {/* ... Alt kısım aynı kalabilir ... */}
    </div>
  );
}