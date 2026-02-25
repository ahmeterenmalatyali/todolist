import { useState, useCallback } from "react";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useMembers(
  activeProject: any,
  currentUser: any,
  todos: any[],
  removeMemberFromTodos: (id: number) => void,
  setFilterAssignees: (fn: (prev: number[]) => number[]) => void
) {
  const [members, setMembers] = useState<any[]>([]);

  // Üye çıkarma popup state'leri
  const [memberToRemove, setMemberToRemove] = useState<{
    id: number;
    username: string;
  } | null>(null);
  const [memberRemoveBlocked, setMemberRemoveBlocked] = useState<{
    username: string;
    tasks: string[];
  } | null>(null);
  const [isRemovingMember, setIsRemovingMember] = useState(false);

  const pId = activeProject?.id || activeProject?.Id;

  const fetchMembers = useCallback(async () => {
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
  }, [pId, currentUser]);

  const handleRemoveMemberClick = (userId: number) => {
    const member = members.find((m: any) => m.id === userId);
    if (!member) return;

    const assignedTasks = todos.filter((todo: any) =>
      todo.assignees?.some((a: any) => a.id === userId)
    );

    if (assignedTasks.length > 0) {
      setMemberRemoveBlocked({
        username: member.username,
        tasks: assignedTasks.map((t: any) => t.title),
      });
      return;
    }

    setMemberToRemove({ id: member.id, username: member.username });
  };

  const handleConfirmRemoveMember = async () => {
    if (!memberToRemove) return;
    const removedId = memberToRemove.id;
    setIsRemovingMember(true);
    try {
      await api.delete(`/Project/${pId}/members/${removedId}`);
      toast.success("Üye projeden çıkarıldı.");
      setMemberToRemove(null);
      setMembers((prev) => prev.filter((m: any) => m.id !== removedId));
      removeMemberFromTodos(removedId);
      setFilterAssignees((prev) => prev.filter((id) => id !== removedId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "İşlem başarısız.");
    } finally {
      setIsRemovingMember(false);
    }
  };

  return {
    members,
    setMembers,
    fetchMembers,
    memberToRemove,
    setMemberToRemove,
    memberRemoveBlocked,
    setMemberRemoveBlocked,
    isRemovingMember,
    handleRemoveMemberClick,
    handleConfirmRemoveMember,
  };
}