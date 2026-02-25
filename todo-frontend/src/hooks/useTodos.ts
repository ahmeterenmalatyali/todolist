import { useState, useCallback, useRef } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useTodos(activeProject: any) {
  const [todos, setTodos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [category, setCategory] = useState("Genel");
  const [isOrderChanged, setIsOrderChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [priority, setPriority] = useState(1);
  const [dueDate, setDueDate] = useState("");

  const [selectedTodo, setSelectedTodo] = useState<any>(null);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState("");

  const selectedTodoRef = useRef<any>(null);
  selectedTodoRef.current = selectedTodo;

  const pId = activeProject?.id || activeProject?.Id;

  const fetchTodos = useCallback(async () => {
    if (!pId) return;
    try {
      const response = await api.get(`/Todo?projectId=${pId}`);
      const sorted = response.data.sort((a: any, b: any) => a.order - b.order);
      setTodos(sorted);
      setIsOrderChanged(false);

      if (selectedTodoRef.current) {
        const updated = sorted.find((t: any) => t.id === selectedTodoRef.current.id);
        if (updated) setSelectedTodo(updated);
      }
    } catch (error) {
      console.error("Görev hatası:", error);
    }
  }, [pId]);

  const fetchCategories = useCallback(async () => {
    if (!pId) return;
    try {
      const res = await api.get(`/Category/${pId}`);
      setCategories(res.data);
      if (res.data.length > 0) setCategory(res.data[0].name);
    } catch (e) {
      console.error("Kategoriler çekilemedi:", e);
    }
  }, [pId]);

  const handleAddCategory = async (name: string) => {
    try {
      await api.post(`/Category/${pId}`, { name });
      toast.success("Kategori eklendi!");
      fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Kategori eklenemedi.");
    }
  };

  const handleAddTodoSubmit = async (e: any) => {
    e.preventDefault();
    if (!newTodoTitle.trim()) return;

    try {
      const formattedDate =
        dueDate && dueDate.trim() !== ""
          ? new Date(dueDate).toISOString()
          : null;

      await api.post("/Todo", {
        Title: newTodoTitle,
        ProjectId: pId,
        Priority: priority,
        Category: category,
        DueDate: formattedDate,
      });

      setNewTodoTitle("");
      setDueDate("");
      toast.success("Görev başarıyla eklendi");
      fetchTodos();
    } catch {
      toast.error("Görev eklenemedi.");
    }
  };

  const handleDeleteTodo = async (id: number) => {
    try {
      await api.delete(`/Todo/${id}`);
      toast.success("Görev silindi.");
      fetchTodos();
    } catch {
      toast.error("Görev silinemedi.");
    }
  };

  const handleToggleTodo = async (id: number) => {
    try {
      await api.put(`/Todo/${id}/toggle`);
      fetchTodos();
    } catch (err: any) {
      toast.error(err.response?.data || "Görev güncellenemedi.");
    }
  };

  const handleUpdateAssignees = async (todoId: number, userId: number) => {
    try {
      await api.post(`/Todo/${todoId}/assign/${userId}`);
      toast.success("Görevli listesi güncellendi");
      fetchTodos();
    } catch {
      toast.error("Atama güncellenemedi.");
    }
  };

  const handleOnDragEnd = (result: any, isLeader: boolean) => {
    if (!isLeader || !result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
    setIsOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      await api.put("/Todo/reorder", todos.map((t) => t.id));
      setIsOrderChanged(false);
      toast.success("Sıralama kaydedildi");
    } catch {
      toast.error("Kaydedilemedi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSubTask = async (sid: number) => {
    try {
      await api.put(`/Todo/subtask/${sid}/toggle`);
      fetchTodos();
    } catch {
      toast.error("Alt görev güncellenemedi.");
    }
  };

  const handleAddSubTask = async (e: any, uId: string) => {
    e.preventDefault();
    if (!newSubTaskTitle.trim()) return;
    try {
      const url = `/Todo/${selectedTodo.id}/subtask?title=${encodeURIComponent(
        newSubTaskTitle
      )}${uId ? `&assignedUserId=${uId}` : ""}`;
      await api.post(url);
      setNewSubTaskTitle("");
      fetchTodos();
    } catch {
      toast.error("Alt görev eklenemedi.");
    }
  };

  // Üye silinince todos'dan da temizle (client-side)
  const removeMemberFromTodos = (removedId: number) => {
    setTodos((prev) =>
      prev.map((todo: any) => ({
        ...todo,
        assignees: (todo.assignees || []).filter((a: any) => a.id !== removedId),
        subTasks: (todo.subTasks || []).map((sub: any) => ({
          ...sub,
          assignedUser:
            sub.assignedUser?.id === removedId ? null : sub.assignedUser,
        })),
      }))
    );
    if (selectedTodoRef.current) {
      setSelectedTodo((prev: any) =>
        prev
          ? {
              ...prev,
              assignees: (prev.assignees || []).filter(
                (a: any) => a.id !== removedId
              ),
              subTasks: (prev.subTasks || []).map((sub: any) => ({
                ...sub,
                assignedUser:
                  sub.assignedUser?.id === removedId
                    ? null
                    : sub.assignedUser,
              })),
            }
          : null
      );
    }
  };

  return {
    todos,
    setTodos,
    categories,
    category,
    setCategory,
    isOrderChanged,
    isSaving,
    newTodoTitle,
    setNewTodoTitle,
    priority,
    setPriority,
    dueDate,
    setDueDate,
    selectedTodo,
    setSelectedTodo,
    newSubTaskTitle,
    setNewSubTaskTitle,
    fetchTodos,
    fetchCategories,
    handleAddCategory,
    handleAddTodoSubmit,
    handleDeleteTodo,
    handleToggleTodo,
    handleUpdateAssignees,
    handleOnDragEnd,
    handleSaveOrder,
    handleToggleSubTask,
    handleAddSubTask,
    removeMemberFromTodos,
  };
}