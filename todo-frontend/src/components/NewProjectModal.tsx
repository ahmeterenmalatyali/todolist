import { FiX, FiFolderPlus } from "react-icons/fi";

interface NewProjectModalProps {
  onClose: () => void;
  onCreate: (e: any) => void;
  projectName: string;
  setProjectName: (name: string) => void;
}

export const NewProjectModal = ({ onClose, onCreate, projectName, setProjectName }: NewProjectModalProps) => (
  <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
    <div className="bg-[var(--card)] w-full max-w-sm rounded-[2.5rem] shadow-2xl border border-white/10 p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-white">Yeni Liste Oluştur</h2>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
          <FiX size={20}/>
        </button>
      </div>

      <form onSubmit={onCreate} className="space-y-4">
        <div className="relative">
          <input 
            autoFocus
            type="text" 
            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-500/30 text-black dark:text-white font-bold transition-all placeholder:text-slate-400" 
            placeholder="Proje veya Liste Adı..." 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!projectName.trim()}
          className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiFolderPlus /> OLUŞTUR
        </button>
      </form>
    </div>
  </div>
);