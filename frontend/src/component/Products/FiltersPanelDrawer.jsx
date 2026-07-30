import React, { useState } from "react";
import FiltersPanel from "./FiltersPanel";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FiltersPanelDrawer({ onFilterChange, mobileOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Sidebar Desktop (inchangée) */}
      {!mobileOnly && (
        <div className="hidden lg:block w-80 shrink-0">
          <div className="bg-base-100 rounded-[2.5rem] border border-base-200 p-8 shadow-xl shadow-slate-200/40 sticky top-36">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-[-20%] -translate-y-[20%] blur-3xl pointer-events-none" />
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-base-200 relative">
              <div className="w-12 h-12 bg-neutral rounded-2xl flex items-center justify-center text-primary shadow-xl shadow-slate-900/20">
                <SlidersHorizontal size={22} className="stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-base-content">Filtres</h3>
                <p className="text-[10px] font-black text-base-content/40 uppercase tracking-widest mt-1">Personnalisation</p>
              </div>
            </div>
            <FiltersPanel onFilterChange={onFilterChange} />
          </div>
        </div>
      )}

      {/* BOUTON MOBILE : FIXE EN HAUT À GAUCHE */}
      <div className="lg:hidden fixed top-6 left-6 z-[999]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-3 bg-primary text-white rounded-full h-14 px-6 shadow-2xl shadow-primary/40 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Filter size={20} className="stroke-[2.5]" />
          <span className="font-black text-sm uppercase tracking-widest">Filtres</span>
        </button>
      </div>

      {/* DRAWER MOBILE : z-index encore plus élevé */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[999] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className=" inset-0 bg-neutral/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Drawer content */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute bottom-10 left-0 right-0 bg-base-100 rounded-t-[2.5rem] shadow-2xl max-h-[90vh] flex flex-col"
            >
              {/* Handle */}
              <div className="w-16 h-1.5 bg-base-300 rounded-full mx-auto mt-3 shrink-0" />

              {/* Header compact */}
              <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-200 rounded-xl flex items-center justify-center text-base-content">
                    <SlidersHorizontal size={20} className="stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-base-content tracking-tight">Filtres</h2>
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">Affinez votre recherche</p>
                  </div>
                </div>
                <button
                  className="w-10 h-10 bg-base-200 text-base-content/40 rounded-xl flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Contenu scrollable */}
              <div className="flex-1 overflow-y-auto px-5 py-4 pb-28 custom-scrollbar">
                <FiltersPanel onFilterChange={onFilterChange} />
              </div>

              {/* Footer fixe avec bouton d'application */}
              <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-t border-base-200 px-5 py-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-white h-14 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3 z-[9999] relative"
                >
                  <SlidersHorizontal size={18} />
                  Appliquer les filtres
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}