import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, ShieldCheck, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL;

const parseStructuredContent = (content) => {
  if (!content) return [];

  // Normalize: insert newlines before numbered sections and "Article X"
  // even when the DB content is stored as one long blob without line breaks
  const normalized = content
    .replace(/([^\n])\s+(\d{1,2}[\.\)]\s+[A-ZÀÂÄÈÉÊËÎÏÔÙÛÜ])/g, '$1\n$2')
    .replace(/([^\n])\s+(Article\s+\d+)/gi, '$1\n$2');

  const lines = normalized.split('\n');
  const sections = [];
  let current = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const headerMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)/);
    const articleMatch = trimmed.match(/^(Article\s+\d+\s*[:\-–]?\s*.+)/i);

    if (headerMatch || articleMatch) {
      if (current) sections.push(current);
      current = {
        number: headerMatch ? headerMatch[1] : null,
        title: headerMatch ? headerMatch[2] : articleMatch[1],
        paragraphs: [],
      };
    } else {
      if (!current) current = { number: null, title: null, paragraphs: [] };
      // Split long intro blobs into readable chunks (~180 chars each)
      const raw = trimmed;
      if (raw.length > 250) {
        const chunks = raw.match(/.{1,200}(?:\s|$)/g) || [raw];
        chunks.forEach(c => { if (c.trim()) current.paragraphs.push(c.trim()); });
      } else {
        current.paragraphs.push(raw);
      }
    }
  }
  if (current) sections.push(current);
  return sections;
};

function PolicyCard({ policy, idx }) {
  const [open, setOpen] = useState(idx === 0);
  const sections = parseStructuredContent(policy.content);
  const hasStructure = sections.some(s => s.number !== null || s.title !== null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.08 }}
      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Header — always visible */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-7 py-6 hover:bg-slate-50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-lg font-black tracking-tight text-slate-800">{policy.title}</h3>
        </div>
        {open
          ? <ChevronUp size={18} className="text-slate-400 shrink-0" />
          : <ChevronDown size={18} className="text-slate-400 shrink-0" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-7 pb-7 space-y-5 border-t border-slate-100 pt-6">
              {sections.map((sec, i) => {
                const isIntro = !sec.number && !sec.title;
                return (
                  <div key={i} className={isIntro ? '' : 'rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-2'}>
                    {/* Numbered / titled header */}
                    {!isIntro && (
                      <div className="flex items-start gap-3">
                        {sec.number && (
                          <span className="shrink-0 w-7 h-7 rounded-lg bg-amber-500 text-white text-xs font-black flex items-center justify-center mt-0.5">
                            {sec.number}
                          </span>
                        )}
                        {sec.title && (
                          <h4 className="font-black text-slate-800 text-sm leading-snug pt-0.5">{sec.title}</h4>
                        )}
                      </div>
                    )}
                    {/* Paragraphs */}
                    <div className={`space-y-2 ${!isIntro && sec.number ? 'pl-10' : ''}`}>
                      {sec.paragraphs.map((p, j) => (
                        <p key={j} className={`text-sm leading-relaxed font-medium ${isIntro ? 'text-slate-500 italic' : 'text-slate-600'}`}>{p}</p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Footer */}
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 pt-4 border-t border-slate-100">
                <Clock size={11} />
                Mise à jour : {new Date(policy.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const DeliveryPolicies = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/policies/type/delivery`)
      .then(res => setPolicies(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page header */}
      <div className="bg-white border-b border-slate-100 px-6 md:px-12 py-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center">
              <FileText size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">Vtout · Partenaires</p>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none mt-0.5">
                Conditions Livreurs
              </h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 font-medium max-w-xl leading-relaxed">
            Règlements et bonnes pratiques pour tous les partenaires livreurs utilisant la plateforme logistique Vtout.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10 space-y-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 h-24 animate-pulse" />
          ))
        ) : policies.length === 0 ? (
          <div className="bg-white rounded-[2rem] border border-slate-100 py-20 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
              <ShieldCheck size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400">Aucun document publié pour l'instant.</p>
          </div>
        ) : (
          policies.map((p, idx) => <PolicyCard key={p.id} policy={p} idx={idx} />)
        )}
      </div>
    </div>
  );
};

export default DeliveryPolicies;
