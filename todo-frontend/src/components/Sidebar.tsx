"use client";

import { useState, useEffect } from "react";
import {
  FiHash, FiPlus, FiFolder, FiUsers, FiLogOut, FiUserPlus,
  FiBell, FiCheck, FiX, FiChevronDown, FiChevronUp, FiTrash2,
  FiAlertTriangle, FiArchive, FiRefreshCw, FiLock
} from "react-icons/fi";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface SidebarProps {
  projects: { owned: any[]; joined: any[] };
  activeProject: any;
  setActiveProject: (p: any) => void;
  username?: string;
  currentUser?: any;
  onAvatarClick?: () => void;
  onProjectsRefresh?: () => void;
  onNewProject: () => void;
  onInviteOpen: (project: any) => void;
  onLogout: () => void;
  onDeleteProject?: (projectId: number) => void;
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
  onDeleteProject,
}: SidebarProps) {
  const [invitations, setInvitations] = useState<any[]>([]);
  const [showInvites, setShowInvites] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const [projectToDelete, setProjectToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [projectToArchive, setProjectToArchive] = useState<{ id: number; name: string } | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Aktif projeler (arşivlenmemiş)
  const activeOwned = projects.owned?.filter((p) => !p.isArchived) ?? [];
  const activeJoined = projects.joined?.filter((p) => !p.isArchived) ?? [];

  // Arşivlenmiş projeler (sadece sahibi olanlar)
  const archivedOwned = projects.owned?.filter((p) => p.isArchived) ?? [];
  // Üye olduğum arşivlenmiş projeler (sadece görüntüleme için)
  const archivedJoined = projects.joined?.filter((p) => p.isArchived) ?? [];
  const allArchived = [...archivedOwned, ...archivedJoined];

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
    const interval = setInterval(fetchInvitations, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (projectId: number, projectName: string) => {
    try {
      await api.post(`/Project/${projectId}/invitations/accept`);
      toast.success(`"${projectName}" projesine katıldınız!`);
      setInvitations((prev) => prev.filter((i) => i.projectId !== projectId));
      if (onProjectsRefresh) onProjectsRefresh();
    } catch {
      toast.error("Davet kabul edilemedi.");
    }
  };

  const handleReject = async (projectId: number) => {
    try {
      await api.post(`/Project/${projectId}/invitations/reject`);
      toast.success("Davet reddedildi.");
      setInvitations((prev) => prev.filter((i) => i.projectId !== projectId));
    } catch {
      toast.error("İşlem yapılamadı.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/Project/${projectToDelete.id}`);
      toast.success(`"${projectToDelete.name}" listesi silindi.`);
      setProjectToDelete(null);
      if (onDeleteProject) onDeleteProject(projectToDelete.id);
      if (onProjectsRefresh) onProjectsRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Liste silinemedi.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmArchive = async () => {
    if (!projectToArchive) return;
    setIsArchiving(true);
    try {
      await api.patch(`/Project/${projectToArchive.id}/archive`);
      toast.success(`"${projectToArchive.name}" arşivlendi.`);
      setProjectToArchive(null);
      // Aktif proje arşivlendiyse seçimi kaldır
      if (activeProject?.id === projectToArchive.id) {
        setActiveProject(null);
      }
      if (onProjectsRefresh) onProjectsRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Arşivlenemedi.");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleUnarchive = async (project: any) => {
    try {
      await api.patch(`/Project/${project.id}/unarchive`);
      toast.success(`"${project.name}" arşivden çıkarıldı.`);
      // Aktif projeyi hemen güncelle — sayfa yenilemesine gerek kalmaz
      const updatedProject = { ...project, isArchived: false };
      setActiveProject(updatedProject);
      if (onProjectsRefresh) onProjectsRefresh();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "İşlem başarısız.");
    }
  };

  const getAvatarSrc = () => {
    if (currentUser?.avatarUrl) return currentUser.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${username || "user"}`;
  };

  return (
    <>
      <div className="w-72 h-screen sticky top-0 bg-slate-950 text-slate-400 flex flex-col border-r border-slate-800 flex-shrink-0">

        {/* ÜST: Kullanıcı Profili + Yeni Liste Butonu */}
        <div className="p-6 flex-shrink-0">
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

          <button
            onClick={onNewProject}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-2xl transition-all text-sm font-bold mb-6"
          >
            <FiPlus size={18} /> Yeni Liste Oluştur
          </button>

          {/* Davet bildirimleri */}
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

        {/* ORTA: Liste navigasyonu */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar min-h-0">

          {/* KENDİ LİSTELERİM (aktif) */}
          <div>
            <div className="flex items-center justify-between px-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
              <span>Kendi Listelerim</span>
              <FiFolder size={12} />
            </div>
            <div className="space-y-1">
              {activeOwned.length === 0 && (
                <p className="px-3 text-[11px] text-slate-600 italic">Liste yok</p>
              )}
              {activeOwned.map((p) => (
                <div key={p.id} className="group relative">
                  <button
                    onClick={() => setActiveProject(p)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeProject?.id === p.id
                        ? "bg-indigo-600/10 text-indigo-400"
                        : "hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <FiHash className={activeProject?.id === p.id ? "text-indigo-400" : "text-slate-600"} />
                    <span className="truncate pr-20">{p.name}</span>
                  </button>

                  {/* Hover'da sağda 3 buton: davet + arşivle + sil */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); onInviteOpen(p); }}
                      className="p-1.5 text-slate-500 hover:text-white bg-slate-800 rounded-lg transition-all"
                      title="Kullanıcı Davet Et"
                    >
                      <FiUserPlus size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setProjectToArchive({ id: p.id, name: p.name }); }}
                      className="p-1.5 text-slate-500 hover:text-amber-400 bg-slate-800 hover:bg-amber-900/30 rounded-lg transition-all"
                      title="Arşivle"
                    >
                      <FiArchive size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setProjectToDelete({ id: p.id, name: p.name }); }}
                      className="p-1.5 text-slate-500 hover:text-rose-400 bg-slate-800 hover:bg-rose-900/30 rounded-lg transition-all"
                      title="Listeyi Sil"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KATILDIĞIM LİSTELER (aktif) */}
          {activeJoined.length > 0 && (
            <div>
              <div className="flex items-center justify-between px-3 mb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <span>Katıldığım Listeler</span>
                <FiUsers size={12} />
              </div>
              <div className="space-y-1">
                {activeJoined.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      activeProject?.id === p.id
                        ? "bg-emerald-600/10 text-emerald-400"
                        : "hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <FiHash className={activeProject?.id === p.id ? "text-emerald-400" : "text-slate-600"} />
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ARŞİV BÖLÜMÜ */}
          {allArchived.length > 0 && (
            <div>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="w-full flex items-center justify-between px-3 mb-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FiArchive size={12} />
                  <span>Arşiv ({allArchived.length})</span>
                </div>
                {showArchived ? <FiChevronUp size={11} /> : <FiChevronDown size={11} />}
              </button>

              {showArchived && (
                <div className="space-y-1">
                  {allArchived.map((p) => {
                    const isOwner = projects.owned?.some((o: any) => o.id === p.id);
                    return (
                      <div key={p.id} className="group relative">
                        <button
                          onClick={() => setActiveProject(p)}
                          className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                            activeProject?.id === p.id
                              ? "bg-amber-600/10 text-amber-400 border border-amber-800/40"
                              : "text-slate-600 hover:bg-slate-900/80 hover:text-slate-400 border border-transparent"
                          }`}
                        >
                          <FiLock size={13} className="text-amber-700 flex-shrink-0" />
                          <span className="truncate pr-10 line-through decoration-slate-700">{p.name}</span>
                        </button>
                        {/* Sadece sahip arşivden çıkarabilir */}
                        {isOwner && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUnarchive(p); }}
                              className="p-1.5 text-slate-500 hover:text-emerald-400 bg-slate-800 hover:bg-emerald-900/30 rounded-lg transition-all"
                              title="Arşivden Çıkar"
                            >
                              <FiRefreshCw size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="h-4" />
        </nav>

        {/* ALT: Çıkış butonu */}
        <div className="p-4 border-t border-slate-800 flex-shrink-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-rose-400 hover:bg-rose-900/10 py-2.5 rounded-xl transition-all text-xs font-bold"
          >
            <FiLogOut size={15} /> Çıkış Yap
          </button>
        </div>
      </div>

      {/* ARŞİVLE onay popup */}
      {projectToArchive && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center text-amber-500">
                  <FiArchive size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Listeyi Arşivle</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Üyeler erişemez, arşivden geri alınabilir</p>
                </div>
              </div>
              <button
                onClick={() => setProjectToArchive(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-black text-slate-800 dark:text-white">{projectToArchive.name}</span>{" "}
                listesini arşivlemek istediğinize emin misiniz?
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Arşivlendikten sonra tüm üyeler listeye erişemez. İstediğiniz zaman arşivden geri alabilirsiniz.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setProjectToArchive(null)}
                disabled={isArchiving}
                className="flex-1 py-3 rounded-2xl text-sm font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmArchive}
                disabled={isArchiving}
                className="flex-1 py-3 rounded-2xl text-sm font-black bg-amber-500 hover:bg-amber-600 text-white transition-all disabled:opacity-60"
              >
                {isArchiving ? "Arşivleniyor..." : "Arşivle"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SİL onay popup */}
      {projectToDelete && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-xl flex items-center justify-center text-rose-500">
                  <FiAlertTriangle size={20} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-800 dark:text-white">Listeyi Sil</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Bu işlem geri alınamaz</p>
                </div>
              </div>
              <button
                onClick={() => setProjectToDelete(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-black text-slate-800 dark:text-white">{projectToDelete.name}</span>{" "}
                listesini silmek istediğinize emin misiniz?
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Listedeki tüm görevler ve alt görevler kalıcı olarak silinecek.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl text-sm font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-2xl text-sm font-black bg-rose-500 hover:bg-rose-600 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Siliniyor..." : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
