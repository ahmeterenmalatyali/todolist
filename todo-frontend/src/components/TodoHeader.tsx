import { FiSun, FiMoon, FiLogOut, FiUserMinus } from "react-icons/fi";

interface Props {
  username: string;
  stats: { total: number; completed: number; pending: number };
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
  // YENİ prop'lar
  members?: any[];
  currentUserId?: number;
  isLeader?: boolean;
  onRemoveMember?: (userId: number) => void;
}

export const TodoHeader = ({ username, stats, darkMode, setDarkMode, onLogout, members = [], currentUserId, isLeader, onRemoveMember }: Props) => {
  // YENİ: avatar src helper
  const getAvatarSrc = (member: any) => {
    if (member.avatarUrl) return member.avatarUrl;
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.username}`;
  };

  return (
    <div className="bg-[var(--card)] p-6 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
      {/* ORİJİNAL: Başlık satırı (avatar + proje adı + dark mode + logout) */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`} className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 p-1" alt="avatar" />
          <h2 className="text-2xl font-black">{username}</h2>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-amber-500 hover:rotate-12 transition-transform shadow-sm">
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </button>
          <button onClick={onLogout} className="p-3 text-rose-500 bg-rose-50 dark:bg-rose-900/20 rounded-xl hover:bg-rose-100 transition-colors shadow-sm">
            <FiLogOut size={20} />
          </button>
        </div>
      </div>

      {/* ORİJİNAL: İstatistik kartları */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl text-center">
          <p className="text-[10px] font-black uppercase text-slate-400">Toplam</p>
          <p className="text-xl font-black">{stats.total}</p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center border border-emerald-100 dark:border-emerald-800">
          <p className="text-[10px] font-black uppercase text-emerald-500">Biten</p>
          <p className="text-xl font-black text-emerald-600">{stats.completed}</p>
        </div>
        <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl text-center border border-indigo-100 dark:border-indigo-800">
          <p className="text-[10px] font-black uppercase text-indigo-500">Kalan</p>
          <p className="text-xl font-black text-indigo-600">{stats.pending}</p>
        </div>
      </div>

      {/* YENİ: Proje ekibi */}
      {members.length > 0 && (
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">
            Proje Ekibi · {members.length} kişi
          </p>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => (
              <div key={m.id} className="group relative flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="w-7 h-7 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={getAvatarSrc(m)} alt={m.username} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-none">{m.username}</p>
                  <p className={`text-[9px] font-black uppercase leading-none mt-0.5 ${m.role === "Leader" ? "text-indigo-500" : "text-slate-400"}`}>
                    {m.role === "Leader" ? "Lider" : "Üye"}
                  </p>
                </div>
                {/* YENİ: Leader ise üye çıkarma butonu */}
                {isLeader && m.id !== currentUserId && onRemoveMember && (
                  <button
                    onClick={() => onRemoveMember(m.id)}
                    title={`${m.username} kişisini çıkar`}
                    className="hidden group-hover:flex absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white rounded-full items-center justify-center hover:bg-rose-600 transition-all shadow-md"
                  >
                    <FiUserMinus size={10} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
