"use client";

import { useState } from "react";
import { FiX, FiPlus, FiCheck, FiUsers, FiCheckCircle, FiCircle, FiLock } from "react-icons/fi";

export const SubTaskModal = ({
  todo, onClose,
  onToggleSub, onAddSub, newTitle, setNewTitle,
  isLeader, isArchived,
  members,
  onUpdateAssignees,      // ana görev ataması
  onUpdateSubAssignees,   // alt görev ataması (YENİ)
}: any) => {
  const [subTaskUserId, setSubTaskUserId] = useState("");

  const currentAssigneeIds = todo.assignees?.map((a: any) => a.id) || [];

  const getAvatarSrc = (member: any) => {
    if (member.avatarUrl) return member.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start bg-indigo-50/30 dark:bg-indigo-900/10">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-black text-slate-800 dark:text-white leading-tight break-words">{todo.title}</h2>
            <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">GÖREV DETAYLARI VE ATAMALAR</p>
          </div>
          <button onClick={onClose} className="flex-shrink-0 p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-all text-slate-400">
            <FiX size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">

          {/* Arşiv uyarısı */}
          {isArchived && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/50 rounded-2xl">
              <FiLock className="text-amber-500 flex-shrink-0" size={18} />
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Arşivlenmiş projede düzenleme yapılamaz.</p>
            </div>
          )}

          {/* ANA GÖREV SORUMLULARI */}
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
                    onClick={() => { if (isLeader && !isArchived) onUpdateAssignees(todo.id, member.id); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
                      isAssigned
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-100 dark:border-slate-700 hover:border-indigo-300"
                    } ${(!isLeader || isArchived) ? "cursor-default opacity-80" : "cursor-pointer"}`}
                  >
                    <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                      <img src={getAvatarSrc(member)} alt={member.username} className="w-full h-full object-cover" />
                    </div>
                    {member.username}
                    {isAssigned && <FiCheck size={14} />}
                  </button>
                );
              })}
              {members.length === 0 && <p className="text-xs text-slate-400 font-medium">Başka üye yok.</p>}
            </div>
            {!isLeader && !isArchived && (
              <p className="text-[11px] text-slate-400 italic">Sadece Proje Lideri atama yapabilir.</p>
            )}
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* ALT GÖREVLER */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase tracking-tighter">
              <FiPlus /> ALT MODÜLLER VE ATAMALAR
            </div>

            {/* Alt görev ekleme formu */}
            {isLeader && !isArchived && (
              <form
                onSubmit={(e) => { e.preventDefault(); onAddSub(e, subTaskUserId); setSubTaskUserId(""); }}
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

            {/* Alt görev listesi */}
            <div className="space-y-3">
              {todo.subTasks?.map((sub: any) => {
                const subAssigneeIds = sub.assignees?.map((a: any) => a.id) || [];
                return (
                  <div key={sub.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">

                    {/* Üst satır: toggle + başlık */}
                    <div className="flex items-center gap-4 p-4">
                      <button
                        onClick={() => { if (!isArchived) onToggleSub(sub.id); }}
                        className={`flex-shrink-0 text-xl transition-colors ${
                          isArchived
                            ? "text-slate-200 dark:text-slate-700 cursor-not-allowed"
                            : sub.isCompleted
                              ? "text-indigo-500"
                              : "text-slate-300 hover:text-indigo-400"
                        }`}
                      >
                        {sub.isCompleted ? <FiCheckCircle /> : <FiCircle />}
                      </button>
                      <span className={`flex-1 text-sm font-semibold ${sub.isCompleted ? "line-through text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>
                        {sub.title}
                      </span>
                    </div>

                    {/* Alt satır: çoklu kişi atama */}
                    {(isLeader || subAssigneeIds.length > 0) && (
                      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex-shrink-0">Atananlar:</span>
                        {members.map((member: any) => {
                          const isAssigned = subAssigneeIds.includes(member.id);
                          if (!isLeader && !isAssigned) return null; // Üye sadece atananları görür
                          return (
                            <button
                              key={member.id}
                              onClick={() => { if (isLeader && !isArchived) onUpdateSubAssignees(sub.id, member.id); }}
                              title={isLeader ? (isAssigned ? `${member.username} çıkar` : `${member.username} ekle`) : member.username}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                                isAssigned
                                  ? "bg-indigo-600 text-white border-indigo-600"
                                  : "bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700 hover:border-indigo-300"
                              } ${(!isLeader || isArchived) ? "cursor-default" : "cursor-pointer"}`}
                            >
                              <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                <img src={getAvatarSrc(member)} alt={member.username} className="w-full h-full object-cover" />
                              </div>
                              {member.username}
                              {isAssigned && isLeader && <FiCheck size={10} />}
                            </button>
                          );
                        })}
                        {subAssigneeIds.length === 0 && !isLeader && (
                          <span className="text-[10px] text-slate-300 italic">Atanmamış</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
