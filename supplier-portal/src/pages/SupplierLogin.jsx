import React, { useState, useEffect } from 'react';
import { useAuth, authClient } from '../components/clerk-shim';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ChevronLeft, MessageCircle, Smartphone } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SupplierLogin() {
    const { isLoaded, isSignedIn } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [forgotMode, setForgotMode] = useState(false);
    const [whatsappMode, setWhatsappMode] = useState('none'); // 'none', 'request', 'verify'
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');

    // --- Persistance pour mobile ---
    useEffect(() => {
        const saved = sessionStorage.getItem('vtout_supplier_auth');
        if (saved) {
            try {
                const { mode, ph } = JSON.parse(saved);
                if (mode) setWhatsappMode(mode);
                if (ph) setPhone(ph);
            } catch (e) {}
        }
    }, []);

    useEffect(() => {
        if (whatsappMode !== 'none') {
            sessionStorage.setItem('vtout_supplier_auth', JSON.stringify({ mode: whatsappMode, ph: phone }));
        } else {
            sessionStorage.removeItem('vtout_supplier_auth');
        }
    }, [whatsappMode, phone]);

    useEffect(() => {
        if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true });
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded) return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
    );

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authClient.signIn.email({ email: email.trim(), password });
            if (res.error) {
                toast.error(res.error.message || 'Identifiants incorrects');
            } else {
                toast.success('Connexion réussie ! Redirection…');
                window.location.href = '/dashboard';
            }
        } catch {
            toast.error('Une erreur inattendue est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgot = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authClient.requestPasswordReset({
                email: email.trim(),
                redirectTo: window.location.origin + '/reset-password',
            });
            toast.success('E-mail de réinitialisation envoyé !');
            setForgotMode(false);
        } catch {
            toast.error('Erreur lors de l\'envoi du mail.');
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
            // 1. Vérifier le code
            await api.post('/auth/whatsapp/verify-code', { phone, code: otp, role: 'fournisseur' });
            
            // 2. Connecter via Better Auth (utilise le format standardisé par vtout)
            const fakeEmail = `${phone.replace(/\D/g, '')}@whatsapp.vtout.com`;
            // On tente de se connecter (le mot de passe est par défaut le numéro si créé via WhatsApp)
            const authRes = await authClient.signIn.email({ 
                email: fakeEmail, 
                password: phone.replace(/\D/g, '') 
            });

            if (authRes.error) {
                toast.error(authRes.error.message || "Erreur de connexion");
                setLoading(false);
                return;
            }

            toast.success('Connexion réussie !');
            window.location.href = '/dashboard';
        } catch (err) {
            toast.error(err.response?.data?.error || 'Code invalide ou expiré');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base-200 flex flex-col relative overflow-hidden">
            {/* Design elements from main AuthUI */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary to-purple-600 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 opacity-10"></div>

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
                <Link to="/inscription" className="text-[10px] font-black uppercase tracking-widest text-base-content/40 hover:text-primary transition-colors bg-white/50 backdrop-blur px-4 py-2 rounded-full border border-base-300">
                    S'inscrire →
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-md relative">
                    {/* Skewed background effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-purple-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-[3rem] opacity-20"></div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative backdrop-blur-xl bg-white/80 border border-white/40 shadow-2xl rounded-[3rem] p-10 md:p-12 space-y-8"
                    >
                        {/* Icon + title */}
                        <div className="text-center space-y-3">
                            <div className="w-16 h-16 bg-gradient-to-tr from-primary to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary">
                                <Lock size={28} className="text-white" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter text-base-content leading-tight">
                                {forgotMode ? 'Récupérer' : 'Bon Retour !'}
                            </h1>
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-base-content/40">
                                {forgotMode ? 'Lien de réinitialisation' : 'Console Vendeur Vtout'}
                            </p>
                        </div>

                        {whatsappMode === 'none' ? (
                            <form onSubmit={forgotMode ? handleForgot : handleLogin} className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">E-mail</label>
                                        <div className="relative">
                                            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 bg-base-200/50 border border-base-300 focus:border-primary rounded-2xl font-bold text-sm text-base-content focus:bg-base-100 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
                                                placeholder="votre@boutique.com"
                                            />
                                        </div>
                                    </div>

                                    {!forgotMode && (
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between px-1 ml-1">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40">Mot de passe</label>
                                                <button type="button" onClick={() => setForgotMode(true)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Oublié ?</button>
                                            </div>
                                            <div className="relative">
                                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                                <input
                                                    type={showPass ? 'text' : 'password'}
                                                    required
                                                    value={password}
                                                    onChange={e => setPassword(e.target.value)}
                                                    className="w-full pl-12 pr-12 py-4 bg-base-200/50 border border-base-300 focus:border-primary rounded-2xl font-bold text-sm text-base-content focus:bg-base-100 focus:ring-4 focus:ring-primary/10 focus:outline-none transition-all shadow-sm"
                                                    placeholder="••••••••"
                                                />
                                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-base-content/40">
                                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-primary to-primary hover:from-neutral hover:to-neutral text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-primary hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>{forgotMode ? 'Réinitialiser' : 'Se Connecter'} <ArrowRight size={18} /></>}
                                </button>

                                {forgotMode && (
                                    <button type="button" onClick={() => setForgotMode(false)} className="w-full py-2 text-[10px] font-black uppercase text-base-content/40 hover:text-base-content/70 flex items-center justify-center gap-2 tracking-widest">
                                        <ChevronLeft size={16} /> Retour à la connexion
                                    </button>
                                )}
                            </form>
                        ) : (
                            <form onSubmit={whatsappMode === 'request' ? handleRequestOTP : handleVerifyOTP} className="space-y-6">
                                {whatsappMode === 'request' ? (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 px-1 ml-1">Numéro WhatsApp</label>
                                        <div className="relative">
                                            <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/30" />
                                            <input
                                                type="text"
                                                required
                                                value={phone}
                                                onChange={e => setPhone(e.target.value)}
                                                className="w-full pl-12 pr-5 py-4 bg-base-200/50 border border-base-300 focus:border-emerald-500 rounded-2xl font-bold text-sm text-base-content focus:bg-base-100 focus:ring-4 focus:ring-emerald-50 focus:outline-none transition-all shadow-sm"
                                                placeholder="229XXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-base-content/40 text-center block">Code OTP envoyé sur WhatsApp</label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            autoFocus
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="w-full text-center tracking-[1em] text-3xl py-5 bg-emerald-50/30 border-2 border-emerald-100 focus:border-emerald-500 rounded-3xl font-black text-base-content focus:bg-base-100 focus:outline-none transition-all"
                                            placeholder="000000"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <>{whatsappMode === 'request' ? 'Recevoir le code' : 'Confirmer'} <ArrowRight size={18} /></>}
                                </button>

                                <button type="button" onClick={() => setWhatsappMode('none')} className="w-full py-2 text-[10px] font-black uppercase text-base-content/40 hover:text-base-content/70 flex items-center justify-center gap-2 tracking-widest">
                                    <ChevronLeft size={16} /> Retour
                                </button>
                            </form>
                        )}

                        {!forgotMode && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-base-300" /></div>
                                    <div className="relative flex justify-center"><span className="bg-white/0 px-4 text-[10px] font-black uppercase tracking-widest text-base-content/30">Ou continuer avec</span></div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin + '/dashboard' })} className="flex items-center justify-center gap-3 py-3.5 bg-base-100 border border-base-300 rounded-2xl hover:border-primary/30 transition-all active:scale-95 shadow-sm group">
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4 group-hover:scale-110 transition-transform" alt="Google" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/70">Google</span>
                                    </button>
                                    <button onClick={() => setWhatsappMode('request')} className="flex items-center justify-center gap-3 py-3.5 bg-base-100 border border-base-300 rounded-2xl hover:border-emerald-300 group transition-all active:scale-95 shadow-sm">
                                        <MessageCircle size={18} className="text-emerald-500 group-hover:scale-110 transition-transform" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-base-content/70">WhatsApp</span>
                                    </button>
                                </div>
                            </>
                        )}

                        <p className="text-center text-[10px] font-black text-base-content/30 uppercase tracking-[0.2em]">Sécurisé par Vtout Encryption</p>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

