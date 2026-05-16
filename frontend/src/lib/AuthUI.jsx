import React, { useState } from 'react';
import { authClient } from './auth-client';
import { useAuth } from './AuthHooks';
import { Mail, Lock, User as UserIcon, Github, Facebook, ArrowRight, Loader, Eye, EyeOff, MessageCircle, Smartphone, ChevronLeft } from 'lucide-react';
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
    
    // --- WhatsApp States ---
    const [isWhatsapp, setIsWhatsapp] = useState(false);
    const [waStep, setWaStep] = useState('form'); // 'form', 'otp', 'reset_password'
    const [phone, setPhone] = useState('');
    const [whatsappPassword, setWhatsappPassword] = useState('');
    const [name, setName] = useState('');
    const [otp, setOtp] = useState('');
    
    const [loading, setLoading] = useState(false);

    // Persistance pour mobile
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
            sessionStorage.setItem('vtout_auth_state', JSON.stringify({
                isWhatsapp, waStep, phone, name, whatsappPassword, otp
            }));
        } else {
            sessionStorage.removeItem('vtout_auth_state');
        }
    }, [isWhatsapp, waStep, phone, name, whatsappPassword, otp]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (!isWhatsapp) {
                // Flux Email Classique
                if (isForgotPath) {
                    await authClient.requestPasswordReset({ email, redirectTo: window.location.origin + '/reset-password' });
                    toast.success("E-mail de réinitialisation envoyé !");
                    setIsForgotPath(false);
                } else if (isSign) {
                    const res = await authClient.signIn.email({ email, password });
                    if (res.error) {
                        toast.error(res.error.message || "Erreur de connexion");
                    } else {
                        window.location.href = '/';
                    }
                } else {
                    const res = await authClient.signUp.email({ email, password, name });
                    if (res.error) {
                        toast.error(res.error.message || "Erreur d'inscription");
                    } else {
                        window.location.href = '/';
                    }
                }
            } else {
                // Flux WhatsApp
                const fakeEmail = `${phone.replace(/\D/g, '')}@whatsapp.vtout.com`;

                if (!isSign) {
                    // Création de compte WhatsApp
                    if (waStep === 'form') {
                        if (!phone) return toast.error("Veuillez entrer un numéro valide");
                        if (!whatsappPassword || whatsappPassword.length < 6) return toast.error("Le mot de passe doit faire au moins 6 caractères");
                        await api.post('/auth/whatsapp/send-code', { phone });
                        toast.success("Code envoyé sur WhatsApp !");
                        setWaStep('otp');
                    } else if (waStep === 'otp') {
                        await api.post('/auth/whatsapp/verify-code', { phone, code: otp });
                        
                        let authRes = await authClient.signUp.email({ 
                            email: fakeEmail, 
                            password: whatsappPassword, 
                            name: name || 'Utilisateur WhatsApp'
                        });

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
                    // Connexion WhatsApp
                    if (!isForgotPath) {
                        // Connexion directe avec numéro et mot de passe
                        if (waStep === 'form') {
                            if (!phone || !whatsappPassword) return toast.error("Téléphone et mot de passe requis");
                            const res = await authClient.signIn.email({ email: fakeEmail, password: whatsappPassword });
                            if (res.error) return toast.error("Numéro ou mot de passe incorrect");
                            window.location.href = '/';
                        }
                    } else {
                        // Mot de passe oublié WhatsApp
                        if (waStep === 'form') {
                            if (!phone) return toast.error("Entrez votre numéro");
                            await api.post('/auth/whatsapp/send-code', { phone });
                            toast.success("Code de réinitialisation envoyé !");
                            setWaStep('otp');
                        } else if (waStep === 'otp') {
                            await api.post('/auth/whatsapp/verify-code', { phone, code: otp });
                            setWaStep('reset_password');
                            setWhatsappPassword(''); // clean for new password
                        } else if (waStep === 'reset_password') {
                            if (!whatsappPassword || whatsappPassword.length < 6) return toast.error("Mot de passe trop court");
                            await api.post('/auth/whatsapp/reset-password', { phone, code: otp, newPassword: whatsappPassword });
                            toast.success("Mot de passe modifié ! Vous pouvez vous connecter.");
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
        const res = await authClient.signIn.social({ 
            provider,
            callbackURL: window.location.origin 
        });
        if (res.error) toast.error("La connexion avec " + provider + " a échoué.");
    };

    const getSubmitButtonText = () => {
        if (!isWhatsapp) {
            if (isForgotPath) return "Envoyer le lien";
            return isSign ? "Se connecter" : "S'inscrire";
        }
        if (!isSign) {
            if (waStep === 'form') return "Recevoir le code WhatsApp";
            if (waStep === 'otp') return "Créer mon compte";
        } else {
            if (!isForgotPath) return "Se connecter";
            if (waStep === 'form') return "Recevoir le code de réinitialisation";
            if (waStep === 'otp') return "Vérifier le code";
            if (waStep === 'reset_password') return "Changer le mot de passe";
        }
    };

    return (
        <div className="flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl opacity-30"></div>
                <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-3xl p-8 sm:p-10 border border-white/20">

                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
                            {isForgotPath ? "Mot de passe oublié ?" : (isSign ? "Bon retour ! 👋" : "Créez votre compte 🚀")}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {isForgotPath
                                ? (isWhatsapp ? "Entrez votre numéro pour réinitialiser via WhatsApp" : "Saisissez votre e-mail pour réinitialiser")
                                : (isSign ? "Connectez-vous pour continuer sur Vtout" : "Rejoignez la meilleure plateforme e-commerce")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isWhatsapp ? (
                            <>
                                {/* FLUX EMAIL */}
                                {!isSign && !isForgotPath && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <UserIcon className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            autoComplete="name"
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Votre nom complet"
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        autoComplete="email"
                                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                        placeholder="Votre adresse e-mail"
                                    />
                                </div>

                                {!isForgotPath && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                                            placeholder="Mot de passe sécurisé"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                )}

                                {isSign && !isForgotPath && (
                                    <div className="flex items-center justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPath(true)}
                                            className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                        >
                                            Mot de passe oublié ?
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="space-y-6">
                                {/* FLUX WHATSAPP */}
                                {waStep === 'form' && (
                                    <>
                                        {!isSign && (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserIcon className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    required
                                                    value={name}
                                                    onChange={e => setName(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                                    placeholder="Votre nom complet"
                                                />
                                            </div>
                                        )}
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                <Smartphone className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <PhoneInput
                                                international
                                                defaultCountry="BJ"
                                                value={phone}
                                                onChange={setPhone}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all [&>input]:bg-transparent [&>input]:outline-none [&>input]:w-full"
                                                placeholder="+229 00 00 00 00"
                                            />
                                        </div>
                                        
                                        {!isForgotPath && (
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                                    <Lock className="h-5 w-5 text-gray-400" />
                                                </div>
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    required
                                                    value={whatsappPassword}
                                                    onChange={e => setWhatsappPassword(e.target.value)}
                                                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                                    placeholder={isSign ? "Votre mot de passe" : "Créer un mot de passe"}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                </button>
                                            </div>
                                        )}

                                        {isSign && !isForgotPath && (
                                            <div className="flex items-center justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => { setIsForgotPath(true); setWaStep('form'); }}
                                                    className="text-sm font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
                                                >
                                                    Mot de passe oublié ?
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {waStep === 'otp' && (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            maxLength={6}
                                            required
                                            autoFocus
                                            value={otp}
                                            onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                            className="block w-full text-center tracking-[0.8em] text-2xl py-3 border-2 border-emerald-100 rounded-xl bg-emerald-50/30 dark:bg-emerald-900/10 text-gray-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-all font-black"
                                            placeholder="000000"
                                        />
                                        <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Code envoyé au {phone}</p>
                                    </div>
                                )}

                                {waStep === 'reset_password' && (
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                            <Lock className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            required
                                            value={whatsappPassword}
                                            onChange={e => setWhatsappPassword(e.target.value)}
                                            className="block w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                            placeholder="Votre nouveau mot de passe"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r ${isWhatsapp ? 'from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500' : 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {loading ? <Loader className="animate-spin h-5 w-5" /> : (
                                <span className="flex items-center">
                                    {getSubmitButtonText()}
                                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </button>

                        {isWhatsapp && (
                            <button
                                type="button"
                                onClick={() => { setIsWhatsapp(false); setWaStep('form'); setIsForgotPath(false); }}
                                className="w-full flex justify-center items-center py-2 text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" /> Revenir à l'email
                            </button>
                        )}
                    </form>


                    {!isForgotPath && !isWhatsapp && (
                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white/80 dark:bg-gray-900/80 text-gray-500">Ou continuer avec</span>
                                </div>
                            </div>
                             <div className="mt-4 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => socialLogin('google')}
                                        className="flex justify-center items-center py-2.5 px-4 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="h-5 w-5 mr-2" alt="Google" />
                                        Google
                                    </button>
                                    
                                    <button
                                        onClick={() => setIsWhatsapp(true)}
                                        className="flex justify-center items-center py-2.5 px-4 border border-emerald-200 dark:border-emerald-800 rounded-xl shadow-sm bg-emerald-50/50 dark:bg-emerald-900/10 text-sm font-medium text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors duration-200 group"
                                    >
                                        <MessageCircle className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                                        WhatsApp
                                    </button>
                                </div>
                        </div>
                    )}

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => {
                                setIsForgotPath(false);
                                setIsSign(!isSign);
                                setWaStep('form');
                                setOtp('');
                                setWhatsappPassword('');
                            }}
                            className="text-sm font-black uppercase tracking-widest transition-all px-6 py-2 rounded-xl mt-4 inline-block text-primary hover:bg-primary/5 border border-primary/20"
                        >
                            {isForgotPath
                                ? "Retourner à la connexion"
                                : (isSign ? "Nouveau ? Créer un compte" : "Déjà un compte ? Se connecter")}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
