import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Package, Truck, CreditCard, RotateCcw, ShieldCheck, MessageCircle } from "lucide-react";
import { getFaqs } from "../../services/contentService";

const CATEGORY_ICONS = {
  "default": HelpCircle,
  "Commandes": Package,
  "Livraison": Truck,
  "Paiement": CreditCard,
  "Retours": RotateCcw,
  "Garantie": ShieldCheck,
  "Support": MessageCircle
};

export default function FaqList() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getFaqs();
      setFaqs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em]"
          >
            <HelpCircle size={14} /> Centre d'assistance
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-[1.1]">
            Comment pouvons-nous <br /> vous <span className="text-primary italic">aider ?</span>
          </h1>
          <p className="text-slate-500 font-bold max-w-xl mx-auto">
            Retrouvez ici les réponses aux questions les plus fréquentes.
          </p>
        </div>

        {/* Questions List */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
          {loading ? (
            <div className="py-20 flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Récupération des réponses...</p>
            </div>
          ) : faqs.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-slate-400 font-bold">Aucune question trouvée.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {faqs.map((item, idx) => (
                <div
                  key={item.id}
                  className={`rounded-2xl border transition-all ${openIndex === idx ? 'border-primary bg-primary/5' : 'border-slate-50 bg-slate-50/30'}`}
                >
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left px-8 py-6 flex items-center justify-between group"
                  >
                    <span className={`font-black text-sm md:text-base tracking-tight ${openIndex === idx ? 'text-primary' : 'text-slate-800'}`}>
                      {item.question}
                    </span>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${openIndex === idx ? 'bg-primary text-white rotate-180' : 'bg-white text-slate-300 group-hover:text-slate-900 shadow-sm'}`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  <AnimatePresence>
                    {openIndex === idx && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-8 pb-8 text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-center space-y-8 relative overflow-hidden">
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">Vous avez toujours des questions ?</h3>
            <p className="text-slate-400 font-bold max-w-md mx-auto">Notre service client est disponible pour répondre à tous vos besoins spécifiques.</p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button
                onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                className="px-8 py-5 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:brightness-110 transition-all shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                <MessageCircle size={16} /> Nous contacter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
