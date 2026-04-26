import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { authClient } from '../components/clerk-shim';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, Mail, Lock, Eye, EyeOff, ChevronRight, CheckCircle2, Loader2, ArrowLeft, ShieldCheck, Package, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, label: 'Votre compte', icon: User },
    { id: 2, label: 'Sécurité', icon: Lock },
    { id: 3, label: 'Confirmation', icon: CheckCircle2 },
];

export default function SupplierRegister() {
    const { isLoaded, isSignedIn } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true });
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
    );

    const set = (field) => (e) => {
        setForm(f => ({ ...f, [field]: e.target.value }));
        setErrors(er => ({ ...er, [field]: '' }));
    };

    const validateStep1 = () => {
        const e = {};
        if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Nom requis (min. 2 caractères)';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Adresse e-mail invalide';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const validateStep2 = () => {
        const e = {};
        if (!form.password || form.password.length < 8) e.password = 'Mot de passe trop court (min. 8 caractères)';
        if (form.password !== form.confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => s + 1);
    };

    const handleBack = () => setStep(s => s - 1);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await authClient.signUp.email({
                email: form.email.trim(),
                password: form.password,
                name: form.name.trim(),
                role: 'fournisseur',
            });
            if (res.error) {
                toast.error(res.error.message || "Erreur lors de la création du compte");
                setStep(1);
            } else {
                // Role 'fournisseur' is already set during signUp — no extra call needed.
                // authMiddleware will sync the profile automatically on first authenticated request.
                toast.success('Compte fournisseur créé ! Bienvenue sur Vtout.');
                window.location.href = '/dashboard';
            }
        } catch (err) {
            toast.error('Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full pl-12 pr-5 py-4 bg-slate-50 border-2 rounded-2xl font-semibold text-sm text-slate-900 focus:bg-white focus:outline-none transition-all ${errors[field] ? 'border-rose-400 focus:border-rose-400' : 'border-transparent focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50'}`;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex flex-col">
            {/* Header */}
            <header className="px-8 py-5 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">
                        <Store size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tighter text-slate-900 leading-none block">Vtout</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-500">Partenaires</span>
                    </div>
                </Link>
                <Link to="/connexion" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                    Déjà inscrit ? Se connecter →
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">

                    {/* Stepper */}
                    <div className="flex items-center justify-center gap-0 mb-10">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const done = step > s.id;
                            const active = step === s.id;
                            return (
                                <React.Fragment key={s.id}>
                                    <div className="flex flex-col items-center gap-2">
                                        <motion.div
                                            animate={{
                                                backgroundColor: done ? '#4f46e5' : active ? '#4f46e5' : '#e2e8f0',
                                                scale: active ? 1.1 : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                            className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
                                        >
                                            {done
                                                ? <CheckCircle2 size={20} className="text-white" />
                                                : <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                                            }
                                        </motion.div>
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-indigo-600' : done ? 'text-indigo-400' : 'text-slate-300'}`}>
                                            {s.label}
                                        </span>
                                    </div>
                                    {i < STEPS.length - 1 && (
                                        <div className={`h-[2px] w-16 mb-5 mx-1 rounded-full transition-all duration-500 ${step > s.id ? 'bg-indigo-500' : 'bg-slate-200'}`} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Card */}
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-white overflow-hidden">
                        <AnimatePresence mode="wait">

                            {/* ── STEP 1 : Infos de base ── */}
                            {step === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="p-10 space-y-8">
                                    <div className="text-center space-y-2">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <User size={28} className="text-indigo-600" />
                                        </div>
                                        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Votre identité</h1>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Étape 1 sur 3 — Informations du compte</p>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Nom */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Nom complet</label>
                                            <div className="relative">
                                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="text" value={form.name} onChange={set('name')} className={inputClass('name')} placeholder="Ex : Kokou Mensah" />
                                            </div>
                                            {errors.name && <p className="text-xs text-rose-500 font-bold px-1">{errors.name}</p>}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Adresse e-mail professionnelle</label>
                                            <div className="relative">
                                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type="email" value={form.email} onChange={set('email')} className={inputClass('email')} placeholder="votre@boutique.com" />
                                            </div>
                                            {errors.email && <p className="text-xs text-rose-500 font-bold px-1">{errors.email}</p>}
                                        </div>
                                    </div>

                                    <button onClick={handleNext} className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-0.5 active:scale-95">
                                        Continuer <ChevronRight size={18} />
                                    </button>
                                </motion.div>
                            )}

                            {/* ── STEP 2 : Mot de passe ── */}
                            {step === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="p-10 space-y-8">
                                    <div className="text-center space-y-2">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Lock size={28} className="text-indigo-600" />
                                        </div>
                                        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Sécurisez votre accès</h1>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Étape 2 sur 3 — Mot de passe</p>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Password */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Mot de passe</label>
                                            <div className="relative">
                                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} className={`${inputClass('password')} pr-12`} placeholder="Min. 8 caractères" />
                                                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {errors.password && <p className="text-xs text-rose-500 font-bold px-1">{errors.password}</p>}
                                            {/* Strength bar */}
                                            {form.password && (
                                                <div className="flex gap-1 px-1 pt-1">
                                                    {[1,2,3,4].map(i => (
                                                        <div key={i} className={`h-1 flex-1 rounded-full transition-all ${form.password.length >= i * 2 ? (form.password.length >= 8 ? 'bg-emerald-400' : 'bg-amber-400') : 'bg-slate-100'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Confirm */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Confirmer le mot de passe</label>
                                            <div className="relative">
                                                <ShieldCheck size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                                <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} className={`${inputClass('confirmPassword')} pr-12`} placeholder="Répétez le mot de passe" />
                                                <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600">
                                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && <p className="text-xs text-rose-500 font-bold px-1">{errors.confirmPassword}</p>}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button onClick={handleBack} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95">
                                            <ArrowLeft size={16} /> Retour
                                        </button>
                                        <button onClick={handleNext} className="flex-[2] py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-0.5 active:scale-95">
                                            Continuer <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* ── STEP 3 : Confirmation ── */}
                            {step === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.3 }} className="p-10 space-y-8">
                                    <div className="text-center space-y-2">
                                        <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle2 size={28} className="text-emerald-500" />
                                        </div>
                                        <h1 className="text-3xl font-black tracking-tighter text-slate-900">Tout est prêt !</h1>
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Étape 3 sur 3 — Vérification et création</p>
                                    </div>

                                    {/* Recap */}
                                    <div className="bg-slate-50 rounded-3xl p-6 space-y-4 border border-slate-100">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Récapitulatif</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Nom</span>
                                            <span className="text-sm font-black text-slate-900">{form.name}</span>
                                        </div>
                                        <div className="border-t border-slate-100" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">E-mail</span>
                                            <span className="text-sm font-black text-slate-900">{form.email}</span>
                                        </div>
                                        <div className="border-t border-slate-100" />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold text-slate-500">Rôle</span>
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                <Package size={12} /> Fournisseur
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-[10px] font-bold text-slate-400 text-center leading-relaxed">
                                        En créant votre compte, vous acceptez les{' '}
                                        <Link to="/conditions" className="text-indigo-500 hover:underline">conditions partenaires Vtout</Link>.
                                    </p>

                                    <div className="flex gap-3">
                                        <button onClick={handleBack} className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95">
                                            <ArrowLeft size={16} /> Retour
                                        </button>
                                        <button onClick={handleSubmit} disabled={loading} className="flex-[2] py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50">
                                            {loading ? <Loader2 size={18} className="animate-spin" /> : <><TrendingUp size={16} /> Créer mon compte</>}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
