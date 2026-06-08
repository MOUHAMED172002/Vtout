import React from "react";
import { Star, ShieldCheck, Truck, MessageCircle, Heart, Users, Target, Rocket, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
export default function About() {
  const navigate = useNavigate();
  const [team, setTeam] = React.useState([
  ]);
  const [stats, setStats] = React.useState([
    { label: "Clients Heureux", value: "12k+", icon: <Heart className="text-red-400" size={20} /> },
    { label: "Articles Premium", value: "1.2k", icon: <Star className="text-amber-400" size={20} /> },
    { label: "Villes Desservies", value: "300+", icon: <Truck className="text-primary" size={20} /> }
  ]);
  const [title, setTitle] = React.useState("Notre Histoire");
  const [tagline, setTagline] = React.useState("L'excellence au service de votre style.");
  const [mission, setMission] = React.useState("Depuis notre création, notre mission est de démocratiser le luxe et la qualité premium. Nous sélectionnons chaque pièce avec une rigueur absolue pour vous offrir uniquement le meilleur du marché.");
  const [showFullHistory, setShowFullHistory] = React.useState(false);

  React.useEffect(() => {
    const fetchAboutConfig = async () => {
      try {
        const { data } = await api.get('/configs/public');
        const teamConfig = data.find(c => c.key === 'about_team');
        if (teamConfig && teamConfig.value) {
          setTeam(JSON.parse(teamConfig.value));
        }
        const titleConfig = data.find(c => c.key === 'about_title');
        if (titleConfig) setTitle(titleConfig.value);

        const taglineConfig = data.find(c => c.key === 'about_tagline');
        if (taglineConfig) setTagline(taglineConfig.value);

        const missionConfig = data.find(c => c.key === 'about_mission');
        if (missionConfig) setMission(missionConfig.value);

        const statsConfig = data.find(c => c.key === 'about_stats');
        if (statsConfig && statsConfig.value) {
          const parsedStats = JSON.parse(statsConfig.value);
          // Re-attach icons based on index or key if needed, or just keep default icons
          setStats(prev => parsedStats.map((s, i) => ({ ...s, icon: prev[i]?.icon })));
        }
      } catch (error) {
        console.error("Erreur chargement config About:", error);
      }
    };
    fetchAboutConfig();
  }, []);
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section - Redesigned for Long Content */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-100 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-40"></div>

        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="flex flex-col gap-16 md:gap-24">
            
            {/* 1. Brand Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 border-b border-slate-100 pb-16">
              <div className="space-y-6 lg:max-w-3xl">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                  <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">À Propos de nous</span>
                </div>
                <h1 className="text-7xl md:text-[10rem] font-black text-slate-900 tracking-tighter leading-[0.85]">
                  {title.split(' ')[0]} <br />
                  <span className="text-slate-200">{title.split(' ').slice(1).join(' ')}</span>
                </h1>
              </div>
              <div className="lg:max-w-md lg:text-right space-y-4">
                <p className="text-3xl md:text-4xl font-bold text-slate-400 leading-tight">
                  {tagline}
                </p>
              </div>
            </div>

            {/* 2. Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
              
              {/* Long Story Column */}
              <div className="lg:col-span-8 space-y-12">
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl md:text-2xl text-slate-500 leading-relaxed font-medium selection:bg-primary/10 whitespace-pre-wrap">
                    <span className="text-6xl font-black text-primary float-left mr-4 mt-2 h-12 flex items-center leading-none">"</span>
                    {mission.length > 250 ? (
                      <>
                        {mission.substring(0, 250)}...
                        <button 
                          onClick={() => setShowFullHistory(true)}
                          className="ml-2 text-primary font-black uppercase text-xs tracking-widest hover:underline inline-flex items-center gap-1"
                        >
                          Lire la suite <Rocket size={12} />
                        </button>
                      </>
                    ) : mission}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-6 pt-6">
                  <button onClick={() => navigate('/products-liste')} className="group relative overflow-hidden btn btn-primary rounded-2xl px-12 h-16 font-black text-lg shadow-2xl shadow-primary/30">
                    <span className="relative z-10">Explorer la collection</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                  </button>
                  <button
                    onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                    className="btn btn-ghost rounded-2xl px-12 h-16 font-black text-lg border-2 border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                  >
                    Contactez-nous
                  </button>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex items-center gap-6 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                      {React.cloneElement(stat.icon, { size: 24 })}
                    </div>
                    <div>
                      <p className="text-3xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-600 transition-colors">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="text-center space-y-4 mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter">Nos Valeurs Fondamentales</h2>
            <p className="text-slate-400 font-bold max-w-2xl mx-auto">Ce qui nous anime au quotidien pour vous offrir la meilleure expérience possible.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: <Target className="text-primary" size={32} />, title: "Sélection Rigoureuse", desc: "Chaque article passe par un processus de contrôle qualité strict avant d'être proposé." },
              { icon: <Rocket className="text-primary" size={32} />, title: "Innovation Continue", desc: "Nous cherchons sans cesse à améliorer nos services et processus de livraison." },
              { icon: <ShieldCheck className="text-primary" size={32} />, title: "Transparence Totale", desc: "Pas de frais cachés, pas de surprises. Juste de la qualité et du service." }
            ].map((value, i) => (
              <div key={i} className="p-12 rounded-[3rem] bg-slate-800/50 border border-slate-700 hover:border-primary/50 transition-all group">
                <div className="mb-8 w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {value.icon}
                </div>
                <h3 className="text-2xl font-black mb-4 tracking-tight">{value.title}</h3>
                <p className="text-slate-400 font-bold leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900">L'Équipe <span className="text-slate-300">derrière tout ça</span></h2>
              <p className="text-slate-500 font-bold max-w-xl">Des passionnés qui travaillent d'arrache-pied pour rendre votre expérience inoubliable.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {team.map((member, i) => (
              <div key={i} className="group cursor-default">
                <div className="relative aspect-square rounded-[3rem] overflow-hidden bg-slate-100 mb-8 border-4 border-white shadow-2xl shadow-slate-200">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <h4 className="text-2xl font-black text-slate-900 tracking-tight">{member.name}</h4>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="max-w-[1400px] mx-auto px-6 md:px-12 pb-32">
        <div className="bg-primary rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-2xl shadow-primary/30">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 flex flex-col items-center text-center space-y-10">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter max-w-3xl leading-[1.1]">
              Rejoignez la révolution du commerce premium
            </h2>
            <div className="flex flex-wrap justify-center gap-6">
              <button
                onClick={() => navigate('/products-liste')}
                className="btn bg-white text-primary border-none rounded-2xl px-12 h-16 font-black text-xl hover:bg-slate-50 shadow-xl"
              >
                Commencer mon shopping
              </button>
              <button
                onClick={() => navigate('/temoignages')}
                className="btn btn-ghost text-slate-900 rounded-2xl px-12 h-16 font-black text-xl border-2 border-white/30"
              >
                Voir nos avis
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Full History Modal */}
      <AnimatePresence>
        {showFullHistory && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFullHistory(false)}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-xl"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-[3rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/20"
            >
              <div className="p-8 md:p-12 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="space-y-1">
                  <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter">L'Histoire de {title.split(' ')[0]}</h2>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{tagline}</p>
                </div>
                <button 
                  onClick={() => setShowFullHistory(false)} 
                  className="p-4 bg-white rounded-2xl hover:bg-slate-50 transition-all shadow-sm border border-slate-100 group"
                >
                  <X size={24} className="text-slate-400 group-hover:text-primary transition-colors" />
                </button>
              </div>
              <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                <div className="prose prose-slate max-w-none">
                  <p className="text-xl md:text-2xl text-slate-600 leading-[1.6] font-medium md:columns-2 gap-16 selection:bg-primary/10 first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-4 first-letter:float-left whitespace-pre-wrap">
                    {mission}
                  </p>
                </div>
              </div>
              <div className="p-8 border-t border-slate-100 bg-slate-50/30 flex justify-center">
                <button 
                  onClick={() => setShowFullHistory(false)}
                  className="btn btn-primary rounded-2xl px-12 h-14 font-black"
                >
                  Fermer la lecture
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}