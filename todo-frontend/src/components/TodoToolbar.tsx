import { FiSearch, FiArrowDown } from "react-icons/fi";
import { FilterPopup } from "./FilterPopup";

// YENİ prop'lar eklendi, eskileri korundu
export const TodoToolbar = ({
  searchQuery, setSearchQuery,
  filterCategory, setFilterCategory,
  filterPriority, setFilterPriority,
  sortBy, setSortBy,
  // YENİ
  categories,
  members,
  filterAssignees,
  setFilterAssignees,
}: any) => (
  // YENİ: flex layout — arama + filtrele popup + sıralama
  <div className="flex items-center gap-3 mb-8 flex-wrap">

    {/* ORİJİNAL: Arama kutusu */}
    <div className="flex-1 relative min-w-48">
      <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
      <input
        type="text"
        className="w-full pl-11 pr-4 py-3 bg-[var(--card)] rounded-2xl outline-none text-xs font-bold dark:text-slate-100 border border-slate-100 dark:border-slate-800 shadow-sm"
        placeholder="Arama..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>

    {/* YENİ: Filtrele popup butonu */}
    <FilterPopup
      categories={categories}
      members={members}
      filterCategory={filterCategory}
      setFilterCategory={setFilterCategory}
      filterPriority={filterPriority}
      setFilterPriority={setFilterPriority}
      filterAssignees={filterAssignees}
      setFilterAssignees={setFilterAssignees}
    />

    {/* YENİ: Sıralama */}
    <div className="flex items-center gap-2 px-4 py-3 bg-[var(--card)] rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <FiArrowDown size={14} className="text-slate-400" />
      <select
        className="bg-transparent text-xs font-black uppercase outline-none cursor-pointer text-slate-600 dark:text-slate-300"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
      >
        <option value="Manuel">Manuel</option>
        <option value="Ad">A-Z</option>
        <option value="Öncelik">Önem</option>
        <option value="Tarih">Tarih</option>
      </select>
    </div>
  </div>
);
