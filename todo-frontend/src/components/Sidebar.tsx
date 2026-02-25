"use client";

import { useState, useEffect } from "react";
import { FiHash, FiPlus, FiFolder, FiUsers, FiLogOut, FiUserPlus, FiBell, FiCheck, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SidebarProps {
  projects: { owned: any[]; joined: any[] };
  activeProject: any;
  setActiveProject: (p: any) => void;
  username?: string;
  // YENİ prop'lar
  currentUser?: any;
  onAvatarClick?: () => void;
  onProjectsRefresh?: () => void;
  // Eski prop'lar korundu
  onNewProject: () => void;
  onInviteOpen: (project: any) => void;
  onLogout: () => void;
}

export default function Sidebar({
  projects,
  activeProject,
  setActiveProject,
  username,
  currentUser,
  onAvatarClick,
  onProjectsRefresh,
  onNewProject,
  onInviteOpen,
  onLogout,
}: SidebarProps) {
  // YENİ: davet bildirimleri state
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInvites, setShowInvites] = useState(false);

  // YENİ: davetleri çek
  const fetchInvitations = async () => {
    try {
      const res = await api.get("/Project/invitations");
      setInvitations(res.data);
    } catch (e) {
      // sessizce geç
    }
  };

  useEffect(() => {
    fetchInvitations();
    const interval = setInterval(fetchInvitations, 30000); // 30sn'de bir kontrol
    return () => clearInterval(interval);
  }, []);

  // YENİ: Daveti kabul et
  const handleAccept = async (projectId: number, projectName: string) => {
    try {
      await api.post(`/Project/${projectId}/invitations/accept`);
      toast.success(`"${projectName}" projesine katıldınız!`);
      setInvitations(prev => prev.filter(i => i.projectId !== projectId));
      if (onProjectsRefresh) onProjectsRefresh();
    } catch {
      toast.error("Davet kabul edilemedi.");
    }
  };

  // YENİ: Daveti reddet
  const handleReject = async (projectId: number) => {
    try {
      await api.post(`/Project/${projectId}/invitations/reject`);
      toast.success("Davet reddedildi.");
      setInvitations(prev => prev.filter(i => i.projectId !== projectId));
    } catch {
      toast.error("İşlem yapılamadı.");
    }
  };

  // YENİ: avatar src helper
  const getAvatarSrc = () => {
    if (currentUser?.avatarUrl) return currentUser.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "user"}`;
  };

  return (
    // YENİ: flex flex-col ile sidebar'ı dikey flex yap, h-screen sabit
    <div className="w-72 h-screen bg-slate-950 text-slate-400 flex flex-col border-r border-slate-800 flex-shrink-0">

      {/* ÜST: Kullanıcı Profili + Yeni Liste Butonu — sabit, kaymaz */}
      <div className="p-6 flex-shrink-0">
        {/* ORİJİNAL profil bloğu — YENİ: avatar tıklanabilir */}
        <div className="flex items-center gap-3 mb-8 px-2">
          <button
            onClick={onAvatarClick}
            className="relative group w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-indigo-500 transition-all"
            title="Avatarı değiştir"
          >
            <img src={getAvatarSrc()} alt="avatar" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-[8px] font-black">DEĞİŞTİR</span>
            </div>
          </button>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">{username}</span>
            <span className="text-[10px] text-slate-500 uppercase">Çalışma Alanı</span>
          </div>
        </div>

        {/* ORİJİNAL: Yeni Liste Butonu */}
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl transition-all text-sm font-bold mb-6"
        >
          <FiPlus size={18} /> Yeni Liste Oluştur
        </button>

        {/* YENİ: Davet bildirimleri */}
        {invitations.length > 0 && (
          <div className="mb-4">
            <button
              onClick={() => setShowInvites(!showInvites)}
              className="w-full flex items-center justify-between bg-indigo-600/20 border border-indigo-500/30 px-4 py-2.5 rounded-2xl text-indigo-400 hover:bg-indigo-600/30 transition-all"
            >
              <div className="flex items-center gap-2">
                <FiBell size={14} className="animate-pulse" />
                <span className="text-xs font-black uppercase">{invitations.length} Davet</span>
              </div>
              {showInvites ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            </button>

            {showInvites && (
              <div className="mt-2 space-y-2">
                {invitations.map((inv) => (
                  <div key={inv.projectId} className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                    <p className="text-white text-xs font-bold truncate mb-0.5">{inv.projectName}</p>
                    <p className="text-slate-500 text-[10px] mb-2">{inv.invitedBy} davet etti</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAccept(inv.projectId, inv.projectName)}
                        className="flex-1 flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black py-1.5 rounded-xl transition-all"
                      >
                        <FiCheck size={11} /> KABUL
                      </button>
                      <button
                        onClick={() => handleReject(inv.projectId)}
                        className="flex-1 flex items-center justify-center gap-1 bg-slate-800 hover:bg-rose-900/30 text-slate-400 hover:text-rose-400 text-[10px] font-black py-1.5 rounded-xl transition-all"
                      >
                        <FiX size={11} /> REDDET
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ORTA: Liste navigasyonu — YENİ: flex-1 + overflow-y-auto ile kaydırılabilir */}
      <nav className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar min-h-0">
        {/* ORİJİNAL: KENDİ LİSTELERİM */}
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

                {/* ORİJİNAL: Davet et butonu */}
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

        {/* ORİJİNAL: KATILDIĞIM LİSTELER */}
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

        {/* Alt boşluk */}
        <div className="h-4" />
      </nav>

      {/* ALT: Çıkış butonu — sabit */}
      <div className="p-4 border-t border-slate-800 flex-shrink-0">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-rose-400 hover:bg-rose-900/10 py-2.5 rounded-xl transition-all text-xs font-bold"
        >
          <FiLogOut size={15} /> Çıkış Yap
        </button>
      </div>
    </div>
  );
}
