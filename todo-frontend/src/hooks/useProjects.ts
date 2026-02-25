import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

export function useProjects() {
  const router = useRouter();

  const [projects, setProjects] = useState<any>({ owned: [], joined: [] });
  const [activeProject, setActiveProject] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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
        api.get("/Project"),
      ]);
      setCurrentUser(userRes.data);
      setProjects(projectsRes.data);

      if (projectsRes.data.owned.length > 0)
        setActiveProject(projectsRes.data.owned[0]);
      else if (projectsRes.data.joined.length > 0)
        setActiveProject(projectsRes.data.joined[0]);
    } catch (e) {
      console.error("Yükleme hatası:", e);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }, [router]);

  const handleCreateProject = async (
    e: any,
    newProjectName: string,
    onSuccess: () => void
  ) => {
    e.preventDefault();
    try {
      const res = await api.post("/Project", { name: newProjectName });
      toast.success("Yeni liste oluşturuldu!");
      onSuccess();
      const updated = await api.get("/Project");
      setProjects(updated.data);
      setActiveProject(res.data);
    } catch {
      toast.error("Liste oluşturulamadı.");
    }
  };

  const handleProjectDeleted = async (
    deletedId: number,
    onClear: () => void
  ) => {
    const updated = await fetchProjects();
    if (activeProject?.id === deletedId) {
      if (updated?.owned?.length > 0) setActiveProject(updated.owned[0]);
      else if (updated?.joined?.length > 0) setActiveProject(updated.joined[0]);
      else {
        setActiveProject(null);
        onClear();
      }
    }
  };

  const logout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return {
    projects,
    activeProject,
    setActiveProject,
    currentUser,
    setCurrentUser,
    loading,
    fetchProjects,
    loadInitialData,
    handleCreateProject,
    handleProjectDeleted,
    logout,
  };
}