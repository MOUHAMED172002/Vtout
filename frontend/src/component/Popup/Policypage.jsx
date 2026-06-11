import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Truck, RotateCcw, Lock, FileText, ChevronRight, HelpCircle } from "lucide-react";
import { getPolicies } from "../../services/contentService";

const POLICY_ICONS = {
  "default": FileText,
  "Retours": RotateCcw,
  "Livraison": Truck,
  "Confidentialité": Lock,
  "Conditions": FileText,
  "Sécurité": ShieldCheck
};

export default function PolicyPage() {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await getPolicies();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (policies.length > 0) {
      const searchParams = new URLSearchParams(location.search);
      const tabParam = searchParams.get('tab');
      
      if (tabParam) {
        const matchingPolicy = policies.find(p => p.title.toLowerCase().includes(tabParam.toLowerCase()));
        if (matchingPolicy) {
          setActiveTab(matchingPolicy.id);
        } else if (!activeTab) {
          setActiveTab(policies[0].id);
        }
      } else if (!activeTab) {
        setActiveTab(policies[0].id);
      }
    }
  }, [location.search, policies]);

  const activePolicy = policies.find(p => p.id === activeTab);

  const getIcon = (title) => {
    for (const key in POLICY_ICONS) {
      if (title.includes(key)) return POLICY_ICONS[key];
    }
    return POLICY_ICONS.default;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-base-100">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 py-20 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em]"
          >
            <ShieldCheck size={16} /> Engagement & Sécurité
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-base-content tracking-tighter leading-[1.1]">
            Nos <span className="text-primary">Politiques</span> & <br />Conditions d'utilisation.
          </h1>
          <p className="text-base-content/50 font-bold max-w-2xl text-lg">
            Transparence et confiance sont les piliers de notre relation. Découvrez comment nous gérons vos commandes, vos données et vos retours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-4 space-y-3">
            {policies.map((p) => {
              const Icon = getIcon(p.title);
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    setActiveTab(p.id);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-full flex items-center justify-between p-6 rounded-[2rem] transition-all group ${activeTab === p.id ? 'bg-neutral text-white shadow-2xl shadow-slate-900/20 scale-[1.02]' : 'bg-base-200 text-base-content/40 hover:bg-base-200'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === p.id ? 'bg-primary text-white' : 'bg-base-100 text-base-content/30 shadow-sm'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest text-left">{p.title}</span>
                  </div>
                  <ChevronRight size={18} className={`transition-transform ${activeTab === p.id ? 'translate-x-1' : 'opacity-0'}`} />
                </button>
              );
            })}

            {/* Support Box */}
            <div className="mt-8 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10 space-y-4">
              <h4 className="font-black text-base-content text-sm uppercase tracking-widest">Une question spécifique ?</h4>
              <p className="text-xs text-base-content/50 font-medium leading-relaxed">Si une clause vous semble obscure, notre service client est à votre disposition.</p>
              <button
                onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                className="w-full py-4 bg-base-100 border border-primary text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
              >
                Nous écrire
              </button>
            </div>
          </div>

          {/* Policy Detail Content */}
          <div className="lg:col-span-8">
            {activePolicy ? (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-base-200 rounded-[3.5rem] p-10 md:p-16 border border-white shadow-inner relative overflow-hidden"
              >
                <div className="relative z-10 space-y-8">
                  <div className="flex items-center gap-6">
                    <div className={`w-16 h-16 bg-primary rounded-[1.8rem] flex items-center justify-center text-white shadow-xl rotate-3`}>
                      {React.createElement(getIcon(activePolicy.title), { size: 28 })}
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black text-base-content tracking-tight leading-tight">{activePolicy.title}</h2>
                      <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">Dernière mise à jour : Février 2026</p>
                    </div>
                  </div>

                  <div className="prose prose-lg max-w-none">
                    <p className="text-base-content/70 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                      {activePolicy.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-20 text-center text-base-content/40 font-bold">
                Sélectionnez une politique pour afficher le contenu.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
