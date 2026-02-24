"use client";

import { FiPlus, FiCalendar, FiUser } from "react-icons/fi";

export const AddTodoForm = ({ 
  onSubmit, title, setTitle, priority, setPriority, 
  category, setCategory, dueDate, setDueDate,
  members, assignedUserId, setAssignedUserId 
}: any) => {
  return (
    <form onSubmit={onSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl shadow-indigo-500/5 mb-10 border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col gap-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Yeni görev başlığı..."
          className="w-full bg-transparent border-none text-xl font-bold placeholder:text-slate-300 focus:ring-0 dark:text-white"
        />
        
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

          {/* KULLANICI ATAMA (Üye Listesi) */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl text-slate-500">
            <FiUser size={14} />
            <select 
              value={assignedUserId} 
              onChange={(e) => setAssignedUserId(e.target.value)} 
              className="bg-transparent border-none text-[11px] font-black p-0 focus:ring-0 cursor-pointer"
            >
              <option value="">Ata (Boş)</option>
              {members?.map((m: any) => (
                <option key={m.id} value={m.id}>
                  {m.username}
                </option>
              ))}
            </select>
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