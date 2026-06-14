import React, { useState } from 'react';
import { authClient } from './auth-client';
import { useAuth } from './AuthHooks';
import { Mail, Lock, User as UserIcon, ArrowRight, Loader, Eye, EyeOff, MessageCircle, Smartphone, ChevronLeft } from 'lucide-react';
import api from '../services/api';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import toast from 'react-hot-toast';

export const AuthUI = ({ mode = 'signIn' }) => {
    const [isSign, setIsSign] = useState(mode === 'signIn');
    const [isForgotPath, setIsForgotPath] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const [isWhatsapp, setIsWhatsapp] = useState(false);
    const [waStep, setWaStep] = useState('form'); // 'form' | 'otp' | 'reset_password'
    const [phone, setPhone] = useState('');
    const [whatsappPassword, setWhatsappPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const saved = sessionStorage.getItem('vtout_auth_state');
        if (saved) {
            try {
                const s = JSON.parse(saved);
                if (s.isWhatsapp) setIsWhatsapp(s.isWhatsapp);
                if (s.waStep) setWaStep(s.waStep);
                if (s.phone) setPhone(s.phone);
                if (s.name) setName(s.name);
                if (s.whatsappPassword) setWhatsappPassword(s.whatsappPassword);
                if (s.otp) setOtp(s.otp);
            } catch (e) {}
        }
    }, []);

    React.useEffect(() => {
        if (isWhatsapp) {
            sessionStorage.setItem('vtout_auth_state', JSON.stringify({ isWhatsapp, waStep, phone, name, whatsappPassword, otp }));
        } else {
            sessionStorage.removeItem('vtout_auth_state');
        }
    }, [isWhatsapp, waStep, phone, name, whatsappPassword, otp]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!isWhatsapp) {
                if (isForgotPath) {
                    await authClient.requestPasswordReset({ email, redirectTo: window.location.origin + '/reset-password' });
                    toast.success("E-mail de réinitialisation envoyé !");
                    setIsForgotPath(false);
                } else if (isSign) {
                    const res = await authClient.signIn.email({ email, password });
                    if (res.error) toast.error(res.error.message || "Erreur de connexion");
                    else window.location.href = '/';
                } else {
                    const res = await authClient.signUp.email({ email, password, name });
                    if (res.error) toast.error(res.error.message || "Erreur d'inscription");
                    else window.location.href = '/';
                }
            } else {
                const fakeEmail = `${phone.replace(/\D/g, '')}@whatsapp.vtout.com`;
                if (!isSign) {
                    if (waStep === 'form') {
                        if (!phone) return toast.error("Veuillez entrer un numéro valide");
                        if (!whatsappPassword || whatsappPassword.length < 6) return toast.error("Le mot de passe doit faire au moins 6 caractères");
                        await api.post('/auth/whatsapp/send-code', { phone });
                        toast.success("Code envoyé sur WhatsApp !");
                        setWaStep('otp');
                    } else if (waStep === 'otp') {
                        await api.post('/auth/whatsapp/verify-code', { phone, code: otp });
                        let authRes = await authClient.signUp.email({ email: fakeEmail, password: whatsappPassword, name: name || 'Utilisateur WhatsApp' });
                        if (authRes.error && (authRes.error.status === 400 || authRes.error.message?.includes('exist'))) {
                            return toast.error("Ce numéro est déjà utilisé. Veuillez vous connecter.");
                        } else if (authRes.error) {
                            return toast.error(authRes.error.message || "Erreur de création de compte");
                        }
                        try { await api.get('/profile/sync'); } catch (e) {}
                        toast.success("Inscription réussie !");
                        window.location.href = '/';
                    }
                } else {
                    if (!isForgotPath) {
                        if (waStep === 'form') {
                            if (!phone || !whatsappPassword) return toast.error("Téléphone et mot de passe requis");
                            const res = await authClient.signIn.email({ email: fakeEmail, password: whatsappPassword });
                            if (res.error) return toast.error("Numéro ou mot de passe incorrect");
                            window.location.href = '/';
                        }
                    } else {
                        if (waStep === 'form') {
                            if (!phone) return toast.error("Entrez votre numéro");
                            await api.post('/auth/whatsapp/send-code', { phone });
                            toast.success("Code de réinitialisation envoyé !");
                            setWaStep('otp');
                        } else if (waStep === 'otp') {
                            await api.post('/auth/whatsapp/verify-code', { phone, code: otp });
                            setWaStep('reset_password');
                            setWhatsappPassword('');
                        } else if (waStep === 'reset_password') {
                            if (!whatsappPassword || whatsappPassword.length < 6) return toast.error("Mot de passe trop court");
                            await api.post('/auth/whatsapp/reset-password', { phone, code: otp, newPassword: whatsappPassword });
                            toast.success("Mot de passe modifié !");
                            setIsForgotPath(false);
                            setWaStep('form');
                            setOtp('');
                            setWhatsappPassword('');
                        }
                    }
                }
            }
        } catch (err) {
            const errorData = err.response?.data;
            toast.error(errorData?.message || errorData?.error || 'Une erreur est survenue.');
        } finally {
            setLoading(false);
        }
    };

    const socialLogin = async (provider) => {
        const res = await authClient.signIn.social({ provider, callbackURL: window.location.origin });
        if (res.error) toast.error("La connexion avec " + provider + " a échoué.");
    };

    const getSubmitButtonText = () => {
        if (!isWhatsapp) {
            if (isForgotPath) return "Envoyer le lien de réinitialisation";
            return isSign ? "Se connecter" : "Créer mon compte";
        }
        if (!isSign) {
            if (waStep === 'form') return "Recevoir le code WhatsApp";
            if (waStep === 'otp') return "Créer mon compte";
        } else {
            if (!isForgotPath) return "Se connecter";
            if (waStep === 'form') return "Envoyer le code";
            if (waStep === 'otp') return "Vérifier le code";
            if (waStep === 'reset_password') return "Changer le mot de passe";
        }
    };

    const inputBase = "block w-full py-3 border border-base-300 rounded-xl bg-base-100 text-base-content placeholder-slate-400 text-sm font-medium focus:outline-none focus:ring-2 transition-all";
    const inputEmail = `${inputBase} pl-10 pr-4 focus:ring-[#f37021]/20 focus:border-[#f37021]`;
    const inputWa = `${inputBase} pl-10 pr-4 focus:ring-emerald-500/20 focus:border-emerald-500`;
    const inputWaPwd = `${inputBase} pl-10 pr-10 focus:ring-emerald-500/20 focus:border-emerald-500`;
    const inputEmailPwd = `${inputBase} pl-10 pr-10 focus:ring-[#f37021]/20 focus:border-[#f37021]`;

    return (
        <div className="bg-base-100 rounded-2xl border border-base-200 shadow-sm p-8">

            {/* Header */}
            <div className="mb-7">
                <h2 className="text-2xl font-black text-base-content tracking-tight">
                    {isForgotPath
                        ? "Mot de passe oublié"
                        : (isSign ? "Connexion" : "Créer un compte")}
                </h2>
                <p className="text-sm text-base-content/50 mt-1.5 font-medium leading-relaxed">
                    {isForgotPath
                        ? (isWhatsapp
                            ? "Entrez votre numéro WhatsApp pour réinitialiser"
                            : "Entrez votre e-mail pour recevoir un lien")
                        : (isSign
                            ? "Bon retour sur Vtout"
                            : "Rejoignez la marketplace N°1 du Bénin")}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">

                {/* ── EMAIL FLOW ── */}
                {!isWhatsapp ? (
                    <>
                        {!isSign && !isForgotPath && (
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <UserIcon size={17} className="text-base-content/40" />
                                </span>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    autoComplete="name"
                                    className={inputEmail}
                                    placeholder="Votre nom complet"
                                />
                            </div>
                        )}

                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <Mail size={17} className="text-base-content/40" />
                            </span>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                autoComplete="email"
                                className={inputEmail}
                                placeholder="Adresse e-mail"
                            />
                        </div>

                        {!isForgotPath && (
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <Lock size={17} className="text-base-content/40" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className={inputEmailPwd}
                                    placeholder="Mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        )}

                        {isSign && !isForgotPath && (
                            <div className="flex justify-end -mt-1">
                                <button
                                    type="button"
                                    onClick={() => setIsForgotPath(true)}
                                    className="text-xs font-bold hover:underline transition-colors"
                                    style={{ color: '#f37021' }}
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        )}
                    </>
                ) : (

                    /* ── WHATSAPP FLOW ── */
                    <div className="space-y-4">
                        {waStep === 'form' && (
                            <>
                                {!isSign && (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                            <UserIcon size={17} className="text-base-content/40" />
                                        </span>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            className={inputWa}
                                            placeholder="Votre nom complet"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                        <Smartphone size={17} className="text-base-content/40" />
                                    </span>
                                    <PhoneInput
                                        international
                                        defaultCountry="BJ"
                                        value={phone}
                                        onChange={setPhone}
                                        className="block w-full pl-10 pr-4 py-3 border border-base-300 rounded-xl bg-base-100 text-sm font-medium focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all [&>input]:bg-transparent [&>input]:outline-none [&>input]:w-full [&>input]:text-sm [&>input]:font-medium [&>input]:text-base-content"
                                        placeholder="+229 00 00 00 00"
                                    />
                                </div>

                                {!isForgotPath && (
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                            <Lock size={17} className="text-base-content/40" />
                                        </span>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={whatsappPassword}
                                            onChange={e => setWhatsappPassword(e.target.value)}
                                            className={inputWaPwd}
                                            placeholder={isSign ? "Votre mot de passe" : "Créer un mot de passe"}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content/70 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                        </button>
                                    </div>
                                )}

                                {isSign && !isForgotPath && (
                                    <div className="flex justify-end -mt-1">
                                        <button
                                            type="button"
                                            onClick={() => { setIsForgotPath(true); setWaStep('form'); }}
                                            className="text-xs font-bold text-emerald-600 hover:underline transition-colors"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                )}
                            </>
                        )}

                        {waStep === 'otp' && (
                            <div className="space-y-3">
                                <p className="text-xs text-center text-base-content/50 font-medium">
                                    Code envoyé au <span className="font-black text-base-content/90">{phone}</span>
                                </p>
                                <input
                                    type="text"
                                    maxLength={6}
                                    required
                                    autoFocus
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full text-center tracking-[0.8em] text-2xl py-3.5 border-2 border-emerald-200 rounded-xl bg-emerald-50/50 text-base-content focus:outline-none focus:border-emerald-500 transition-all font-black"
                                    placeholder="000000"
                                />
                            </div>
                        )}

                        {waStep === 'reset_password' && (
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                                    <Lock size={17} className="text-base-content/40" />
                                </span>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={whatsappPassword}
                                    onChange={e => setWhatsappPassword(e.target.value)}
                                    className={inputWaPwd}
                                    placeholder="Nouveau mot de passe"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-base-content/40 hover:text-base-content/70 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── Submit button ── */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-xl font-black text-sm text-white transition-all active:scale-[0.98] shadow-lg disabled:opacity-60 disabled:cursor-not-allowed mt-2 ${
                        isWhatsapp
                            ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/25'
                            : 'hover:brightness-90 shadow-[#f37021]/25'
                    }`}
                    style={!isWhatsapp ? { background: '#f37021' } : undefined}
                >
                    {loading
                        ? <Loader className="animate-spin h-5 w-5" />
                        : <><span>{getSubmitButtonText()}</span><ArrowRight size={15} /></>
                    }
                </button>

                {isWhatsapp && (
                    <button
                        type="button"
                        onClick={() => { setIsWhatsapp(false); setWaStep('form'); setIsForgotPath(false); }}
                        className="w-full flex justify-center items-center gap-1.5 py-2 text-xs font-bold text-base-content/40 hover:text-base-content/70 transition-colors"
                    >
                        <ChevronLeft size={14} /> Revenir à l'e-mail
                    </button>
                )}
            </form>

            {/* ── Social login ── */}
            {!isForgotPath && !isWhatsapp && (
                <div className="mt-6">
                    <div className="relative flex items-center gap-4">
                        <div className="flex-1 h-px bg-base-200" />
                        <span className="text-[11px] text-base-content/40 font-semibold uppercase tracking-widest shrink-0">ou continuer avec</span>
                        <div className="flex-1 h-px bg-base-200" />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => socialLogin('google')}
                            className="flex justify-center items-center gap-2 py-2.5 px-4 border border-base-300 rounded-xl bg-base-100 text-sm font-semibold text-base-content/80 hover:bg-base-200 transition-colors shadow-sm"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-4 w-4" alt="Google" />
                            Google
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsWhatsapp(true)}
                            className="flex justify-center items-center gap-2 py-2.5 px-4 border border-emerald-200 rounded-xl bg-emerald-50/60 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors shadow-sm"
                        >
                            <MessageCircle size={16} className="text-emerald-600" />
                            WhatsApp
                        </button>
                    </div>
                </div>
            )}

            {/* ── Switch signin / signup ── */}
            <div className="mt-6 pt-5 border-t border-base-200 text-center">
                <button
                    type="button"
                    onClick={() => {
                        setIsForgotPath(false);
                        setIsSign(!isSign);
                        setWaStep('form');
                        setOtp('');
                        setWhatsappPassword('');
                    }}
                    className="text-sm font-bold hover:underline transition-colors"
                    style={{ color: '#f37021' }}
                >
                    {isForgotPath
                        ? "Retourner à la connexion"
                        : (isSign ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter")}
                </button>
            </div>
        </div>
    );
};
