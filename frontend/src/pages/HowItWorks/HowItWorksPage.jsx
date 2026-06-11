import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppConfig } from '../../component/context/ConfigContext';
import {
  ShoppingBag, Search, CreditCard, Package, Star,
  Truck, MapPin, Bell, Navigation, UserCheck, Wallet,
  Store, Upload, Send, DollarSign, BarChart3,
  ArrowRight, ChevronRight
} from 'lucide-react';

const SUPPLIER_URL = import.meta.env.VITE_SUPPLIER_PORTAL_URL || 'https://vendeur.vtout.com';

const userTypes = {
  acheteur: {
    label: 'Acheteur',
    emoji: '🛍️',
    description: "Découvrez comment acheter facilement sur Vtout",
    gradient: 'from-[#0054a6] to-[#1a73e8]',
    bgColor: 'bg-blue-50',
    textColor: 'text-[#0054a6]',
    ctaLabel: 'Explorer la marketplace',
    ctaLink: '/products-liste',
    ctaExternal: false,
    steps: [
      { num: 1, icon: <Search size={22} />, title: 'Explorez les produits', desc: "Parcourez des milliers de produits de vendeurs vérifiés à travers tout le Bénin. Filtrez par catégorie, prix ou ville." },
      { num: 2, icon: <ShoppingBag size={22} />, title: 'Ajoutez au panier', desc: "Sélectionnez vos articles, choisissez la quantité et ajoutez-les à votre panier en un clic." },
      { num: 3, icon: <CreditCard size={22} />, title: 'Passez votre commande', desc: "Renseignez votre adresse de livraison et confirmez votre commande. Paiement à la réception — aucun risque." },
      { num: 4, icon: <Truck size={22} />, title: 'Suivez votre livraison', desc: "Un livreur prend en charge votre commande. Vous recevez des notifications WhatsApp à chaque étape." },
      { num: 5, icon: <Package size={22} />, title: 'Recevez votre colis', desc: "Votre commande arrive à votre porte. Vérifiez le contenu avant de payer. Satisfaction garantie." },
      { num: 6, icon: <Star size={22} />, title: 'Donnez votre avis', desc: "Notez le vendeur et le produit pour aider la communauté. Vos retours améliorent la plateforme." },
    ],
  },
  livreur: {
    label: 'Livreur',
    emoji: '🚚',
    description: "Gagnez de l'argent en livrant des commandes près de chez vous",
    gradient: 'from-[#f37021] to-[#f97316]',
    bgColor: 'bg-orange-50',
    textColor: 'text-[#f37021]',
    ctaLabel: 'Devenir livreur',
    ctaLink: '/devenir-livreur',
    ctaExternal: false,
    steps: [
      { num: 1, icon: <UserCheck size={22} />, title: 'Inscrivez-vous', desc: "Créez votre compte livreur depuis « Devenir livreur ». Renseignez vos informations et votre zone de travail." },
      { num: 2, icon: <Bell size={22} />, title: 'Recevez des missions', desc: "Dès qu'une commande est disponible dans votre zone, vous êtes notifié. Acceptez selon vos disponibilités." },
      { num: 3, icon: <Navigation size={22} />, title: 'Récupérez la commande', desc: "Rendez-vous chez le vendeur pour récupérer le colis. L'adresse et les détails du vendeur vous sont communiqués." },
      { num: 4, icon: <MapPin size={22} />, title: 'Livrez le client', desc: "Déposez le colis à l'adresse du client. Une fois confirmée, la commande est marquée « livrée »." },
      { num: 5, icon: <Wallet size={22} />, title: 'Soyez payé', desc: "Vos gains sont automatiquement crédités sur votre portefeuille Vtout après chaque livraison réussie." },
    ],
  },
  vendeur: {
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
};

export default function HowItWorksPage() {
  const { tab } = useParams();
  const { getConfig } = useAppConfig();
  const navigate = useNavigate();

  const type = userTypes[tab] ? tab : 'acheteur';
  const active = userTypes[type];

  useEffect(() => {
    if (getConfig('show_how_it_works', 'true') === 'false') {
      navigate('/');
    }
    // Redirect invalid tabs
    if (tab && !userTypes[tab]) {
      navigate('/comment-ca-marche/acheteur', { replace: true });
    }
  }, [getConfig, navigate, tab]);

  return (
    <div className="min-h-screen bg-base-100">
      {/* Page header */}
      <section className={`relative pt-24 pb-12 overflow-hidden ${active.bgColor}`}>
        <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[100px] pointer-events-none" style={{ background: 'rgba(0,84,166,0.07)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full blur-[80px] pointer-events-none" style={{ background: 'rgba(243,112,33,0.06)' }} />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <span className="text-6xl mb-4 block">{active.emoji}</span>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-5"
            style={{ background: 'rgba(0,84,166,0.08)', borderColor: 'rgba(0,84,166,0.2)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#0054a6' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#0054a6' }}>Comment ça marche</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-base-content mb-3">
            Pour les <span style={{ color: '#f37021' }}>{active.label}s</span>
          </h1>
          <p className="text-base text-base-content/70 font-medium max-w-xl mx-auto">{active.description}</p>
        </div>
      </section>

      {/* Steps grid */}
      <section className="py-14 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {active.steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="relative bg-base-100 rounded-3xl p-7 border border-base-200 shadow-sm hover:shadow-xl hover:border-base-300 transition-all duration-400 group"
            >
              <div className="flex items-center justify-between mb-5">
                <div className={`w-11 h-11 rounded-2xl ${active.bgColor} ${active.textColor} flex items-center justify-center`}>
                  {step.icon}
                </div>
                <span className={`text-4xl font-black ${active.textColor} opacity-15 group-hover:opacity-30 transition-opacity`}>
                  {String(step.num).padStart(2, '0')}
                </span>
              </div>
              <h3 className="text-lg font-black text-base-content mb-2 tracking-tight">{step.title}</h3>
              <p className="text-base-content/50 font-medium leading-relaxed text-sm">{step.desc}</p>
              {i < active.steps.length - 1 && (i + 1) % 3 !== 0 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight size={18} className="text-base-content/20" />
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-base-100/10 rounded-full blur-[60px] pointer-events-none" />
          <div className="relative z-10">
            <h3 className="text-3xl md:text-4xl font-black tracking-tighter mb-3">Prêt à commencer ?</h3>
            <p className="text-white/80 font-medium mb-7 max-w-md mx-auto text-sm">
              {type === 'acheteur' && "Des milliers de produits vous attendent !"}
              {type === 'livreur' && "Rejoignez notre équipe et commencez à gagner dès aujourd'hui !"}
              {type === 'vendeur' && "Ouvrez votre boutique et vendez partout au Bénin !"}
            </p>
            {active.ctaExternal ? (
              <a
                href={active.ctaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-base-100 text-base-content font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
              >
                {active.ctaLabel}
                <ArrowRight size={16} />
              </a>
            ) : (
              <button
                onClick={() => navigate(active.ctaLink)}
                className="inline-flex items-center gap-2 bg-base-100 text-base-content font-black px-10 py-4 rounded-2xl shadow-xl hover:shadow-2xl active:scale-95 transition-all text-sm"
              >
                {active.ctaLabel}
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
