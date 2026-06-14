import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Trash2, Mail, ExternalLink, ShieldAlert } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-base-100 py-24 px-6 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="space-y-6 text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-base-200 border border-base-200 text-base-content/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4"
          >
            <ShieldCheck size={16} className="text-primary" /> Conformité & Sécurité
          </motion.div>
          <h1 className="text-4xl md:text-7xl font-black text-base-content tracking-tighter leading-[0.9]">
            Politique de <span className="text-primary">Confidentialité</span>.
          </h1>
          <p className="text-base-content/50 font-bold text-lg max-w-2xl mx-auto leading-relaxed">
            Votre vie privée est notre priorité absolue. Nous nous engageons à protéger vos données personnelles et à vous donner un contrôle total sur vos informations.
          </p>
        </div>

        {/* User Data Deletion Instructions - SPECIFIC FOR META COMPLIANCE */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-neutral rounded-[3rem] p-10 md:p-16 text-white shadow-2xl overflow-hidden mb-16"
        >
          {/* Abstract Design Element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full pointer-events-none"></div>
          
          <div className="relative z-10 space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-10">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-primary/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center text-primary border border-primary/30 rotate-3">
                  <Trash2 size={36} />
                </div>
                <div>
                  <h2 id="data-deletion" className="text-3xl font-black tracking-tight mb-2">Suppression des données</h2>
                  <p className="text-primary font-black uppercase tracking-widest text-[10px]">Meta Platform Compliance</p>
                </div>
              </div>
              <div className="px-6 py-2 bg-base-100/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-white/40">
                Data Deletion Policy
              </div>
            </div>

            <div className="space-y-8 font-medium text-white/70 leading-relaxed text-lg">
              <p>
                Conformément aux politiques de Meta (Facebook) et au Règlement Général sur la Protection des Données (RGPD), nous offrons un moyen simple et transparent de supprimer vos données personnelles de nos systèmes.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="p-8 bg-base-100/5 border border-white/10 rounded-[2.5rem] space-y-4 hover:bg-base-200/10 transition-colors">
                  <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white mb-2">
                    <Lock size={20} />
                  </div>
                  <h3 className="font-black text-white text-base tracking-tight uppercase tracking-widest">Via l'Application</h3>
                  <p className="text-sm">Connectez-vous à votre compte Vtout, allez dans <strong>Profil {'>'} Paramètres {'>'} Sécurité</strong> et cliquez sur "Supprimer mon compte". Toutes vos données seront effacées sous 24h.</p>
                </div>

                <div className="p-8 bg-base-100/5 border border-white/10 rounded-[2.5rem] space-y-4 hover:bg-base-200/10 transition-colors">
                  <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mb-2">
                    <Mail size={20} />
                  </div>
                  <h3 className="font-black text-white text-base tracking-tight uppercase tracking-widest">Par E-mail</h3>
                  <p className="text-sm">Envoyez une demande à <strong>support@vtout.com</strong> avec l'objet "Suppression de données". Notre équipe traitera votre demande manuellement sous 48h.</p>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-3xl p-8 flex items-start gap-4">
                <ShieldAlert className="text-amber-500 shrink-0" size={24} />
                <p className="text-sm text-amber-200/80 italic">
                  <strong>Note importante :</strong> La suppression de votre compte est irréversible. Toutes vos commandes passées, factures et avantages fidélité seront définitivement supprimés.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* General Privacy Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12 border-t border-base-200">
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-base-content tracking-tight">Utilisation des Cookies</h3>
            <p className="text-base-content/50 font-medium leading-relaxed">
              Nous utilisons des cookies pour améliorer votre expérience de navigation, analyser le trafic du site et personnaliser les publicités. En continuant à utiliser notre site, vous acceptez notre utilisation des cookies.
            </p>
          </div>
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-base-content tracking-tight">Sécurité des Paiements</h3>
            <p className="text-base-content/50 font-medium leading-relaxed">
              Toutes les transactions sur Vtout sont sécurisées et cryptées via SSL. Nous ne stockons jamais vos informations bancaires complètes sur nos serveurs.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-24 text-center">
          <p className="text-[10px] font-black text-base-content/40 uppercase tracking-[0.3em] mb-6">Besoin d'aide supplémentaire ?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => window.location.href = 'mailto:privacy@vtout.com'}
              className="px-10 py-5 bg-neutral text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary transition-all flex items-center gap-3"
            >
              Contact DPO <ExternalLink size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
