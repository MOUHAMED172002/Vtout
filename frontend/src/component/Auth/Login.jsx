import { SignIn } from "../../lib/AuthComponents";
import { ShoppingBag, Shield, Truck, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TRUST_ITEMS = [
  { icon: Shield, label: 'Paiement 100% sécurisé' },
  { icon: Truck, label: 'Livraison rapide au Bénin' },
  { icon: Star, label: 'Milliers de vendeurs vérifiés' },
];

export default function Login() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #0054a6 0%, #003d80 55%, #001e45 100%)' }}
      >
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* orange glow */}
        <div
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-[130px] pointer-events-none"
          style={{ background: 'rgba(243,112,33,0.35)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <ShoppingBag size={20} style={{ color: '#f37021' }} />
            </div>
            <div className="text-left">
              <span className="text-white font-black text-2xl tracking-tight block leading-none">Vtout</span>
              <span className="text-white/40 text-[9px] font-bold uppercase tracking-[0.2em]">On vend tout</span>
            </div>
          </button>
        </div>

        {/* Hero message */}
        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <span
              className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border"
              style={{ color: '#f37021', borderColor: 'rgba(243,112,33,0.4)', background: 'rgba(243,112,33,0.1)' }}
            >
              🇧🇯 Marketplace N°1 du Bénin
            </span>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Bienvenue<br />sur{' '}
              <span style={{ color: '#f37021' }}>Vtout</span>
            </h1>
            <p className="text-white/60 font-medium text-base max-w-xs leading-relaxed">
              Achetez et faites livrer des milliers de produits partout au Bénin.
            </p>
          </div>

          <div className="space-y-3">
            {TRUST_ITEMS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <Icon size={14} className="text-white/80" />
                </div>
                <span className="text-white/70 text-sm font-semibold">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/25 text-[10px] font-bold uppercase tracking-[0.25em]">
          © 2025 Vtout · Bénin
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 px-6 py-12 sm:px-12 overflow-y-auto">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center mb-8">
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: '#f37021' }}
            >
              <ShoppingBag size={16} className="text-white" />
            </div>
            <span className="font-black text-xl text-slate-900 tracking-tight">Vtout</span>
          </button>
        </div>

        <div className="w-full max-w-[420px]">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
