import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, ArrowRight, HelpCircle, ChevronDown } from "lucide-react";
import { normalizeSearch } from "../../../lib/textSearch";
import { ADMIN_HELP_SECTIONS } from "../adminHelpContent";

// Index plat (section + item) pour la recherche — construit une seule fois.
const FLAT_INDEX = ADMIN_HELP_SECTIONS.flatMap((section) =>
  section.items.map((item) => ({ menu: section.menu, ...item }))
);

/**
 * Centre d'aide admin — explique ce que fait chaque section du dashboard et
 * comment elle fonctionne, avec sa propre recherche (indépendante de la
 * recherche de navigation du header, mais même logique de normalisation).
 * `onGoTo({ menu, key })` est appelé quand l'admin clique "Aller à cette
 * section" — le panneau se ferme et AdminLayaout navigue dessus.
 */
export default function AdminHelpCenter({ open, onClose, onGoTo }) {
  const [query, setQuery] = useState("");
  const [openItemKey, setOpenItemKey] = useState(null);

  const results = useMemo(() => {
    const q = normalizeSearch(query);
    if (q.length < 2) return null; // null = pas de recherche active, on affiche tout groupé
    return FLAT_INDEX.filter((item) => {
      if (normalizeSearch(item.title).includes(q)) return true;
      if (normalizeSearch(item.menu).includes(q)) return true;
      if (normalizeSearch(item.summary).includes(q)) return true;
      if ((item.details || []).some((d) => normalizeSearch(d).includes(q))) return true;
      return (item.keywords || []).some((k) => normalizeSearch(k).includes(q));
    });
  }, [query]);

  const handleGoTo = (item) => {
    onGoTo?.({ menu: item.menu, key: item.key });
    onClose?.();
  };

  const renderItem = (item) => {
    const itemId = `${item.menu}-${item.key}`;
    const isOpen = openItemKey === itemId;
    return (
      <div key={itemId} className="border border-base-200 rounded-2xl overflow-hidden bg-base-100">
        <button
          onClick={() => setOpenItemKey(isOpen ? null : itemId)}
          className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left hover:bg-base-200/60 transition-colors"
        >
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-wide text-indigo-500">{item.menu}</p>
            <p className="text-sm font-black text-base-content truncate">{item.title}</p>
          </div>
          <ChevronDown size={16} className={`shrink-0 text-base-content/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-0 space-y-3">
                <p className="text-sm text-base-content/70 font-medium leading-relaxed">{item.summary}</p>
                {item.details?.length > 0 && (
                  <ul className="space-y-1.5">
                    {item.details.map((d, i) => (
                      <li key={i} className="text-xs text-base-content/60 font-medium flex gap-2">
                        <span className="text-indigo-400 shrink-0">•</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  onClick={() => handleGoTo(item)}
                  className="flex items-center gap-2 text-xs font-black uppercase tracking-wide text-indigo-600 hover:text-indigo-800 transition-colors pt-1"
                >
                  Aller à cette section <ArrowRight size={14} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-neutral/40 backdrop-blur-sm z-[70]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[71] w-full sm:w-[26rem] bg-base-200 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-base-100 border-b border-base-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <HelpCircle size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black tracking-tighter text-base-content">Centre d'aide</h2>
                    <p className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">Comment ça marche</p>
                  </div>
                </div>
                <button onClick={onClose} className="p-2 text-base-content/40 hover:text-base-content hover:bg-base-200 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" size={16} />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Chercher une fonctionnalité..."
                  className="w-full pl-11 pr-10 py-3 bg-base-200 border border-base-200 rounded-2xl text-sm font-medium placeholder:text-base-content/40 focus:bg-base-100 focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all outline-none"
                />
                {query && (
                  <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-base-300 rounded-md text-base-content/40">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {results !== null ? (
                results.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40">
                      {results.length} résultat{results.length > 1 ? "s" : ""}
                    </p>
                    {results.map(renderItem)}
                  </div>
                ) : (
                  <p className="text-sm text-base-content/50 font-medium text-center py-10">
                    Aucune fonctionnalité ne correspond à "{query}".
                  </p>
                )
              ) : (
                ADMIN_HELP_SECTIONS.map((section) => (
                  <div key={section.menu} className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1">{section.menu}</p>
                    <div className="space-y-3">
                      {section.items.map((item) => renderItem({ menu: section.menu, ...item }))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
