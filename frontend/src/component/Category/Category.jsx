import React, { useEffect, useState, useRef } from "react";
import { getCategories } from "../../services/productService";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";
import TourAnchor from "../../tour/TourAnchor";

export default function Category() {
  const [allCategories, setAllCategories] = useState([]);
  const [parents, setParents] = useState([]);
  const [activeParent, setActiveParent] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, id: null });

  const handleMouseMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      id
    });
  };

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setAllCategories(data || []);
        // Niveau-1 (racines) comme boutons du carousel — pas niveau-2
        const parentCats = (data || []).filter(c => !c.parent_id);
        setParents(parentCats);
        if (parentCats.length > 0) setActiveParent(parentCats[0]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const children = activeParent
    ? allCategories.filter(c => c.parent_id === activeParent.id)
    : [];

  if (loading) {
    return (
      <div className="container py-10 flex justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <TourAnchor id="tour-categories" className="container mt-16 mb-0 px-4 max-w-7xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.3em]"
          >
            <div className="w-8 h-[1px] bg-primary" /> Explorer nos Univers
          </motion.div>
          <h2 className="text-4xl font-black text-base-content tracking-tighter">
            Par <span className="text-base-content/30 italic font-serif">Catégories.</span>
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/promotions")}
            className="group flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-100 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
          >
            <LucideIcons.Flame className="group-hover:animate-bounce" size={14} /> Promotions
          </button>
          <button
            onClick={() => navigate("/categories")}
            className="group flex items-center gap-3 px-6 py-3 bg-base-200 border border-base-200 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-base-content/50 hover:bg-neutral hover:text-white transition-all shadow-sm"
          >
            Voir tout <LucideIcons.ArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
          </button>
        </div>
      </div>

      {/* Tier 1: Parent Carousel (Small Squares) */}
      <div className="relative group/carousel mb-10">
        <div className="flex overflow-x-auto gap-4 pb-6 no-scrollbar snap-x scroll-smooth">
          {/* Static Promotions Card */}
          <motion.button
            key="promo-static"
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/promotions')}
            className="flex-none w-24 h-24 md:w-28 md:h-28 rounded-3xl p-3 flex flex-col items-center justify-center gap-2 border transition-all duration-500 snap-start relative overflow-hidden group bg-gradient-to-br from-red-500 to-red-600 border-red-400 shadow-xl shadow-red-500/20 text-white"
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 pointer-events-none" />
            <div className="text-2xl md:text-3xl transition-transform duration-500 relative z-10 group-hover:scale-110">
              <LucideIcons.Flame size={28} className="text-white animate-pulse" />
            </div>
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-tight text-center line-clamp-1 px-1 relative z-10 text-white">
              Promotions
            </span>
          </motion.button>

          {parents.map((cat) => {
            const isEmoji = /\p{Emoji}/u.test(cat.icon);
            const Icon = !isEmoji && LucideIcons[cat.icon] ? LucideIcons[cat.icon] : LucideIcons.LayoutPanelTop;
            const isActive = activeParent?.id === cat.id;

            return (
              <motion.button
                key={cat.id}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onMouseMove={(e) => handleMouseMove(e, cat.id)}
                onClick={() => setActiveParent(cat)}
                style={{ touchAction: 'manipulation' }}
                className={`flex-none w-24 h-24 md:w-28 md:h-28 rounded-3xl p-3 flex flex-col items-center justify-center gap-2 border transition-all duration-500 snap-start relative overflow-hidden group ${isActive
                  ? 'bg-neutral border-neutral shadow-xl shadow-slate-200 text-white'
                  : 'bg-base-100 border-base-200 text-base-content/40 hover:border-primary/30 hover:bg-base-200'
                  }`}
              >
                {/* Effect 4: Spotlight Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: mousePos.id === cat.id ? `radial-gradient(circle 50px at ${mousePos.x}px ${mousePos.y}px, rgba(249, 115, 22, 0.15), transparent)` : ''
                  }}
                />

                <div className={`text-2xl md:text-3xl transition-transform duration-500 relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                  {isEmoji ? cat.icon : <Icon size={isActive ? 28 : 24} className={isActive ? 'text-base-content' : 'text-base-content/30'} />}
                </div>
                <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-tight text-center line-clamp-1 px-1 relative z-10 ${isActive ? 'text-white' : 'text-base-content/50'}`}>
                  {cat.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 w-8 h-1 bg-primary rounded-full z-10"
                  />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Scroll Indicators (Desktop) */}
        <div className="hidden md:flex absolute inset-y-0 -left-4 items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-base-100 shadow-lg flex items-center justify-center text-base-content/40 border border-base-200">
            <LucideIcons.ChevronLeft size={16} />
          </div>
        </div>
        <div className="hidden md:flex absolute inset-y-0 -right-4 items-center opacity-0 group-hover/carousel:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-base-100 shadow-lg flex items-center justify-center text-base-content/40 border border-base-200">
            <LucideIcons.ChevronRight size={16} />
          </div>
        </div>
      </div>

      {/* Tier 2: Children Display (Secondary Carousel) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeParent?.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {children.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {children.map((sub, idx) => {
                const isSubEmoji = /\p{Emoji}/u.test(sub.icon);
                const IconSub = !isSubEmoji && LucideIcons[sub.icon] ? LucideIcons[sub.icon] : LucideIcons.ArrowRightCircle;

                return (
                  <motion.button
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => {
                      window.fbq?.('track', 'ViewCategory', { content_category: sub.name, content_ids: [sub.id] });
                      navigate(`/products-liste?category_id=${sub.id}`);
                    }}
                    style={{ touchAction: 'manipulation' }}
                    className="flex-none min-w-[160px] md:min-w-[200px] bg-base-100 border border-base-200 rounded-2xl p-4 flex items-center gap-3 hover:bg-base-200 hover:border-primary/20 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center text-xl group-hover:bg-primary transition-all shadow-inner">
                      {isSubEmoji ? sub.icon : <IconSub size={18} className="text-base-content/40 group-hover:text-base-content" />}
                    </div>
                    <div className="text-left">
                      <p className="text-[11px] font-black text-base-content group-hover:text-primary transition-colors leading-tight">
                        {sub.name}
                      </p>
                      <span className="text-[8px] font-bold text-base-content/40 uppercase tracking-widest mt-1">Découvrir</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          ) : activeParent && (
            <div className="text-center py-6">
              <button
                onClick={() => {
                  window.fbq?.('track', 'ViewCategory', { content_category: activeParent.name, content_ids: [activeParent.id] });
                  navigate(`/products-liste?category_id=${activeParent.id}`);
                }}
                className="inline-flex items-center gap-4 px-8 py-4 bg-primary text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-neutral transition-all shadow-xl shadow-primary/20"
              >
                Explorer tout dans {activeParent.name} <LucideIcons.ArrowUpRight size={16} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,300&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </TourAnchor>
  );
}
