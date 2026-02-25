import { useState } from "react";

export function useFilters(todos: any[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("Hepsi");
  const [filterPriority, setFilterPriority] = useState("Hepsi");
  const [filterAssignees, setFilterAssignees] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("Manuel");

  const filteredTodos = (() => {
    let list = todos.filter((t) => {
      const matchesSearch = t.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "Hepsi" || t.category === filterCategory;
      const matchesPriority =
        filterPriority === "Hepsi" ||
        t.priority.toString() === filterPriority;

      const assigneeIds = t.assignees?.map((a: any) => a.id) || [];
      const matchesAssignees =
        filterAssignees.length === 0 ||
        filterAssignees.every((id: number) => assigneeIds.includes(id));

      return matchesSearch && matchesCategory && matchesPriority && matchesAssignees;
    });

    if (sortBy === "Ad")
      list = [...list].sort((a, b) => a.title.localeCompare(b.title, "tr"));
    else if (sortBy === "Öncelik")
      list = [...list].sort((a, b) => b.priority - a.priority);
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

  return {
    searchQuery, setSearchQuery,
    filterCategory, setFilterCategory,
    filterPriority, setFilterPriority,
    filterAssignees, setFilterAssignees,
    sortBy, setSortBy,
    filteredTodos,
  };
}