import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { getCategories } from '../../services/productService';

export default function Category2() {
  const [allCategories, setAllCategories] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const data = await getCategories();
        setAllCategories(data || []);
      } catch (err) {
        console.error(err);
        setAllCategories([]);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  // Level-1 (racines) → affichées comme cartes (27 cartes, pas 211)
  const parents = allCategories.filter(c => !c.parent_id);
  const childrenByParent = allCategories.reduce((acc, c) => {
    if (c.parent_id) {
      acc[c.parent_id] = acc[c.parent_id] || [];
      acc[c.parent_id].push(c);
    }
    return acc;
  }, {});

  const toggle = (id) => setExpanded(prev => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="container my-24 flex justify-center items-center h-64 mx-auto">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-base-200 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200/50 min-h-screen pb-20">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl pt-24">
        {/* Refined Header */}
        <div className="mb-16 space-y-4 px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full"
          >
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Catalogue Complet</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-base-content tracking-tight"
          >
            Toutes Nos <span className="text-base-content/30 italic font-serif font-light">Catégories.</span>
          </motion.h1>
          <p className="text-base-content/50 font-bold text-sm max-w-lg mx-auto leading-relaxed">
            Parcourez l'intégralité de notre univers et trouvez l'inspiration parmi nos nombreuses collections spécialisées.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {parents.map((cat, index) => {
            const isEmoji = /\p{Emoji}/u.test(cat.icon);
            const Icon = !isEmoji && LucideIcons[cat.icon] ? LucideIcons[cat.icon] : LucideIcons.Package;
            const children = childrenByParent[cat.id] || [];
            const isOpen = expanded === cat.id;

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="group"
              >
                <div className={`bg-base-100 rounded-[2.5rem] border border-base-200 shadow-sm transition-all duration-500 overflow-hidden ${isOpen ? 'shadow-2xl shadow-primary/10 ring-1 ring-primary/20' : 'hover:shadow-xl hover:shadow-slate-200/50'}`}>
                  <button
                    onClick={() => toggle(cat.id)}
                    className="w-full text-left flex items-center gap-5 p-8 group/btn"
                    style={{ touchAction: 'manipulation' }}
                    aria-expanded={isOpen}
                  >
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl transition-all duration-500 shadow-inner ${isOpen ? 'bg-primary text-white scale-110 -rotate-6' : 'bg-base-200 text-white group-hover/btn:bg-primary/10 group-hover/btn:scale-105'}`}>
                      {isEmoji ? (
                        <span className={isOpen ? 'drop-shadow-md' : ''}>{cat.icon}</span>
                      ) : (
                        <Icon size={30} className={isOpen ? 'text-base-content' : 'text-base-content/80 group-hover/btn:text-primary'} />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className={`text-xl font-black tracking-tight transition-colors duration-300 ${isOpen ? 'text-primary' : 'text-base-content'}`}>
                        {cat.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">
                          {children.length} {children.length > 1 ? 'Sous-catégories' : 'Sous-catégorie'}
                        </span>
                      </div>
                    </div>

                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-base-200 text-base-content/40 group-hover/btn:bg-neutral group-hover/btn:text-white'}`}>
                      <LucideIcons.ChevronDown size={18} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                      >
                        <div className="px-8 pb-10">
                          <div className="h-[1px] bg-base-200 mb-8" />

                          {children.length === 0 ? (
                            <button
                              onClick={() => navigate(`/products-liste?category_id=${cat.id}`)}
                              style={{ touchAction: 'manipulation' }}
                              className="w-full py-4 bg-neutral text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-primary transition-all shadow-lg shadow-slate-200"
                            >
                              Explorer la Collection
                            </button>
                          ) : (
                            <div className="grid grid-cols-1 gap-3">
                              {children.map((sub) => {
                                const isSubEmoji = /\p{Emoji}/u.test(sub.icon);
                                const IconSub = !isSubEmoji && LucideIcons[sub.icon] ? LucideIcons[sub.icon] : LucideIcons.CornerDownRight;
                                return (
                                  <button
                                    key={sub.id}
                                    onClick={() => navigate(`/products-liste?category_id=${sub.id}`)}
                                    style={{ touchAction: 'manipulation' }}
                                    className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-base-200 hover:bg-base-200 transition-all text-left group/sub"
                                  >
                                    <div className="w-10 h-10 rounded-xl bg-base-100 border border-base-200 flex items-center justify-center text-lg shadow-sm group-hover/sub:border-primary/20 group-hover/sub:text-primary transition-all">
                                      {isSubEmoji ? <span>{sub.icon}</span> : <IconSub size={16} />}
                                    </div>
                                    <span className='text-sm font-bold text-base-content/70 group-hover/sub:text-primary group-hover/sub:translate-x-1 transition-all'>
                                      {sub.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,300&display=swap');
        .font-serif { font-family: 'Playfair Display', serif; }
      `}</style>
    </div>
  );
}