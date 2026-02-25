"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { FiSave, FiAlertTriangle, FiX } from "react-icons/fi";
import { DragDropContext } from "@hello-pangea/dnd";
import toast from "react-hot-toast";

import Sidebar from "@/components/Sidebar";
import { TodoHeader } from "@/components/TodoHeader";
import { AddTodoForm } from "@/components/AddTodoForm";
import { TodoToolbar } from "@/components/TodoToolbar";
import { TodoItem } from "@/components/TodoItem";
import { SubTaskModal } from "@/components/SubTaskModal";
import { StrictModeDroppable } from "@/components/StrictModeDroppable";
import { InviteMemberModal } from "@/components/InviteMemberModal";
import { NewProjectModal } from "@/components/NewProjectModal";
import { AvatarModal } from "@/components/AvatarModal";

export default function HomePage() {
  const router = useRouter();

  const [projects, setProjects] = useState<any>({ owned: [], joined: [] });
  const [activeProject, setActiveProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [todos, setTodos] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [priority, setPriority] = useState(1);
  const [category, setCategory] = useState("Genel");
  const [dueDate, setDueDate] = useState("");
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Hepsi");
  const [filterPriority, setFilterPriority] = useState("Hepsi");
  const [filterAssignees, setFilterAssignees] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("Manuel");

  // Üye çıkarma popup
  const [memberToRemove, setMemberToRemove] = useState<{ id: number; username: string } | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const isLeader = activeProject?.isOwner || activeProject?.role === "Leader";
  const isArchived = activeProject?.isArchived === true;

  const selectedTodoRef = useRef<any>(null);
  selectedTodoRef.current = selectedTodo;

  const fetchTodos = useCallback(async () => {
    const pId = activeProject?.id || activeProject?.Id;
    if (!pId) return;
    try {
      const response = await api.get(`/Todo?projectId=${pId}`);
      const sorted = response.data.sort((a: any, b: any) => a.order - b.order);
      setTodos(sorted);
      setIsOrderChanged(false);

      if (selectedTodoRef.current) {
        const updatedSelected = sorted.find((t: any) => t.id === selectedTodoRef.current.id);
        if (updatedSelected) setSelectedTodo(updatedSelected);
      }
    } catch (error) {
      console.error("Görev hatası:", error);
    }
  }, [activeProject]);

  const fetchCategories = useCallback(async () => {
    const pId = activeProject?.id || activeProject?.Id;
    if (!pId) return;
    try {
      const res = await api.get(`/Category/${pId}`);
      setCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0].name);
    } catch (e) {
      console.error("Kategoriler çekilemedi:", e);
    }
  }, [activeProject]);

  const handleAddCategory = async (name: string) => {
    const pId = activeProject?.id || activeProject?.Id;
    try {
      await api.post(`/Category/${pId}`, { name });
      toast.success("Kategori eklendi!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Kategori eklenemedi.");
    }
  };

  const fetchMembers = useCallback(async () => {
    const pId = activeProject?.id || activeProject?.Id;
    if (!pId) return;
    try {
      const res = await api.get(`/Project/${pId}/members`);
      const memberList = res.data;
      if (currentUser && !memberList.find((m: any) => m.id === currentUser.id)) {
        memberList.unshift(currentUser);
      }
      setMembers(memberList);
    } catch (e) {
      console.error("Üye listesi çekilemedi:", e);
    }
  }, [activeProject, currentUser]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await api.get("/Project");
      setProjects(res.data);
      return res.data;
    } catch (e) {
      console.error("Projeler çekilemedi:", e);
    }
  }, []);

  const loadInitialData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      const [userRes, projectsRes] = await Promise.all([
        api.get("/Auth/me"),
        api.get("/Project")
      ]);
      setCurrentUser(userRes.data);
      setProjects(projectsRes.data);

      if (projectsRes.data.owned.length > 0) setActiveProject(projectsRes.data.owned[0]);
      else if (projectsRes.data.joined.length > 0) setActiveProject(projectsRes.data.joined[0]);
    } catch (e) {
      console.error("Yükleme hatası:", e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);
  useEffect(() => {
    if (activeProject) {
      fetchTodos();
      fetchMembers();
      fetchCategories();
      setFilterAssignees([]);
    }
  }, [activeProject, fetchTodos, fetchMembers, fetchCategories]);

  const handleAddTodoSubmit = async (e: any) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;
    const pId = activeProject?.id || activeProject?.Id;

    try {
      let formattedDate = null;
      if (dueDate && dueDate.trim() !== "") {
        formattedDate = new Date(dueDate).toISOString();
      }

      await api.post("/Todo", {
        Title: newTodoTitle,
        ProjectId: pId,
        Priority: priority,
        Category: category,
        DueDate: formattedDate
      });

      setNewTodoTitle("");
      setDueDate("");
      toast.success("Görev başarıyla eklendi");
      fetchTodos();
    } catch (err: any) {
      toast.error("Görev eklenemedi.");
    }
  };

  const handleCreateProject = async (e: any) => {
    e.preventDefault();
    try {
      const res = await api.post("/Project", { name: newProjectName });
      toast.success("Yeni liste oluşturuldu!");
      setIsNewProjectModalOpen(false);
      setNewProjectName("");
      const updated = await api.get("/Project");
      setProjects(updated.data);
      setActiveProject(res.data);
    } catch (e) {
      toast.error("Liste oluşturulamadı.");
    }
  };

  // YENİ: Proje silindikten sonra aktif projeyi güncelle
  const handleProjectDeleted = async (deletedId: number) => {
    const updated = await fetchProjects();
    if (activeProject?.id === deletedId) {
      if (updated?.owned?.length > 0) setActiveProject(updated.owned[0]);
      else if (updated?.joined?.length > 0) setActiveProject(updated.joined[0]);
      else {
        setActiveProject(null);
        setTodos([]);
        setMembers([]);
        setCategories([]);
      }
    }
  };

  const handleUpdateAssignees = async (todoId: number, userId: number) => {
    try {
      await api.post(`/Todo/${todoId}/assign/${userId}`);
      toast.success("Görevli listesi güncellendi");
      fetchTodos();
    } catch (e) {
      toast.error("Atama güncellenemedi.");
    }
  };

  const handleRemoveMemberClick = (userId: number) => {
    const member = members.find((m: any) => m.id === userId);
    if (member) setMemberToRemove({ id: member.id, username: member.username });
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    const pId = activeProject?.id || activeProject?.Id;
    const removedId = memberToRemove.id;
    setIsRemovingMember(true);
    try {
      await api.delete(`/Project/${pId}/members/${removedId}`);
      toast.success("Üye projeden çıkarıldı.");
      setMemberToRemove(null);

      // Üye listesini güncelle
      setMembers(prev => prev.filter((m: any) => m.id !== removedId));

      // YENİ: Client-side anlık avatar temizleme — backend'den bağımsız
      // Todos içindeki assignees'den çıkarılan üyeyi hemen kaldırır
      setTodos(prev => prev.map((todo: any) => ({
        ...todo,
        assignees: (todo.assignees || []).filter((a: any) => a.id !== removedId),
        subTasks: (todo.subTasks || []).map((sub: any) => ({
          ...sub,
          assignedUser: sub.assignedUser?.id === removedId ? null : sub.assignedUser,
        })),
      })));

      // Açık modal varsa da güncelle
      if (selectedTodoRef.current) {
        setSelectedTodo((prev: any) => prev ? {
          ...prev,
          assignees: (prev.assignees || []).filter((a: any) => a.id !== removedId),
          subTasks: (prev.subTasks || []).map((sub: any) => ({
            ...sub,
            assignedUser: sub.assignedUser?.id === removedId ? null : sub.assignedUser,
          })),
        } : null);
      }

      // NOT: fetchTodos() kasıtlı olarak çağrılmıyor.
      // Backend, üye silinince todo assignees'i temizlemediği için
      // fetchTodos çağrısı client-side temizlemeyi ezip eski avatarı geri getirir.
      // Temizleme client-side yapılır; proje değişimi veya sonraki işlemlerde sync olur.

      // Atamalar filtresinden de kaldır
      setFilterAssignees(prev => prev.filter(id => id !== removedId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setIsRemovingMember(false);
    }
  };

  const handleOnDragEnd = (result: any) => {
    if (!isLeader || !result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
    setIsOrderChanged(true);
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await api.delete(`/Todo/${id}`);
      toast.success("Görev silindi.");
      fetchTodos();
    } catch (err: any) {
      toast.error("Görev silinemedi.");
    }
  };

  const filteredTodos = (() => {
    let list = todos.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === "Hepsi" || t.category === filterCategory;
      const matchesPriority = filterPriority === "Hepsi" || t.priority.toString() === filterPriority;

      const assigneeIds = t.assignees?.map((a: any) => a.id) || [];
      const matchesAssignees = filterAssignees.length === 0
        || filterAssignees.every((id: number) => assigneeIds.includes(id));

      return matchesSearch && matchesCategory && matchesPriority && matchesAssignees;
    });

    if (sortBy === "Ad") list = [...list].sort((a, b) => a.title.localeCompare(b.title, "tr"));
    else if (sortBy === "Öncelik") list = [...list].sort((a, b) => b.priority - a.priority);
    else if (sortBy === "Tarih") {
      list = [...list].sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }
    return list;
  })();

  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-indigo-600 text-4xl animate-pulse tracking-tighter">
      FOCUSFLOW...
    </div>
  );

  return (
    <main className={`${darkMode ? "dark" : ""} flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500`}>
      <Sidebar
        projects={projects}
        activeProject={activeProject}
        setActiveProject={setActiveProject}
        username={currentUser?.username}
        currentUser={currentUser}
        onAvatarClick={() => setIsAvatarModalOpen(true)}
        onProjectsRefresh={fetchProjects}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onInviteOpen={(proj: any) => { setActiveProject(proj); setIsInviteModalOpen(true); }}
        onLogout={() => { localStorage.clear(); router.push("/login"); }}
        onDeleteProject={handleProjectDeleted}  // YENİ
      />

      <div className="flex-1 py-12 px-4 md:px-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {isLeader && isOrderChanged && (
            <div className="fixed bottom-10 right-10 z-50">
              <button
                onClick={async () => {
                  setIsSaving(true);
                  try {
                    await api.put("/Todo/reorder", todos.map(t => t.id));
                    setIsOrderChanged(false);
                    toast.success("Sıralama kaydedildi");
                  } catch {
                    toast.error("Kaydedilemedi");
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className="bg-indigo-600 text-white px-8 py-4 rounded-full font-black shadow-2xl flex items-center gap-2"
              >
                <FiSave /> {isSaving ? "KAYDEDİLİYOR..." : "SIRAYI KAYDET"}
              </button>
            </div>
          )}

          {activeProject ? (
            <>
              <TodoHeader
                username={activeProject?.name || "LİSTE SEÇİN"}
                stats={{ total: todos.length, completed: todos.filter(t => t.isCompleted).length, pending: todos.filter(t => !t.isCompleted).length }}
                darkMode={darkMode} setDarkMode={setDarkMode}
                onLogout={() => { localStorage.clear(); router.push("/login"); }}
                members={members}
                currentUserId={currentUser?.id}
                isLeader={isLeader && !isArchived}
                onRemoveMember={handleRemoveMemberClick}
              />

              {/* ARŞİV DUVARI: Arşivlenmiş projelerde hiçbir şey düzenlenemez */}
              {isArchived ? (
                <div className="p-6 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-3xl text-center mb-8">
                  <div className="text-3xl mb-3">🗄️</div>
                  <h3 className="text-base font-black text-amber-700 dark:text-amber-400 mb-1">Bu liste arşivlendi</h3>
                  <p className="text-xs text-amber-600/70 dark:text-amber-500/70">
                    Arşivlenmiş listeler salt okunur modundadır. Düzenleme yapılamaz.
                    {isLeader && " Arşivden çıkarmak için sol menüdeki arşiv bölümünü kullanın."}
                  </p>
                </div>
              ) : isLeader ? (
                <AddTodoForm
                  onSubmit={handleAddTodoSubmit}
                  title={newTodoTitle} setTitle={setNewTodoTitle}
                  priority={priority} setPriority={setPriority}
                  category={category} setCategory={setCategory}
                  dueDate={dueDate} setDueDate={setDueDate}
                  categories={categories}
                  onAddCategory={handleAddCategory}
                />
              ) : (
                <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl text-center text-sm font-bold text-slate-400 mb-8 border border-dashed border-slate-200">
                  Sadece Proje Lideri yeni görev ekleyebilir.
                </div>
              )}

              <TodoToolbar
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                filterCategory={filterCategory} setFilterCategory={setFilterCategory}
                filterPriority={filterPriority} setFilterPriority={setFilterPriority}
                sortBy={sortBy} setSortBy={setSortBy}
                categories={categories}
                members={members}
                filterAssignees={filterAssignees}
                setFilterAssignees={setFilterAssignees}
              />

              {/* Arşivde TodoItem'lar gösterilir ama tıklanamaz (role=Archived) */}
              <DragDropContext onDragEnd={isArchived ? () => {} : handleOnDragEnd}>
                <StrictModeDroppable droppableId="todos">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 pb-24">
                      {filteredTodos.map((todo, index) => (
                        <TodoItem
                          key={todo.id} todo={todo} index={index} sortBy={sortBy}
                          role={isArchived ? "Archived" : isLeader ? "Leader" : "Member"} currentUserId={currentUser?.id}
                          onToggle={async (id: any) => {
                            try {
                              await api.put(`/Todo/${id}/toggle`);
                              fetchTodos();
                            } catch (err: any) {
                              toast.error(err.response?.data || "Görev güncellenemedi.");
                            }
                          }}
                          onDelete={handleDeleteTodo}
                          onSelect={setSelectedTodo}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </StrictModeDroppable>
              </DragDropContext>
            </>
          ) : (
            /* Hiç proje yoksa boş durum */
            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 text-3xl">📋</div>
              <h2 className="text-xl font-black text-slate-700 dark:text-slate-200">Henüz liste yok</h2>
              <p className="text-sm text-slate-400">Sol menüden yeni bir liste oluşturun.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALLAR */}
      {isNewProjectModalOpen && (
        <NewProjectModal
          projectName={newProjectName}
          setProjectName={setNewProjectName}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreate={handleCreateProject}
        />
      )}

      {isInviteModalOpen && (
        <InviteMemberModal
          project={activeProject}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={async (e: any) => {
            e.preventDefault();
            const pId = activeProject?.id || activeProject?.Id;
            try {
              await api.post(`/Project/${pId}/invite`, { EmailOrUsername: inviteEmail.trim() });
              setIsInviteModalOpen(false);
              toast.success("Davet gönderildi");
              setInviteEmail("");
              fetchMembers();
            } catch (err: any) {
              toast.error(err.response?.data?.message || "Davet gönderilemedi.");
            }
          }}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
        />
      )}

      {selectedTodo && (
        <SubTaskModal
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          members={members.filter((m: any) => m.id !== currentUser?.id)}
          onUpdateAssignees={handleUpdateAssignees}
          onToggleSub={async (sid: any) => {
            try {
              await api.put(`/Todo/subtask/${sid}/toggle`);
              fetchTodos();
            } catch {
              toast.error("Alt görev güncellenemedi.");
            }
          }}
          onAddSub={async (e: any, uId: string) => {
            e.preventDefault();
            if (!newSubTaskTitle.trim()) return;
            try {
              const url = `/Todo/${selectedTodo.id}/subtask?title=${encodeURIComponent(newSubTaskTitle)}${uId ? `&assignedUserId=${uId}` : ''}`;
              await api.post(url);
              setNewSubTaskTitle("");
              fetchTodos();
            } catch {
              toast.error("Alt görev eklenemedi.");
            }
          }}
          newTitle={newSubTaskTitle}
          setNewTitle={setNewSubTaskTitle}
          isLeader={isLeader}
        />
      )}

      {isAvatarModalOpen && (
        <AvatarModal
          currentUser={currentUser}
          onClose={() => setIsAvatarModalOpen(false)}
          onUpdated={(avatarUrl) => {
            setCurrentUser((prev: any) => ({ ...prev, avatarUrl }));
          }}
        />
      )}

      {/* Üye çıkarma onay popup'ı */}
      {memberToRemove && (
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
              <button
                onClick={() => setMemberToRemove(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-black text-slate-800 dark:text-white">
                  {memberToRemove.username}
                </span>{" "}
                adlı kullanıcıyı bu projeden çıkarmak istediğinize emin misiniz?
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Kullanıcı projeye erişimini kaybedecek ve atandığı görevlerden çıkarılacak.
              </p>
            </div>

            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={() => setMemberToRemove(null)}
                disabled={isRemovingMember}
                className="flex-1 py-3 rounded-2xl text-sm font-black bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                İptal
              </button>
              <button
                onClick={handleConfirmRemoveMember}
                disabled={isRemovingMember}
                className="flex-1 py-3 rounded-2xl text-sm font-black bg-rose-500 hover:bg-rose-600 text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isRemovingMember ? "Çıkarılıyor..." : "Çıkar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
