import { FiSearch } from "react-icons/fi";
import { CATEGORIES } from "@/lib/utils";

export const TodoToolbar = ({ searchQuery, setSearchQuery, filterCategory, setFilterCategory, filterPriority, setFilterPriority, sortBy, setSortBy }: any) => (
  <div className="bg-[var(--card)] p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm mb-8">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
      <div className="md:col-span-5 relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl outline-none text-xs font-bold dark:text-slate-100" placeholder="Arama..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>
      <div className="md:col-span-7 flex flex-wrap gap-2">
        <select className="flex-1 bg-slate-50 dark:bg-slate-800/40 px-3 py-3 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600 dark:text-slate-300 border border-transparent hover:border-indigo-400/30 transition-all" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
          <option value="Hepsi">Türler</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="flex-1 bg-slate-50 dark:bg-slate-800/40 px-3 py-3 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600 dark:text-slate-300 border border-transparent hover:border-emerald-400/30 transition-all" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="Hepsi">Öncelikler</option>
          <option value="1">Düşük</option>
          <option value="2">Orta</option>
          <option value="3">Yüksek</option>
        </select>
        <select className="flex-1 bg-slate-50 dark:bg-slate-800/40 px-3 py-3 rounded-2xl text-[10px] font-black uppercase outline-none cursor-pointer text-slate-600 dark:text-slate-300 border border-transparent hover:border-rose-400/30 transition-all" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="Manuel">Sıralama</option>
          <option value="Ad">A-Z</option>
          <option value="Öncelik">Önem</option>
          <option value="Tarih">Tarih</option>
        </select>
      </div>
    </div>
  </div>
);