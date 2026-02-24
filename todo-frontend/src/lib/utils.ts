// src/lib/utils.ts
export const CATEGORIES = ["Genel", "İş", "Kişisel", "Alışveriş", "Eğitim"];

export const PRIORITY_MAP: Record<number, { label: string; color: string; bg: string; hover: string }> = {
  1: { label: "Düşük", color: "text-emerald-500", bg: "bg-emerald-500", hover: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20" },
  2: { label: "Orta", color: "text-amber-500", bg: "bg-amber-500", hover: "hover:bg-amber-50 dark:hover:bg-amber-900/20" },
  3: { label: "Yüksek", color: "text-rose-500", bg: "bg-rose-500", hover: "hover:bg-rose-50 dark:hover:bg-rose-900/20" },
};

export const getRemainingTime = (dateStr: string | null) => {
  if (!dateStr) return null;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr); target.setHours(0, 0, 0, 0);
  const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diff < 0) return { text: "Geçti", color: "text-rose-500" };
  if (diff === 0) return { text: "Bugün", color: "text-orange-500 animate-pulse" };
  return { text: `${diff} gün kaldı`, color: "text-slate-400" };
};