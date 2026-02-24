"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { FiSave } from "react-icons/fi";
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
  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  const [sortBy, setSortBy] = useState("Manuel");

  const isLeader = activeProject?.isOwner || activeProject?.role === "Leader";

  // HATA DÜZELTMESİ: selectedTodo dependency'si kaldırıldı — sonsuz döngü önlendi.
  // selectedTodo güncellemesi ayrı bir ref aracılığıyla yapılıyor.
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

      // Modal açıksa seçili görevi güncelle (ref kullanarak döngü önlendi)
      if (selectedTodoRef.current) {
        const updatedSelected = sorted.find((t: any) => t.id === selectedTodoRef.current.id);
        if (updatedSelected) setSelectedTodo(updatedSelected);
      }
    } catch (error) {
      console.error("Görev hatası:", error);
    }
  }, [activeProject]); // selectedTodo dependency'si kaldırıldı

  const fetchMembers = useCallback(async () => {
    const pId = activeProject?.id || activeProject?.Id;
    if (!pId) return;
    try {
      const res = await api.get(`/Project/${pId}/members`);
      const memberList = res.data;
      // Yönetici (currentUser) listede yoksa ekle
      if (currentUser && !memberList.find((m: any) => m.id === currentUser.id)) {
        memberList.unshift(currentUser);
      }
      setMembers(memberList);
    } catch (e) {
      console.error("Üye listesi çekilemedi:", e);
    }
  }, [activeProject, currentUser]);

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
    }
  }, [activeProject, fetchTodos, fetchMembers]);

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

  const handleUpdateAssignees = async (todoId: number, userId: number) => {
    try {
      await api.post(`/Todo/${todoId}/assign/${userId}`);
      toast.success("Görevli listesi güncellendi");
      fetchTodos();
    } catch (e) {
      toast.error("Atama güncellenemedi.");
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

  // HATA DÜZELTMESİ: onDelete için hata yönetimi eklendi
  const handleDeleteTodo = async (id: number) => {
    try {
      await api.delete(`/Todo/${id}`);
      toast.success("Görev silindi.");
      fetchTodos();
    } catch (err: any) {
      toast.error("Görev silinemedi.");
    }
  };

  const filteredTodos = todos.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "Hepsi" || t.category === filterCategory;
    const matchesPriority = filterPriority === "Hepsi" || t.priority.toString() === filterPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

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
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onInviteOpen={(proj: any) => { setActiveProject(proj); setIsInviteModalOpen(true); }}
        onLogout={() => { localStorage.clear(); router.push("/login"); }}
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

          <TodoHeader
            username={activeProject?.name || "LİSTE SEÇİN"}
            stats={{ total: todos.length, completed: todos.filter(t => t.isCompleted).length, pending: todos.filter(t => !t.isCompleted).length }}
            darkMode={darkMode} setDarkMode={setDarkMode}
            onLogout={() => { localStorage.clear(); router.push("/login"); }}
          />

          {isLeader ? (
            <AddTodoForm
              onSubmit={handleAddTodoSubmit}
              title={newTodoTitle} setTitle={setNewTodoTitle}
              priority={priority} setPriority={setPriority}
              category={category} setCategory={setCategory}
              dueDate={dueDate} setDueDate={setDueDate}
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
          />

          <DragDropContext onDragEnd={handleOnDragEnd}>
            <StrictModeDroppable droppableId="todos">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3 pb-24">
                  {filteredTodos.map((todo, index) => (
                    <TodoItem
                      key={todo.id} todo={todo} index={index} sortBy={sortBy}
                      role={isLeader ? "Leader" : "Member"} currentUserId={currentUser?.id}
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
    </main>
  );
}
