import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/clerk-shim';
import { authClient } from '../components/clerk-shim';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, Mail, Lock, Eye, EyeOff, ChevronRight, CheckCircle2, Loader2, ArrowLeft, ShieldCheck, Package, TrendingUp, MessageCircle, Smartphone, ArrowRight } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const STEPS = [
    { id: 1, label: 'Identité', icon: User },
    { id: 2, label: 'Sécurité', icon: Lock },
    { id: 3, label: 'Vérification', icon: CheckCircle2 },
];

export default function SupplierRegister() {
    const { isLoaded, isSignedIn } = useAuth();
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [whatsappMode, setWhatsappMode] = useState('none'); // 'none', 'request', 'verify'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState({});

    // --- Persistance pour mobile ---
    useEffect(() => {
        const saved = sessionStorage.getItem('vtout_supplier_reg_state');
        if (saved) {
            try {
                const { st, mode, ph, f } = JSON.parse(saved);
                if (st) setStep(st);
                if (mode) setWhatsappMode(mode);
                if (ph) setPhone(ph);
                if (f) setForm(prev => ({ ...prev, ...f }));
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        const state = { st: step, mode: whatsappMode, ph: phone, f: form };
        sessionStorage.setItem('vtout_supplier_reg_state', JSON.stringify(state));
    }, [step, whatsappMode, phone, form]);

    useEffect(() => {
        if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true });
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded) return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
                // Better Auth renvoie souvent 422 si l'email existe ou le MDP est court
                toast.error(res.error.message || "Erreur lors de la création du compte (Vérifiez si l'email existe déjà)");
                console.error("[SignUp Error]", res.error);
                if (res.error.status === 422) setStep(1); 
            } else {
                toast.success('Compte marchand créé ! Bienvenue sur Vtout.');
                sessionStorage.removeItem('vtout_supplier_reg_state');
                window.location.href = '/dashboard';
            }
        } catch (err) {
            toast.error('Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        if (!phone) return toast.error('Veuillez entrer votre numéro WhatsApp');
        setLoading(true);
        try {
            await api.post('/auth/whatsapp/send-code', { phone });
            toast.success('Code envoyé sur votre WhatsApp !');
            setWhatsappMode('verify');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Erreur lors de l\'envoi du code');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        if (otp.length !== 6) return toast.error('Le code doit contenir 6 chiffres');
        setLoading(true);
        try {
            // 1. Vérifier le code OTP
            await api.post('/auth/whatsapp/verify-code', { phone, code: otp, role: 'fournisseur' });
            
            // 2. Créer le compte via Better Auth
            const fakeEmail = `${phone.replace(/\D/g, '')}@whatsapp.vtout.com`;
            const pwd = phone.replace(/\D/g, '');
            
            let authRes = await authClient.signUp.email({ 
                email: fakeEmail, 
                password: pwd, 
                name: form.name || 'Marchand WhatsApp',
                role: 'fournisseur'
            });

            if (authRes.error && (authRes.error.status === 400 || authRes.error.message?.includes('exist'))) {
                authRes = await authClient.signIn.email({ email: fakeEmail, password: pwd });
            }

            if (authRes.error) {
                toast.error(authRes.error.message || "Erreur d'authentification");
                setLoading(false);
                return;
            }

            toast.success('Inscription et connexion réussies !');
            sessionStorage.removeItem('vtout_supplier_reg_state');
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err.response?.data?.error || 'Code invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full pl-12 pr-5 py-4 bg-base-200/50 border border-base-300 focus:border-primary rounded-2xl font-bold text-sm text-base-content focus:bg-base-100 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm ${errors[field] ? 'border-rose-300 ring-rose-50 ring-4' : ''}`;

    return (
        <div className="min-h-screen bg-base-200 flex flex-col relative overflow-hidden">
             {/* Background design elements */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-purple-600/10 transform -skew-y-6 sm:skew-y-0 sm:-rotate-3"></div>

            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between relative z-10">
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary group-hover:scale-105 transition-transform">
                        <Store size={20} className="text-white" />
                    </div>
                    <div>
                        <span className="font-black text-lg tracking-tighter text-base-content leading-none block">Vtout</span>
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">Business</span>
                    </div>
                </Link>
                <Link to="/connexion" className="text-[10px] font-black uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-base-300 shadow-sm">
                    Déjà inscrit ? Connexion →
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-xl">
                    
                    {/* Stepper (Simplified & Modern) */}
                    <div className="flex items-center justify-center gap-8 mb-10">
                        {STEPS.map((s, i) => (
                            <div key={s.id} className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs transition-all shadow-sm ${step >= s.id ? 'bg-primary text-white shadow-primary' : 'bg-base-100 text-base-content/30 border border-base-300'}`}>
                                    {step > s.id ? <CheckCircle2 size={16} /> : s.id}
                                </div>
                                <span className={`hidden sm:block text-[10px] font-black uppercase tracking-widest ${step >= s.id ? 'text-base-content' : 'text-base-content/30'}`}>
                                    {s.label}
                                </span>
                                {i < STEPS.length - 1 && <div className="hidden sm:block w-8 h-px bg-base-300" />}
                            </div>
                        ))}
                    </div>

                    <div className="relative">
                        {/* Skewed background effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 shadow-lg transform -skew-y-2 sm:skew-y-0 sm:rotate-2 sm:rounded-[3rem] opacity-20"></div>

                        <div className="relative backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-[3rem] overflow-hidden">
                            <AnimatePresence mode="wait">

                                {/* ── STEP 1 : Identité ── */}
                                {step === 1 && (
                                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 md:p-14 space-y-8">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary">
                                                <User size={28} className="text-white" />
                                            </div>
                                            <h1 className="text-4xl font-black tracking-tighter text-base-content">Devenir Vendeur</h1>
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">Étape 1 — Votre identité</p>
                                        </div>

                                        {whatsappMode === 'none' ? (
                                            <>
                                                <div className="space-y-5">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">Nom complet</label>
                                                        <div className="relative">
                                                            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                                            <input type="text" value={form.name} onChange={set('name')} className={inputClass('name')} placeholder="Ex : Kokou Mensah" />
                                                        </div>
                                                        {errors.name && <p className="text-[10px] text-rose-500 font-black px-1 mt-1 uppercase">{errors.name}</p>}
                                                    </div>

                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">E-mail professionnel</label>
                                                        <div className="relative">
                                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                                            <input type="email" value={form.email} onChange={set('email')} className={inputClass('email')} placeholder="votre@boutique.com" />
                                                        </div>
                                                        {errors.email && <p className="text-[10px] text-rose-500 font-black px-1 mt-1 uppercase">{errors.email}</p>}
                                                    </div>
                                                </div>

                                                <button onClick={handleNext} className="w-full py-4 bg-primary hover:brightness-90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary hover:-translate-y-0.5">
                                                    Continuer <ChevronRight size={18} />
                                                </button>

                                                <div className="relative pt-2">
                                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-300" /></div>
                                                    <div className="relative flex justify-center"><span className="bg-white/0 px-4 text-[10px] font-black uppercase tracking-widest text-base-content/30">Ou inscription rapide</span></div>
                                                </div>

                                                <button onClick={() => setWhatsappMode('request')} className="w-full py-4 bg-base-100 border border-base-300 hover:border-emerald-300 text-base-content/70 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 shadow-sm group">
                                                    <MessageCircle size={20} className="text-emerald-500 group-hover:scale-110 transition-transform" /> Inscription via WhatsApp
                                                </button>
                                            </>
                                        ) : (
                                            <form onSubmit={whatsappMode === 'request' ? handleRequestOTP : handleVerifyOTP} className="space-y-6">
                                                {whatsappMode === 'request' ? (
                                                    <div className="space-y-1.5">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">Numéro WhatsApp</label>
                                                        <div className="relative">
                                                            <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                                            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-12 pr-5 py-4 bg-base-200 border border-base-300 focus:border-emerald-500 rounded-2xl font-bold text-sm text-base-content focus:bg-base-100 focus:ring-4 focus:ring-emerald-50 focus:outline-none transition-all" placeholder="229XXXXXXXX" />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 text-center block">Code reçu sur WhatsApp</label>
                                                        <input type="text" maxLength={6} required autoFocus value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} className="w-full text-center tracking-[1em] text-3xl py-5 bg-emerald-50/30 border-2 border-emerald-100 rounded-3xl font-black text-base-content focus:bg-base-100 focus:border-emerald-500 focus:outline-none transition-all" placeholder="000000" />
                                                    </div>
                                                )}

                                                <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100 hover:-translate-y-0.5">
                                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>{whatsappMode === 'request' ? 'Recevoir le code' : 'Confirmer & S\'inscrire'} <ArrowRight size={18} /></>}
                                                </button>

                                                <button type="button" onClick={() => setWhatsappMode('none')} className="w-full py-2 text-[10px] font-black uppercase tracking-widest text-base-content/40 hover:text-base-content/70 flex items-center justify-center gap-2">
                                                    <ArrowLeft size={16} /> Retour au formulaire
                                                </button>
                                            </form>
                                        )}
                                    </motion.div>
                                )}

                                {/* ── STEP 2 : Sécurité ── */}
                                {step === 2 && (
                                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 md:p-14 space-y-8">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary">
                                                <Lock size={28} className="text-white" />
                                            </div>
                                            <h1 className="text-4xl font-black tracking-tighter text-base-content">Sécurisation</h1>
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">Étape 2 — Accès au compte</p>
                                        </div>

                                        <div className="space-y-5">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">Mot de passe</label>
                                                <div className="relative">
                                                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                                    <input type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} className={`${inputClass('password')} pr-12`} placeholder="Min. 8 caractères" />
                                                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70">
                                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {errors.password && <p className="text-[10px] text-rose-500 font-black px-1 mt-1 uppercase">{errors.password}</p>}
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">Confirmation</label>
                                                <div className="relative">
                                                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                                    <input type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')} className={`${inputClass('confirmPassword')} pr-12`} placeholder="Répétez le mot de passe" />
                                                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content/70">
                                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                                    </button>
                                                </div>
                                                {errors.confirmPassword && <p className="text-[10px] text-rose-500 font-black px-1 mt-1 uppercase">{errors.confirmPassword}</p>}
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button onClick={handleBack} className="flex-1 py-4 bg-base-300 hover:brightness-95 text-base-content/70 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all">
                                                <ArrowLeft size={16} /> Retour
                                            </button>
                                            <button onClick={handleNext} className="flex-[2] py-4 bg-primary hover:brightness-90 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary hover:-translate-y-0.5">
                                                Suivant <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {/* ── STEP 3 : Vérification ── */}
                                {step === 3 && (
                                    <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="p-10 md:p-14 space-y-8">
                                        <div className="text-center space-y-3">
                                            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-100">
                                                <CheckCircle2 size={28} className="text-white" />
                                            </div>
                                            <h1 className="text-4xl font-black tracking-tighter text-base-content">C'est prêt !</h1>
                                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">Étape 3 — Finalisation</p>
                                        </div>

                                        <div className="bg-base-200/50 border border-base-300 rounded-[2rem] p-8 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Marchand</span>
                                                <span className="text-sm font-black text-base-content">{form.name}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">E-mail</span>
                                                <span className="text-sm font-black text-base-content">{form.email}</span>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-base-300">
                                                <span className="text-[10px] font-black text-base-content/40 uppercase tracking-widest">Plateforme</span>
                                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest">Vtout Business</span>
                                            </div>
                                        </div>

                                        <p className="text-[10px] font-bold text-base-content/40 text-center px-4 leading-relaxed uppercase tracking-wide">
                                            En confirmant, vous acceptez les{' '}
                                            <Link to="/terms" className="text-primary hover:underline">conditions d'utilisation</Link> du portail marchand.
                                        </p>

                                        <div className="flex gap-4">
                                            <button onClick={handleBack} className="flex-1 py-4 bg-base-300 hover:brightness-95 text-base-content/70 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2">
                                                <ArrowLeft size={16} />
                                            </button>
                                            <button onClick={handleSubmit} disabled={loading} className="flex-[3] py-4 bg-gradient-to-r from-primary to-primary text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 shadow-xl shadow-primary hover:-translate-y-0.5 disabled:opacity-50">
                                                {loading ? <Loader2 size={18} className="animate-spin" /> : <><TrendingUp size={18} /> Créer mon compte</>}
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
