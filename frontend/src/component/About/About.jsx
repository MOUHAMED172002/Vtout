import React from "react";
import { Star, ShieldCheck, Truck, MessageCircle, Heart, Users, Target, Rocket } from "lucide-react";
import { motion } from "framer-motion";

export default function About({
  title = "Notre Histoire",
  tagline = "L'excellence au service de votre style.",
  mission = "Depuis notre création, notre mission est de démocratiser le luxe et la qualité premium. Nous sélectionnons chaque pièce avec une rigueur absolue pour vous offrir uniquement le meilleur du marché.",
  stats = [
    { label: "Clients Heureux", value: "12k+", icon: <Heart className="text-red-400" size={20} /> },
    { label: "Articles Premium", value: "1.2k", icon: <Star className="text-amber-400" size={20} /> },
    { label: "Villes Desservies", value: "300+", icon: <Truck className="text-primary" size={20} /> }
  ],
  team = [
    { name: "Amina Diallo", role: "Visionnaire & Fondatrice", avatar: "https://ui-avatars.com/api/?name=Amina+Diallo&background=f97316&color=fff" },
    { name: "Karim Soglo", role: "Directeur de Collection", avatar: "https://ui-avatars.com/api/?name=Karim+Soglo&background=0f172a&color=fff" },
    { name: "Sara Mensah", role: "Expérience Client", avatar: "https://ui-avatars.com/api/?name=Sara+Mensah&background=10b981&color=fff" }
  ]
}) {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">À Propos de nous</span>
              </div>
              <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                {title.split(' ')[0]} <br />
                <span className="text-slate-300">{title.split(' ').slice(1).join(' ')}</span>
              </h1>
              <p className="text-2xl font-bold text-slate-400 max-w-lg">{tagline}</p>
              <p className="text-lg text-slate-500 leading-relaxed max-w-xl font-medium">
                {mission}
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="btn btn-primary rounded-2xl px-10 h-16 font-black text-lg shadow-xl shadow-primary/20">Explorer la collection</button>
                <button
                  onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                  className="btn btn-ghost rounded-2xl px-10 h-16 font-black text-lg border-2 border-slate-100"
                >
                  Contactez-nous
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 flex items-center gap-8 group hover:bg-white hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500"
                >
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-500">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
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
                onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                className="btn bg-white text-primary border-none rounded-2xl px-12 h-16 font-black text-xl hover:bg-slate-50 shadow-xl"
              >
                Commencer mon shopping
              </button>
              <button
                onClick={() => window.dispatchEvent(new Event('open-support-chat'))}
                className="btn btn-ghost text-slate-900 rounded-2xl px-12 h-16 font-black text-xl border-2 border-white/30"
              >
                Voir nos avis
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}