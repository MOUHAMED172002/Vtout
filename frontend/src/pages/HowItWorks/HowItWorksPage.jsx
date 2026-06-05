import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppConfig } from '../../component/context/ConfigContext';
import {
  ShoppingBag, Search, CreditCard, Package, Star,
  Truck, MapPin, Bell, Navigation, UserCheck, Wallet,
  Store, Upload, Send, DollarSign, BarChart3,
  ArrowRight, ChevronRight
} from 'lucide-react';

const SUPPLIER_URL = import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com';

const userTypes = [
  {
    id: 'acheteur',
    label: 'Acheteur',
    emoji: '🛍️',
    description: "Découvrez comment acheter facilement sur Vtout",
    gradient: 'from-[#0054a6] to-[#1a73e8]',
    bgColor: 'bg-blue-50',
    textColor: 'text-[#0054a6]',
    ctaLabel: 'Explorer la marketplace',
    ctaLink: '/products-liste',
    steps: [
      { num: 1, icon: <Search size={22} />, title: 'Explorez les produits', desc: "Parcourez des milliers de produits de vendeurs vérifiés à travers tout le Bénin. Filtrez par catégorie, prix ou ville." },
      { num: 2, icon: <ShoppingBag size={22} />, title: 'Ajoutez au panier', desc: "Sélectionnez vos articles, choisissez la quantité et ajoutez-les à votre panier en un clic." },
      { num: 3, icon: <CreditCard size={22} />, title: 'Passez votre commande', desc: "Renseignez votre adresse de livraison et confirmez votre commande. Paiement à la réception — aucun risque." },
      { num: 4, icon: <Truck size={22} />, title: 'Suivez votre livraison', desc: "Un livreur prend en charge votre commande. Vous recevez des notifications WhatsApp à chaque étape." },
      { num: 5, icon: <Package size={22} />, title: 'Recevez votre colis', desc: "Votre commande arrive à votre porte. Vérifiez le contenu avant de payer. Satisfaction garantie." },
      { num: 6, icon: <Star size={22} />, title: 'Donnez votre avis', desc: "Notez le vendeur et le produit pour aider la communauté. Vos retours améliorent la plateforme." },
    ],
  },
  {
    id: 'livreur',
    label: 'Livreur',
    emoji: '🚚',
    description: "Gagnez de l'argent en livrant des commandes près de chez vous",
    gradient: 'from-[#f37021] to-[#f97316]',
    bgColor: 'bg-orange-50',
    textColor: 'text-[#f37021]',
    ctaLabel: 'Devenir livreur',
    ctaLink: '/devenir-livreur',
    steps: [
      { num: 1, icon: <UserCheck size={22} />, title: 'Inscrivez-vous', desc: "Créez votre compte livreur depuis le menu « Devenir livreur ». Renseignez vos informations et votre zone de travail." },
      { num: 2, icon: <Bell size={22} />, title: 'Recevez des missions', desc: "Dès qu'une commande est disponible dans votre zone, vous êtes notifié. Acceptez selon vos disponibilités." },
      { num: 3, icon: <Navigation size={22} />, title: 'Récupérez la commande', desc: "Rendez-vous chez le vendeur pour récupérer le colis. L'adresse et les détails du vendeur vous sont communiqués." },
      { num: 4, icon: <MapPin size={22} />, title: 'Livrez le client', desc: "Déposez le colis à l'adresse du client. Une fois confirmée, la commande est marquée « livrée »." },
      { num: 5, icon: <Wallet size={22} />, title: 'Soyez payé', desc: "Vos gains sont automatiquement crédités sur votre portefeuille Vtout après chaque livraison réussie." },
    ],
  },
  {
    id: 'vendeur',
    label: 'Vendeur',
    emoji: '🏪',
    description: "Vendez vos produits à des milliers de clients partout au Bénin",
    gradient: 'from-[#0054a6] to-[#1a73e8]',
    bgColor: 'bg-blue-50',
    textColor: 'text-[#0054a6]',
    ctaLabel: 'Ouvrir ma boutique',
    ctaLink: SUPPLIER_URL,
    ctaExternal: true,
    steps: [
      { num: 1, icon: <Store size={22} />, title: 'Créez votre boutique', desc: "Inscrivez-vous sur le portail vendeur. Complétez votre profil avec votre logo, description et coordonnées." },
      { num: 2, icon: <Upload size={22} />, title: 'Ajoutez vos produits', desc: "Publiez vos articles avec photos, description et prix vendeur. Vtout calcule automatiquement le prix client final." },
      { num: 3, icon: <Bell size={22} />, title: 'Recevez les commandes', desc: "Lorsqu'un client commande vos produits, vous êtes notifié instantanément par WhatsApp et sur votre tableau de bord." },
      { num: 4, icon: <Send size={22} />, title: 'Remettez au livreur', desc: "Préparez le colis et remettez-le au livreur assigné. Il s'occupe de la livraison jusqu'au client final." },
      { num: 5, icon: <DollarSign size={22} />, title: 'Touchez vos gains', desc: "Après chaque livraison réussie, vos gains nets sont crédités sur votre portefeuille automatiquement." },
      { num: 6, icon: <BarChart3 size={22} />, title: 'Gérez votre activité', desc: "Suivez vos ventes, revenus et statistiques en temps réel depuis votre tableau de bord vendeur." },
    ],
  },
];

