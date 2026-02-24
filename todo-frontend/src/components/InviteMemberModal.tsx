import { FiX, FiUserPlus, FiSend, FiUser } from "react-icons/fi";

export const InviteMemberModal = ({ project, onClose, onInvite, inviteEmail, setInviteEmail }: any) => (
  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
    <div className="bg-[var(--card)] w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/10">
      <div className="p-8">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600">
              <FiUserPlus size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Ekibe Davet Et</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{project?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-all"><FiX size={20} /></button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
          Projeye eklemek istediğiniz arkadaşınızın e-posta adresini veya kullanıcı adını yazın.
        </p>

        <form onSubmit={onInvite} className="space-y-4">
          <div className="relative group">
            <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              required
              className="w-full pl-11 pr-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500/30 text-black dark:text-white font-bold transition-all" 
              placeholder="E-posta veya Kullanıcı Adı" 
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-95"
          >
            <FiSend /> DAVET GÖNDER
          </button>
        </form>
      </div>
    </div>
  </div>
);