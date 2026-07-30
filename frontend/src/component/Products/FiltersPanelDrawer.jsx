import React, { useEffect, useState } from "react";
import FiltersPanel from "./FiltersPanel";
import { Filter, X, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FiltersPanelDrawer({ onFilterChange, mobileOnly = false }) {
  const [isOpen, setIsOpen] = useState(false);

  // Empêche le scroll de la page derrière le drawer quand il est ouvert
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = original; };
    }
  }, [isOpen]);

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

      {/* BOUTON MOBILE — repositionné en bas à droite, zone naturellement
          atteignable au pouce, avec marge de sécurité pour la barre de
          gestes iOS (env(safe-area-inset-bottom)) */}
      <div
        className="lg:hidden fixed right-5 z-[999]"
        style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
      >
        <motion.button
          onClick={() => setIsOpen(true)}
          whileTap={{ scale: 0.94 }}
          className="flex items-center gap-2.5 bg-primary text-white rounded-full h-14 pl-5 pr-6 shadow-2xl shadow-primary/40 active:scale-95 transition-transform duration-150"
        >
          <Filter size={18} className="stroke-[2.5]" />
          <span className="font-black text-xs uppercase tracking-widest">Filtres</span>
        </motion.button>
      </div>

      {/* DRAWER MOBILE */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-neutral/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Contenu du drawer — collé au bas de l'écran, hauteur bornée,
                colonne flex pour que le header et le footer restent visibles
                pendant que seul le corps scrolle */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t-[2.5rem] shadow-2xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Handle */}
              <div className="w-16 h-1.5 bg-base-300 rounded-full mx-auto mt-3 shrink-0" />

              {/* Header */}
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

              {/* Corps scrollable — seule cette zone défile, header et footer restent fixes */}
              <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
                <FiltersPanel onFilterChange={onFilterChange} />
              </div>

              {/* Footer — dans le flux flex (plus en absolute), donc jamais
                  chevauché par le contenu scrollable ; marge de sécurité iOS incluse */}
              <div
                className="shrink-0 bg-base-100/95 backdrop-blur-sm border-t border-base-200 px-5 pt-4"
                style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-primary text-white h-14 rounded-2xl font-black text-sm uppercase tracking-[0.15em] shadow-lg shadow-primary/30 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
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