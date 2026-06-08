import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ShoppingBag, ArrowLeft, Search, Flame, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  { label: 'Boutique', icon: <ShoppingBag size={14} />, link: '/products-liste' },
  { label: 'Promotions', icon: <Flame size={14} />, link: '/promotions' },
  { label: 'Comment ça marche', icon: <HelpCircle size={14} />, link: '/comment-ca-marche/acheteur' },
];

export default function NotFoundPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/products-liste?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-base-100 flex items-center justify-center px-6 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]" style={{ background: 'rgba(243,112,33,0.06)' }} />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full blur-[100px]" style={{ background: 'rgba(0,84,166,0.06)' }} />
      </div>

      <div className="relative z-10 text-center max-w-xl mx-auto space-y-10">
        {/* 404 number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', bounce: 0.4 }}
        >
          <span
            className="text-[10rem] md:text-[14rem] font-black tracking-tighter leading-none select-none"
            style={{
              background: 'linear-gradient(135deg, #f37021 0%, #0054a6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            404
          </span>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-base-content">
            Page introuvable
          </h1>
          <p className="text-base-content/50 font-medium text-base max-w-sm mx-auto">
            Cette page n'existe pas ou a été déplacée. Essayez une recherche.
          </p>
        </motion.div>

        {/* Search */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onSubmit={handleSearch}
          className="flex items-center gap-3 bg-base-200/60 border border-base-300/50 rounded-2xl px-5 py-3 shadow-inner"
        >
          <Search size={18} className="text-base-content/30 flex-shrink-0" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-base-content placeholder:text-base-content/30"
            autoFocus
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest text-white transition-all active:scale-95"
            style={{ background: '#f37021' }}
          >
            Go
          </button>
        </motion.form>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {SUGGESTIONS.map(s => (
            <button
              key={s.link}
              onClick={() => navigate(s.link)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs text-base-content/60 border border-base-content/10 hover:bg-base-200 hover:text-base-content transition-all"
            >
              {s.icon} {s.label}
            </button>
          ))}
        </motion.div>

        {/* Nav buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-base-content/60 border border-base-content/10 hover:bg-base-200 transition-all"
          >
            <ArrowLeft size={16} /> Retour
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl font-black text-sm text-white shadow-lg transition-all active:scale-95 hover:brightness-110"
            style={{ background: '#f37021', boxShadow: '0 8px 24px rgba(243,112,33,0.25)' }}
          >
            <Home size={16} /> Accueil
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-[10px] font-black uppercase tracking-[0.3em] text-base-content/20"
        >
          Vtout — On vend tout
        </motion.p>
      </div>
    </div>
  );
}
