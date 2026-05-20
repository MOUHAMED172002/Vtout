import React from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../component/Navbar/Navbar";
import Footer from "../../component/Footer/Footer";
import { motion } from "framer-motion";
import { Flame, Package, Zap, ArrowRight } from "lucide-react";
import { useTheme } from "../../component/context/ThemeContext";

export default function PromotionsHub() {
  const navigate = useNavigate();
  const { theme } = useTheme();

  const darkThemes = ["dark", "synthwave", "cyberpunk", "luxury", "dracula"];
  const isDark = darkThemes.includes(theme);

  const promos = [
    {
      id: "flash",
      title: "Ventes Flash",
      subtitle: "Offres limitées dans le temps",
      desc: "Des réductions massives valables seulement pour quelques heures. Faites vite !",
      icon: <Flame size={40} className="text-rose-500" />,
      color: "from-rose-500 to-orange-500",
      bgClass: isDark ? "bg-rose-950/20 border-rose-900/50" : "bg-rose-50 border-rose-100",
      link: "/promotions/flash"
    },
    {
      id: "gros",
      title: "Remises de Gros",
      subtitle: "Plus vous achetez, moins vous payez",
      desc: "Prix dégressifs automatiquement appliqués sur vos achats en quantité.",
      icon: <Zap size={40} className="text-amber-500" />,
      color: "from-amber-500 to-yellow-500",
      bgClass: isDark ? "bg-amber-950/20 border-amber-900/50" : "bg-amber-50 border-amber-100",
      link: "/promotions/quantite"
    },
    {
      id: "kits",
      title: "Packs & Kits",
      subtitle: "Combos intelligents à prix réduit",
      desc: "Achetez des ensembles d'articles complémentaires et économisez gros.",
      icon: <Package size={40} className="text-emerald-500" />,
      color: "from-emerald-500 to-teal-500",
      bgClass: isDark ? "bg-emerald-950/20 border-emerald-900/50" : "bg-emerald-50 border-emerald-100",
      link: "/promotions/kits"
    }
  ];

  return (
    <>
      <Navbar />
      <div className={`min-h-screen pt-32 pb-24 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
        <div className="container mx-auto px-4 max-w-6xl">
          
          <div className="text-center space-y-4 mb-16">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-[0.2em]"
            >
              Bons Plans
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black tracking-tighter"
            >
              Nos <span className="text-primary italic font-serif">Promotions.</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`max-w-2xl mx-auto font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
            >
              Découvrez toutes les façons d'économiser sur Vtout. Choisissez l'offre qui correspond le mieux à vos besoins actuels.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {promos.map((promo, idx) => (
              <motion.div
                key={promo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 + 0.3 }}
                onClick={() => navigate(promo.link)}
                className={`group cursor-pointer rounded-[2.5rem] p-8 border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl relative overflow-hidden flex flex-col items-center text-center ${promo.bgClass} ${isDark ? 'hover:shadow-black/50' : 'hover:shadow-slate-200'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${promo.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300">
                  {promo.icon}
                </div>
                
                <h3 className="text-2xl font-black mb-2">{promo.title}</h3>
                <h4 className={`text-sm font-bold uppercase tracking-wider mb-4 ${promo.color.split(' ')[0].replace('from-', 'text-')}`}>
                  {promo.subtitle}
                </h4>
                <p className={`text-sm leading-relaxed mb-8 flex-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {promo.desc}
                </p>

                <div className="w-full mt-auto">
                  <div className={`flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-black text-sm uppercase tracking-widest transition-all bg-white shadow-sm border group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 ${isDark ? 'text-slate-800' : 'text-slate-800'}`}>
                    Explorer <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
