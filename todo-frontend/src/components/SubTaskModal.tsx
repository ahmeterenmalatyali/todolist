"use client";

import { useState } from "react";
import { FiX, FiPlus, FiUser, FiCheck, FiUsers, FiCheckCircle, FiCircle } from "react-icons/fi";

export const SubTaskModal = ({ todo, onClose, onToggleSub, onAddSub, newTitle, setNewTitle, isLeader, members, onUpdateAssignees }: any) => {
  const [subTaskUserId, setSubTaskUserId] = useState("");

  const currentAssigneeIds = todo.assignees?.map((a: any) => a.id) || [];

  // YENİ: avatar src helper
  const getAvatarSrc = (member: any) => {
    if (member.avatarUrl) return member.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-indigo-50/30 dark:bg-indigo-900/10">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{todo.title}</h2>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">GÖREV DETAYLARI VE ATAMALAR</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* SEKTÖR 1: ANA GÖREV SORUMLULARI */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-tighter">
              <FiUsers /> ANA GÖREV SORUMLULARI
            </div>
            <div className="flex flex-wrap gap-2">
              {members.map((member: any) => {
                const isAssigned = currentAssigneeIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => onUpdateAssignees(todo.id, member.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                      isAssigned
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-indigo-300"
                    }`}
                  >
                    {/* YENİ: initials yerine avatar */}
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      <img src={getAvatarSrc(member)} alt={member.username} className="w-full h-full object-cover" />
                    </div>
                    {member.username}
                    {isAssigned && <FiCheck size={14} />}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* SEKTÖR 2: ALT GÖREVLER */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-tighter">
              <FiPlus /> ALT MODÜLLER VE ATAMALAR
            </div>

            {isLeader && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onAddSub(e, subTaskUserId);
                  setSubTaskUserId("");
                }}
                className="flex flex-col sm:flex-row gap-3 bg-slate-50 dark:bg-slate-800 p-4 rounded-3xl border border-slate-100 dark:border-slate-700"
              >
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Alt modül başlığı..."
                  className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 dark:text-white"
                />
                <div className="flex items-center gap-2">
                  <select
                    value={subTaskUserId}
                    onChange={(e) => setSubTaskUserId(e.target.value)}
                    className="bg-white dark:bg-slate-900 border-none rounded-xl text-[11px] font-black p-2 focus:ring-0 text-slate-500"
                  >
                    <option value="">Kişi Seç</option>
                    {members.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.username}</option>
                    ))}
                  </select>
                  <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 transition-all">
                    <FiPlus size={20} />
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {todo.subTasks?.map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl group transition-all">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => onToggleSub(sub.id)}
                      className={`text-xl transition-colors ${sub.isCompleted ? "text-indigo-500" : "text-slate-300 hover:text-indigo-400"}`}
                    >
                      {sub.isCompleted ? <FiCheckCircle /> : <FiCircle />}
                    </button>
                    <span className={`text-sm font-semibold ${sub.isCompleted ? "line-through text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>
                      {sub.title}
                    </span>
                  </div>

                  {sub.assignedUser && (
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
                      {/* YENİ: FiUser ikonu yerine avatar */}
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <img
                          src={sub.assignedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sub.assignedUser.username}`}
                          alt={sub.assignedUser.username}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">{sub.assignedUser.username}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
