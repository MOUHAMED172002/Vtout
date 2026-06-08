import { SignUp } from "../../lib/AuthComponents";
import { ShoppingBag, Zap, Users, BadgeCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PERKS = [
  { icon: Zap, label: 'Commandez en quelques clics' },
  { icon: Users, label: 'Communauté de milliers d\'acheteurs' },
  { icon: BadgeCheck, label: 'Vendeurs certifiés & vérifiés' },
];

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ── */}
      <div
        className="hidden lg:flex w-[45%] flex-col justify-between p-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(150deg, #f37021 0%, #d95f10 45%, #0054a6 100%)' }}
      >
        {/* dot-grid texture */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, white 1.5px, transparent 0)', backgroundSize: '28px 28px' }}
        />
        {/* blue glow */}
        <div
          className="absolute -bottom-24 -right-24 w-[28rem] h-[28rem] rounded-full blur-[130px] pointer-events-none"
          style={{ background: 'rgba(0,84,166,0.4)' }}
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
              style={{ color: 'white', borderColor: 'rgba(255,255,255,0.35)', background: 'rgba(255,255,255,0.15)' }}
            >
              🇧🇯 Marketplace N°1 du Bénin
            </span>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight tracking-tight">
              Rejoignez<br />
              <span style={{ color: 'rgba(255,255,255,0.85)' }}>des milliers</span><br />
              d'acheteurs
            </h1>
            <p className="text-white/65 font-medium text-base max-w-xs leading-relaxed">
              Inscription gratuite en moins d'une minute. Livraison partout au Bénin.
            </p>
          </div>

          <div className="space-y-3">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.15)' }}
                >
                  <Icon size={14} className="text-white/85" />
                </div>
                <span className="text-white/75 text-sm font-semibold">{label}</span>
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
          <SignUp />
        </div>
      </div>
    </div>
  );
}
