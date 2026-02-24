"use client";

import { useState } from "react";
import { FiPlus, FiCalendar, FiEdit3, FiX } from "react-icons/fi";

export const AddTodoForm = ({ 
  onSubmit, title, setTitle, priority, setPriority, 
  category, setCategory, dueDate, setDueDate,
  categories, onAddCategory
}: any) => {
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await onAddCategory(newCategoryName.trim());
    setNewCategoryName("");
    setShowCategoryInput(false);
  };

  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 mb-10 border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-4">

        {/* Görev Başlığı Input */}
        <div className="relative flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent focus-within:border-indigo-500 rounded-2xl px-4 py-3 transition-all duration-200">
          <FiEdit3 size={20} className="text-indigo-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yeni görev ekle..."
            className="w-full bg-transparent border-none text-base font-semibold placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-0 outline-none dark:text-white text-slate-700"
            style={{ outline: "none", boxShadow: "none" }}
          />
          {title.length > 0 && (
            <span className="text-[10px] font-black text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-lg shrink-0">
              {title.length} harf
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-3">

          {/* Öncelik */}
          <select 
            value={priority} 
            onChange={(e) => setPriority(Number(e.target.value))} 
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black text-slate-500 p-2 cursor-pointer focus:ring-0"
          >
            <option value={1}>DÜŞÜK</option>
            <option value={2}>ORTA</option>
            <option value={3}>ACİL</option>
          </select>

          {/* Kategori Seçimi */}
          <div className="flex items-center gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black text-slate-500 p-2 cursor-pointer focus:ring-0"
            >
              {categories?.map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Yeni Kategori Ekle */}
            {showCategoryInput ? (
              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 rounded-xl px-2 py-1">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCategory())}
                  placeholder="Kategori adı..."
                  autoFocus
                  className="bg-transparent border-none text-xs font-black text-slate-600 dark:text-slate-300 w-28 focus:ring-0 outline-none p-0"
                  style={{ outline: "none", boxShadow: "none" }}
                />
                <button type="button" onClick={handleAddCategory} className="text-indigo-500 hover:text-indigo-700">
                  <FiPlus size={14} />
                </button>
                <button type="button" onClick={() => setShowCategoryInput(false)} className="text-slate-400 hover:text-slate-600">
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowCategoryInput(true)}
                className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 rounded-xl transition-colors"
                title="Yeni kategori ekle"
              >
                <FiPlus size={16} />
              </button>
            )}
          </div>

          {/* Tarih */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-500">
            <FiCalendar size={14} />
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="bg-transparent border-none text-[11px] font-black p-0 focus:ring-0" 
            />
          </div>

          {/* Gönder */}
          <button 
            type="submit" 
            className="ml-auto bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
          >
            <FiPlus size={24} />
          </button>
        </div>
      </div>
    </form>
  );
};
