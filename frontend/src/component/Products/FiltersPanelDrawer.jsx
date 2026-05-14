import React, { useState } from "react";
import FiltersPanel from "./FiltersPanel";
import { Filter, X, SlidersHorizontal, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FiltersPanelDrawer({ onFilterChange, mobileOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Desktop - Only shown when not in mobileOnly mode */}
      {!mobileOnly && (
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-200/40 sticky top-36">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-[-20%] -translate-y-[20%] blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-slate-50 relative">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-slate-900/20">
                <SlidersHorizontal size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900">Filtres</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Personnalisation</p>
              </div>
            </div>
            <FiltersPanel onFilterChange={onFilterChange} />
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile Only) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-0 right-0 px-6 z-[150] lg:hidden pointer-events-none"
          >
            <button
              onClick={() => setIsOpen(true)}
              className="w-full bg-slate-900 text-white rounded-[2rem] h-16 flex items-center justify-between px-8 shadow-2xl shadow-slate-900/30 hover:scale-[1.02] transition-transform pointer-events-auto group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <Filter size={20} className="stroke-[2.5]" />
                </div>
                <span className="font-black text-sm uppercase tracking-widest">Affiner la recherche</span>
              </div>
              <ChevronUp size={20} className="text-slate-500 group-hover:text-primary transition-colors" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Slide-over / Bottom Sheet Hybrid */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[250] lg:hidden">
            {/* Soft Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
              onClick={() => setIsOpen(false)}
            />

            {/* Content Drawer */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[3.5rem] shadow-2xl max-h-[92vh] flex flex-col border-t border-white"
            >
              {/* Handle Bar */}
              <div className="w-16 h-1.5 bg-slate-100 rounded-full mx-auto mt-4 shrink-0" />

              {/* Header */}
              <div className="px-6 py-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-slate-900 shadow-inner">
                    <SlidersHorizontal size={24} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Filtres Articulés.</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">Précision Absolute</p>
                  </div>
                </div>
                <button
                  className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100/50"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto px-6 pb-32 custom-scrollbar">
                <FiltersPanel onFilterChange={onFilterChange} />
              </div>

              {/* Sticky Action Footer */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-16 bg-gradient-to-t from-white via-white to-transparent pointer-events-none">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-white h-16 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary/30 hover:brightness-110 active:scale-95 transition-all pointer-events-auto flex items-center justify-center gap-3"
                >
                  Appliquer & Voir les résultats
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