export default function HowItWorksPage() {
  const [activeTab, setActiveTab] = useState('acheteur');
  const { getConfig } = useAppConfig();
  const navigate = useNavigate();

  useEffect(() => {
    if (getConfig('show_how_it_works', 'true') === 'false') {
      navigate('/');
    }
  }, [getConfig, navigate]);

  const active = userTypes.find(u => u.id === activeTab);

  return (
    <div className="min-h-screen bg-white">
      {/* Page header */}
      <section className="relative pt-24 pb-12 overflow-hidden bg-gradient-to-br from-white to-slate-50">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#0054a6]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#f37021]/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0054a6]/10 rounded-full border border-[#0054a6]/20 mb-5">
            <span className="w-2 h-2 bg-[#0054a6] rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#0054a6]">Guide d'utilisation</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-900 mb-3">
            Comment <span className="text-[#f37021]">ça marche</span> ?
          </h1>
          <p className="text-base text-slate-500 font-medium max-w-xl mx-auto">
            Tout ce que vous devez savoir pour utiliser Vtout selon votre profil.
          </p>
        </div>
      </section>

      {/* Sticky tabs */}
      <div className="sticky top-[60px] z-40 bg-white/90 backdrop-blur-xl border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex gap-2 py-3">
            {userTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setActiveTab(type.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-black text-sm transition-all duration-300 ${
                  activeTab === type.id
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <span>{type.emoji}</span>
                <span className="hidden sm:block">{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* Tab intro */}
          <section className={`py-10 ${active.bgColor}`}>
            <div className="max-w-5xl mx-auto px-6 text-center">
              <span className="text-5xl mb-3 block">{active.emoji}</span>
              <h2 className={`text-3xl md:text-4xl font-black tracking-tighter ${active.textColor} mb-2`}>
                Pour les {active.label}s
              </h2>
              <p className="text-slate-600 font-medium max-w-xl mx-auto">{active.description}</p>
            </div>
          </section>

          {/* Steps grid */}
          <section className="py-12 max-w-5xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {active.steps.map((step, i) => (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="relative bg-white rounded-3xl p-7 border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-400 group"
                >
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-11 h-11 rounded-2xl ${active.bgColor} ${active.textColor} flex items-center justify-center`}>
                      {step.icon}
                    </div>
                    <span className={`text-4xl font-black ${active.textColor} opacity-15 group-hover:opacity-30 transition-opacity`}>
                      {String(step.num).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2 tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm">{step.desc}</p>
                  {/* Arrow between steps on desktop */}
                  {i < active.steps.length - 1 && (i + 1) % 3 !== 0 && (
                    <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                      <ChevronRight size={18} className="text-slate-200" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* CTA Banner */}
          <section className="pb-16 max-w-5xl mx-auto px-6">
            <div className={`rounded-[2.5rem] p-10 md:p-14 bg-gradient-to-br ${active.gradient} text-white text-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">Prêt à commencer ?</h3>
                <p className="text-white/80 font-medium mb-7 max-w-md mx-auto text-sm">
                  {activeTab === 'acheteur' && "Des milliers de produits vous attendent !"}
                  {activeTab === 'livreur' && "Rejoignez notre équipe et commencez à gagner dès aujourd'hui !"}
                  {activeTab === 'vendeur' && "Ouvrez votre boutique et vendez partout au Bénin !"}
                </p>
                {active.ctaExternal ? (
                  <a
                    href={active.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-slate-900 font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
                  >
                    {active.ctaLabel}
                    <ArrowRight size={16} />
                  </a>
                ) : (
                  <button
                    onClick={() => navigate(active.ctaLink)}
                    className="inline-flex items-center gap-2 bg-white text-slate-900 font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
                  >
                    {active.ctaLabel}
                    <ArrowRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
