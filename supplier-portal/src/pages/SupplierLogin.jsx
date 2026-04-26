import React, { useState, useEffect } from 'react';
import { useAuth, authClient } from '../components/clerk-shim';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Store, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SupplierLogin() {
    const { isLoaded, isSignedIn } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [forgotMode, setForgotMode] = useState(false);

    useEffect(() => {
        if (isLoaded && isSignedIn) navigate('/dashboard', { replace: true });
    }, [isLoaded, isSignedIn, navigate]);

    if (!isLoaded) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
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
            await authClient.forgetPassword({
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
                <Link to="/inscription" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-colors">
                    Pas de compte ? S'inscrire →
                </Link>
            </header>

            <div className="flex-1 flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="w-full max-w-md"
                >
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-slate-200/60 border border-white p-10 space-y-8">

                        {/* Icon + title */}
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Lock size={30} className="text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-black tracking-tighter text-slate-900">
                                {forgotMode ? 'Récupérer l\'accès' : 'Bon Retour !'}
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                {forgotMode ? 'Recevez un lien de réinitialisation' : 'Connectez-vous à votre espace partenaire'}
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={forgotMode ? handleForgot : handleLogin} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">
                                    Adresse e-mail
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-semibold text-sm text-slate-900 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                                        placeholder="votre@boutique.com"
                                    />
                                </div>
                            </div>

                            {/* Password (hidden in forgot mode) */}
                            {!forgotMode && (
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                                            Mot de passe
                                        </label>
                                        <button
                                            type="button"
                                            onClick={() => setForgotMode(true)}
                                            className="text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-semibold text-sm text-slate-900 focus:bg-white focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPass(v => !v)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                                        >
                                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-indigo-600 hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all shadow-xl shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 mt-2"
                            >
                                {loading
                                    ? <Loader2 size={18} className="animate-spin" />
                                    : <>{forgotMode ? 'Envoyer le lien' : 'Accéder à mon Espace'} <ArrowRight size={16} /></>
                                }
                            </button>

                            {forgotMode && (
                                <button
                                    type="button"
                                    onClick={() => setForgotMode(false)}
                                    className="w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors"
                                >
                                    <ChevronLeft size={14} /> Retour à la connexion
                                </button>
                            )}
                        </form>

                        {/* Divider + social (login only) */}
                        {!forgotMode && (
                            <>
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100" />
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="bg-white px-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                            Ou continuer avec
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1">
                                    <button
                                        type="button"
                                        onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin + '/dashboard' })}
                                        className="flex items-center justify-center gap-2 py-3.5 bg-white border-2 border-slate-100 rounded-2xl hover:border-indigo-200 transition-all active:scale-95"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Google</span>
                                    </button>
                                </div>
                            </>
                        )}

                        {/* Footer note */}
                        <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                            Connexion sécurisée SSL 256-bit
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
