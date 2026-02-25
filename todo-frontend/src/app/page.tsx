"use client";

import { useEffect, useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { FiSave } from "react-icons/fi";
import api from "@/lib/api";
import toast from "react-hot-toast";

// Hooks
import { useProjects } from "@/hooks/useProjects";
import { useTodos } from "@/hooks/useTodos";
import { useMembers } from "@/hooks/useMembers";
import { useFilters } from "@/hooks/useFilters";

// Components
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

// Modals
import { NotAssignedModal } from "@/components/modals/NotAssignedModal";
import { RemoveMemberBlockedModal } from "@/components/modals/RemoveMemberBlockedModal";
import { RemoveMemberConfirmModal } from "@/components/modals/RemoveMemberConfirmModal";

export default function HomePage() {
  const [darkMode, setDarkMode] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [notAssignedPopup, setNotAssignedPopup] = useState<{ title: string; assignees: any[] } | null>(null);

  // ── Hooks ─────────────────────────────────────────────────────────────────
  const {
    projects, activeProject, setActiveProject,
    currentUser, setCurrentUser, loading,
    fetchProjects, loadInitialData,
    handleCreateProject, handleProjectDeleted, logout,
  } = useProjects();

  const {
    todos, setTodos, categories, category, setCategory,
    isOrderChanged, isSaving,
    newTodoTitle, setNewTodoTitle,
    priority, setPriority,
    dueDate, setDueDate,
    selectedTodo, setSelectedTodo,
    newSubTaskTitle, setNewSubTaskTitle,
    fetchTodos, fetchCategories,
    handleAddCategory, handleAddTodoSubmit,
    handleDeleteTodo, handleToggleTodo,
    handleUpdateAssignees, handleOnDragEnd, handleSaveOrder,
    handleToggleSubTask, handleAddSubTask,
    removeMemberFromTodos,
  } = useTodos(activeProject);

  const {
    filterAssignees, setFilterAssignees,
    ...filters
  } = useFilters(todos);

  const {
    members, fetchMembers,
    memberToRemove, setMemberToRemove,
    memberRemoveBlocked, setMemberRemoveBlocked,
    isRemovingMember,
    handleRemoveMemberClick, handleConfirmRemoveMember,
  } = useMembers(activeProject, currentUser, todos, removeMemberFromTodos, setFilterAssignees);

  // ── Derived ───────────────────────────────────────────────────────────────
  const isLeader = activeProject?.isOwner || activeProject?.role === "Leader";
  const isArchived = activeProject?.isArchived === true;

  // ── Effects ───────────────────────────────────────────────────────────────
  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  useEffect(() => {
    if (activeProject) {
      fetchTodos();
      fetchMembers();
      fetchCategories();
      setFilterAssignees([]);
    }
  }, [activeProject, fetchTodos, fetchMembers, fetchCategories]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const onToggleTodo = async (id: number) => {
    if (!isLeader) {
      const todo = todos.find((t: any) => t.id === id);
      const isAssigned = todo?.assignees?.some((a: any) => a.id === currentUser?.id);
      if (!isAssigned) {
        setNotAssignedPopup({ title: todo?.title || "", assignees: todo?.assignees || [] });
        return;
      }
    }
    handleToggleTodo(id);
  };

  const onInviteSubmit = async (e: any) => {
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
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="h-screen flex items-center justify-center font-black text-indigo-600 text-4xl animate-pulse tracking-tighter">
      FOCUSFLOW...
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
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
        onLogout={logout}
        onDeleteProject={(id) => handleProjectDeleted(id, () => { setTodos([]); })}
      />

      <div className="flex-1 py-12 px-4 md:px-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* Sıralama kaydet butonu */}
          {isLeader && isOrderChanged && (
            <div className="fixed bottom-10 right-10 z-50">
              <button
                onClick={handleSaveOrder}
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
                stats={{
                  total: todos.length,
                  completed: todos.filter((t) => t.isCompleted).length,
                  pending: todos.filter((t) => !t.isCompleted).length,
                }}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={logout}
                members={members}
                currentUserId={currentUser?.id}
                isLeader={isLeader && !isArchived}
                onRemoveMember={handleRemoveMemberClick}
              />

              {/* Arşiv banner */}
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
                searchQuery={filters.searchQuery} setSearchQuery={filters.setSearchQuery}
                filterCategory={filters.filterCategory} setFilterCategory={filters.setFilterCategory}
                filterPriority={filters.filterPriority} setFilterPriority={filters.setFilterPriority}
                sortBy={filters.sortBy} setSortBy={filters.setSortBy}
                categories={categories}
                members={members}
                filterAssignees={filterAssignees}
                setFilterAssignees={setFilterAssignees}
              />

              <DragDropContext onDragEnd={isArchived ? () => {} : (r) => handleOnDragEnd(r, isLeader)}>
                <StrictModeDroppable droppableId="todos">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="pb-24">
                      {filters.filteredTodos.map((todo, index) => (
                        <TodoItem
                          key={todo.id}
                          todo={todo}
                          index={index}
                          sortBy={filters.sortBy}
                          role={isArchived ? "Archived" : isLeader ? "Leader" : "Member"}
                          currentUserId={currentUser?.id}
                          onToggle={onToggleTodo}
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
            <div className="flex flex-col items-center justify-center h-[60vh] text-center gap-4">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center text-indigo-500 text-3xl">📋</div>
              <h2 className="text-xl font-black text-slate-700 dark:text-slate-200">Henüz liste yok</h2>
              <p className="text-sm text-slate-400">Sol menüden yeni bir liste oluşturun.</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {isNewProjectModalOpen && (
        <NewProjectModal
          projectName={newProjectName}
          setProjectName={setNewProjectName}
          onClose={() => setIsNewProjectModalOpen(false)}
          onCreate={(e) => handleCreateProject(e, newProjectName, () => {
            setIsNewProjectModalOpen(false);
            setNewProjectName("");
          })}
        />
      )}

      {isInviteModalOpen && (
        <InviteMemberModal
          project={activeProject}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={onInviteSubmit}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
        />
      )}

      {selectedTodo && (
        <SubTaskModal
          todo={selectedTodo}
          onClose={() => setSelectedTodo(null)}
          isArchived={isArchived}
          isLeader={isLeader}
          members={members.filter((m: any) => m.id !== currentUser?.id)}
          onUpdateAssignees={handleUpdateAssignees}
          onToggleSub={handleToggleSubTask}
          onAddSub={handleAddSubTask}
          newTitle={newSubTaskTitle}
          setNewTitle={setNewSubTaskTitle}
        />
      )}

      {isAvatarModalOpen && (
        <AvatarModal
          currentUser={currentUser}
          onClose={() => setIsAvatarModalOpen(false)}
          onUpdated={(avatarUrl) => setCurrentUser((prev: any) => ({ ...prev, avatarUrl }))}
        />
      )}

      {notAssignedPopup && (
        <NotAssignedModal data={notAssignedPopup} onClose={() => setNotAssignedPopup(null)} />
      )}

      {memberRemoveBlocked && (
        <RemoveMemberBlockedModal data={memberRemoveBlocked} onClose={() => setMemberRemoveBlocked(null)} />
      )}

      {memberToRemove && (
        <RemoveMemberConfirmModal
          member={memberToRemove}
          isLoading={isRemovingMember}
          onConfirm={handleConfirmRemoveMember}
          onClose={() => setMemberToRemove(null)}
        />
      )}
    </main>
  );
}
