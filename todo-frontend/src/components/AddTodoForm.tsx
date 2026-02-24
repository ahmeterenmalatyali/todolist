"use client";

import { FiPlus, FiCalendar, FiEdit3 } from "react-icons/fi";

export const AddTodoForm = ({ 
  onSubmit, title, setTitle, priority, setPriority, 
  category, setCategory, dueDate, setDueDate
}: any) => {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 mb-10 border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-4">
        {/* Görev Başlığı Input - Yeni Tasarım */}
        <div className="relative flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 border-2 border-transparent focus-within:border-indigo-500 rounded-2xl px-4 py-3 transition-all duration-200 outline-none">
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
          {/* Öncelik Seçimi */}
          <select 
            value={priority} 
            onChange={(e) => setPriority(Number(e.target.value))} 
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black text-slate-500 p-2 cursor-pointer focus:ring-0"
          >
            <option value={1}>DÜŞÜK</option>
            <option value={2}>ORTA</option>
            <option value={3}>ACİL</option>
          </select>

          {/* Kategori Inputu */}
          <input 
            type="text" 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            placeholder="Kategori" 
            className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-black text-slate-500 p-2 w-24 focus:ring-0" 
          />

          {/* Tarih Seçici */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-500">
            <FiCalendar size={14} />
            <input 
              type="date" 
              value={dueDate} 
              onChange={(e) => setDueDate(e.target.value)} 
              className="bg-transparent border-none text-[11px] font-black p-0 focus:ring-0" 
            />
          </div>

          {/* Gönder Butonu */}
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