"use client";

import { Draggable } from "@hello-pangea/dnd";
import { FiTrash2, FiCalendar, FiCheckCircle, FiCircle, FiAlertCircle } from "react-icons/fi";

const PRIORITY_CONFIG: Record<number, { label: string; bg: string; text: string; dot: string }> = {
  1: { label: "Düşük", bg: "bg-emerald-100 dark:bg-emerald-900/30", text: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" },
  2: { label: "Orta",  bg: "bg-amber-100 dark:bg-amber-900/30",   text: "text-amber-600 dark:text-amber-400",   dot: "bg-amber-500"  },
  3: { label: "Acil",  bg: "bg-rose-100 dark:bg-rose-900/30",     text: "text-rose-600 dark:text-rose-400",     dot: "bg-rose-500"   },
};

export const TodoItem = ({ todo, index, role, onToggle, onDelete, onSelect, sortBy }: any) => {
  const isLeader = role === "Leader";

  const getDateStatus = (dateString: string) => {
    if (!dateString) return null;
    const dueDate = new Date(dateString); dueDate.setHours(0, 0, 0, 0);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    const formatted = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(dueDate);

    // Geçmiş tarihler
    if (diffDays < 0) return {
      label: `Gecikti: ${formatted}`,
      color: "text-rose-600 bg-rose-50 border-rose-200",
      icon: <FiAlertCircle />,
      blink: false,
    };

    // Bugün — yanıp söner
    if (diffDays === 0) return {
      label: "Bugün",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      icon: <FiCalendar />,
      blink: true,
    };

    // Yarın — amber, yanıp sönmez
    if (diffDays === 1) return {
      label: "Yarın",
      color: "text-amber-600 bg-amber-50 border-amber-200",
      icon: <FiCalendar />,
      blink: false,
    };

    // 2–6 gün arası → "X gün kaldı"
    if (diffDays >= 2 && diffDays <= 6) return {
      label: `${diffDays} gün kaldı`,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      icon: <FiCalendar />,
      blink: false,
    };

    // Tam 7 gün → "1 hafta kaldı"
    if (diffDays === 7) return {
      label: "1 hafta kaldı",
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      icon: <FiCalendar />,
      blink: false,
    };

    // 7 günden fazla → tarih yaz
    return {
      label: formatted,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      icon: <FiCalendar />,
      blink: false,
    };
  };

  const status = getDateStatus(todo.dueDate);
  const pConfig = PRIORITY_CONFIG[todo.priority];

  const getAvatarSrc = (assignee: any) => {
    if (assignee.avatarUrl) return assignee.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${assignee.username}`;
  };

  return (
    <Draggable draggableId={todo.id.toString()} index={index} isDragDisabled={sortBy !== "Manuel" || !isLeader}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="group flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all duration-300 mb-3">
          <button onClick={() => onToggle(todo.id)} className={`text-2xl transition-colors ${todo.isCompleted ? "text-indigo-500" : "text-slate-300 hover:text-indigo-400"}`}>
            {todo.isCompleted ? <FiCheckCircle /> : <FiCircle />}
          </button>

          <div className="flex-1 cursor-pointer" onClick={() => onSelect(todo)}>
            <div className="flex flex-col">
              <span className={`font-semibold text-sm sm:text-base ${todo.isCompleted ? "line-through text-slate-400" : "text-slate-700 dark:text-slate-200"}`}>
                {todo.title}
              </span>

              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{todo.category || "Genel"}</span>

                {status && !todo.isCompleted && (
                  <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${status.color} ${status.blink ? "today-blink" : ""}`}>
                    {status.icon} {status.label}
                  </span>
                )}

                <div className="flex -space-x-2 ml-1">
                  {todo.assignees?.map((assignee: any) => (
                    <div
                      key={assignee.id}
                      title={assignee.username}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 overflow-hidden"
                    >
                      <img src={getAvatarSrc(assignee)} alt={assignee.username} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {pConfig ? (
              <>
                <span className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${pConfig.bg} ${pConfig.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pConfig.dot}`} />
                  {pConfig.label}
                </span>
                <span className={`sm:hidden w-3 h-3 rounded-full ${pConfig.dot}`} />
              </>
            ) : (
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            )}

            {isLeader && (
              <button onClick={(e) => { e.stopPropagation(); onDelete(todo.id); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                <FiTrash2 size={18} />
              </button>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
